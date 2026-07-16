# Next-Gen Multi-Tenant ERP System 🚀

A comprehensive, production-grade Enterprise Resource Planning (ERP) system built with a modern tech stack (Nuxt 3, Vue 3, TailwindCSS) for the frontend, and a highly scalable Node.js/Express backend with MongoDB.

## ✨ Key Features

- **Multi-Tenant Architecture**: Complete data isolation with separate databases for each tenant/company.
- **Point of Sale (POS)**: Full-screen, responsive POS terminal with barcode scanning, shift management, and receipt printing.
- **Advanced Inventory Management**: Real-time stock tracking, low-stock alerts, and zero-stock restocking workflows.
- **Double-Entry Accounting**: Automated journal entries for all financial movements, maintaining strict accounting principles.
- **Customer Relationship Management (CRM)**: Manage customers, debts, post-dated checks, and installment plans.
- **Human Resources (HR) & Payroll**: Employee directories, attendance tracking, and automated monthly payroll generation with commission integrations.
- **Supply Chain**: Manage suppliers, purchase orders, and stock adjustments.
- **Document Archive**: Securely store and organize company documents and invoices.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Nuxt 3 / Vue 3
- **Styling**: TailwindCSS
- **State Management**: Vue Composition API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose) with Dynamic Connection Switching for Multi-Tenancy

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI_MASTER=mongodb://localhost:27017/erp_master
   JWT_SECRET=your_super_secret_key
   ```
4. Start the server: `npm start` or `node server.js`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the Nuxt development server: `npm run dev`

## 🔐 Authentication & Tenancy
To log in, a tenant must first be created via the Super Admin portal (`/super`). Once a tenant is created, use the assigned `Workspace ID` along with the admin email and password to access the ERP dashboard.

---
*Developed with focus on beautiful UI/UX, responsiveness, and robust enterprise integrations.*
