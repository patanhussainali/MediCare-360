# Entity Mapping — Python SQLAlchemy → Java JPA

**Rule:** Java entity field names follow camelCase; `@Column(name="...")` uses the exact SQLite column name.  
**Timestamp mixin:** All tables have `created_at` / `updated_at`. Map as `Instant` with `@Column(name="created_at")`.  
**`ddl-auto=validate`** — no DDL changes; column names must match exactly.

---

## Base / Mixin

### TimestampMixin → `BaseEntity.java`
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

---

## User → `User.java`

**Table:** `users`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | `@Id @GeneratedValue(strategy=IDENTITY)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| hashed_password | hashedPassword | `String` | `@Column(name="hashed_password", length=255)` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| role | role | `UserRole` enum | `@Enumerated(EnumType.STRING)` `@Column(length=12)` |
| phone | phone | `String` | nullable, `@Column(length=50)` |
| is_active | isActive | `boolean` | `@Column(name="is_active")` |
| is_verified | isVerified | `boolean` | `@Column(name="is_verified")` |
| last_login | lastLogin | `Instant` | nullable, `@Column(name="last_login")` |
| created_at | (from BaseEntity) | `Instant` | |
| updated_at | (from BaseEntity) | `Instant` | |

**Enum:**
```java
public enum UserRole { PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, ADMIN }
```

**Relationships:**
```java
@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private Patient patientProfile;

@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private Doctor doctorProfile;

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private List<AuditLog> auditLogs;

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Notification> notifications;
```

---

## Patient → `Patient.java`

**Table:** `patients`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| patient_id | patientId | `String` | `@Column(name="patient_id", unique=true, length=50)` |
| user_id | user | `User` | `@ManyToOne @JoinColumn(name="user_id")` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| gender | gender | `String` | `@Column(length=20)` |
| date_of_birth | dateOfBirth | `String` | `@Column(name="date_of_birth", length=50)` |
| blood_group | bloodGroup | `String` | nullable, `@Column(name="blood_group", length=10)` |
| phone | phone | `String` | `@Column(length=50)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| address | address | `String` | nullable, `@Column(columnDefinition="TEXT")` |
| emergency_contact | emergencyContact | `String` | nullable, `@Column(name="emergency_contact", length=100)` |
| allergies | allergies | `String` | nullable, `@Column(columnDefinition="TEXT")` |
| chronic_conditions | chronicConditions | `String` | nullable, `@Column(name="chronic_conditions", columnDefinition="TEXT")` |
| status | status | `String` | `@Column(length=50)` default `Active` |

**Relationships:**
```java
@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Appointment> appointments;

@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
private List<MedicalRecord> medicalRecords;

@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Prescription> prescriptions;

@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Invoice> invoices;
```

---

## Doctor → `Doctor.java`

