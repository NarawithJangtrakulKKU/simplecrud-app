'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Link from 'next/link';

// ประเภทสำหรับข้อมูลผลิตภัณฑ์
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

// ประเภทสำหรับข้อมูลหมวดหมู่
interface Category {
  id: string;
  name: string;
  productCount: number;
}

// ประเภทสำหรับข้อมูลสถิติแดชบอร์ด
interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  recentProducts: Product[];
  productsByCategory: { name: string; value: number }[];
  monthlySales: { month: string; sales: number }[];
}

// ข้อมูลยอดขายรายเดือนตัวอย่าง
const sampleSalesData = [
  { month: 'Jan', sales: 5000 },
  { month: 'Feb', sales: 7000 },
  { month: 'Mar', sales: 4000 },
  { month: 'Apr', sales: 8000 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 9000 },
  { month: 'Jul', sales: 10000 },
  { month: 'Aug', sales: 12000 },
  { month: 'Sep', sales: 8000 },
  { month: 'Oct', sales: 11000 },
  { month: 'Nov', sales: 15000 },
  { month: 'Dec', sales: 18000 },
];

// สีสำหรับ Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    recentProducts: [],
    productsByCategory: [],
    monthlySales: sampleSalesData
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // ตรวจสอบครั้งแรก
    checkIfMobile();
    
    // เพิ่ม event listener
    window.addEventListener('resize', checkIfMobile);
    
    // ทำความสะอาด
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // ดึงข้อมูลสำหรับ dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลสินค้า
        let products: Product[] = [];
        let categories: Category[] = [];
        
        try {
          // ดึงข้อมูลสินค้า
          const productsResponse = await axios.get(`${apiUrl}/products`);
          
          // ตรวจสอบและแปลงข้อมูลสินค้า
          if (productsResponse.data && Array.isArray(productsResponse.data)) {
            products = productsResponse.data.map((product: any) => ({
              id: product.id?.toString() || '',
              name: product.name?.toString() || 'Unnamed Product',
              price: typeof product.price === 'number' ? product.price : 0,
              category: product.category?.toString() || 'Uncategorized',
              createdAt: product.createdAt?.toString() || new Date().toISOString()
            }));
          } else if (productsResponse.data && typeof productsResponse.data === 'object') {
            // หากข้อมูลเป็น object ที่มี items หรือ products
            const productsArray = productsResponse.data.items || productsResponse.data.products || [];
            if (Array.isArray(productsArray)) {
              products = productsArray.map((product: any) => ({
                id: product.id?.toString() || '',
                name: product.name?.toString() || 'Unnamed Product',
                price: typeof product.price === 'number' ? product.price : 0,
                category: product.category?.toString() || 'Uncategorized',
                createdAt: product.createdAt?.toString() || new Date().toISOString()
              }));
            }
          }
          
          // ดึงข้อมูลหมวดหมู่
          const categoriesResponse = await axios.get(`${apiUrl}/categories`);
          
          // ตรวจสอบและแปลงข้อมูลหมวดหมู่
          if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            categories = categoriesResponse.data.map((category: any) => ({
              id: category.id?.toString() || '',
              name: category.name?.toString() || 'Unnamed Category',
              productCount: typeof category.productCount === 'number' ? category.productCount : 0
            }));
          } else if (categoriesResponse.data && typeof categoriesResponse.data === 'object') {
            // หากข้อมูลเป็น object ที่มี items หรือ categories
            const categoriesArray = categoriesResponse.data.items || categoriesResponse.data.categories || [];
            if (Array.isArray(categoriesArray)) {
              categories = categoriesArray.map((category: any) => ({
                id: category.id?.toString() || '',
                name: category.name?.toString() || 'Unnamed Category',
                productCount: typeof category.productCount === 'number' ? category.productCount : 0
              }));
            }
          }
        } catch (error) {
          console.error('API call failed, using mock data', error);
          // ในกรณีที่ API ยังไม่พร้อมใช้งาน ให้ใช้ข้อมูลจำลอง
          products = Array(5).fill(0).map((_, i) => ({
            id: `product-${i+1}`,
            name: `Sample Product ${i+1}`,
            price: Math.floor(Math.random() * 500) + 50,
            category: i % 2 === 0 ? 'Electronics' : 'Clothing',
            createdAt: new Date(Date.now() - i * 86400000).toISOString()
          }));
          
          categories = [
            { id: 'cat-1', name: 'Electronics', productCount: 15 },
            { id: 'cat-2', name: 'Clothing', productCount: 10 },
            { id: 'cat-3', name: 'Books', productCount: 8 },
            { id: 'cat-4', name: 'Home', productCount: 5 },
            { id: 'cat-5', name: 'Beauty', productCount: 4 }
          ];
        }
        
        // สมมติว่ามี endpoint ผู้ใช้หรือใช้ข้อมูลจำลอง
        const users = { count: 125 }; // ข้อมูลจำลอง
        
        // ประมวลผลสถิติหมวดหมู่
        const categoryStats = categories.map((category) => ({
          name: category.name || 'Unnamed',
          value: category.productCount || 0
        }));
        
        // ตั้งค่าสถิติแดชบอร์ด
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          totalUsers: users.count,
          recentProducts: products.slice(0, 5), // ดึง 5 สินค้าล่าสุด
          productsByCategory: categoryStats,
          monthlySales: sampleSalesData // ใช้ข้อมูลจำลองสำหรับยอดขาย
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // ตั้งค่าข้อมูลจำลองในกรณีเกิดข้อผิดพลาด
        setStats({
          totalProducts: 42,
          totalCategories: 8,
          totalUsers: 125,
          recentProducts: [],
          productsByCategory: [
            { name: 'Electronics', value: 15 },
            { name: 'Clothing', value: 10 },
            { name: 'Books', value: 8 },
            { name: 'Home', value: 5 },
            { name: 'Beauty', value: 4 }
          ],
          monthlySales: sampleSalesData
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl]);

  // วันที่สร้างสินค้าในรูปแบบที่อ่านได้
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
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
              <h1 className="ml-3 text-2xl font-semibold text-gray-900">Dashboard</h1>
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
        
        {/* เนื้อหาแดชบอร์ด */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {/* สถิติภาพรวม */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M3 6h18"></path>
                  <path d="M3 12h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Manage your product inventory
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2H2v10h10V2z"></path>
                  <path d="M22 12h-10v10h10V12z"></path>
                  <path d="M12 12H2v10h10V12z"></path>
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalCategories}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Organize your products efficiently
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Track your customer base
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* กราฟ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Sales performance over the past year</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="w-full h-[300px]">
                    {stats.monthlySales.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats.monthlySales}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No sales data available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <CardDescription>Distribution of products across categories</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="w-full h-[300px]">
                    {stats.productsByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.productsByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.productsByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [`${value} products`, props?.payload?.name || '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No category data available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* รายการสินค้าล่าสุด */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Latest products added to the store</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : stats.recentProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recentProducts.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(product.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No products found</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all products
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}