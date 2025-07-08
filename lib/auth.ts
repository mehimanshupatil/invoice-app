export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Mock users for demo
export const mockUsers: User[] = [
  { id: '1', email: 'admin@company.com', name: 'John Admin', role: 'Admin' },
  { id: '2', email: 'accountant@company.com', name: 'Sarah Accountant', role: 'Accountant' },
  { id: '3', email: 'viewer@company.com', name: 'Mike Viewer', role: 'Viewer' },
];

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simple mock authentication - in production, this would be a real API call
  if (password === 'password123') {
    return mockUsers.find(user => user.email === email) || null;
  }
  return null;
};