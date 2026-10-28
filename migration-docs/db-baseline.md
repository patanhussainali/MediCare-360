# Database Baseline — MediCare360 SQLite

**Database file:** `backend/medicare360.db` (SQLite 3)  
**Inspected:** after Phase 1 fixes (two columns added to `notifications`)  
**DDL-auto in Java:** `validate` — no DDL changes permitted

---

## Table Inventory

| Table | Row Count |
|---|---|
| alembic_version | 1 |
| users | 3 |
| patients | 1 |
| doctors | 1 |
| departments | 8 |
| nurses | 0 |
| receptionists | 0 |
| pharmacists | 0 |
| appointments | 0 |
| medical_records | 0 |
| prescriptions | 0 |
| prescription_items | 0 |
| medicines | 0 |
| medicine_issue_records | 0 |
| invoices | 0 |
| notifications | 0 |
| audit_logs | 17 |
| staff_schedules | 0 |

---

## Table Details

### alembic_version
Used by Alembic migrations. Java does not touch this table.

| Column | Type | Constraints |
|---|---|---|
| version_num | VARCHAR(32) | PK, NOT NULL |

---

### users

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| role | VARCHAR(12) | NOT NULL, INDEX (`PATIENT`,`DOCTOR`,`NURSE`,`RECEPTIONIST`,`PHARMACIST`,`LAB_TECHNICIAN`,`ADMIN`) |
| phone | VARCHAR(50) | NULL |
| is_active | BOOLEAN | NOT NULL |
| is_verified | BOOLEAN | NOT NULL |
| last_login | DATETIME | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_users_id`, `ix_users_email` (UNIQUE), `ix_users_role`

---

### patients

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| patient_id | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| user_id | INTEGER | NOT NULL, FK→users.id CASCADE, INDEX |
| full_name | VARCHAR(255) | NOT NULL, INDEX |
| gender | VARCHAR(20) | NOT NULL |
| date_of_birth | VARCHAR(50) | NOT NULL |
| blood_group | VARCHAR(10) | NULL |
| phone | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| address | TEXT | NULL |
| emergency_contact | VARCHAR(100) | NULL |
| allergies | TEXT | NULL |
| chronic_conditions | TEXT | NULL |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_patients_id`, `ix_patients_patient_id` (UNIQUE), `ix_patients_user_id`, `ix_patients_email` (UNIQUE via `uq_patients_email`), `ix_patients_full_name`

---

