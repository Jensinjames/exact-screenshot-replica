import { useState } from 'react';
import { useCustomers, useDeleteCustomers } from '@/hooks/customers';
import { useIsAdmin } from '@/hooks/team/useIsAdmin';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Search, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/export';
import { LoadingState } from '@/components/ui/loading-state';
import { PageHeader } from '@/components/ui/page-header';
import {
  CustomerFormDialog,
  CustomerTable,
  CustomerBulkActions,
  CustomerStats,
} from '@/components/customers';
import type { Customer } from '@/types';

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const { isAdmin } = useIsAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteCustomersMutation = useDeleteCustomers();

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const filteredCustomers = customers?.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const retailCount = customers?.filter((c) => c.customer_type === 'retail').length || 0;
  const wholesaleCount = customers?.filter((c) => c.customer_type === 'wholesale').length || 0;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers?.length && filteredCustomers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers?.map(c => c.id)));
    }
  };

  const handleBulkDelete = () => {
    deleteCustomersMutation.mutate([...selectedIds], {
      onSuccess: () => {
        toast.success(`${selectedIds.size} customer(s) deleted`);
        setSelectedIds(new Set());
        setIsDeleteDialogOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const handleExport = () => {
    const customersToExport = selectedIds.size > 0
      ? customers?.filter(c => selectedIds.has(c.id))
      : customers;
    
    if (!customersToExport?.length) return;
    
    exportToCSV(customersToExport, 'customers', [
      { key: 'name', header: 'Name' },
      { key: 'customer_type', header: 'Type' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'address', header: 'Address' },
      { key: 'notes', header: 'Notes' },
    ]);
    
    toast.success(`Exported ${customersToExport.length} customer(s)`);
  };

  if (isLoading) {
    return <LoadingState size="full" message="Loading customers..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </>
        }
      />

      {/* Create Dialog */}
      <CustomerFormDialog
        mode="create"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Edit Dialog */}
      <CustomerFormDialog
        mode="edit"
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} customer(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              selected customers and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCustomersMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <CustomerStats
        total={customers?.length || 0}
        retailCount={retailCount}
        wholesaleCount={wholesaleCount}
      />

      {/* Bulk Action Bar */}
      {isAdmin && (
        <CustomerBulkActions
          selectedCount={selectedIds.size}
          onExport={handleExport}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerTable
            customers={filteredCustomers || []}
            selectedIds={selectedIds}
            isAdmin={isAdmin}
            onSelect={toggleSelect}
            onSelectAll={toggleSelectAll}
            onEdit={handleEdit}
            onAddNew={() => setIsDialogOpen(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
