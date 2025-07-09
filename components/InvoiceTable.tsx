'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Download, 
  Mail, 
  MoreHorizontal, 
  Trash2, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns/format';
import { toast } from 'sonner';
import { Invoice, deleteInvoice } from '@/lib/invoice-data';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceTableProps {
  invoices: Invoice[];
  onInvoicesChange: () => void;
}

const columnHelper = createColumnHelper<Invoice>();

export function InvoiceTable({ invoices, onInvoicesChange }: InvoiceTableProps) {
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const getPermissions = () => {
    switch (user?.role) {
      case 'Admin':
        return { canDelete: true, canResend: true };
      case 'Accountant':
        return { canDelete: false, canResend: true };
      case 'Viewer':
        return { canDelete: false, canResend: false };
      default:
        return { canDelete: false, canResend: false };
    }
  };

  const permissions = getPermissions();

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const success = deleteInvoice(invoiceId);
      if (success) {
        toast.success('Invoice deleted successfully');
        onInvoicesChange();
      } else {
        toast.error('Failed to delete invoice');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the invoice');
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    toast.success(`PDF downloaded for ${invoice.id}`);
  };

  const handleDownloadCSV = (invoice: Invoice) => {
    toast.success(`CSV downloaded for ${invoice.id}`);
  };

  const handleResendEmail = (invoice: Invoice) => {
    toast.success(`Email resent for ${invoice.id}`);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      Draft: 'default',
      Sent: 'secondary',
      Paid: 'default',
      Overdue: 'destructive',
    } as const;

    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Sent: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Overdue: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const columns: ColumnDef<Invoice>[] = [
    columnHelper.accessor('id', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Invoice ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    }),
    columnHelper.accessor('customerName', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{row.getValue('customerName')}</div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('type')}</Badge>
      ),
    }),
    columnHelper.accessor('startDate', {
      header: 'Date Range',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.getValue('startDate')), 'MMM dd, yyyy')} - {format(new Date(row.original.endDate), 'MMM dd, yyyy')}
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    }),
    columnHelper.accessor('amount', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">${row.getValue<number>('amount').toLocaleString()}</div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadCSV(invoice)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV
              </DropdownMenuItem>
              {permissions.canResend && (
                <DropdownMenuItem onClick={() => handleResendEmail(invoice)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Email
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the invoice {invoice.id}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search invoices..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn('customerName')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {Array.from(new Set(invoices.map(invoice => invoice.customerName))).map(customer => (
                <SelectItem key={customer} value={customer}>{customer}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn('type')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Prepaid">Prepaid</SelectItem>
              <SelectItem value="Postpaid">Postpaid</SelectItem>
              <SelectItem value="Test">Test</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s).
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}