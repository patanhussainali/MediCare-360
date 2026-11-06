# MediCare-360 — Complete Hospital Management Platform

MediCare-360 is an enterprise-grade, full-stack hospital management web application engineered for modern healthcare institutions. It provides role-tailored portals, real-time patient monitoring, doctor scheduling, electronic health records (EHR), pharmacy inventory control, billing workflows, audit logging, and centralized administrative management.

The backend has been migrated to **Java 21 + Spring Boot 3.2.5** with full JPA/Hibernate data preservation, and the frontend is powered by **React 18 + Vite + Tailwind CSS**.

---

## 👥 Role-Based Portals

MediCare-360 implements strict Role-Based Access Control (RBAC) across 6 dedicated user roles:

1. **Administrator:** System configuration, staff and doctor accounts, clinical departments, audit logs, and performance reports.
2. **Doctor:** Patient consultations, diagnosis logging, electronic prescription issuance, and schedule management.
3. **Nurse:** Inpatient vitals recording, assigned patient monitoring, and nursing task execution.
4. **Receptionist:** Patient registration, appointment booking, doctor availability tracking, and intake billing.
5. **Pharmacist:** Medicine inventory, stock tracking, and prescription dispensing.
6. **Patient:** Appointment self-booking, personal health records, electronic prescriptions, and billing statements.
7. **Lab Technician:** Viewing doctor-ordered test requests, sample collection tracking, test result entry, and lab report upload and release.

---

## 🚀 Getting Started

### 1. Java Backend Setup (Spring Boot)

**Requirements:** Java 21 JDK, Maven 3.9+

mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
````
Backend API will be accessible at: `http://localhost:8080`  
Health check endpoint: `http://localhost:8080/health`

---

### 2. Frontend Setup (React + Vite)

**Requirements:** Node.js 18+

```powershell
# Using the PowerShell runner script from root:
.\run-frontend.ps1

# Or using npm directly:
cd frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:3000`

---

## 🧪 Testing

To run the Java backend test suite:
```powershell
cd java-backend
mvn test
```

To run the automated API and RBAC test suite against the running backend:
```powershell
powershell -ExecutionPolicy Bypass -File test-api-suite.ps1
```


`````
## 📄 License

````
## This project is licensed under the MIT License.
