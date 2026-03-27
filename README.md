# HMS Meru - Hospital Management System

A modern, comprehensive Hospital Management System (HMS) built for high-efficiency clinical workflows and staff productivity.

## 🚀 Tech Stack (Migrated)
- **Backend:** Node.js (Express), interacting with MySQL.
- **Frontend:** React + Vite, powered by Tailwind CSS.
- **Database:** MySQL.
- **System Theme:** HMS Meru Design System (Electric Mint & Deep Ink).

## 📦 Core Modules
- **Authentication:** Role-based secure login.
- **Patient Records:** Registration, search, and medical history maintenance.
- **Appointments:** Booking system, consultation queue.
- **Laboratory:** Test requests, specimen tracking.
- **Pharmacy:** Drug inventory management.
- **Billing:** Dynamic invoice generation and payment tracking via React frontend and Express backend APIs.
- **Admin:** System user management and comprehensive reporting.

## 🛠️ Setup Instructions (New MERN-like Stack)
1. **Database:** Import the schema from `sql/schema.sql`. Ensure `server/.env` has correct credentials for your local MySQL instance.
2. **Backend Server:** 
   - Navigate to the `/server` directory.
   - Run `npm install` to install Express, MySQL, etc.
   - Run `npm run dev` to start the backend API on port 5000.
3. **Frontend Client:**
   - Navigate to the `/client` directory.
   - Run `npm install` to install React and Vite dependencies.
   - Run `npm run dev` to start the client application on port 5173.

## 🧪 Testing Status
Currently, the backend Express server needs to be booted, as connection on port 5000 is refused. Additionally, the Vite frontend seems to have been scaffolded with or overridden by a "SwahiliPot Hub" template and needs to be migrated to the HMS Meru design system to match the intended UI aesthetics.