**Table:** `doctors`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| doctor_id | doctorId | `String` | `@Column(name="doctor_id", unique=true, length=50)` |
| user_id | user | `User` | `@ManyToOne @JoinColumn(name="user_id")` |
| department_id | department | `Department` | nullable, `@ManyToOne @JoinColumn(name="department_id")` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| specialization | specialization | `String` | `@Column(length=255)` |
| qualification | qualification | `String` | `@Column(length=255)` |
| experience_years | experienceYears | `int` | `@Column(name="experience_years")` default 0 |
| consultation_fee | consultationFee | `double` | `@Column(name="consultation_fee")` default 50.0 |
| available_days | availableDays | `String` | nullable, `@Column(name="available_days", length=255)` |
| phone | phone | `String` | `@Column(length=50)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| status | status | `String` | `@Column(length=50)` default `Available` |

---

## Department → `Department.java`

**Table:** `departments`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| code | code | `String` | `@Column(unique=true, length=50)` |
| name | name | `String` | `@Column(unique=true, length=255)` |
| description | description | `String` | nullable, TEXT |
| head_of_department | headOfDepartment | `String` | nullable, `@Column(name="head_of_department", length=255)` |
| status | status | `String` | `@Column(length=50)` default `Active` |
| is_active | isActive | `boolean` | `@Column(name="is_active")` default true |

---

## Appointment → `Appointment.java`

**Table:** `appointments`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| appointment_number | appointmentNumber | `String` | `@Column(name="appointment_number", unique=true, length=50)` |
| patient_id | patient | `Patient` | `@ManyToOne @JoinColumn(name="patient_id")` |
| doctor_id | doctor | `Doctor` | `@ManyToOne @JoinColumn(name="doctor_id")` |
| department_id | department | `Department` | nullable, `@ManyToOne @JoinColumn(name="department_id")` |
| appointment_date | appointmentDate | `String` | `@Column(name="appointment_date", length=50)` |
| appointment_time | appointmentTime | `String` | `@Column(name="appointment_time", length=20)` |
| type | type | `String` | `@Column(length=50)` default `General Consultation` |
| reason | reason | `String` | nullable, TEXT |
| status | status | `AppointmentStatus` enum | `@Enumerated(STRING) @Column(length=9)` |
| notes | notes | `String` | nullable, TEXT |

**AppointmentStatus enum:** `SCHEDULED("Scheduled")`, `CONFIRMED("Confirmed")`, `COMPLETED("Completed")`, `CANCELLED("Cancelled")`, `NO_SHOW("No-show")`  
Note: stored as `Scheduled`, `Confirmed`, etc. (title-case) — NOT all-caps. Use `@Enumerated(EnumType.STRING)` plus a custom converter that maps enum name to stored value.

---

## MedicalRecord → `MedicalRecord.java`

**Table:** `medical_records`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| record_number | recordNumber | `String` | `@Column(name="record_number", unique=true, length=50)` |
| patient_id | patient | `Patient` | `@ManyToOne @JoinColumn(name="patient_id")` |
| doctor_id | doctor | `Doctor` | `@ManyToOne @JoinColumn(name="doctor_id")` |
| diagnosis | diagnosis | `String` | `@Column(length=255)` |
| symptoms | symptoms | `String` | nullable, TEXT |
| examination_notes | examinationNotes | `String` | nullable, `@Column(name="examination_notes", columnDefinition="TEXT")` |
| vital_signs | vitalSigns | `String` | nullable, `@Column(name="vital_signs", columnDefinition="TEXT")` |
| attachments | attachments | `String` | nullable, TEXT |
| visit_date | visitDate | `String` | `@Column(name="visit_date", length=50)` |

---

## Prescription → `Prescription.java`

**Table:** `prescriptions`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| prescription_number | prescriptionNumber | `String` | `@Column(name="prescription_number", unique=true, length=50)` |
| patient_id | patient | `Patient` | `@ManyToOne @JoinColumn(name="patient_id")` |
| doctor_id | doctor | `Doctor` | `@ManyToOne @JoinColumn(name="doctor_id")` |
| appointment_id | appointment | `Appointment` | nullable, `@ManyToOne @JoinColumn(name="appointment_id")` |
| diagnosis | diagnosis | `String` | `@Column(length=255)` |
| instructions | instructions | `String` | nullable, TEXT |
| status | status | `String` | `@Column(length=50)` default `Active` |

**Relationship:**
```java
@OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PrescriptionItem> items;
```

---

## PrescriptionItem → `PrescriptionItem.java`

**Table:** `prescription_items`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| prescription_id | prescription | `Prescription` | `@ManyToOne @JoinColumn(name="prescription_id")` |
| medicine_name | medicineName | `String` | `@Column(name="medicine_name", length=255)` |
| dosage | dosage | `String` | `@Column(length=100)` |
| frequency | frequency | `String` | `@Column(length=100)` |
| duration | duration | `String` | `@Column(length=100)` |
| instructions | instructions | `String` | nullable, `@Column(length=255)` |

---

## Medicine → `Medicine.java`

**Table:** `medicines`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| code | code | `String` | `@Column(unique=true, length=50)` |
| name | name | `String` | `@Column(unique=true, length=255)` |
| generic_name | genericName | `String` | `@Column(name="generic_name", length=255)` |
| category | category | `String` | `@Column(length=100)` |
| manufacturer | manufacturer | `String` | nullable, `@Column(length=255)` |
| unit_price | unitPrice | `double` | `@Column(name="unit_price")` default 0.0 |
| stock_quantity | stockQuantity | `int` | `@Column(name="stock_quantity")` default 0 |
| min_stock_threshold | minStockThreshold | `int` | `@Column(name="min_stock_threshold")` default 10 |
| expiry_date | expiryDate | `String` | nullable, `@Column(name="expiry_date", length=50)` |
| status | status | `String` | `@Column(length=50)` default `Available` |

---

## MedicineIssueRecord → `MedicineIssueRecord.java`

**Table:** `medicine_issue_records`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| prescription_id | prescription | `Prescription` | nullable, `@ManyToOne @JoinColumn(name="prescription_id")` |
| medicine_id | medicine | `Medicine` | `@ManyToOne @JoinColumn(name="medicine_id")` |
| patient_id | patient | `Patient` | `@ManyToOne @JoinColumn(name="patient_id")` |
| quantity | quantity | `int` | NOT NULL |
| dispensed_by | dispensedBy | `String` | `@Column(name="dispensed_by", length=255)` |
| dispensed_at | dispensedAt | `Instant` | `@Column(name="dispensed_at")` |
| notes | notes | `String` | nullable, TEXT |

---

## Invoice → `Invoice.java`

**Table:** `invoices`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| invoice_number | invoiceNumber | `String` | `@Column(name="invoice_number", unique=true, length=50)` |
| patient_id | patient | `Patient` | `@ManyToOne @JoinColumn(name="patient_id")` |
| appointment_id | appointment | `Appointment` | nullable, `@ManyToOne @JoinColumn(name="appointment_id")` |
| description | description | `String` | nullable, TEXT |
| items_json | itemsJson | `String` | `@Column(name="items_json", columnDefinition="TEXT")` default `[]` |
| subtotal | subtotal | `double` | default 0.0 |
| tax | tax | `double` | default 0.0 |
| discount | discount | `double` | default 0.0 |
| total_amount | totalAmount | `double` | `@Column(name="total_amount")` default 0.0 |
| payment_status | paymentStatus | `PaymentStatus` enum | `@Enumerated(STRING) @Column(name="payment_status", length=9)` |
| payment_method | paymentMethod | `String` | nullable, `@Column(name="payment_method", length=50)` |
| paid_at | paidAt | `Instant` | nullable, `@Column(name="paid_at")` |
| notes | notes | `String` | nullable, TEXT |

**PaymentStatus enum:** `PENDING("Pending")`, `PAID("Paid")`, `PARTIAL("Partial")`, `CANCELLED("Cancelled")`, `REFUNDED("Refunded")` — title-case stored values, same pattern as AppointmentStatus.

---

## Notification → `Notification.java`

**Table:** `notifications`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| user_id | user | `User` | nullable, `@ManyToOne @JoinColumn(name="user_id")` |
| title | title | `String` | `@Column(length=255)` |
| message | message | `String` | `@Column(columnDefinition="TEXT")` |
| type | type | `String` | `@Column(length=50)` default `INFO` |
| is_read | isRead | `boolean` | `@Column(name="is_read")` default false |
| link | link | `String` | nullable, `@Column(length=500)` |
| read_at | readAt | `Instant` | nullable, `@Column(name="read_at")` |

---

## AuditLog → `AuditLog.java`

**Table:** `audit_logs`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| user_id | user | `User` | nullable, `@ManyToOne @JoinColumn(name="user_id")` |
| user_email | userEmail | `String` | nullable, `@Column(name="user_email", length=255)` |
| user_name | userName | `String` | `@Column(name="user_name", length=255)` default `System` |
| action | action | `String` | `@Column(length=100)` |
| resource | resource | `String` | nullable, `@Column(length=100)` |
| resource_id | resourceId | `String` | nullable, `@Column(name="resource_id", length=100)` |
| details | details | `String` | nullable, TEXT (JSON string) |
| ip_address | ipAddress | `String` | nullable, `@Column(name="ip_address", length=50)` |
| user_agent | userAgent | `String` | nullable, `@Column(name="user_agent", length=500)` |

---

## Nurse → `Nurse.java`

**Table:** `nurses`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| nurse_id | nurseId | `String` | `@Column(name="nurse_id", unique=true, length=50)` |
| user_id | user | `User` | `@ManyToOne @JoinColumn(name="user_id")` |
| department_id | department | `Department` | nullable, `@ManyToOne @JoinColumn(name="department_id")` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| license_number | licenseNumber | `String` | nullable, `@Column(name="license_number", length=100)` |
| shift | shift | `String` | `@Column(length=50)` default `Morning` |
| phone | phone | `String` | `@Column(length=50)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| status | status | `String` | `@Column(length=50)` default `Active` |

