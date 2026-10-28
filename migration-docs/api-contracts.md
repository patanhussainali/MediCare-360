# API Contracts — MediCare360

**Base path:** `/api/v1`  
**Auth header:** `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json`

---

## Health

| Method | Path | Auth | Roles | Request | Response |
|---|---|---|---|---|---|
| GET | `/health` | No | — | — | `{"status":"healthy","service":"...","version":"..."}` |

---

## Auth — `/api/v1/auth`

### GET `/auth/check-admin`
- Auth: No
- Returns: `{"hasAdmin": boolean}`

### POST `/auth/setup-admin`
- Auth: No (rejected if admin already exists)
- Request body: `UserCreate` (email, password, full_name; role forced to ADMIN)
- Response 201: `Token`
- Error 400: admin already configured

### POST `/auth/register`
- Auth: No
- Request body: `UserCreate` (role always forced to PATIENT)
- Response 201: `UserResponse`
- Error 400: email exists

### POST `/auth/login`
- Auth: No
- Request body: `{"email": string, "password": string, "role": string|null}`
- Response 200: `Token`
- Error 401: invalid credentials

### POST `/auth/login/form` (hidden from schema, for Swagger UI)
- Auth: No
- Request: `application/x-www-form-urlencoded` (username, password)
- Response 200: `Token`

### POST `/auth/refresh`
- Auth: No
- Request body: `{"refresh_token": string}`
- Response 200: `Token`
- Error 401: invalid/expired refresh token

### POST `/auth/logout`
- Auth: Yes (any role)
- Response 200: `{"message": "Successfully logged out and token invalidated."}`

### GET `/auth/me`
- Auth: Yes (any role)
- Response 200: `UserResponse`

---

## Users — `/api/v1/users` (ADMIN only)

### POST `/users`
- Auth: ADMIN
- Request body: `UserCreate`
- Response 201: `UserResponse`

### GET `/users`
- Auth: ADMIN
- Query params: `skip` (int, default 0), `limit` (int, default 100), `role` (UserRole enum, optional)
- Response 200: `List<UserResponse>`

### GET `/users/{user_id}`
- Auth: ADMIN
- Response 200: `UserResponse`
- Error 404: user not found

### PATCH `/users/{user_id}`
- Auth: ADMIN
- Request body: `UserUpdate` (full_name?, phone?, is_active?, role?, password?)
- Response 200: `UserResponse`
- Error 400: self-deactivation / short password
- Error 403: non-admin trying to assign ADMIN role
- Error 404: user not found

### DELETE `/users/{user_id}`
- Auth: ADMIN
- Response 204: No content
- Error 400: deleting own account
- Error 404: user not found

---

## Patients — `/api/v1/patients`

### POST `/patients`
- Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE
- Request body: `PatientCreate` (full_name, gender, date_of_birth, phone, email, blood_group?, address?, emergency_contact?, allergies?, chronic_conditions?, status?, password?, medical_record_number?)
- Response 201: `PatientResponse`

### GET `/patients`
- Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE
- Query params: `skip`, `limit`, `search` (name/MRN/phone/email)
- Response 200: `List<PatientResponse>`

### GET `/patients/{patient_id}`
- Auth: Any authenticated user
- Response 200: `PatientResponse`
- Error 404: patient not found

### PUT `/patients/{patient_id}`
- Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE
- Request body: `PatientUpdate`
- Response 200: `PatientResponse`

### DELETE `/patients/{patient_id}`
- Auth: ADMIN
- Response 200: `{"message": "Patient deleted successfully"}`

---

## Doctors — `/api/v1/doctors`

### POST `/doctors`
- Auth: ADMIN
- Request body: `DoctorCreate` (full_name, specialization, qualification, phone, email, department_id?, experience_years?, consultation_fee?, available_days?, status?, password?)
- Response 201: `DoctorResponse`

### GET `/doctors`
- Auth: Any authenticated user
- Query params: `skip`, `limit`, `department_id?`, `is_available?` (bool)
- Response 200: `List<DoctorResponse>`

### GET `/doctors/{doctor_id}`
- Auth: Any authenticated user
- Response 200: `DoctorResponse`
- Error 404: doctor not found

### PUT `/doctors/{doctor_id}`
- Auth: ADMIN
- Request body: `DoctorUpdate`
- Response 200: `DoctorResponse`

---

## Appointments — `/api/v1/appointments`

### POST `/appointments`
- Auth: ADMIN, RECEPTIONIST, DOCTOR, PATIENT
- Request body: `AppointmentCreate` (patient_id, doctor_id, appointment_date, appointment_time, type?, reason?, notes?, department_id?, status?)
- Response 201: `AppointmentResponse`

### GET `/appointments`
- Auth: Any authenticated user
- Query params: `skip`, `limit`, `patient_id?`, `doctor_id?`, `status?` (AppointmentStatus), `appointment_date?` (date)
- Response 200: `List<AppointmentResponse>`

### GET `/appointments/{appointment_id}`
- Auth: Any authenticated user
- Response 200: `AppointmentResponse`
- Error 404: appointment not found

