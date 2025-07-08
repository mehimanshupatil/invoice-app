'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, Download, FileText, FileSpreadsheet, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getCustomers, createInvoice, type Invoice } from '@/lib/invoice-data';
import { cn } from '@/lib/utils';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['Prepaid', 'Postpaid', 'Test'], { required_error: 'Invoice type is required' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  amount: z.number().positive('Amount must be positive'),
  sendStatus: z.enum(['Send', 'Failed', 'Discard'], { required_error: 'Send status is required' }),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const customers = getCustomers();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  const watchedValues = watch();

  const calculateAmount = (type: string, startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const baseRates = {
      Prepaid: 50,
      Postpaid: 75,
      Test: 25,
    };
    return days * (baseRates[type as keyof typeof baseRates] || 50);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setValue(field, date);
      if (field === 'startDate') {
        setStartDate(date);
      } else {
        setEndDate(date);
      }

      // Auto-calculate amount when both dates and type are set
      if (startDate && endDate && watchedValues.type) {
        const amount = calculateAmount(watchedValues.type, startDate, endDate);
        setValue('amount', amount);
      }
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    
    try {
      const customer = customers.find(c => c.id === data.customerId);
      if (!customer) {
        toast.error('Customer not found');
        return;
      }

      const invoiceData = {
        customerId: data.customerId,
        customerName: customer.name,
        type: data.type,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        amount: data.amount,
        sendStatus: data.sendStatus,
        status: 'Draft' as const,
      };

      const newInvoice = createInvoice(invoiceData);
      setPreviewInvoice(newInvoice);
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSend = () => {
    if (previewInvoice) {
      toast.success(`Invoice ${previewInvoice.id} created successfully!`);
      setShowConfirmation(false);
      router.push('/invoices');
    }
  };

  const handleDownloadPDF = () => {
    toast.success('PDF downloaded successfully');
  };

  const handleDownloadCSV = () => {
    toast.success('CSV downloaded successfully');
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-gray-600 mt-1">Generate a new invoice for your customer</p>
            </div>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Fill in the details below to create a new invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select onValueChange={(value) => setValue('customerId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <p className="text-sm text-red-600">{errors.customerId.message}</p>
                  )}
                </div>

                {/* Invoice Type */}
                <div className="space-y-3">
                  <Label>Invoice Type</Label>
                  <RadioGroup 
                    onValueChange={(value) => setValue('type', value as 'Prepaid' | 'Postpaid' | 'Test')}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prepaid" id="prepaid" />
                      <Label htmlFor="prepaid">Prepaid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Postpaid" id="postpaid" />
                      <Label htmlFor="postpaid">Postpaid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Test" id="test" />
                      <Label htmlFor="test">Test</Label>
                    </div>
                  </RadioGroup>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => handleDateChange('startDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.startDate && (
                      <p className="text-sm text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => handleDateChange('endDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.endDate && (
                      <p className="text-sm text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                {/* Send Status */}
                <div className="space-y-2">
                  <Label>Send Status</Label>
                  <Select onValueChange={(value) => setValue('sendStatus', value as 'Send' | 'Failed' | 'Discard')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select send status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Send">Send</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Discard">Discard</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sendStatus && (
                    <p className="text-sm text-red-600">{errors.sendStatus.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Invoice Creation</DialogTitle>
              <DialogDescription>
                Review your invoice details before finalizing
              </DialogDescription>
            </DialogHeader>
            
            {previewInvoice && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice ID:</span>
                    <span>{previewInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span>{previewInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{previewInvoice.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-bold text-green-600">${previewInvoice.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Preview PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadCSV}
                    className="w-full"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Preview CSV
                  </Button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSend}>
                    <Mail className="mr-2 h-4 w-4" />
                    Confirm & Send
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}