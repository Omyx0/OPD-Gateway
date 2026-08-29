# Smart OPD Gateway — Production Deployment Guide

This guide provides step-by-step instructions for deploying all components of the **Smart OPD Gateway** monorepo to production environments.

---

## 1. System Architecture & Deployment Topology

The Smart OPD platform consists of four distinct components that can be hosted independently or together on a single server:

```
                                  ┌───────────────────────────────┐
                                  │    Google Gemini AI Studio    │
                                  │      (gemini-2.5-flash)       │
                                  └───────────────▲───────────────┘
                                                  │
                                                  │ HTTPS API
                                                  ▼
┌──────────────────────────┐      ┌───────────────────────────────┐      ┌──────────────────────────┐
│   Patient PWA Frontend   │      │      Node.js / Express        │      │  Hospital Staff Frontend │
│   (Vercel / Netlify /    │◄────►│       Backend Service         │◄────►│   (Vercel / Netlify /    │
│    Cloudflare Pages)     │ HTTPS│     (Render / Railway / VPS)  │ HTTPS│    Cloudflare Pages)     │
└──────────────────────────┘      └───────────────▲───────────────┘      └──────────────────────────┘
                                                  │
                                                  │ TLS Connection
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │       Supabase Cloud          │
                                  │  PostgreSQL, PostGIS, Auth    │
                                  └───────────────────────────────┘
```

### Recommended Hosting Providers (Free & Production Tiers)

