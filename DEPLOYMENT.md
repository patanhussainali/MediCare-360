# MediCare360 Deployment Guide

This guide covers deploying the **Frontend** to **Netlify** and the **Java Spring Boot Backend** to **Railway** / container hosting.

---

## Repository Structure

```
MediCare-360/
├── frontend/          ← Netlify deploys this directory
│   ├── netlify.toml   ← Netlify build & redirect config
│   └── ...
├── java-backend/      ← Railway / Docker deploys this directory (Java 21 Spring Boot)
│   ├── pom.xml        ← Maven configuration
│   ├── src/           ← Spring Boot source code
│   └── ...
├── data/              ← SQLite persistent data directory
│   └── medicare360.db
└── database/          ← Database schema & migration history
    └── migrations/
```

---

## 1. Backend Deployment (Railway)

### Steps:
1. Log in to [Railway](https://railway.app/).
2. Click **+ New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. In the service **Settings** → **Root Directory**, set it to `java-backend` (or use the root `railway.toml`).
5. In **Variables** (Environment Variables), configure:
   - `JWT_SECRET_KEY` = `generate-a-strong-random-secret-key-32-chars-minimum`
   - `CORS_ALLOWED_ORIGINS` = `https://your-frontend.netlify.app`
   - `PORT` = `8000` (or Railway dynamic port)
6. Click **Deploy**.
7. In **Settings** → **Networking**, click **Generate Domain** (e.g. `https://medicare-backend-production.up.railway.app`).
8. Test that your backend is up by opening:
   - `https://your-railway-url.up.railway.app/health` → `{"status": "healthy", "service": "medicare360", "version": "1.0.0"}`

---

## 2. Frontend Deployment (Netlify)

### Steps:
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project** → **GitHub**.
3. Select your repository.
4. Netlify will detect `netlify.toml`:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. In **Site Configuration** → **Environment variables**, set:
   - `VITE_API_URL` = `https://your-railway-url.up.railway.app/api/v1`
6. Click **Deploy Site**.
