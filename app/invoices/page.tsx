'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { InvoiceTable } from '@/components/InvoiceTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getInvoices, Invoice } from '@/lib/invoice-data';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = () => {
    setInvoices(getInvoices());
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const canCreate = user?.role === 'Admin' || user?.role === 'Accountant';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
            </div>
            {canCreate && (
              <Link href="/invoices/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            )}
          </div>

          <InvoiceTable invoices={invoices} onInvoicesChange={loadInvoices} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}