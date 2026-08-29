# Smart OPD Gateway

> **AI-Assisted Outpatient Department & Queue Management System**  
> Complete Full-Stack Solution (Node.js / Express Backend + React Patient PWA + Hospital Staff Web Application + Supabase PostgreSQL + Google Gemini AI)

---

## 📖 Complete Documentation & Project Report

For the full detailed project report, architecture breakdown, and testing verification guide, please see:
👉 **[PROJECT_REPORT.md](./PROJECT_REPORT.md)**

All planning and design documents have been organized in the **[`docs/`](./docs/)** directory.

---

## 🚀 Quick Start (Running All Services)

### 1. Database Seed (First time setup)
```powershell
cd "e:\OPD Gateway\server"
npm run seed
```

### 2. Start Backend Server (Port 5000)
```powershell
cd "e:\OPD Gateway\server"
npm run dev
```

### 3. Start Patient PWA (Port 5174 / 5173)
```powershell
cd "e:\OPD Gateway\patient-pwa"
npm run dev
```

### 4. Start Hospital Staff Web App (Port 5173 / 5174)
```powershell
cd "e:\OPD Gateway\hospital-web"
npm run dev
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Interface |
|---|---|---|---|
| **Patient** | `patient@opd.com` | `demo123` | Patient PWA |
| **Hospital Staff** | `staff@opd.com` | `demo123` | Hospital Web App |
| **Doctor** | `doctor@opd.com` | `demo123` | Hospital Web App |
| **Admin** | `admin@opd.com` | `demo123` | Hospital Web App |

---

## 🧪 Build & Typecheck Verification
```powershell
cd "e:\OPD Gateway\server" && npm run build
cd "e:\OPD Gateway\patient-pwa" && npm run build
cd "e:\OPD Gateway\hospital-web" && npm run build
```
*(All 3 packages compile with 0 errors)*
