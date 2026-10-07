# MediCare-360 — Complete Hospital Management Platform

MediCare-360 is an enterprise-grade, full-stack hospital management web application engineered for modern healthcare institutions. It provides role-tailored portals, real-time patient monitoring, doctor scheduling, electronic health records (EHR), pharmacy inventory control, billing workflows, audit logging, and centralized administrative management.

---

## 🏗️ Repository Architecture

The project is structured as a full-stack monorepo:

```
medicare-360/
├── backend/                  # FastAPI Python backend service
│   ├── app/
│   │   ├── api/              # API endpoints and route handlers
│   │   ├── core/             # Auth (JWT/Bcrypt), RBAC, configurations
│   │   ├── database/         # SQLAlchemy session and initial seeders
│   │   ├── models/           # SQLAlchemy 2.0 ORM data models
│   │   ├── repositories/     # Generic CRUD repository layer
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # Core business logic layer
│   ├── alembic/              # Database migration versions
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Backend environment template
│   └── README.md             # Backend detailed documentation
│
├── frontend/                 # React + Vite frontend client
│   ├── src/
│   │   ├── components/       # Reusable UI & Layout components
│   │   ├── context/          # Auth, Data, and Theme context providers
│   │   ├── pages/            # Role-specific and public route views
│   │   ├── routes/           # Protected routes & App router
│   │   ├── services/         # API clients & service integrations
│   │   └── utils/            # Formatters, validators, and security utilities
│   ├── public/               # Static assets
│   ├── index.html            # Single page app entry point
│   ├── package.json          # Node dependencies and scripts
│   ├── tailwind.config.js    # Tailwind styling tokens
│   └── vite.config.js        # Vite bundler configuration
│
└── README.md                 # Project root documentation
```

---

## 👥 Role-Based Portals

MediCare-360 implements strict Role-Based Access Control (RBAC) across 6 dedicated user roles:

1. **Administrator:** System configuration, staff and doctor accounts, clinical departments, audit logs, and performance reports.
2. **Doctor:** Patient consultations, diagnosis logging, electronic prescription issuance, and schedule management.
3. **Nurse:** Inpatient vitals recording, assigned patient monitoring, and nursing task execution.
4. **Receptionist:** Patient registration, appointment booking, doctor availability tracking, and intake billing.
5. **Pharmacist:** Medicine inventory, stock tracking, and prescription dispensing.
6. **Patient:** Appointment self-booking, personal health records, electronic prescriptions, and billing statements.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Vanilla CSS Tokens
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6)
- **Data Visualizations:** Recharts

### Backend
- **Framework:** FastAPI (Python 3.12+)
- **ORM / Database:** SQLAlchemy 2.0, Alembic, SQLite / PostgreSQL / MongoDB
- **Validation:** Pydantic v2
- **Authentication:** OAuth2 with JWT Bearer tokens + Bcrypt password hashing
- **Testing:** Pytest

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run database migrations and seeds
python -m app.database.init_db

# Start backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## 🔑 Default Administrator Credentials

- **Email:** `admin@medicare360.com`
- **Password:** `Admin@123`
- **Role:** `ADMIN`

---

## 📄 License

This project is licensed under the MIT License.
