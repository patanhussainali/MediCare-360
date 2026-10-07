# MediCare360 Backend API

A production-ready **FastAPI** backend for the **MediCare360 – Hospital Management Platform**.

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory with lifespan events
│   ├── core/
│   │   ├── config.py            # Pydantic Settings v2 configuration
│   │   ├── security.py          # JWT, bcrypt, token blacklist
│   │   └── dependencies.py      # Auth + RBAC FastAPI dependencies
│   ├── api/
│   │   ├── api.py               # Master API router
│   │   └── routes/              # One file per module
│   ├── models/                  # SQLAlchemy 2.0 ORM models
│   ├── schemas/                 # Pydantic v2 request/response schemas
│   ├── services/                # Business logic layer
│   ├── repositories/            # Generic CRUD repository
│   └── database/
│       ├── base.py              # DeclarativeBase + TimestampMixin
│       ├── session.py           # Engine, SessionLocal, get_db
│       └── init_db.py           # DB seeder (admin user + departments)
├── tests/                       # Pytest test suite
├── alembic/                     # Database migrations
├── alembic.ini
├── requirements.txt
├── .env.example
└── .env                         # Local config (not committed to git)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- pip

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env as needed — defaults work for local SQLite dev
```

### 4. Run the API Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server auto-creates all database tables and seeds the default admin on first start.

---

## 🔑 Default Admin Credentials

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@medicare360.com`  |
| Password | `Admin@123`              |
| Role     | `ADMIN`                  |

---

## 📖 API Documentation

After starting the server, open:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

---

## 🛡️ Authentication

All protected endpoints require a `Bearer` JWT token in the `Authorization` header.

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medicare360.com","password":"Admin@123"}'
```

**Use the returned `access_token` in subsequent requests:**
```bash
curl http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer <your_access_token>"
```

---

## 👥 Role-Based Access Control (RBAC)

| Role          | Access Level                                                  |
|---------------|---------------------------------------------------------------|
| `ADMIN`       | Full access to all endpoints                                  |
| `DOCTOR`      | Patients, appointments, medical records, prescriptions        |
| `NURSE`       | Patients, appointments, medical records                       |
| `RECEPTIONIST`| Patients, appointments, billing, invoices                     |
| `PHARMACIST`  | Pharmacy inventory, medicine dispensing                       |
| `PATIENT`     | Own profile, own appointments, own notifications              |

---

## 📦 API Modules

| Module          | Base URL                  | Description                                    |
|-----------------|---------------------------|------------------------------------------------|
| Auth            | `/api/v1/auth`            | Register, login, logout, token refresh         |
| Patients        | `/api/v1/patients`        | Patient CRUD + MRN auto-generation             |
| Doctors         | `/api/v1/doctors`         | Doctor profiles with department linking        |
| Appointments    | `/api/v1/appointments`    | Scheduling + status transitions + notifications|
| Medical Records | `/api/v1/medical-records` | Visit history per patient                      |
| Prescriptions   | `/api/v1/prescriptions`   | Drug prescriptions with multi-item support     |
| Pharmacy        | `/api/v1/pharmacy`        | Medicine inventory, stock control, dispensing  |
| Billing         | `/api/v1/billing`         | Invoice lifecycle (pending → paid)             |
| Departments     | `/api/v1/departments`     | Hospital department management                 |
| Staff           | `/api/v1/staff`           | Nurses, receptionists, pharmacists, schedules  |
| Notifications   | `/api/v1/notifications`   | Per-user notification system                   |
| Reports         | `/api/v1/reports`         | Analytics: patients, appointments, billing, pharmacy|
| Audit Logs      | `/api/v1/audit-logs`      | All system action logs (Admin only)            |

---

## 🗄️ Database

**Default**: SQLite (`./medicare360.db`) for zero-config local development.

**Switch to PostgreSQL** — just update `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/medicare360
```

### Alembic Migrations

```bash
# Generate a migration after model changes
alembic revision --autogenerate -m "describe changes"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🧪 Running Tests

```bash
# From project root (or backend/ directory)
python -m pytest backend/tests -v

# With coverage
pip install pytest-cov
python -m pytest backend/tests -v --cov=backend/app --cov-report=term-missing
```

---

## 🌐 Frontend Integration

The React frontend (Vite) runs on `http://localhost:3001`.

CORS is pre-configured to allow:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://127.0.0.1:3001`

**Frontend API base URL**: Set to `http://localhost:8000/api/v1` in your frontend `.env`.

---

## 🔧 Environment Variables Reference

| Variable                    | Default                              | Description                         |
|-----------------------------|--------------------------------------|-------------------------------------|
| `DATABASE_URL`              | `sqlite:///./medicare360.db`         | SQLAlchemy-compatible DB URL        |
| `SECRET_KEY`                | (see `.env.example`)                 | JWT signing key — **change in prod**|
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `60`                                | Access token TTL                    |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7`                                  | Refresh token TTL                   |
| `FIRST_SUPERUSER_EMAIL`     | `admin@medicare360.com`              | Seeded admin email                  |
| `FIRST_SUPERUSER_PASSWORD`  | `Admin@123`                          | Seeded admin password               |
| `REDIS_URL`                 | `redis://localhost:6379/0`           | Redis URL (optional, for future use)|
