import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, User, Plus } from 'lucide-react';
import type { Customer } from '@/types';

interface CustomerTableProps {
  customers: Customer[];
  selectedIds: Set<string>;
  isAdmin: boolean;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (customer: Customer) => void;
  onAddNew: () => void;
}

export function CustomerTable({
  customers,
  selectedIds,
  isAdmin,
  onSelect,
  onSelectAll,
  onEdit,
  onAddNew,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="mb-4">No customers found</p>
        <Button onClick={onAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add your first customer
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === customers.length && customers.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            {isAdmin && <TableHead className="w-[60px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              {isAdmin && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(customer.id)}
                    onCheckedChange={() => onSelect(customer.id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                  {customer.customer_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {customer.email && <div>{customer.email}</div>}
                  {customer.phone && <div className="text-muted-foreground">{customer.phone}</div>}
                  {!customer.email && !customer.phone && <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {customer.address || <span className="text-muted-foreground">—</span>}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
