'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ประเภทของสินค้า
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// ประเภทของรีวิว
interface Review {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  comment: string;
}

export default function LandingPage() {
  const router = useRouter();
  
  // สถานะสำหรับการเคลื่อนไหวของ UI
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // ข้อมูลจำลองสำหรับสินค้า
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Headphones',
      description: 'Wireless noise-cancelling headphones with premium sound quality.',
      price: 299,
      image: '/api/placeholder/400/400',
      category: 'electronics'
    },
    {
      id: '2',
      name: 'Stylish Watch',
      description: 'Elegant watch with smart features and long battery life.',
      price: 199,
      image: '/api/placeholder/400/400',
      category: 'fashion'
    },
    {
      id: '3',
      name: 'Ergonomic Chair',
      description: 'High-quality office chair designed for maximum comfort during long working hours.',
      price: 349,
      image: '/api/placeholder/400/400',
      category: 'furniture'
    },
    {
      id: '4',
      name: 'Smart Speaker',
      description: 'Voice-controlled smart speaker with premium sound and virtual assistant.',
      price: 129,
      image: '/api/placeholder/400/400',
      category: 'electronics'
    },
    {
      id: '5',
      name: 'Designer Backpack',
      description: 'Water-resistant backpack with multiple compartments and laptop sleeve.',
      price: 89,
      image: '/api/placeholder/400/400',
      category: 'fashion'
    },
    {
      id: '6',
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe and auto-shutoff feature.',
      price: 159,
      image: '/api/placeholder/400/400',
      category: 'kitchen'
    },
  ];

  // ข้อมูลจำลองสำหรับหมวดหมู่
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'kitchen', name: 'Kitchen' },
  ];

  // ข้อมูลจำลองสำหรับรีวิว
  const customerReviews: Review[] = [
    {
      id: '1',
      name: 'John Smith',
      avatar: '/api/placeholder/60/60',
      stars: 5,
      comment: 'Absolutely love my new headphones! The sound quality is incredible and the noise cancellation works perfectly.'
    },
    {
      id: '2',
      name: 'Emma Johnson',
      avatar: '/api/placeholder/60/60',
      stars: 4,
      comment: 'The watch is beautiful and has great features. Battery life could be a bit better, but overall I\'m very happy with my purchase.'
    },
    {
      id: '3',
      name: 'Michael Davis',
      avatar: '/api/placeholder/60/60',
      stars: 5,
      comment: 'The ergonomic chair has completely transformed my home office. No more back pain after long work sessions!'
    },
  ];

  // ข้อมูลจำลองสำหรับคุณสมบัติเด่น
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: 'Premium Quality',
      description: 'All our products meet the highest standards of quality and durability.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      title: 'Free Shipping',
      description: 'Enjoy free shipping on all orders over $50 nationwide.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '30-Day Returns',
      description: 'Not satisfied? Return your purchase within 30 days for a full refund.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to assist you with any questions.'
    }
  ];

  // กรองสินค้าตามหมวดหมู่
  const filteredProducts = activeCategory === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(product => product.category === activeCategory);

  // เอฟเฟกต์การโหลดสำหรับการเคลื่อนไหว
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // คอมโพเนนต์สำหรับแสดงดาว
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-black sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="absolute inset-y-0 right-0 hidden lg:block lg:inset-y-0 lg:right-0 lg:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
            </div>
            
            <main className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className={`sm:text-center lg:text-left transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Discover Premium</span>{' '}
                  <span className="block text-gray-300 xl:inline">Products</span>
                </h1>
                <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Experience the finest selection of curated products for your lifestyle. 
                  From cutting-edge electronics to stylish fashion accessories, we have everything you need.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/menu" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10">
                      Shop Now
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/about" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-transparent border-white hover:bg-white hover:text-black md:py-4 md:text-lg md:px-10 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className={`h-56 w-full relative sm:h-72 md:h-96 lg:w-full lg:h-full transition-all duration-1000 ${isLoaded ? 'opacity-100 transform-none' : 'opacity-0 translate-x-10'}`}>
            <img
              className="h-full w-full object-cover"
              src="/api/placeholder/1000/800"
              alt="Featured product"
            />
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-black font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Us
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We pride ourselves on providing the best shopping experience possible.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`relative p-5 border border-gray-200 rounded-lg transition-all duration-700 transform hover:shadow-lg ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-black mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl text-center">
            Featured Products
          </h2>
          <p className="mt-4 text-xl text-gray-500 text-center max-w-3xl mx-auto">
            Explore our top selection of premium products, all carefully chosen for quality and value.
          </p>
          
          {/* Categories navigation */}
          <div className="flex items-center justify-center mt-8 space-x-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } mb-2`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Products grid */}
          <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`group relative border rounded-lg p-4 transition-all duration-500 transform hover:shadow-lg ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-full min-h-80 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <a href={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">${product.price}</p>
                </div>
                <button 
                  className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors" 
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl text-center">
            Customer Testimonials
          </h2>
          <p className="mt-4 text-xl text-gray-500 text-center max-w-3xl mx-auto mb-12">
            Hear what our satisfied customers have to say about our products and service.
          </p>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {customerReviews.map((review, index) => (
              <div 
                key={review.id} 
                className={`bg-white p-6 rounded-lg shadow-md transition-all duration-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <StarRating rating={review.stars} />
                <p className="mt-4 text-base text-gray-500 italic">"{review.comment}"</p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <img src={review.avatar} alt={review.name} className="h-10 w-10 rounded-full" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{review.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-gray-300">Start shopping today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/menu" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100">
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-transparent border-white hover:bg-white hover:text-black transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover opacity-30"
                src="/api/placeholder/1200/400"
                alt="Newsletter background"
              />
            </div>
            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-center">
                Get updates on new products
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 text-center">
                Subscribe to our newsletter and be the first to know about new products and special offers.
              </p>
              <div className="mt-10 max-w-xl mx-auto">
                <form className="sm:flex">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                    />
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      type="submit"
                      className="block w-full py-3 px-4 rounded-md shadow bg-white text-black font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-gray-300 text-center">
                  We care about your data. Read our{' '}
                  <a href="/privacy" className="font-medium text-white underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}