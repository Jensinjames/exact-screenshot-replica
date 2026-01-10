import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

interface CustomerBulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function CustomerBulkActions({
  selectedCount,
  onExport,
  onDelete,
  onClear,
}: CustomerBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}
