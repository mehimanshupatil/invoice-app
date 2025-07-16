'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Users,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns/format';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  type DatabaseUser,
  type CreateUserData 
} from '@/lib/api/users';
import { useDatabaseStatus, useInitializeDatabase } from '@/lib/api/database';

export default function UsersPage() {
  // React Query hooks
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: dbStatus, isLoading: dbStatusLoading, refetch: refetchDbStatus } = useDatabaseStatus();
  const initializeDb = useInitializeDatabase();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  
  // Local state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null);
  const [formData, setFormData] = useState<CreateUserData & { is_active: boolean }>({
    email: '',
    name: '',
    password: '',
    role: 'Viewer' as 'Admin' | 'Accountant' | 'Viewer',
    is_active: true
  });

  // Create or update user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        ...formData,
      });
    } else {
      await createUserMutation.mutateAsync(formData);
    }
    
    // Reset form and close dialog
    setShowCreateDialog(false);
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '', role: 'Viewer', is_active: true });
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    await deleteUserMutation.mutateAsync(userId);
  };

  // Edit user
  const handleEdit = (user: DatabaseUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      is_active: user.is_active
    });
    setShowCreateDialog(true);
  };

  const handleInitializeDatabase = async () => {
    await initializeDb.mutateAsync();
    refetchDbStatus();
    refetchUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Accountant': return 'bg-blue-100 text-blue-800';
      case 'Viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <Layout>
        <div className="space-y-8 px-2 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage system users and database</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => refetchDbStatus()}
                disabled={dbStatusLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Check Connection</span>
              </Button>
              {dbStatus?.connected && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              )}
            </div>
          </div>

          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Database Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {dbStatusLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : dbStatus?.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>
                    {dbStatusLoading
                      ? 'Checking connection...' 
                      : dbStatus?.message || 'Unknown status'
                    }
                  </span>
                </div>
                {!dbStatus?.connected && !dbStatusLoading && (
                  <Button 
                    onClick={handleInitializeDatabase} 
                    variant="outline"
                    disabled={initializeDb.isPending}
                  >
                    {initializeDb.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                    Initialize Database
                  </Button>
                )}
              </div>
              
              {!dbStatus?.connected && !dbStatusLoading && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Make sure your MySQL database is running and the connection details in your environment variables are correct.
                    <br />
                    <strong>Required environment variables:</strong> DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          {dbStatus?.connected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>System Users ({users.length})</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" text="Loading users..." />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={updateUserMutation.isPending}
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {user.name}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(user.id)}
                                        disabled={deleteUserMutation.isPending}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {deleteUserMutation.isPending && (
                                          <LoadingSpinner size="sm" className="mr-2" />
                                        )}
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Create/Edit User Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information' : 'Add a new user to the system'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser && '(leave blank to keep current)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setEditingUser(null);
                      setFormData({ email: '', name: '', password: '', role: 'Viewer', is_active: true });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {(createUserMutation.isPending || updateUserMutation.isPending) && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}