| Component | Directory | Recommended Platform | Alternative Platforms |
|---|---|---|---|
| **Database & Auth** | `supabase/` | [Supabase Cloud](https://supabase.com) | Self-hosted Supabase / AWS RDS PostgreSQL |
| **Backend REST API** | `server/` | [Render](https://render.com) / [Railway](https://railway.app) | AWS EC2 / DigitalOcean / Fly.io / Docker VPS |
| **Patient PWA** | `patient-pwa/` | [Vercel](https://vercel.com) | Netlify / Cloudflare Pages |
| **Hospital Staff Web** | `hospital-web/` | [Vercel](https://vercel.com) | Netlify / Cloudflare Pages |
| **AI Triage Model** | — | [Google AI Studio](https://aistudio.google.com) | Google Cloud Vertex AI |

---

## 2. Environment Variables Matrix

Before deploying, collect and prepare the environment variables for each component:

### 2.1 Backend API Server (`server/.env`)

| Variable | Description | Example / Production Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Server listening port | `5000` (or injected by PaaS) |
| `CLIENT_URL` | Primary Frontend URL for CORS | `https://hospital.yourdomain.com` |
| `SUPABASE_URL` | Supabase Project URL | `https://<project-id>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key (Bypasses RLS) | `eyJhbGciOi...` *(Keep Secret)* |
| `SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_TRIAGE_MODEL` | Gemini Model Identifier | `gemini-2.5-flash` |
| `ML_SERVICE_URL` | Optional ML Microservice URL | `http://localhost:8000` |

### 2.2 Patient Progressive Web App (`patient-pwa/.env.production`)

| Variable | Description | Example / Production Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://<project-id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `VITE_API_URL` | Public Production Backend API URL | `https://api.yourdomain.com/api/v1` |

### 2.3 Hospital Staff Web App (`hospital-web/.env.production`)

| Variable | Description | Example / Production Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://<project-id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `VITE_API_URL` | Public Production Backend API URL | `https://api.yourdomain.com/api/v1` |

---

## 3. Phase 1: Database & Supabase Production Setup

### Step 1.1: Create Project in Supabase
1. Navigate to [supabase.com](https://supabase.com) and create a new project.
2. Choose a region closest to your hospital or primary user base.
3. Save your **Database Password**, **Project URL**, **Anon Key**, and **Service Role Key** from **Project Settings → API**.

### Step 1.2: Execute Database Schema
1. Open the **SQL Editor** in your Supabase project dashboard.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Paste into the SQL Editor and click **Run**.
4. Verify that:
   - The `postgis` extension is created.
   - All 20 tables are initialized (`profiles`, `user_roles`, `hospitals`, `departments`, `patients`, `visits`, `symptoms`, `triage_assessments`, `queue_tickets`, `alerts`, etc.).
   - Triggers for `update_updated_at_column` are active.

### Step 1.3: Run Database Seed Script
Run the seed script from your local machine (pointing to production Supabase via `server/.env`):

```powershell
cd server
npm run seed
```

This creates:
- Default Hospital: *General Hospital Demo*
- Departments: `GP` (General Practice), `CARDIO` (Cardiology), `ENT`, `ORTHO`, `OPHTHAL`, `DERM`, `PAED`
- Default Users with encrypted credentials:
  - `admin@opd.com` (`ADMIN`)
  - `doctor@opd.com` (`DOCTOR`)
  - `staff@opd.com` (`STAFF`)
  - `patient@opd.com` (`PATIENT`)

### Step 1.4: Configure Supabase Authentication
1. Go to **Authentication → URL Configuration** in Supabase Dashboard.
2. Set **Site URL** to your Patient PWA URL: `https://pwa.yourdomain.com`.
3. Under **Redirect URLs**, add:
   - `https://pwa.yourdomain.com/**`
   - `https://hospital.yourdomain.com/**`
   - `http://localhost:5173/**` (for local development)
   - `http://localhost:5174/**`

---

## 4. Phase 2: Deploying the Backend API (`server/`)

### Option A: Deploy to Render.com (Recommended Managed PaaS)

1. Log in to [render.com](https://render.com) and click **New + → Web Service**.
2. Connect your GitHub repository: `https://github.com/Omyx0/OPD-Gateway`.
3. Configure the Web Service settings:
   - **Name:** `smart-opd-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start` (executes `node dist/server.js`)
   - **Instance Type:** Free or Starter
4. Under **Environment Variables**, add:
   ```
   NODE_ENV = production
   PORT = 5000
   CLIENT_URL = https://hospital.yourdomain.com
   SUPABASE_URL = https://<your-project-id>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = <your-supabase-service-role-key>
   SUPABASE_ANON_KEY = <your-supabase-anon-key>
   GEMINI_API_KEY = <your-google-gemini-api-key>
   GEMINI_TRIAGE_MODEL = gemini-2.5-flash
   ```
5. Click **Deploy Web Service**.
6. Once deployed, test the health endpoint: `https://<your-render-app>.onrender.com/health` (should return `{"success": true, "data": {"status": "ok"}}`).

---

### Option B: Deploy with Docker on a Linux VPS (Ubuntu / Nginx / PM2)

If deploying to your own Virtual Private Server (AWS EC2, DigitalOcean Droplet, Linode):

#### 1. Server Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

#### 2. Build and Run Container
```bash
# Build image
docker build -t smart-opd-api ./server

# Run with environment file
docker run -d \
  --name opd-api \
  -p 5000:5000 \
  --env-file ./server/.env \
  --restart unless-stopped \
  smart-opd-api
```

---

## 5. Phase 3: Deploying the Patient PWA (`patient-pwa/`)

The Patient PWA is a client-rendered React Single Page Application with Service Worker caching.

### Deploying to Vercel

1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository: `OPD-Gateway`.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `patient-pwa`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and add:
   ```
   VITE_SUPABASE_URL = https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY = <your-supabase-anon-key>
   VITE_API_URL = https://<your-backend-api-url>/api/v1
   ```
5. Create a `patient-pwa/vercel.json` file for SPA routing fallback:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**.

> [!IMPORTANT]
> **PWA HTTPS Requirement:** Progressive Web Apps require HTTPS to register Service Workers (`dist/sw.js`) and install to home screens. Vercel, Netlify, and Cloudflare Pages provide SSL certificates automatically.

---

## 6. Phase 4: Deploying the Hospital Staff Web App (`hospital-web/`)

The Hospital Staff App is built with Vite, React, and TanStack Router.

### Deploying to Vercel

1. In Vercel, click **Add New Project**.
2. Select the same repository: `OPD-Gateway`.
3. Configure Project Settings:
   - **Project Name:** `smart-opd-hospital-web`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `hospital-web`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and add:
   ```
   VITE_SUPABASE_URL = https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY = <your-supabase-anon-key>
   VITE_API_URL = https://<your-backend-api-url>/api/v1
   ```
5. Create a `hospital-web/vercel.json` file for TanStack Router SPA fallback:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**.

---

## 7. Phase 5: Production Domain, SSL & CORS Synchronization

Once all three services are deployed, synchronize CORS and redirect URLs:

### 1. Update Backend CORS in [`server/src/app.ts`](./server/src/app.ts)
Ensure your production frontend domains are included in the CORS origin array:

```typescript
app.use(
  cors({
    origin: [
      env.CLIENT_URL,
      "https://pwa.yourdomain.com",
      "https://hospital.yourdomain.com",
      "https://smart-opd-pwa.vercel.app",
      "https://smart-opd-hospital-web.vercel.app",
    ],
    credentials: true,
  })
);
```

### 2. Update Supabase Auth Redirects
In **Supabase Dashboard → Authentication → URL Configuration**, add your production Vercel URLs to the **Redirect URLs** list.

---

## 8. Option B: Self-Hosted Docker Compose (All-in-One VPS)

To deploy the entire stack on a single Virtual Private Server using Docker Compose:

### `docker-compose.yml` (Root)

```yaml
version: '3.8'

services:
  # 1. Backend REST API
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: smart-opd-api
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=5000
      - CLIENT_URL=https://hospital.yourdomain.com
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_TRIAGE_MODEL=gemini-2.5-flash
    ports:
      - "5000:5000"

  # 2. Patient PWA (Nginx)
  patient-pwa:
    build:
      context: ./patient-pwa
      dockerfile: Dockerfile
    container_name: smart-opd-patient-pwa
    restart: always
    ports:
      - "3001:80"

  # 3. Hospital Staff Web App (Nginx)
  hospital-web:
    build:
      context: ./hospital-web
      dockerfile: Dockerfile
    container_name: smart-opd-hospital-web
    restart: always
    ports:
      - "3002:80"

  # 4. Master Reverse Proxy with SSL (Nginx)
  nginx-proxy:
    image: nginx:alpine
    container_name: smart-opd-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - api
      - patient-pwa
      - hospital-web
```

### Static Nginx Dockerfile (for `patient-pwa` and `hospital-web`)

```dockerfile
# Multi-stage build for frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Where `nginx-spa.conf` contains:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 9. Post-Deployment Smoke Test & Runbook

Execute this runbook to verify that production is operational:

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | `GET https://<api-domain>/health` | Status 200, `{"status": "ok"}` | [ ] |
| 2 | Open Patient PWA URL | PWA installs and landing page loads | [ ] |
| 3 | Log in with `patient@opd.com` / `demo123` | Patient dashboard loads | [ ] |
| 4 | Submit symptoms ("Chest pain, fever") | Gemini AI triage returns `RED` priority | [ ] |
| 5 | Open Hospital Web and log in with `staff@opd.com` | Live queue shows newly generated token | [ ] |
| 6 | Click **Call next patient** on staff board | Ticket status updates to `CALLED` | [ ] |
| 7 | Check Patient PWA queue screen | Amber alert banner shows "Called to Room" | [ ] |
| 8 | Click **Complete** on staff board | Ticket status updates to `COMPLETED` | [ ] |

---

## 10. Monitoring, Logging & Troubleshooting

### Viewing Server Logs
- **Render / Railway:** Check the live Log Stream under your service dashboard.
- **Docker VPS:** Run `docker logs -f smart-opd-api`.

### Common Issues & Quick Fixes

1. **CORS Error (`Blocked by CORS policy`)**:
   - Verify `CLIENT_URL` in `server/.env` matches the exact frontend domain (including `https://` and without trailing slash).
   - Ensure the frontend URL is listed in `server/src/app.ts` under `cors({ origin: [...] })`.

2. **Gemini API Error (`API_KEY_INVALID` or 429 Rate Limit)**:
   - Check that `GEMINI_API_KEY` is set in server environment variables.
   - Verify billing/quota in [Google AI Studio](https://aistudio.google.com).

3. **Supabase 401 / JWT Expired**:
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is kept server-side only and not exposed to frontends.
   - Frontends must only use `VITE_SUPABASE_ANON_KEY`.

4. **PWA Refresh 404 on Subroutes (e.g., `/dashboard/symptoms`)**:
   - Ensure the SPA rewrite file (`vercel.json` or `_redirects` with `/* /index.html 200`) is present in the frontend root directory.
