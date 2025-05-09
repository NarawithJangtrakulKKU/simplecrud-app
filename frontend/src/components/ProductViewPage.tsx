'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Check, 
  Minus, 
  Plus, 
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  createdAt?: string;
  updatedAt?: string;
}

// ประเภทสำหรับหมวดหมู่
interface Category {
  id: string | number;
  name: string;
}

// Props ของคอมโพเนนต์
interface ProductViewPageProps {
  id: string;
}

export default function ProductViewPage({ id }: ProductViewPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ดึงข้อมูลสินค้าตาม ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${apiUrl}/products/${id}`);
        
        // แปลงข้อมูลสินค้า
        let productData: Product | null = null;
        
        if (response.data) {
          productData = {
            id: response.data.id?.toString() || '',
            name: response.data.name?.toString() || 'Unnamed Product',
            description: response.data.description?.toString() || '',
            image: response.data.image?.toString() || '',
            price: typeof response.data.price === 'number' ? response.data.price : 0,
            categoryId: Number(response.data.categoryId) || 0,
            category: response.data.category || null,
            createdAt: response.data.createdAt?.toString() || '',
            updatedAt: response.data.updatedAt?.toString() || '',
          };
        }
        
        setProduct(productData);
        
        // ถ้าเจอสินค้า ให้ดึงสินค้าที่เกี่ยวข้อง
        if (productData && productData.categoryId) {
          fetchRelatedProducts(productData.categoryId);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
        
        // ใช้ข้อมูลจำลอง
        const mockProduct: Product = {
          id: id,
          name: 'Sample Product',
          description: 'This is a detailed description of the sample product. It includes information about the product features, benefits, and specifications. The product is designed to provide excellent value and quality to customers.',
          image: '/api/placeholder/500/400',
          price: 199.99,
          categoryId: 1,
          category: { id: 1, name: 'Electronics' },
        };
        
        setProduct(mockProduct);
        
        // ดึงสินค้าที่เกี่ยวข้องจำลอง
        const mockRelatedProducts = Array(4).fill(0).map((_, index) => ({
          id: `rel-${index + 1}`,
          name: `Related Product ${index + 1}`,
          image: `/api/placeholder/200/150?text=Related${index+1}`,
          price: 99 + index * 20,
          categoryId: 1,
          category: { id: 1, name: 'Electronics' },
        }));
        
        setRelatedProducts(mockRelatedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, apiUrl]);

  // ดึงสินค้าที่เกี่ยวข้อง
  const fetchRelatedProducts = async (categoryId: number) => {
    try {
      const response = await axios.get(`${apiUrl}/products?categoryId=${categoryId}`);
      
      let productsData: Product[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        productsData = response.data.filter((p: any) => p.id !== id).slice(0, 4);
      } else if (response.data && typeof response.data === 'object') {
        const productsArray = response.data.items || response.data.products || [];
        if (Array.isArray(productsArray)) {
          productsData = productsArray.filter((p: any) => p.id !== id).slice(0, 4);
        }
      }
      
      setRelatedProducts(productsData);
    } catch (error) {
      console.error('Error fetching related products:', error);
      
      // ใช้ข้อมูลจำลอง
      const mockRelatedProducts = Array(4).fill(0).map((_, index) => ({
        id: `rel-${index + 1}`,
        name: `Related Product ${index + 1}`,
        image: `/api/placeholder/200/150?text=Related${index+1}`,
        price: 99 + index * 20,
        categoryId: categoryId,
        category: { id: categoryId, name: 'Related Category' },
      }));
      
      setRelatedProducts(mockRelatedProducts);
    }
  };

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // ตัวอย่างโค้ดสำหรับเพิ่มสินค้าลงตะกร้า (ปรับแต่งตาม API จริง)
      // await axios.post(`${apiUrl}/cart`, {
      //   productId: product.id,
      //   quantity: quantity
      // });
      
      // จำลองการรอ API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // แสดงข้อความสำเร็จ
      alert(`Added ${quantity} item(s) of ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // ปรับเปลี่ยนจำนวนสินค้า
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // กลับไปหน้าเมนู
  const goBackToMenu = () => {
    router.push('/menu');
  };

  // ฟอร์แมตราคาเป็นรูปแบบสกุลเงิน
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full md:w-[500px]" />
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-6">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Product not found.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/menu?category=${product.categoryId}`}>
                    {product.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button variant="outline" className="mb-6" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full max-w-md aspect-square flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image.startsWith('http') ? product.image : `${apiUrl}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-2">
                  <Tag className="h-3 w-3 mr-1" /> {product.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">4.0 (24 reviews)</span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-600">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Quantity</h3>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-1 border-r border-gray-300"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1 font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-1 border-l border-gray-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Availability</h3>
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span>In Stock</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-black hover:bg-gray-800"
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-6 bg-white border rounded-md mt-2">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <p className="text-gray-600">
              {product.description || 'No detailed information available for this product.'} 
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>Premium quality materials</li>
              <li>Designed for durability and performance</li>
              <li>Carefully crafted with attention to detail</li>
              <li>Comes with a satisfaction guarantee</li>
            </ul>
          </TabsContent>
          <TabsContent value="specifications" className="p-6 bg-white border rounded-md mt-2">
            <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">Premium Brand</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">X-2000</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">10 x 5 x 2 inches</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">1.2 lbs</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Material</p>
                <p className="font-medium">Premium Materials</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-medium">Multiple Options</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-6 bg-white border rounded-md mt-2">
            <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
            <div className="space-y-6">
              {/* Sample Reviews */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">John D.</span>
                  <span className="text-xs text-gray-500 ml-2">2 months ago</span>
                </div>
                <p className="text-gray-600">
                  Great product! I've been using it for a month now and I'm very satisfied with the quality and performance.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">Sarah M.</span>
                  <span className="text-xs text-gray-500 ml-2">1 month ago</span>
                </div>
                <p className="text-gray-600">
                  Good product but it took a while to arrive. The quality is excellent though.
                </p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">Robert K.</span>
                  <span className="text-xs text-gray-500 ml-2">3 weeks ago</span>
                </div>
                <p className="text-gray-600">
                  It's okay but I expected better for the price. The design is nice but functionality could be improved.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden group">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {relatedProduct.image ? (
                      <img
                        src={relatedProduct.image.startsWith('http') ? relatedProduct.image : `${apiUrl}${relatedProduct.image}`}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">{relatedProduct.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold">{formatCurrency(relatedProduct.price)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/product/${relatedProduct.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}