---

## Receptionist → `Receptionist.java`

**Table:** `receptionists`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| receptionist_id | receptionistId | `String` | `@Column(name="receptionist_id", unique=true, length=50)` |
| user_id | user | `User` | `@ManyToOne @JoinColumn(name="user_id")` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| shift | shift | `String` | `@Column(length=50)` default `Day` |
| phone | phone | `String` | `@Column(length=50)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| status | status | `String` | `@Column(length=50)` default `Active` |

---

## Pharmacist → `Pharmacist.java`

**Table:** `pharmacists`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| pharmacist_id | pharmacistId | `String` | `@Column(name="pharmacist_id", unique=true, length=50)` |
| user_id | user | `User` | `@ManyToOne @JoinColumn(name="user_id")` |
| full_name | fullName | `String` | `@Column(name="full_name", length=255)` |
| license_number | licenseNumber | `String` | `@Column(name="license_number", length=100)` NOT NULL |
| phone | phone | `String` | `@Column(length=50)` |
| email | email | `String` | `@Column(unique=true, length=255)` |
| status | status | `String` | `@Column(length=50)` default `Active` |

---

## StaffSchedule → `StaffSchedule.java`

**Table:** `staff_schedules`

| Python column | Java field | JPA type | Notes |
|---|---|---|---|
| id | id | `Long` | PK |
| staff_type | staffType | `String` | `@Column(name="staff_type", length=50)` |
| staff_id | staffId | `int` | `@Column(name="staff_id")` NOT NULL |
| staff_name | staffName | `String` | `@Column(name="staff_name", length=255)` |
| day_of_week | dayOfWeek | `String` | `@Column(name="day_of_week", length=20)` |
| shift_start | shiftStart | `String` | `@Column(name="shift_start", length=20)` |
| shift_end | shiftEnd | `String` | `@Column(name="shift_end", length=20)` |
| duty_location | dutyLocation | `String` | nullable, `@Column(name="duty_location", length=100)` |

---

## Critical Implementation Notes

### Enum Title-Case Storage
`AppointmentStatus` and `PaymentStatus` values in the DB are title-case (`Scheduled`, `Paid`) not ALL_CAPS. Use a `@Converter` or override `EnumType.STRING` serialization:

```java
@Converter(autoApply = false)
public class AppointmentStatusConverter implements AttributeConverter<AppointmentStatus, String> {
    public String convertToDatabaseColumn(AppointmentStatus status) {
        return status == null ? null : status.getDbValue();
    }
    public AppointmentStatus convertToEntityAttribute(String dbData) {
        return AppointmentStatus.fromDbValue(dbData);
    }
}
```

Each enum carries a `dbValue` field (e.g., `SCHEDULED("Scheduled")`).

### SQLite DATETIME as Instant
Use `org.hibernate.community.dialect.SQLiteDialect` from `hibernate-community-dialects`. Configure:
```properties
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.datasource.driver-class-name=org.sqlite.JDBC
```
Map `Instant` columns via `@Column(columnDefinition="DATETIME")`.

### alembic_version Table
Do not create an entity for it. Hibernate `validate` will not complain about tables without mapped entities (only the reverse).