### doctors

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| doctor_id | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| user_id | INTEGER | NOT NULL, FK→users.id CASCADE, INDEX |
| department_id | INTEGER | NULL, FK→departments.id SET NULL |
| full_name | VARCHAR(255) | NOT NULL, INDEX |
| specialization | VARCHAR(255) | NOT NULL |
| qualification | VARCHAR(255) | NOT NULL |
| experience_years | INTEGER | NOT NULL (default 0) |
| consultation_fee | FLOAT | NOT NULL (default 50.0) |
| available_days | VARCHAR(255) | NULL (default `Mon,Tue,Wed,Thu,Fri`) |
| phone | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| status | VARCHAR(50) | NOT NULL (default `Available`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_doctors_id`, `ix_doctors_doctor_id` (UNIQUE), `ix_doctors_user_id`, `ix_doctors_full_name`, `ix_doctors_email` + `uq_doctors_email` (UNIQUE)

---

### departments

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| code | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| name | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| description | TEXT | NULL |
| head_of_department | VARCHAR(255) | NULL |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| is_active | BOOLEAN | NOT NULL (default 1) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_departments_id`, `ix_departments_code` (UNIQUE), `ix_departments_name` (UNIQUE)

---

### nurses

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| nurse_id | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| user_id | INTEGER | NOT NULL, FK→users.id CASCADE |
| department_id | INTEGER | NULL, FK→departments.id SET NULL |
| full_name | VARCHAR(255) | NOT NULL |
| license_number | VARCHAR(100) | NULL |
| shift | VARCHAR(50) | NOT NULL (default `Morning`) |
| phone | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_nurses_id`, `ix_nurses_nurse_id` (UNIQUE), `uq_nurses_email` (UNIQUE)

---

### receptionists

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| receptionist_id | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| user_id | INTEGER | NOT NULL, FK→users.id CASCADE |
| full_name | VARCHAR(255) | NOT NULL |
| shift | VARCHAR(50) | NOT NULL (default `Day`) |
| phone | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_receptionists_id`, `ix_receptionists_receptionist_id` (UNIQUE), `uq_receptionists_email` (UNIQUE)

---

### pharmacists

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| pharmacist_id | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| user_id | INTEGER | NOT NULL, FK→users.id CASCADE |
| full_name | VARCHAR(255) | NOT NULL |
| license_number | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_pharmacists_id`, `ix_pharmacists_pharmacist_id` (UNIQUE), `uq_pharmacists_email` (UNIQUE)

---

### appointments

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| appointment_number | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| patient_id | INTEGER | NOT NULL, FK→patients.id CASCADE, INDEX |
| doctor_id | INTEGER | NOT NULL, FK→doctors.id CASCADE, INDEX |
| department_id | INTEGER | NULL, FK→departments.id SET NULL |
| appointment_date | VARCHAR(50) | NOT NULL, INDEX |
| appointment_time | VARCHAR(20) | NOT NULL |
| type | VARCHAR(50) | NOT NULL (default `General Consultation`) |
| reason | TEXT | NULL |
| status | VARCHAR(9) | NOT NULL, INDEX (`Scheduled`,`Confirmed`,`Completed`,`Cancelled`,`No-show`) |
| notes | TEXT | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_appointments_id`, `ix_appointments_appointment_number` (UNIQUE), `ix_appointments_patient_id`, `ix_appointments_doctor_id`, `ix_appointments_appointment_date`, `ix_appointments_status`

---

### medical_records

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| record_number | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| patient_id | INTEGER | NOT NULL, FK→patients.id CASCADE, INDEX |
| doctor_id | INTEGER | NOT NULL, FK→doctors.id CASCADE, INDEX |
| diagnosis | VARCHAR(255) | NOT NULL |
| symptoms | TEXT | NULL |
| examination_notes | TEXT | NULL |
| vital_signs | TEXT | NULL |
| attachments | TEXT | NULL |
| visit_date | VARCHAR(50) | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_medical_records_id`, `ix_medical_records_record_number` (UNIQUE), `ix_medical_records_patient_id`, `ix_medical_records_doctor_id`

---

### prescriptions

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| prescription_number | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| patient_id | INTEGER | NOT NULL, FK→patients.id CASCADE, INDEX |
| doctor_id | INTEGER | NOT NULL, FK→doctors.id CASCADE, INDEX |
| appointment_id | INTEGER | NULL, FK→appointments.id SET NULL |
| diagnosis | VARCHAR(255) | NOT NULL |
| instructions | TEXT | NULL |
| status | VARCHAR(50) | NOT NULL (default `Active`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_prescriptions_id`, `ix_prescriptions_prescription_number` (UNIQUE), `ix_prescriptions_patient_id`, `ix_prescriptions_doctor_id`

---

### prescription_items

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| prescription_id | INTEGER | NOT NULL, FK→prescriptions.id CASCADE |
| medicine_name | VARCHAR(255) | NOT NULL |
| dosage | VARCHAR(100) | NOT NULL |
| frequency | VARCHAR(100) | NOT NULL |
| duration | VARCHAR(100) | NOT NULL |
| instructions | VARCHAR(255) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_prescription_items_id`

---

### medicines

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| code | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| name | VARCHAR(255) | NOT NULL, UNIQUE INDEX |
| generic_name | VARCHAR(255) | NOT NULL |
| category | VARCHAR(100) | NOT NULL |
| manufacturer | VARCHAR(255) | NULL |
| unit_price | FLOAT | NOT NULL (default 0.0) |
| stock_quantity | INTEGER | NOT NULL (default 0) |
| min_stock_threshold | INTEGER | NOT NULL (default 10) |
| expiry_date | VARCHAR(50) | NULL |
| status | VARCHAR(50) | NOT NULL (default `Available`) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_medicines_id`, `ix_medicines_code` (UNIQUE), `ix_medicines_name` (UNIQUE)

---

### medicine_issue_records

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| prescription_id | INTEGER | NULL, FK→prescriptions.id SET NULL |
| medicine_id | INTEGER | NOT NULL, FK→medicines.id CASCADE |
| patient_id | INTEGER | NOT NULL, FK→patients.id CASCADE |
| quantity | INTEGER | NOT NULL |
| dispensed_by | VARCHAR(255) | NOT NULL |
| dispensed_at | DATETIME | NOT NULL |
| notes | TEXT | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_medicine_issue_records_id`

---

### invoices

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| invoice_number | VARCHAR(50) | NOT NULL, UNIQUE INDEX |
| patient_id | INTEGER | NOT NULL, FK→patients.id CASCADE, INDEX |
| appointment_id | INTEGER | NULL, FK→appointments.id SET NULL |
| description | TEXT | NULL |
| items_json | TEXT | NOT NULL (default `[]`) |
| subtotal | FLOAT | NOT NULL (default 0.0) |
| tax | FLOAT | NOT NULL (default 0.0) |
| discount | FLOAT | NOT NULL (default 0.0) |
| total_amount | FLOAT | NOT NULL (default 0.0) |
| payment_status | VARCHAR(9) | NOT NULL, INDEX (`Pending`,`Paid`,`Partial`,`Cancelled`,`Refunded`) |
| payment_method | VARCHAR(50) | NULL |
| paid_at | DATETIME | NULL |
| notes | TEXT | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_invoices_id`, `ix_invoices_invoice_number` (UNIQUE), `ix_invoices_patient_id`, `ix_invoices_payment_status`

---

### notifications

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| user_id | INTEGER | NULL, FK→users.id CASCADE, INDEX |
| title | VARCHAR(255) | NOT NULL |
| message | TEXT | NOT NULL |
| type | VARCHAR(50) | NOT NULL (default `INFO`) |
| is_read | BOOLEAN | NOT NULL (default 0) |
| link | VARCHAR(500) | NULL — *added Phase 1* |
| read_at | DATETIME | NULL — *added Phase 1* |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_notifications_id`, `ix_notifications_user_id`

---

### audit_logs

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| user_id | INTEGER | NULL, FK→users.id SET NULL |
| user_email | VARCHAR(255) | NULL |
| user_name | VARCHAR(255) | NOT NULL (default `System`) |
| action | VARCHAR(100) | NOT NULL, INDEX |
| resource | VARCHAR(100) | NULL (default `System`) |
| resource_id | VARCHAR(100) | NULL |
| details | TEXT | NULL |
| ip_address | VARCHAR(50) | NULL |
| user_agent | VARCHAR(500) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_audit_logs_id`, `ix_audit_logs_action`

---

### staff_schedules

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, NOT NULL |
| staff_type | VARCHAR(50) | NOT NULL |
| staff_id | INTEGER | NOT NULL |
| staff_name | VARCHAR(255) | NOT NULL |
| day_of_week | VARCHAR(20) | NOT NULL |
| shift_start | VARCHAR(20) | NOT NULL |
| shift_end | VARCHAR(20) | NOT NULL |
| duty_location | VARCHAR(100) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Indexes: `ix_staff_schedules_id`

---

## Notes for Java JPA

- All DATETIME columns store UTC timestamps. SQLite stores them as strings in ISO-8601 format. Use `@Column(columnDefinition="DATETIME")` with `Instant` or `LocalDateTime` mapped through the SQLite dialect.
- All BOOLEAN columns are stored as INTEGER (0/1) in SQLite.
- Enum columns (`role`, `status`, `payment_status`) are stored as plain VARCHAR strings — use `@Enumerated(EnumType.STRING)`.
- `items_json` in invoices is a TEXT JSON array — map as `String` and handle serialization in the service layer.
- `alembic_version` table must be ignored by JPA (no entity) — use `spring.jpa.hibernate.ddl-auto=validate` so it is untouched.
- The `LAB_TECHNICIAN` role exists in the User enum definition but has no corresponding staff table (none was created in Python). Java enum must include it.
