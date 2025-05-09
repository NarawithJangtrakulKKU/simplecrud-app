'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { Users, Plus, Edit, Trash2, Search, Image } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ประเภทสำหรับสินค้า
type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

// ประเภทสำหรับหมวดหมู่
type Category = {
  id: number;
  name: string;
};

// DTO สำหรับสร้างและแก้ไขสินค้า
interface ProductFormData {
  name: string;
  description?: string;
  image?: string;
  price: number;
  categoryId: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createFormData, setCreateFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    image: '',
    price: 0,
    categoryId: 0,
  });
  const [editFormData, setEditFormData] = useState<ProductFormData & { id: string }>({
    id: '',
    name: '',
    description: '',
    image: '',
    price: 0,
    categoryId: 0,
  });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  const validateProductForm = (data: ProductFormData) => {
    const errors: {[key: string]: string} = {};
    
    if (!data.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!data.categoryId || data.categoryId <= 0) {
      errors.categoryId = 'Category is required';
    }
    
    return errors;
  };

  // ฟังก์ชันดึงข้อมูลสินค้าและหมวดหมู่
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ฟังก์ชันดึงข้อมูลหมวดหมู่
        let categoriesData: Category[] = [];
        try {
          const categoriesResponse = await axios.get(`${apiUrl}/categories`);
          
          if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            categoriesData = categoriesResponse.data.map(formatCategoryData);
          } else if (categoriesResponse.data && typeof categoriesResponse.data === 'object') {
            const categoriesArray = categoriesResponse.data.items || categoriesResponse.data.categories || [];
            if (Array.isArray(categoriesArray)) {
              categoriesData = categoriesArray.map(formatCategoryData);
            }
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          // ใช้ข้อมูลจำลอง
          categoriesData = [
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
            { id: 3, name: 'Books' },
            { id: 4, name: 'Home' },
            { id: 5, name: 'Beauty' }
          ];
        }
        
        setCategories(categoriesData);
        
        // ฟังก์ชันดึงข้อมูลสินค้า
        try {
          const productsResponse = await axios.get(`${apiUrl}/products`);
          
          let productsData: Product[] = [];
          
          if (productsResponse.data && Array.isArray(productsResponse.data)) {
            productsData = productsResponse.data.map((product: any) => 
              formatProductData(product, categoriesData)
            );
          } else if (productsResponse.data && typeof productsResponse.data === 'object') {
            const productsArray = productsResponse.data.items || productsResponse.data.products || [];
            if (Array.isArray(productsArray)) {
              productsData = productsArray.map((product: any) => 
                formatProductData(product, categoriesData)
              );
            }
          }
          
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching products:', error);
          // ใช้ข้อมูลจำลอง
          const mockProducts = Array(8).fill(0).map((_, index) => ({
            id: `prod-${index + 1}`,
            name: `Sample Product ${index + 1}`,
            description: `This is a sample product description ${index + 1}`,
            image: `/api/placeholder/100/100?text=Product${index+1}`,
            price: Math.floor(Math.random() * 1000) + 10,
            categoryId: categoriesData[Math.floor(Math.random() * categoriesData.length)].id,
            category: categoriesData[Math.floor(Math.random() * categoriesData.length)],
            createdAt: new Date(Date.now() - index * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - index * 43200000).toISOString(),
          }));
          
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // ฟังก์ชันแปลงข้อมูลหมวดหมู่
  const formatCategoryData = (category: any): Category => ({
    id: Number(category.id) || 0,
    name: category.name?.toString() || 'Unnamed Category',
  });

  // ฟังก์ชันแปลงข้อมูลสินค้า
  const formatProductData = (product: any, categoriesList: Category[]): Product => {
    const categoryId = Number(product.categoryId) || 0;
    const category = categoriesList.find(cat => cat.id === categoryId);
    return {
      id: product.id?.toString() || '',
      name: product.name?.toString() || 'Unnamed Product',
      description: product.description?.toString() || '',
      image: product.image?.toString() || '',
      price: typeof product.price === 'number' ? product.price : 0,
      categoryId: categoryId,
      category: category,
      createdAt: product.createdAt?.toString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toString() || new Date().toISOString(),
    };
  };

  // ฟังก์ชันสร้างสินค้าใหม่
  const handleCreateProduct = async () => {
    const errors = validateProductForm(createFormData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      setIsSubmitting(true);
      let imagePath = createFormData.image;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await axios.post(`${apiUrl}/products/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagePath = uploadRes.data.imagePath;
      }
      const response = await axios.post(
        `${apiUrl}/products`,
        {
          ...createFormData,
          image: imagePath,
          price: Number(createFormData.price),
          categoryId: Number(createFormData.categoryId),
        },
        { withCredentials: true }
      );
      const newProduct = formatProductData(response.data, categories);
      setProducts([newProduct, ...products]);
      setCreateFormData({ name: '', description: '', image: '', price: 0, categoryId: 0 });
      setSelectedFile(null);
      alert('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    setCreateDialogOpen(false);
  };

  // ฟังก์ชันอัปเดตสินค้า
  const handleUpdateProduct = async () => {
    const { id, ...updateData } = editFormData;
    const errors = validateProductForm(updateData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.patch(`${apiUrl}/products/${id}`, updateData, { withCredentials: true });
      
      // อัปเดตข้อมูลในรายการ
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          const category = categories.find(cat => Number(cat.id) === Number(updateData.categoryId));
          return {
            ...product,
            ...updateData,
            category,
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          const category = categories.find(cat => Number(cat.id) === Number(updateData.categoryId));
          return {
            ...product,
            ...updateData,
            category,
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
    } finally {
      setIsSubmitting(false);
      setSelectedProduct(null);
    }
    setEditDialogOpen(false);
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`${apiUrl}/products/${productToDelete.id}`);
      
      // ลบสินค้าออกจากรายการ
      const updatedProducts = products.filter(product => product.id !== productToDelete.id);
      setProducts(updatedProducts);
      
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
      
      // กรณีเทสใช้ข้อมูลจำลอง
      const updatedProducts = products.filter(product => product.id !== productToDelete.id);
      setProducts(updatedProducts);
    } finally {
      setIsSubmitting(false);
      setProductToDelete(null);
    }
  };

  // ฟังก์ชันเลือกสินค้าสำหรับแก้ไข
  const handleSelectForEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      id: product.id,
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      price: product.price,
      categoryId: product.categoryId,
    });
    setFormErrors({});
  };

  // ฟังก์ชันเลือกสินค้าสำหรับลบ
  const handleSelectForDelete = (product: Product) => {
    setProductToDelete(product);
  };

  // กรองรายการตามคำค้นหา
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // วันที่สร้างและอัปเดตในรูปแบบที่อ่านได้
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // ฟอร์แมตราคาเป็นรูปแบบสกุลเงิน
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
              <h1 className="ml-3 text-2xl font-semibold text-gray-900">Products</h1>
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
                <CardTitle>Products Management</CardTitle>
                <CardDescription>Manage your store products here</CardDescription>
              </div>
              
              {/* ปุ่มสร้างสินค้าใหม่ */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your store. Fill out the information below.
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
                          placeholder="Product name"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price *
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={createFormData.price}
                          onChange={(e) => 
                            setCreateFormData({...createFormData, price: parseFloat(e.target.value) || 0})
                          }
                          className={formErrors.price ? "border-red-500" : ""}
                          placeholder="0.00"
                        />
                        {formErrors.price && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category *
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={createFormData.categoryId.toString()}
                          onValueChange={(value) => 
                            setCreateFormData({...createFormData, categoryId: parseInt(value)})
                          }
                        >
                          <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.categoryId && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right">
                        Image
                      </Label>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={createFormData.description || ''}
                        onChange={(e) => 
                          setCreateFormData({...createFormData, description: e.target.value})
                        }
                        className="col-span-3"
                        placeholder="Product description"
                        rows={4}
                      />
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
                          onClick={handleCreateProduct} 
                          disabled={isSubmitting}
                          className="bg-black hover:bg-gray-800"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Product'}
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
                    placeholder="Search products by name, description or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* ตารางแสดงรายการสินค้า */}
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
                        <TableHead className="w-[280px]">Product</TableHead>
                        <TableHead className="min-w-[150px]">Category</TableHead>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                  <img
                                    src={product.image ? `${apiUrl}${product.image}` : '/placeholder.png'}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.png';
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  {product.description && (
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.category ? (
                                <Badge variant="outline">{product.category.name}</Badge>
                              ) : (
                                <span className="text-gray-400">Uncategorized</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {formatCurrency(product.price)}
                            </TableCell>
                            <TableCell>{formatDate(product.createdAt)}</TableCell>
                            <TableCell>{formatDate(product.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {/* ปุ่มแก้ไข */}
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleSelectForEdit(product)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[550px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Product</DialogTitle>
                                      <DialogDescription>
                                        Make changes to the product information.
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
                                        <Label htmlFor="editPrice" className="text-right">
                                          Price *
                                        </Label>
                                        <div className="col-span-3">
                                          <Input
                                            id="editPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editFormData.price}
                                            onChange={(e) => 
                                              setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})
                                            }
                                            className={formErrors.price ? "border-red-500" : ""}
                                          />
                                          {formErrors.price && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="editCategory" className="text-right">
                                          Category *
                                        </Label>
                                        <div className="col-span-3">
                                          <Select
                                            value={editFormData.categoryId.toString()}
                                            onValueChange={(value) => 
                                              setEditFormData({...editFormData, categoryId: parseInt(value)})
                                            }
                                          >
                                            <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                                              <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                  {category.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          {formErrors.categoryId && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 items-start gap-4">
                                        <Label htmlFor="editDescription" className="text-right pt-2">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="editDescription"
                                          value={editFormData.description || ''}
                                          onChange={(e) => 
                                            setEditFormData({...editFormData, description: e.target.value})
                                          }
                                          className="col-span-3"
                                          rows={4}
                                        />
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
                                            onClick={handleUpdateProduct} 
                                            disabled={isSubmitting}
                                            className="bg-black hover:bg-gray-800"
                                          >
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                                      onClick={() => handleSelectForDelete(product)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteProduct}
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
                            {searchTerm 
                              ? `No products found matching "${searchTerm}"`
                              : 'No products found. Create your first product!'}
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
                Total: {filteredProducts.length} products
              </div>
              
              {searchTerm && (
                <div className="text-sm text-gray-500">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              )}
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}