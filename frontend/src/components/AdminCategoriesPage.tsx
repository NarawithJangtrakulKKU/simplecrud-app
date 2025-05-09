'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

// ประเภทสำหรับหมวดหมู่
interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    id: 0,
    name: '',
    description: '',
  });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/categories`);
        
        // แปลงข้อมูลจาก API
        let categoriesData: Category[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data.map(formatCategoryData);
        } else if (response.data && typeof response.data === 'object') {
          // หากข้อมูลเป็น object ที่มี items หรือ categories
          const categoriesArray = response.data.items || response.data.categories || [];
          if (Array.isArray(categoriesArray)) {
            categoriesData = categoriesArray.map(formatCategoryData);
          }
        }
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // ใช้ข้อมูลจำลองเมื่อมีข้อผิดพลาด
        const mockCategories = Array(5).fill(0).map((_, index) => ({
          id: index + 1,
          name: `Sample Category ${index + 1}`,
          description: `This is a sample category description ${index + 1}`,
          productCount: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - index * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - index * 43200000).toISOString(),
        }));
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [apiUrl]);

  // ฟังก์ชันแปลงข้อมูลหมวดหมู่ให้มีรูปแบบที่ถูกต้อง
  const formatCategoryData = (category: any): Category => ({
    id: Number(category.id) || 0,
    name: category.name?.toString() || 'Unnamed Category',
    description: category.description?.toString() || '',
    productCount: typeof category.productCount === 'number' ? category.productCount : 0,
    createdAt: category.createdAt?.toString() || new Date().toISOString(),
    updatedAt: category.updatedAt?.toString() || new Date().toISOString(),
  });

  // ฟังก์ชันสร้างหมวดหมู่ใหม่
  const handleCreateCategory = async () => {
    if (!createFormData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${apiUrl}/categories`,
        createFormData,
        { withCredentials: true }
      );
      
      // เพิ่มหมวดหมู่ใหม่ลงในรายการ
      const newCategory = formatCategoryData(response.data);
      setCategories([newCategory, ...categories]);
      
      // รีเซ็ตฟอร์ม
      setCreateFormData({
        name: '',
        description: '',
      });
      
      alert('Category created successfully!');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const mockNewCategory: Category = {
        id: Date.now(),
        name: createFormData.name,
        description: createFormData.description,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCategories([mockNewCategory, ...categories]);
      
      // รีเซ็ตฟอร์ม
      setCreateFormData({
        name: '',
        description: '',
      });
      setCreateDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันอัปเดตหมวดหมู่
  const handleUpdateCategory = async () => {
    if (!editFormData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const { id, ...updateData } = editFormData;
      await axios.patch(
        `${apiUrl}/categories/${id}`,
        updateData,
        { withCredentials: true }
      );
      
      // อัปเดตข้อมูลในรายการ
      const updatedCategories = categories.map(category => {
        if (category.id === id) {
          return {
            ...category,
            name: editFormData.name,
            description: editFormData.description,
            updatedAt: new Date().toISOString(),
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      
      alert('Category updated successfully!');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedCategories = categories.map(category => {
        if (category.id === editFormData.id) {
          return {
            ...category,
            name: editFormData.name,
            description: editFormData.description,
            updatedAt: new Date().toISOString(),
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      setEditDialogOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedCategory(null);
    }
  };

  // ฟังก์ชันลบหมวดหมู่
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsSubmitting(true);
      await axios.delete(
        `${apiUrl}/categories/${categoryToDelete.id}`,
        { withCredentials: true }
      );
      
      // ลบหมวดหมู่ออกจากรายการ
      const updatedCategories = categories.filter(category => category.id !== categoryToDelete.id);
      setCategories(updatedCategories);
      
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedCategories = categories.filter(category => category.id !== categoryToDelete.id);
      setCategories(updatedCategories);
    } finally {
      setIsSubmitting(false);
      setCategoryToDelete(null);
    }
  };

  // ฟังก์ชันเลือกหมวดหมู่สำหรับแก้ไข
  const handleSelectForEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      id: category.id,
      name: category.name,
      description: category.description,
    });
    setEditDialogOpen(true);
  };

  // ฟังก์ชันเลือกหมวดหมู่สำหรับลบ
  const handleSelectForDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  // กรองรายการตามคำค้นหา
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // วันที่สร้างและอัปเดตในรูปแบบที่อ่านได้
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
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
              <h1 className="ml-3 text-2xl font-semibold text-gray-900">Categories</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* ไอคอนผู้ดูแลระบบ */}
              <div className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white">
                <span className="sr-only">Admin profile</span>
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        
        {/* เนื้อหาหลัก */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories Management</CardTitle>
                <CardDescription>Manage your product categories here</CardDescription>
              </div>
              
              {/* ปุ่มสร้างหมวดหมู่ใหม่ */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new category to organize your products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={createFormData.name}
                        onChange={(e) => 
                          setCreateFormData({...createFormData, name: e.target.value})
                        }
                        className="col-span-3"
                        placeholder="Category name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={createFormData.description}
                        onChange={(e) => 
                          setCreateFormData({...createFormData, description: e.target.value})
                        }
                        className="col-span-3"
                        placeholder="Category description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateCategory} 
                      disabled={isSubmitting}
                      className="bg-black hover:bg-gray-800"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Category'}
                    </Button>
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
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* ตารางแสดงรายการหมวดหมู่ */}
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
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="min-w-[300px]">Description</TableHead>
                        <TableHead className="text-center">Products</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                              {category.description || <span className="text-gray-400">No description</span>}
                            </TableCell>
                            <TableCell className="text-center">{category.productCount || 0}</TableCell>
                            <TableCell>{formatDate(category.createdAt)}</TableCell>
                            <TableCell>{formatDate(category.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {/* ปุ่มแก้ไข */}
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => { handleSelectForEdit(category); setEditDialogOpen(true); }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Category</DialogTitle>
                                      <DialogDescription>
                                        Make changes to the category.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editName" className="text-right">
                                          Name
                                        </Label>
                                        <Input
                                          id="editName"
                                          value={editFormData.name}
                                          onChange={(e) => 
                                            setEditFormData({...editFormData, name: e.target.value})
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editDescription" className="text-right">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="editDescription"
                                          value={editFormData.description}
                                          onChange={(e) => 
                                            setEditFormData({...editFormData, description: e.target.value})
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogClose>
                                      <Button 
                                        onClick={handleUpdateCategory} 
                                        disabled={isSubmitting}
                                        className="bg-black hover:bg-gray-800"
                                      >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                {/* ปุ่มลบ */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleSelectForDelete(category)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
                                        {categoryToDelete?.productCount && categoryToDelete.productCount > 0 && (
                                          <span className="text-red-500 block mt-2">
                                            Warning: This category contains {categoryToDelete.productCount} products.
                                            Deleting it may affect those products.
                                          </span>
                                        )}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteCategory}
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
                          <TableCell colSpan={6} className="h-24 text-center">
                            No categories found.
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
                Total: {filteredCategories.length} categories
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}