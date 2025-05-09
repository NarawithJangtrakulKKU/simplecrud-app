'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { Users as UsersIcon, Search, Edit, Trash2, Plus, Mail, UserCog, Shield, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ประเภทของผู้ใช้
interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// ประเภทของข้อมูลในฟอร์ม
interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
}

// ประเภทของบทบาท
type RoleOption = {
  value: 'USER' | 'ADMIN';
  label: string;
  icon: React.ReactNode;
  color: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createFormData, setCreateFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [editFormData, setEditFormData] = useState<UserFormData & { id: string }>({
    id: '',
    name: '',
    email: '',
    role: 'USER',
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ตัวเลือกบทบาท
  const roleOptions: RoleOption[] = [
    { 
      value: 'USER', 
      label: 'User', 
      icon: <User className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    { 
      value: 'ADMIN', 
      label: 'Admin', 
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
  ];

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateUserForm = (data: UserFormData, isCreating = false) => {
    const errors: {[key: string]: string} = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (isCreating && !data.password?.trim()) {
      errors.password = 'Password is required';
    } else if (isCreating && data.password && data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/users`);
        
        let usersData: User[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          usersData = response.data.map(formatUserData);
        } else if (response.data && typeof response.data === 'object') {
          const usersArray = response.data.items || response.data.users || [];
          if (Array.isArray(usersArray)) {
            usersData = usersArray.map(formatUserData);
          }
        }
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        
        // ใช้ข้อมูลจำลอง
        const mockUsers: User[] = Array(8).fill(0).map((_, index) => ({
          id: `user-${index + 1}`,
          name: `User ${index + 1}`,
          email: `user${index + 1}@example.com`,
          role: index < 2 ? 'ADMIN' : 'USER',
          createdAt: new Date(Date.now() - index * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - index * 43200000).toISOString(),
        }));
        
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  // ฟังก์ชันแปลงข้อมูลผู้ใช้
  const formatUserData = (user: any): User => ({
    id: user.id?.toString() || '',
    name: user.name || null,
    email: user.email?.toString() || '',
    role: (user.role === 'ADMIN' ? 'ADMIN' : 'USER'),
    createdAt: user.createdAt?.toString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toString() || new Date().toISOString(),
  });

  // ฟังก์ชันสร้างผู้ใช้ใหม่
  const handleCreateUser = async () => {
    const errors = validateUserForm(createFormData, true);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${apiUrl}/users`, createFormData);
      
      // เพิ่มผู้ใช้ใหม่ลงในรายการ
      const newUser = formatUserData(response.data);
      setUsers([newUser, ...users]);
      
      // รีเซ็ตฟอร์ม
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      });
      
      alert('User created successfully!');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const mockNewUser: User = {
        id: `user-${Date.now()}`,
        name: createFormData.name,
        email: createFormData.email,
        role: createFormData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUsers([mockNewUser, ...users]);
      
      // รีเซ็ตฟอร์ม
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      });
      setCreateDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันอัปเดตผู้ใช้
  const handleUpdateUser = async () => {
    const { id, ...updateData } = editFormData;
    const errors = validateUserForm(updateData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // สร้างข้อมูลที่จะอัปเดต (ไม่ส่ง password ถ้าไม่ได้กรอก)
      const dataToUpdate = { ...updateData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }
      
      await axios.patch(`${apiUrl}/users/${id}`, dataToUpdate);
      
      // อัปเดตข้อมูลในรายการ
      const updatedUsers = users.map(user => {
        if (user.id === id) {
          return {
            ...user,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      alert('User updated successfully!');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedUsers = users.map(user => {
        if (user.id === id) {
          return {
            ...user,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setEditDialogOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  // ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`${apiUrl}/users/${userToDelete.id}`);
      
      // ลบผู้ใช้ออกจากรายการ
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
    } finally {
      setIsSubmitting(false);
      setUserToDelete(null);
    }
  };

  // ฟังก์ชันเลือกผู้ใช้สำหรับแก้ไข
  const handleSelectForEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
    });
    setFormErrors({});
  };

  // ฟังก์ชันเลือกผู้ใช้สำหรับลบ
  const handleSelectForDelete = (user: User) => {
    setUserToDelete(user);
  };

  // กรองรายการตามคำค้นหา
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟังก์ชันแสดงวันที่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // ฟังก์ชันค้นหา Role Option จากค่า
  const getRoleOption = (role: 'USER' | 'ADMIN'): RoleOption => {
    return roleOptions.find(option => option.value === role) || roleOptions[0];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* เนื้อหาหลัก */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* แถบด้านบน */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* ปุ่มเมนูมือถือ */}
              <div className="md:hidden">
                <AdminSidebar isMobile={true} />
              </div>
              <h1 className="ml-3 text-2xl font-semibold text-gray-900">Users</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* ไอคอนผู้ดูแลระบบ */}
              <div className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white">
                <span className="sr-only">Admin profile</span>
                <UsersIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        
        {/* เนื้อหาหลัก */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>Manage your system users here</CardDescription>
              </div>
              
              {/* ปุ่มสร้างผู้ใช้ใหม่ */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system. Fill out the information below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name *
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="name"
                          value={createFormData.name}
                          onChange={(e) => 
                            setCreateFormData({...createFormData, name: e.target.value})
                          }
                          className={formErrors.name ? "border-red-500" : ""}
                          placeholder="Full name"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email *
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="email"
                          type="email"
                          value={createFormData.email}
                          onChange={(e) => 
                            setCreateFormData({...createFormData, email: e.target.value})
                          }
                          className={formErrors.email ? "border-red-500" : ""}
                          placeholder="user@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password *
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="password"
                          type="password"
                          value={createFormData.password || ''}
                          onChange={(e) => 
                            setCreateFormData({...createFormData, password: e.target.value})
                          }
                          className={formErrors.password ? "border-red-500" : ""}
                          placeholder="••••••••"
                        />
                        {formErrors.password && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 6 characters
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={createFormData.role}
                          onValueChange={(value: 'USER' | 'ADMIN') => 
                            setCreateFormData({...createFormData, role: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center">
                                  {role.icon}
                                  <span className="ml-2">{role.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <div className="w-full flex justify-between items-center">
                      <p className="text-sm text-gray-500">Fields marked with * are required</p>
                      <div>
                        <DialogClose asChild>
                          <Button variant="outline" className="mr-2">Cancel</Button>
                        </DialogClose>
                        <Button 
                          onClick={handleCreateUser} 
                          disabled={isSubmitting}
                          className="bg-black hover:bg-gray-800"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </div>
                          ) : 'Create User'}
                        </Button>
                      </div>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              {/* ช่องค้นหา */}
              <div className="flex items-center mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search users by name, email or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* ตารางแสดงรายการผู้ใช้ */}
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Name & Email</TableHead>
                        <TableHead className="w-[100px] text-center">Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.name || 'Unnamed User'}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span>{user.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {user.role === 'ADMIN' ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  <Shield className="h-3 w-3 mr-1" /> Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  <User className="h-3 w-3 mr-1" /> User
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{formatDate(user.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {/* ปุ่มแก้ไข */}
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => { handleSelectForEdit(user); setEditDialogOpen(true); }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[550px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit User</DialogTitle>
                                      <DialogDescription>
                                        Make changes to {user.name || user.email}'s information.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editName" className="text-right">
                                          Name *
                                        </Label>
                                        <div className="col-span-3">
                                          <Input
                                            id="editName"
                                            value={editFormData.name}
                                            onChange={(e) => 
                                              setEditFormData({...editFormData, name: e.target.value})
                                            }
                                            className={formErrors.name ? "border-red-500" : ""}
                                          />
                                          {formErrors.name && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editEmail" className="text-right">
                                          Email *
                                        </Label>
                                        <div className="col-span-3">
                                          <Input
                                            id="editEmail"
                                            type="email"
                                            value={editFormData.email}
                                            onChange={(e) => 
                                              setEditFormData({...editFormData, email: e.target.value})
                                            }
                                            className={formErrors.email ? "border-red-500" : ""}
                                          />
                                          {formErrors.email && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editPassword" className="text-right">
                                          Password
                                        </Label>
                                        <div className="col-span-3">
                                          <Input
                                            id="editPassword"
                                            type="password"
                                            value={editFormData.password || ''}
                                            onChange={(e) => 
                                              setEditFormData({...editFormData, password: e.target.value})
                                            }
                                            className={formErrors.password ? "border-red-500" : ""}
                                            placeholder="Leave blank to keep current password"
                                          />
                                          {formErrors.password && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                          )}
                                          <p className="text-xs text-gray-500 mt-1">
                                            Only fill this if you want to change the password
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editRole" className="text-right">
                                          Role
                                        </Label>
                                        <div className="col-span-3">
                                          <Select
                                            value={editFormData.role}
                                            onValueChange={(value: 'USER' | 'ADMIN') => 
                                              setEditFormData({...editFormData, role: value})
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {roleOptions.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                  <div className="flex items-center">
                                                    {role.icon}
                                                    <span className="ml-2">{role.label}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <div className="w-full flex justify-between items-center">
                                        <p className="text-sm text-gray-500">Fields marked with * are required</p>
                                        <div>
                                          <DialogClose asChild>
                                            <Button variant="outline" className="mr-2">Cancel</Button>
                                          </DialogClose>
                                          <Button 
                                            onClick={handleUpdateUser} 
                                            disabled={isSubmitting}
                                            className="bg-black hover:bg-gray-800"
                                          >
                                            {isSubmitting ? (
                                              <div className="flex items-center">
                                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              Saving...
                                            </div>
                                          ) : 'Save Changes'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* ปุ่มลบ */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleSelectForDelete(user)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete <strong>{userToDelete?.name || userToDelete?.email}</strong>?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteUser}
                                      className="bg-red-500 hover:bg-red-600"
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {searchTerm 
                            ? `No users found matching "${searchTerm}"`
                            : 'No users found. Create your first user!'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Total: {filteredUsers.length} users
            </div>
            
            {searchTerm && (
              <div className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  </div>
);
}