### PUT `/appointments/{appointment_id}`
- Auth: ADMIN, RECEPTIONIST, DOCTOR
- Request body: `AppointmentUpdate` (appointment_date?, appointment_time?, type?, reason?, status?, notes?)
- Response 200: `AppointmentResponse`

### PATCH `/appointments/{appointment_id}/status`
- Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE
- Request body: `AppointmentStatusUpdate` (status, notes?)
- Response 200: `AppointmentResponse`

### DELETE `/appointments/{appointment_id}`
- Auth: ADMIN, RECEPTIONIST
- Response 200: `{"message": "Appointment deleted successfully"}`

---

## Medical Records — `/api/v1/medical-records`

### POST `/medical-records`
- Auth: ADMIN, DOCTOR, NURSE
- Request body: `MedicalRecordCreate` (patient_id, doctor_id, diagnosis, visit_date, symptoms?, examination_notes?, vital_signs?, attachments?)
- Response 201: `MedicalRecordResponse`

### GET `/medical-records`
- Auth: ADMIN, DOCTOR, NURSE
- Query params: `skip`, `limit`
- Response 200: `List<MedicalRecordResponse>`

### GET `/medical-records/patient/{patient_id}`
- Auth: Any authenticated user
- Query params: `skip`, `limit`
- Response 200: `List<MedicalRecordResponse>`

### GET `/medical-records/{record_id}`
- Auth: Any authenticated user
- Response 200: `MedicalRecordResponse`
- Error 404: record not found

### PUT `/medical-records/{record_id}`
- Auth: ADMIN, DOCTOR
- Request body: `MedicalRecordUpdate`
- Response 200: `MedicalRecordResponse`

---

## Prescriptions — `/api/v1/prescriptions`

### POST `/prescriptions`
- Auth: ADMIN, DOCTOR
- Request body: `PrescriptionCreate` (patient_id, doctor_id, diagnosis, appointment_id?, instructions?, status?, items: List\<PrescriptionItemCreate\>)
- Response 201: `PrescriptionResponse`

### GET `/prescriptions`
- Auth: ADMIN, DOCTOR, PHARMACIST, NURSE
- Query params: `skip`, `limit`, `patient_id?`, `doctor_id?`
- Response 200: `List<PrescriptionResponse>`

### GET `/prescriptions/{prescription_id}`
- Auth: Any authenticated user
- Response 200: `PrescriptionResponse` (includes items list)
- Error 404: prescription not found

### PUT `/prescriptions/{prescription_id}`
- Auth: ADMIN, DOCTOR
- Request body: `PrescriptionUpdate` (diagnosis?, instructions?, status?)
- Response 200: `PrescriptionResponse`

### POST `/prescriptions/{prescription_id}/items`
- Auth: ADMIN, DOCTOR
- Request body: `PrescriptionItemCreate` (medicine_name, dosage, frequency, duration, instructions?)
- Response 201: `PrescriptionItemResponse`

---

## Pharmacy — `/api/v1/pharmacy`

### POST `/pharmacy/medicines`
- Auth: ADMIN, PHARMACIST
- Request body: `MedicineCreate`
- Response 201: `MedicineResponse`

### GET `/pharmacy/medicines`
- Auth: Any authenticated user
- Query params: `skip`, `limit`, `search?`, `category?`
- Response 200: `List<MedicineResponse>`

### GET `/pharmacy/medicines/low-stock`
- Auth: ADMIN, PHARMACIST
- Response 200: `List<MedicineResponse>`

### GET `/pharmacy/medicines/{medicine_id}`
- Auth: Any authenticated user
- Response 200: `MedicineResponse`
- Error 404: medicine not found

### PUT `/pharmacy/medicines/{medicine_id}`
- Auth: ADMIN, PHARMACIST
- Request body: `MedicineUpdate`
- Response 200: `MedicineResponse`

### PATCH `/pharmacy/medicines/{medicine_id}/stock`
- Auth: ADMIN, PHARMACIST
- Request body: `{"quantity_delta": int, "reason": string?}`
- Response 200: `MedicineResponse`

### POST `/pharmacy/issue`
- Auth: ADMIN, PHARMACIST
- Request body: `MedicineIssueCreate` (medicine_id, patient_id, quantity, prescription_id?, notes?)
- Response 201: `MedicineIssueResponse`

### GET `/pharmacy/issue`
- Auth: ADMIN, PHARMACIST
- Query params: `skip`, `limit`
- Response 200: `List<MedicineIssueResponse>`

---

## Billing — `/api/v1/billing`

### POST `/billing`
- Auth: ADMIN, RECEPTIONIST
- Request body: `InvoiceCreate` (patient_id, appointment_id?, description?, items?, subtotal?, tax?, discount?, total_amount?, payment_status?, payment_method?, notes?)
- Response 201: `InvoiceResponse`

### GET `/billing`
- Auth: ADMIN, RECEPTIONIST
- Query params: `skip`, `limit`, `patient_id?`, `payment_status?`
- Response 200: `List<InvoiceResponse>`

### GET `/billing/{invoice_id}`
- Auth: Any authenticated user
- Response 200: `InvoiceResponse`
- Error 404: invoice not found

