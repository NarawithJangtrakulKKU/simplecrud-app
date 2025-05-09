'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  Tag, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// ประเภทของรายการในเมนู
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  isMobile?: boolean;
}

export default function AdminSidebar({ isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // รายการเมนู sidebar - สามารถเพิ่มได้ในอนาคต
  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: <Tag className="h-5 w-5" />
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // เมนูสำหรับ Desktop
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-black text-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="text-xl font-bold">Admin Dashboard</span>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <Link
            href="/logout"
            className="flex-shrink-0 w-full group flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );

  // ถ้าเป็น Mobile ให้แสดงเป็น Sheet Component จาก shadcn UI
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md text-gray-400 hover:text-black focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-black text-white p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <span className="text-xl font-bold">Admin Dashboard</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <Link
                href="/logout"
                className="flex-shrink-0 w-full group flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ถ้าไม่ใช่ Mobile ให้แสดง Desktop Sidebar
  return <DesktopSidebar />;
}