import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RunOutput {
  id: string;
  size: string;
  variety: string;
  quantity_produced: number;
  quantity_sold: number;
}

interface RunOutputTableProps {
  outputs: RunOutput[];
}

export function RunOutputTable({ outputs }: RunOutputTableProps) {
  const totalProduced = outputs.reduce((sum, o) => sum + o.quantity_produced, 0);
  const totalSold = outputs.reduce((sum, o) => sum + o.quantity_sold, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Size</TableHead>
          <TableHead>Variety</TableHead>
          <TableHead className="text-right">Produced</TableHead>
          <TableHead className="text-right">Sold</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {outputs.map((output) => (
          <TableRow key={output.id}>
            <TableCell className="capitalize">{output.size}</TableCell>
            <TableCell className="capitalize">{output.variety.replace('_', ' ')}</TableCell>
            <TableCell className="text-right">{output.quantity_produced}</TableCell>
            <TableCell className="text-right">{output.quantity_sold}</TableCell>
            <TableCell className="text-right">
              {output.quantity_produced - output.quantity_sold}
            </TableCell>
          </TableRow>
        ))}
        {outputs.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No outputs recorded
            </TableCell>
          </TableRow>
        )}
        {outputs.length > 0 && (
          <TableRow className="font-bold">
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">{totalProduced}</TableCell>
            <TableCell className="text-right">{totalSold}</TableCell>
            <TableCell className="text-right">{totalProduced - totalSold}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