### PUT `/billing/{invoice_id}`
- Auth: ADMIN, RECEPTIONIST
- Request body: `InvoiceUpdate`
- Response 200: `InvoiceResponse`

### PATCH `/billing/{invoice_id}/status`
- Auth: ADMIN, RECEPTIONIST
- Request body: `InvoiceStatusUpdate` (payment_status, payment_method?)
- Response 200: `InvoiceResponse`

---

## Departments — `/api/v1/departments`

### POST `/departments`
- Auth: ADMIN
- Request body: `DepartmentCreate` (name, code?, description?, head_of_department?, status?, is_active?)
- Response 201: `DepartmentResponse`

### GET `/departments`
- Auth: Any authenticated user
- Query params: `skip`, `limit`, `is_active?`
- Response 200: `List<DepartmentResponse>`

### GET `/departments/{dept_id}`
- Auth: Any authenticated user
- Response 200: `DepartmentResponse`
- Error 404: department not found

### PUT `/departments/{dept_id}`
- Auth: ADMIN
- Request body: `DepartmentUpdate`
- Response 200: `DepartmentResponse`

---

## Staff — `/api/v1/staff` (ADMIN only)

### POST `/staff/nurses`
- Auth: ADMIN
- Request body: `NurseCreate` (full_name, license_number, phone, email, shift?, department_id?, status?, password?)
- Response 201: `NurseResponse`

### GET `/staff/nurses`
- Auth: ADMIN
- Query params: `skip`, `limit`
- Response 200: `List<NurseResponse>`

### GET `/staff/nurses/{nurse_id}`
- Auth: ADMIN
- Response 200: `NurseResponse`
- Error 404

### POST `/staff/receptionists`
- Auth: ADMIN
- Request body: `ReceptionistCreate`
- Response 201: `ReceptionistResponse`

### GET `/staff/receptionists`
- Auth: ADMIN
- Response 200: `List<ReceptionistResponse>`

### POST `/staff/pharmacists`
- Auth: ADMIN
- Request body: `PharmacistCreate`
- Response 201: `PharmacistResponse`

### GET `/staff/pharmacists`
- Auth: ADMIN
- Response 200: `List<PharmacistResponse>`

### POST `/staff/schedules`
- Auth: ADMIN
- Request body: `StaffScheduleCreate` (staff_type, staff_id, staff_name, day_of_week, shift_start, shift_end, duty_location?)
- Response 201: `StaffScheduleResponse`

### GET `/staff/schedules`
- Auth: ADMIN
- Query params: `skip`, `limit`, `staff_type?`, `schedule_date?`
- Response 200: `List<StaffScheduleResponse>`

---

## Notifications — `/api/v1/notifications`

### GET `/notifications`
- Auth: Any authenticated user
- Query params: `skip` (0), `limit` (50)
- Response 200: `List<NotificationResponse>` (for current user + global)

### PATCH `/notifications/{notification_id}/read`
- Auth: Any authenticated user
- Response 200: `NotificationResponse`
- Error 404: not found

### PATCH `/notifications/read-all`
- Auth: Any authenticated user
- Response 200: `{"message": "{n} notifications marked as read"}`

---

## Reports — `/api/v1/reports`

### GET `/reports/patients`
- Auth: ADMIN, DOCTOR
- Response 200: `PatientStatsResponse` (total_patients, gender_distribution, blood_group_distribution, new_patients_last_30_days)

### GET `/reports/appointments`
- Auth: ADMIN, DOCTOR, RECEPTIONIST
- Response 200: `AppointmentStatsResponse` (total_appointments, by_status, today_count, upcoming_count)

### GET `/reports/billing`
- Auth: ADMIN, RECEPTIONIST
- Response 200: `BillingStatsResponse` (total_invoiced, total_paid, total_pending, by_status, invoice_count)

### GET `/reports/pharmacy`
- Auth: ADMIN, PHARMACIST
- Response 200: `PharmacyStatsResponse` (total_medicines, low_stock_count, out_of_stock_count, total_dispensed)

---

## Audit Logs — `/api/v1/audit-logs` (ADMIN only)

### GET `/audit-logs`
- Auth: ADMIN
- Query params: `skip` (0), `limit` (100), `action?`, `resource?`
- Response 200: `List<AuditLogResponse>`

---

## Common Response Shapes

### Token
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": { /* UserResponse */ }
}
```

### UserResponse
```json
{
  "id": 1,
  "email": "admin@hospital.com",
  "full_name": "Hospital Administrator",
  "role": "ADMIN",
  "phone": null,
  "is_active": true,
  "is_verified": true,
  "last_login": "2025-01-01T00:00:00Z",
  "profile_id": "DOC-XXXXXX",
  "department": "Cardiology",
  "created_at": "...",
  "updated_at": "..."
}
```

### Error shapes (Python HTTPException default)
```json
{ "detail": "Error message string" }
```

### Validation error (422)
```json
{
  "detail": "Validation error",
  "errors": [ /* pydantic error objects */ ],
  "body": "..."
}
```

### Database error (500)
```json
{ "detail": "A database error occurred. Please try again." }
```
