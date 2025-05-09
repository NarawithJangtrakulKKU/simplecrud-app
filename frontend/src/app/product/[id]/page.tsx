import React from 'react'
import ProductViewPage from '@/components/ProductViewPage'

export default function Page({ params }: { params: { id: string } }) {
  // ใช้ React.use() เพื่อรับค่า params ในรูปแบบใหม่ของ Next.js 15
  const resolvedParams = React.use(Promise.resolve(params));
  
  return (
    <div>
      <ProductViewPage id={resolvedParams.id} />
    </div>
  )
}