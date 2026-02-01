# Kasimuddin Sarkar Foundation (KSL) Platform

![Project Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

**🌐 Live Site:** [https://ksf.console.bd](https://ksf.console.bd)

A comprehensive, full-stack web application designed to manage the multifaceted operations of the **Kasimuddin Sarkar Foundation**. This platform digitalizes the foundation's Library Services, Health Camps, Social Welfare programs, and Community Blogs, providing a centralized hub for administrators, staff, and public members.

The system is built for **scale, security, and performance**, leveraging a modern stack with React (Vite) on the frontend and Django Rest Framework (DRF) on the backend, optimized for deployment on DigitalOcean cloud infrastructure.

---

## 🚀 Key Features

### 📚 Library Management System
*   **Digital Catalog:** Manage thousands of books with details like authors, categories, and stock levels.
*   **Smart Search:** Real-time search with debouncing for instant results.
*   **Borrowing System:** Track borrowed books, due dates, and return history.
*   **Exports:**
    *   **PDF Generation:** Optimized for **Bengali fonts**, ensuring accurate script rendering for print catalogs.
    *   **Excel Export:** Download complete book lists for offline inventory management.

### 🏥 Health & Wellbeing Wing
*   **Camp Management:** Schedule and manage free health checkup camps (Eye, Dental, General).
*   **Doctor Availability:** Track visiting doctors and their schedules.
*   **Gallery:** Showcase images from past health camps and community events.

### ✍️ Community Blog & CMS
*   **Rich Text Editor:** Integrated **ReactQuill** editor with image resizing and formatting support.
*   **Interactive System:** Commenting system, read counters, and social sharing.
*   **Role-Based Access:** Public reading access vs. Member/Staff authoring privileges.

### 🛡️ User & Security
*   **Role-Based Access Control (RBAC):** Distinct permissions for Superusers, Admins, Staff, and General Members.
*   **Secure Authentication:** JWT (JSON Web Tokens) with refresh rotation.
*   **Account Security:**
    *   Email Verification flow.
    *   Forgot/Reset Password functionality.
    *   **ReCAPTCHA V3** integration to prevent bot spam.
*   **File Security:**
    *   **UUID Renaming:** All uploads are renamed to UUIDs to prevent enumeration attacks.
    *   **Auto-Cleanup:** Orphaned files are automatically deleted to save storage.
    *   **Validation:** Strict file size and type enforcement (Images < 5MB).

### ⚙️ Professional Admin Panel
*   **Custom Dashboard:** A bespoke React-based dashboard for quick stats and management.
*   **Enhanced Django Admin:** Powered by **Django Jazzmin** for a sleek, responsive administrative interface.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React 18 + Vite (High-performance build tool)
*   **Styling:** Tailwind CSS (Modern, utility-first styling) with Dark Mode support.
*   **State Management:** Zustand (Lightweight global state).
*   **UI Components:** Lucide React Icons, Custom Modals, Toasts (React Hot Toast).
*   **Routing:** React Router DOM v6 with Protected Routes.

### Backend
*   **Core:** Python 3.10+
*   **Framework:** Django 5.x + Django Rest Framework (DRF).
*   **Authentication:** `rest_framework_simplejwt`.
*   **Utilities:** `Pillow` (Image processing), `django-cleanup`.

### Database
*   **Development:** SQLite (for rapid prototyping).
*   **Production:** **PostgreSQL 16** (Robust, ACID-compliant RDBMS).

---

## ☁️ Production Infrastructure (DigitalOcean)

The application is architected for a high-performance production environment on **DigitalOcean Droplets** using **Ubuntu Linux**.

### server Architecture
*   **Web Server:** **Nginx** acting as a high-performance reverse proxy and load balancer.
*   **Application Server:** **Gunicorn** (Green Unicorn) running as a robust WSGI HTTP server, managed by **Systemd** for process supervision and auto-restart.
*   **Database connection Pooling:** **PgBouncer** is implemented to manage PostgreSQL connection pooling, drastically reducing overhead for high-traffic operations.
*   **SSL/Security:** Secured via Let's Encrypt Certbot (HTTPS).

### Storage & Backups
*   **Object Storage:** **DigitalOcean Spaces** (S3-compatible) is utilized for storing user-uploaded media files (images, documents), ensuring scalable and reliable storage independent of the compute instance.
*   **Database Backups:** Automated scheduled backups of the PostgreSQL database are stored securely in DigitalOcean Spaces for disaster recovery.

### CI/CD Pipeline
*   **GitHub Actions:** Automated workflows for testing, building, and deploying code changes to the live server.

---

## 💻 Local Installation Guide

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/Sadman-Sakib-Sarkar/ks-foundation-production.git
cd ks-foundation-production
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Migrate Database
python manage.py migrate

# Create Superuser
python manage.py createsuperuser

# Run Server
python manage.py runserver
```
*Backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install

# Run Development Server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 4. Environment Variables
Rename `.env.example` to `.env` in both folders and populate required secrets (DB credentials, API keys).

---

## 👨‍💻 Developer & Maintainer

**Developed by:** [Sadman Sakib Sarkar (sadman.console.bd)](https://sadman.console.bd)
*Full Stack Developer & Software Engineer*

---

&copy; 2025-2026 Kashimuddin Sarkar Foundation. All rights reserved.
