# MediCare360 Deployment Guide

This guide covers deploying the **Frontend** to **Netlify** and the **Backend** to **Railway**.

---

## 1. Backend Deployment (Railway)

### Steps:
1. Log in to [Railway](https://railway.app/).
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select `patanhussainali/MediCare-360`.
4. If asked for a root directory, or in the service settings (**Settings** -> **Root Directory**):
   - Set **Root Directory** to `backend`.
   *(Alternatively, if leaving root directory blank, Railway will use the root `railway.toml`)*.
5. In **Variables** (Environment Variables), configure:
   - `ENVIRONMENT` = `production`
   - `SECRET_KEY` = `generate-a-strong-random-secret-key-32-chars-minimum`
   - `BACKEND_CORS_ORIGINS` = `["*"]` *(or your Netlify URL e.g. `["https://your-medicare.netlify.app"]`)*
6. *(Optional PostgreSQL database)*:
   - In your Railway project, click **+ New** -> **Database** -> **Add PostgreSQL**.
   - Railway will automatically link and provide the `DATABASE_URL` variable to your backend service.
7. Click **Deploy**.
8. In **Settings** -> **Networking**, click **Generate Domain** (e.g. `https://medicare-backend-production.up.railway.app`).
9. Test that your backend is up by opening:
   - `https://your-railway-url.up.railway.app/health` -> `{"status": "healthy"}`
   - `https://your-railway-url.up.railway.app/api/v1/docs` -> Interactive Swagger API documentation.

---

## 2. Frontend Deployment (Netlify)

### Steps:
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project** -> **GitHub**.
3. Select `patanhussainali/MediCare-360`.
4. Netlify will automatically detect settings from [netlify.toml](file:///c:/Users/SIVA%20SANKAR/OneDrive/Desktop/medicare-360/netlify.toml):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (or `dist`)
5. In **Site configuration** -> **Environment variables**, add:
   - `VITE_API_BASE_URL` = `https://your-railway-url.up.railway.app/api/v1`
   *(Point to your live Railway backend URL from Step 1)*
6. Click **Deploy MediCare-360**.
7. Once deployed, Netlify provides a live URL (e.g. `https://medicare-360.netlify.app`).

---

## 3. Post-Deployment Verification

1. Open your Netlify site URL in the browser.
2. Sign in with the default administrator credentials:
   - **Email**: `admin@medicare360.com` *(or `hussainalipatan@gmail.com`)*
   - **Password**: `Admin@123` *(or `patan@02`)*
3. Check the browser console to verify API communication with Railway is working smoothly with zero CORS issues.
