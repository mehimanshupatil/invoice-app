'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getInvoices } from '@/lib/invoice-data';

export default function DashboardPage() {
  const { user } = useAuth();
  const invoices = getInvoices();

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'Overdue').length;

  const getPermissions = () => {
    switch (user?.role) {
      case 'Admin':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canView: true,
        };
      case 'Accountant':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: false,
          canView: true,
        };
      case 'Viewer':
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canView: true,
        };
      default:
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canView: false,
        };
    }
  };

  const permissions = getPermissions();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            {permissions.canCreate && (
              <Link href="/invoices/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  All invoices in the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total invoice value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paidInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully paid
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <FileText className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/invoices">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-600" />
                    View Invoices
                  </CardTitle>
                  <CardDescription>
                    Browse and manage all invoices
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            {permissions.canCreate && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <Link href="/invoices/create">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-green-600" />
                      Create Invoice
                    </CardTitle>
                    <CardDescription>
                      Generate a new invoice
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            )}

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Customer Management
                </CardTitle>
                <CardDescription>
                  Manage customer information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Role-based permissions info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions ({user?.role})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Eye className={`h-4 w-4 ${permissions.canView ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={permissions.canView ? 'text-green-600' : 'text-gray-400'}>View</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Plus className={`h-4 w-4 ${permissions.canCreate ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={permissions.canCreate ? 'text-green-600' : 'text-gray-400'}>Create</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Edit className={`h-4 w-4 ${permissions.canEdit ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={permissions.canEdit ? 'text-green-600' : 'text-gray-400'}>Edit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trash2 className={`h-4 w-4 ${permissions.canDelete ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={permissions.canDelete ? 'text-green-600' : 'text-gray-400'}>Delete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}