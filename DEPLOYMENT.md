# MediCare360 deployment

The frontend is hosted on Netlify. The Java Spring Boot API is hosted on Render and stores application data in MongoDB Atlas.

## Render backend

Create or update a Render **Web Service** connected to this repository with:

- Runtime: **Docker**
- Root directory: repository root (leave blank)
- Dockerfile path: `backend/Dockerfile`
- Health check path: `/health`

Configure these variables in the Render service environment:

- `MONGODB_URI` = MongoDB Atlas connection string
- `MONGODB_DATABASE` = `medicare360` (or the database name you use)
- `JWT_SECRET_KEY` = a unique, random secret of at least 32 characters
- `CORS_ALLOWED_ORIGINS` = `https://medplus360.netlify.app`
- `RESEND_API_KEY` = Resend API key (optional; needed for password reset email)
- `MAIL_FROM` = sender address on a Resend verified domain (optional; needed for password reset email)
- `FRONTEND_URL` = `https://medplus360.netlify.app`

Render supplies `PORT`; the Docker start command passes it to Spring Boot. Do not set a separate fixed port. After changing variables, redeploy the service and confirm `https://<your-render-service>.onrender.com/health` returns a healthy response.

## Netlify frontend

In the Netlify site environment, set:

- `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api/v1`

Trigger a new Netlify deploy after changing this value. The frontend API client also reads a saved runtime override from browser local storage, which takes precedence over the Netlify build variable. If the site still calls an old backend URL, clear the site's `VITE_API_BASE_URL` and `API_BASE_URL` local storage entries and reload.

## Response time

The frontend renders cached data first and refreshes backend lists in the background, so saving a form does not wait for unrelated list requests. Render Free web services can sleep after inactivity and take about a minute to start again. The client now allows up to 75 seconds for a backend request to accommodate that startup. For consistently fast logins and saves, use an always-on Render plan. Keep MongoDB Atlas in a region close to the Render service to reduce database round-trip time.

## Password reset email

Password recovery is sent through Resend. Verify the sending domain in Resend, set `RESEND_API_KEY` and `MAIL_FROM` in Render, then redeploy. Reset links point to the frontend and expire after 30 minutes.
