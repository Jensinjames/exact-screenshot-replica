import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { parseCSV, ParsedCSVRow, parseDateValue, parseNumericValue, findColumn } from '@/utils/csvParser';
import { useImportProductionRuns } from '@/hooks/production/useImportProductionRuns';

interface ImportRunsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

const DATE_COLUMNS = ['date', 'run_date', 'production date'];
const DOUGH_COLUMNS = ['total dough eq', 'doughs', 'dough eq', 'total dough'];

export function ImportRunsDialog({ open, onOpenChange }: ImportRunsDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedCSVRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [validRows, setValidRows] = useState<ParsedCSVRow[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [fileName, setFileName] = useState('');

  const importMutation = useImportProductionRuns();

  const resetState = useCallback(() => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setParseErrors([]);
    setValidRows([]);
    setSkippedCount(0);
    setFileName('');
    importMutation.reset();
  }, [importMutation]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetState, 200);
  }, [onOpenChange, resetState]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      
      setHeaders(result.headers);
      setRows(result.rows);
      setParseErrors(result.errors);

      // Filter valid rows (have date and at least some data)
      const dateCol = findColumn(result.headers, DATE_COLUMNS);
      let valid: ParsedCSVRow[] = [];
      let skipped = 0;

      if (dateCol) {
        for (const row of result.rows) {
          const dateValue = parseDateValue(row[dateCol]);
          if (dateValue) {
            valid.push(row);
          } else {
            skipped++;
          }
        }
      }

      setValidRows(valid);
      setSkippedCount(skipped);
      setStep('preview');
    };

    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(async () => {
    setStep('importing');
    
    try {
      await importMutation.mutateAsync({ rows: validRows, headers });
      setStep('complete');
    } catch (error) {
      // Error handled by mutation
    }
  }, [importMutation, validRows, headers]);

  const dateCol = findColumn(headers, DATE_COLUMNS);
  const doughCol = findColumn(headers, DOUGH_COLUMNS);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Production Runs</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file containing production run data'}
            {step === 'preview' && 'Review the data before importing'}
            {step === 'importing' && 'Importing production runs...'}
            {step === 'complete' && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV file to import production run data
              </p>
              <label htmlFor="csv-upload">
                <Button asChild>
                  <span>
                    <FileText className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </span>
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{fileName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {validRows.length} valid rows, {skippedCount} skipped
                </div>
              </div>

              {parseErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Parse Errors</AlertTitle>
                  <AlertDescription>
                    {parseErrors.slice(0, 3).join(', ')}
                    {parseErrors.length > 3 && ` and ${parseErrors.length - 3} more...`}
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[300px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[100px]">Doughs</TableHead>
                      <TableHead>Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validRows.slice(0, 20).map((row, index) => {
                      const date = dateCol ? parseDateValue(row[dateCol]) : null;
                      const doughs = doughCol ? parseNumericValue(row[doughCol]) : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{date}</TableCell>
                          <TableCell>{doughs.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {headers.slice(0, 5).map(h => `${h}: ${row[h] || '-'}`).join(' | ')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {validRows.length > 20 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          ... and {validRows.length - 20} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Importing {validRows.length} production runs...
              </p>
              <Progress value={50} className="w-[60%]" />
            </div>
          )}

          {step === 'complete' && importMutation.data && (
            <div className="space-y-4 py-4">
              <Alert variant={importMutation.data.success ? 'default' : 'destructive'}>
                {importMutation.data.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {importMutation.data.success ? 'Import Complete' : 'Import Completed with Errors'}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <p>✓ {importMutation.data.imported} runs imported successfully</p>
                    {importMutation.data.skipped > 0 && (
                      <p>⊘ {importMutation.data.skipped} rows skipped (invalid date or no data)</p>
                    )}
                    {importMutation.data.duplicates.length > 0 && (
                      <p>⊘ {importMutation.data.duplicates.length} duplicates skipped</p>
                    )}
                    {importMutation.data.errors.length > 0 && (
                      <p>✗ {importMutation.data.errors.length} errors</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {importMutation.data.errors.length > 0 && (
                <ScrollArea className="h-[150px] border rounded-md p-3">
                  <ul className="text-sm space-y-1">
                    {importMutation.data.errors.map((error, i) => (
                      <li key={i} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          )}

          {step === 'complete' && importMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>
                {importMutation.error instanceof Error 
                  ? importMutation.error.message 
                  : 'An unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>
                Choose Different File
              </Button>
              <Button onClick={handleImport} disabled={validRows.length === 0}>
                Import {validRows.length} Runs
              </Button>
            </>
          )}

          {step === 'importing' && (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
