import React from 'react'
import AdminSidebar from './AdminSidebar'

export default function AdminUsersPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
    </div>
  )
}
