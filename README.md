# 🛒 Simple CRUD App (NestJS + Next.js)

โปรเจกต์นี้เป็นระบบจัดการสินค้า (Product Management) ที่ใช้ [NestJS](https://nestjs.com/) สำหรับ Backend และ [Next.js](https://nextjs.org/) สำหรับ Frontend โดยรองรับฟีเจอร์ CRUD สำหรับสินค้า หมวดหมู่ และผู้ใช้ พร้อมระบบอัพโหลดและแสดงผลรูปภาพสินค้า UI ทันสมัยด้วย Tailwind CSS และ shadcn/ui

## 🚀 Features

- จัดการสินค้า (Products): เพิ่ม, แก้ไข, ลบ, ดูรายละเอียด
- จัดการหมวดหมู่ (Categories): เพิ่ม, แก้ไข, ลบ
- จัดการผู้ใช้ (Users): สมัคร, ล็อกอิน, JWT Auth, สิทธิ์แอดมิน
- อัพโหลดและแสดงผลรูปภาพสินค้า
- ระบบแอดมินหลังบ้าน (Admin Panel)
- ระบบค้นหาและกรองสินค้า
- ระบบตะกร้าสินค้า (Cart) (โครงสร้างรองรับ)
- UI/UX ทันสมัย Responsive ด้วย Tailwind CSS และ shadcn/ui
- รองรับการเชื่อมต่อ API แบบ RESTful
- ระบบ Auth ด้วย JWT (Login/Logout, Protected Route)
- รองรับ CORS และ Cookie สำหรับ cross-origin

## 🛠️ Tech Stack

- [NestJS](https://nestjs.com/) (Backend)
- [Prisma ORM](https://www.prisma.io/) (Database)
- [Next.js 15](https://nextjs.org/) (Frontend)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Axios](https://axios-http.com/)

---

## 📦 การติดตั้งและรันโปรเจกต์

### 1. Clone โปรเจกต์นี้ลงเครื่อง

```bash
git clone https://github.com/NarawithJangtrakulKKU/simplecrud-app.git
cd simplecrud-app
```

### 2. ติดตั้ง dependencies (ทั้ง backend และ frontend)

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. ตั้งค่า Environment Variables
- สร้างไฟล์ `.env` ในทั้ง backend และ frontend (ดูตัวอย่างใน `.env.example` ถ้ามี)
- ตัวอย่างสำคัญ (frontend):
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:4000/api
  ```

### 4. รัน Backend (NestJS)

```bash
cd backend
npm run start:dev
```

### 5. รัน Frontend (Next.js)

```bash
cd frontend
npm run dev
```

### 6. เปิด Browser

```
http://localhost:3000
```

---

## 📝 โครงสร้างข้อมูล (Database Schema)

- **Product**: id, name, description, image, price, categoryId
- **Category**: id, name
- **User**: id, username, password, role

---

## 📋 ตัวอย่าง API Endpoint

- `GET /api/products` — ดึงรายการสินค้า
- `POST /api/products` — เพิ่มสินค้า (admin)
- `PUT /api/products/:id` — แก้ไขสินค้า (admin)
- `DELETE /api/products/:id` — ลบสินค้า (admin)
- `GET /api/categories` — ดึงหมวดหมู่
- `POST /api/auth/login` — ล็อกอิน
- `GET /api/users/me` — ข้อมูลผู้ใช้ปัจจุบัน

---

## 🖼️ การอัพโหลดและแสดงผลรูปภาพ
- อัพโหลดไฟล์ภาพผ่านฟอร์ม (admin)
- Backend จะเก็บไฟล์ไว้ใน `/backend/public` และส่ง path กลับมา
- Frontend จะดึงรูปผ่าน URL ที่ backend ส่งมา (รองรับ fallback เป็น placeholder)

---

## 👨‍💻 ผู้พัฒนา

โปรเจกต์นี้พัฒนาโดย นราวิชญ์ จังตระกูล

หากมีข้อเสนอแนะ หรือต้องการพูดคุยเกี่ยวกับโปรเจกต์นี้ สามารถติดต่อมาได้เลยครับ 🙌
