# 🔮 SE-Project-2025  
## ระบบดูดวงและจำหน่ายสินค้าออนไลน์  
รายวิชา Software Engineering 2/2025  

---

# บทนำ (Introduction)

โปรเจคนี้เป็นระบบเว็บแอปพลิเคชันที่พัฒนาเพื่อให้ผู้ใช้งานสามารถ:

- สมัครสมาชิกและเข้าสู่ระบบ
- ทำการดูดวงและบันทึกผลลัพธ์
- เลือกซื้อสินค้า
- ตรวจสอบประวัติคำสั่งซื้อ

ระบบมีการแยกสิทธิ์ผู้ใช้งานเป็น:

- 👤 User  
- 👮 Admin  

---

# วัตถุประสงค์ของระบบ

- เพื่อออกแบบและพัฒนาระบบ Full-Stack Web Application
- เพื่อประยุกต์ใช้แนวคิด Software Architecture
- เพื่อใช้งาน Authentication และ Authorization อย่างถูกต้อง
- เพื่อใช้ ORM (Prisma) ในการจัดการฐานข้อมูล

---

# สถาปัตยกรรมระบบ (System Architecture)

Frontend (Next.js)
↓ HTTP
Backend (Express + Prisma)
↓
PostgreSQL Database


ระบบใช้รูปแบบ:

- Client–Server Architecture  
- Layered Architecture  
- Service Layer Pattern  

---

# เทคโนโลยีที่ใช้ (Tech Stack)

## Frontend
- Next.js
- React
- TypeScript

## Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- bcrypt (Password Hashing)
- JSON Web Token (JWT)

## Database
- PostgreSQL

---

# โครงสร้างโปรเจค (Project Structure)
SE-PROJECT-2025/
│
├── frontend/ # Next.js
│
└── backend/
├── prisma/
│ ├── schema.prisma
│ └── migrations/
│
├── src/
│ ├── routes/
│ ├── services/
│ ├── middleware/
│ ├── lib/
│ └── server.ts
│
├── .env
└── package.json

---

# ขั้นตอนการติดตั้งและรันระบบ

## 🔹 Clone Project

```bash
git clone <repository-url>
cd SE-PROJECT-2025
🖥 ติดตั้งและรัน Frontend
cd frontend
npm install
npm run dev

เปิดใช้งานที่:

http://localhost:3000
🔧 ติดตั้งและรัน Backend
cd backend
npm install
🔐 สร้างไฟล์ .env

สร้างไฟล์ .env ในโฟลเดอร์ backend แล้วเพิ่ม:

DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
JWT_SECRET="your_super_secret_key"
🗄 สร้างฐานข้อมูล
npx prisma migrate dev
🗄 เปิดดูฐานข้อมูล (Optional)
npx prisma studio
🚀 รัน Backend Server
npm run dev

Backend จะทำงานที่:

http://localhost:5001
7️⃣ API Endpoints
🔐 Authentication
Register
POST /api/auth/register
Login
POST /api/auth/login
👤 User
Get Profile (Protected)
GET /api/user/profile

Header ที่ต้องส่ง:

Authorization: Bearer <token>
ระบบ Authentication
ใช้ bcrypt ในการ hash password
ใช้ JWT สำหรับ authentication
ใช้ middleware ตรวจสอบ token
ตรวจสอบสิทธิ์ Admin ผ่าน role-based validation