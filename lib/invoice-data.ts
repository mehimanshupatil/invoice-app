export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  type: 'Prepaid' | 'Postpaid' | 'Test';
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  amount: number;
  sendStatus: 'Send' | 'Failed' | 'Discard';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
}

// Mock data
export const mockCustomers: Customer[] = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp Inc.' },
  { id: '2', name: 'Alice Johnson', email: 'alice@startup.com', company: 'Startup Solutions' },
  { id: '3', name: 'Bob Wilson', email: 'bob@enterprise.com', company: 'Enterprise LLC' },
  { id: '4', name: 'Sarah Davis', email: 'sarah@consulting.com', company: 'Consulting Pro' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    customerId: '1',
    customerName: 'John Smith',
    type: 'Prepaid',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'Paid',
    amount: 1500.00,
    sendStatus: 'Send',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'INV-002',
    customerId: '2',
    customerName: 'Alice Johnson',
    type: 'Postpaid',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'Sent',
    amount: 2250.00,
    sendStatus: 'Send',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'INV-003',
    customerId: '3',
    customerName: 'Bob Wilson',
    type: 'Test',
    startDate: '2024-01-15',
    endDate: '2024-01-31',
    status: 'Draft',
    amount: 750.00,
    sendStatus: 'Discard',
    createdAt: '2024-01-25T09:15:00Z',
  },
  {
    id: 'INV-004',
    customerId: '4',
    customerName: 'Sarah Davis',
    type: 'Prepaid',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    status: 'Overdue',
    amount: 3100.00,
    sendStatus: 'Failed',
    createdAt: '2024-02-10T16:45:00Z',
  },
];

let invoiceData = [...mockInvoices];
let customerData = [...mockCustomers];

export const getInvoices = (): Invoice[] => {
  return invoiceData;
};

export const getCustomers = (): Customer[] => {
  return customerData;
};

export const createCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: String(customerData.length + 1),
  };
  customerData.push(newCustomer);
  return newCustomer;
};

export const createInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
  const newInvoice: Invoice = {
    ...invoice,
    id: `INV-${String(invoiceData.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  invoiceData.push(newInvoice);
  return newInvoice;
};

export const deleteInvoice = (id: string): boolean => {
  const index = invoiceData.findIndex(invoice => invoice.id === id);
  if (index > -1) {
    invoiceData.splice(index, 1);
    return true;
  }
  return false;
};

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice | null => {
  const index = invoiceData.findIndex(invoice => invoice.id === id);
  if (index > -1) {
    invoiceData[index] = { ...invoiceData[index], ...updates };
    return invoiceData[index];
  }
  return null;
};