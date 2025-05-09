'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, ShoppingCart, Filter, SlidersHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// ประเภทสำหรับสินค้า
interface Product {
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
}

// ประเภทสำหรับหมวดหมู่
interface Category {
  id: number;
  name: string;
}

export default function MenuListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [initialPriceRange, setInitialPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ดึงข้อมูลสินค้าและหมวดหมู่
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลหมวดหมู่
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
        
        // ดึงข้อมูลสินค้า
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
          
          // กำหนดช่วงราคาตามข้อมูลสินค้า
          if (productsData.length > 0) {
            const prices = productsData.map(product => product.price);
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange([minPrice, maxPrice]);
            setInitialPriceRange([minPrice, maxPrice]);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          // ใช้ข้อมูลจำลอง
          const mockProducts: Product[] = Array(16).fill(0).map((_, index) => {
            const randomCategory = categoriesData[Math.floor(Math.random() * categoriesData.length)];
            const categoryId = Number(randomCategory.id) || 0;
            return {
              id: `prod-${index + 1}`,
              name: `Sample Product ${index + 1}`,
              description: `This is a sample product description ${index + 1}`,
              image: `/api/placeholder/300/200?text=Product${index+1}`,
              price: Math.floor(Math.random() * 900) + 100,
              categoryId: categoryId,
              category: { id: categoryId, name: randomCategory.name },
            };
          });
          
          setProducts(mockProducts);
          
          // กำหนดช่วงราคาตามข้อมูลสินค้า
          const prices = mockProducts.map(product => product.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
          setInitialPriceRange([minPrice, maxPrice]);
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
    // หาข้อมูลหมวดหมู่จาก categoryId
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
    };
  };

  // ฟังก์ชันสำหรับกรองและเรียงลำดับสินค้า
  const getFilteredProducts = () => {
    return products
      .filter(product => {
        // กรองตามคำค้นหา
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // กรองตามหมวดหมู่
        const matchesCategory = selectedCategory === 'all' || 
          (product.category && product.category.id.toString() === selectedCategory);
        
        // กรองตามช่วงราคา
        const matchesPrice = 
          product.price >= priceRange[0] && product.price <= priceRange[1];
        
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        // เรียงลำดับตามตัวเลือกที่เลือก
        switch (sortOption) {
          case 'price-low-high':
            return a.price - b.price;
          case 'price-high-low':
            return b.price - a.price;
          case 'name-a-z':
            return a.name.localeCompare(b.name);
          case 'name-z-a':
            return b.name.localeCompare(a.name);
          case 'newest':
            return a.id.localeCompare(b.id) * -1;
          default:
            return 0; // featured
        }
      });
  };

  // รีเซ็ตตัวกรอง
  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange(initialPriceRange);
    setSortOption('featured');
  };

  // ฟอร์แมตราคาเป็นรูปแบบสกุลเงิน
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // รายการสินค้าที่กรองแล้ว
  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search and filters */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Link href="/home" className="text-2xl font-bold text-gray-900">Menu</Link>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort options */}
            <div className="hidden md:block">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                  <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile filters */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters & Sort</SheetTitle>
                    <SheetDescription>
                      Filter and sort the products to find what you're looking for.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Sort By</h3>
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                          <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                          <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Categories</h3>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="all-categories" 
                            checked={selectedCategory === 'all'} 
                            onCheckedChange={() => setSelectedCategory('all')}
                          />
                          <label htmlFor="all-categories" className="text-sm">All Categories</label>
                        </div>
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.id}`} 
                              checked={selectedCategory === category.id.toString()} 
                              onCheckedChange={() => setSelectedCategory(category.id.toString())}
                            />
                            <label htmlFor={`category-${category.id}`} className="text-sm">{category.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={priceRange}
                          min={initialPriceRange[0]}
                          max={initialPriceRange[1]}
                          step={1}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{formatCurrency(priceRange[0])}</span>
                        <span className="text-sm">{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                  
                  <SheetFooter className="flex justify-between sm:justify-between">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop filters sidebar */}
          <div className="hidden md:block w-64 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Button 
                  variant={selectedCategory === 'all' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button 
                    key={category.id} 
                    variant={selectedCategory === category.id.toString() ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id.toString())}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="px-2">
                <Slider
                  defaultValue={priceRange}
                  min={initialPriceRange[0]}
                  max={initialPriceRange[1]}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
            
            <Separator />
            
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
          
          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-48 bg-gray-200">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/3 mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedCategory === 'all' 
                        ? 'All Products' 
                        : `${categories.find(c => c.id.toString() === selectedCategory)?.name || 'Products'}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {filteredProducts.length} items found
                    </p>
                  </div>
                </div>
                
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden group min-h-[350px] flex flex-col">
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image.startsWith('http') ? product.image : `${apiUrl}${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              No image available
                            </div>
                          )}
                          {product.category && (
                            <Badge className="absolute top-2 left-2 bg-black text-white">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4 flex flex-col flex-1">
                          <h3 className="font-medium truncate">
                            <Link href={`/product/${product.id}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                              {product.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                            <Button variant="outline" size="sm" className="group-hover:bg-black group-hover:text-white transition-colors">
                              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      We couldn't find any products matching your search and filters.
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Button variant="outline" onClick={resetFilters} className="mt-4">
                      Reset Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}