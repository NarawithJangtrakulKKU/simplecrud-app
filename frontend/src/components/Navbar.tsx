'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// ประเภทของข้อมูลผู้ใช้
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

// ประเภทของรายการ Navbar
interface NavItem {
  label: string;
  href: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // รายการเมนู Navbar
  const navItems: NavItem[] = [
    { label: 'Home', href: '/home' },
    { label: 'Menu', href: '/menu' },
    // เพิ่มรายการอื่นๆ ในอนาคต
  ];
  
  // Ref สำหรับเมนูโปรไฟล์เพื่อจัดการคลิกภายนอก
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  
  // ฟังก์ชันปิดเมนูเมื่อคลิกภายนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    // เพิ่ม event listener เมื่อเมนูเปิด
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // ลบ event listener เมื่อ component unmount หรือเมนูปิด
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  useEffect(() => {
    // ตรวจสอบผู้ใช้ที่ล็อกอินอยู่
    const checkUser = async () => {
      try {
        const res = await axios.get(`${apiUrl}/auth/whoami`, { withCredentials: true });
        if (res.data) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [apiUrl]);

  // ฟังก์ชันสำหรับการออกจากระบบ
  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // สร้างตัวอักษรแรกของชื่อสำหรับโปรไฟล์
  const getInitial = () => {
    if (user?.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            {/* Logo หรือชื่อเว็บไซต์ */}
            <Link href="/menu" className="font-bold text-xl text-black">
              YourLogo
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center">
            {/* รายการเมนูและโปรไฟล์ผู้ใช้อยู่ฝั่งขวาบน Desktop */}
            <div className="flex items-center space-x-8">
              {/* รายการเมนูบน Desktop */}
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* โปรไฟล์ผู้ใช้และปุ่มออกจากระบบบน Desktop */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="flex bg-black text-white rounded-full focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitial()}
                    </span>
                  </button>

                  {/* Dropdown เมื่อคลิกที่โปรไฟล์ */}
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center sm:hidden">
            {/* ปุ่มแฮมเบอร์เกอร์สำหรับโทรศัพท์มือถือ */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon สำหรับปุ่มเมนู */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* เมนูบนมือถือ */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`} ref={profileMenuRef}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center">
                  {getInitial()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.name || 'User'}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}