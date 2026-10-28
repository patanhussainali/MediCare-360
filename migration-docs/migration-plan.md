# Migration Plan — Python → Java Spring Boot

**Goal:** Replace the Python FastAPI backend with a Java 21 / Spring Boot 3.x backend that reads the same SQLite database without any DDL changes.

**Constraint:** `spring.jpa.hibernate.ddl-auto=validate`. No CREATE TABLE, no DROP TABLE, no ALTER TABLE, no INSERT/DELETE during startup.

**Java project root:** `c:\Users\SIVA SANKAR\OneDrive\Desktop\medicare-360\java-backend\`

Reference documents:
- `migration-docs/db-baseline.md` — exact table/column names and types
- `migration-docs/api-contracts.md` — every endpoint
- `migration-docs/auth-roles.md` — JWT, bcrypt, CORS
- `migration-docs/entity-mapping.md` — Python model → Java JPA field mapping

---

## Implementation Plan

- [ ] 1. **Create the Maven project scaffold**

      Create `java-backend/` as a standard Maven project with Spring Boot 3.x parent.

      Files to create:
      - `java-backend/pom.xml`
      - `java-backend/src/main/java/com/medicare360/MediCare360Application.java`
      - `java-backend/src/main/resources/application.properties`
      - `java-backend/src/test/java/com/medicare360/MediCare360ApplicationTests.java`

      **pom.xml** must declare:
      ```xml
      <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
      </parent>
      <properties>
        <java.version>21</java.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <jjwt.version>0.12.6</jjwt.version>
      </properties>
      ```

      Dependencies (exact versions):
      | groupId | artifactId | version |
      |---|---|---|
      | org.springframework.boot | spring-boot-starter-web | (from parent) |
      | org.springframework.boot | spring-boot-starter-data-jpa | (from parent) |
      | org.springframework.boot | spring-boot-starter-security | (from parent) |
      | org.springframework.boot | spring-boot-starter-validation | (from parent) |
      | org.xerial | sqlite-jdbc | 3.45.3.0 |
      | org.hibernate.orm | hibernate-community-dialects | 6.4.4.Final |
      | org.projectlombok | lombok | (from parent managed) |
      | org.mapstruct | mapstruct | 1.5.5.Final |
      | org.mapstruct | mapstruct-processor | 1.5.5.Final (annotationProcessorPaths) |
      | io.jsonwebtoken | jjwt-api | 0.12.6 |
      | io.jsonwebtoken | jjwt-impl | 0.12.6 (runtime) |
      | io.jsonwebtoken | jjwt-jackson | 0.12.6 (runtime) |
      | org.springframework.boot | spring-boot-starter-test | (from parent, test scope) |
      | org.mockito | mockito-core | (from parent, test scope) |

      **application.properties:**
      ```properties
      spring.application.name=medicare360
      server.port=8000

      # SQLite — path relative to java-backend working directory
      spring.datasource.url=jdbc:sqlite:../backend/medicare360.db
      spring.datasource.driver-class-name=org.sqlite.JDBC
      spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
      spring.jpa.hibernate.ddl-auto=validate
      spring.jpa.show-sql=false

      # JWT — overridden by environment variable JWT_SECRET_KEY
      jwt.secret=${JWT_SECRET_KEY:changeme-set-in-production-to-at-least-32-chars}
      jwt.access-expiry-minutes=60
      jwt.refresh-expiry-days=7

      # CORS
      cors.allowed-origins=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001
      ```

      **Verify:** `cd java-backend && mvn compile -q` — BUILD SUCCESS, no compilation errors.

---

- [ ] 2. **Implement the shared infrastructure layer**

      Create the common utilities used by every other layer. No business logic here.

      Files to create:
      - `src/main/java/com/medicare360/common/BaseEntity.java` — `@MappedSuperclass` with `createdAt`, `updatedAt`, `@PrePersist`, `@PreUpdate`
      - `src/main/java/com/medicare360/common/ApiResponse.java` — generic wrapper (not required for all endpoints, but useful for consistent error bodies)
      - `src/main/java/com/medicare360/exception/GlobalExceptionHandler.java` — `@RestControllerAdvice` handling:
        - `ResourceNotFoundException` → 404 `{"detail": "..."}`
        - `BadRequestException` → 400 `{"detail": "..."}`
        - `ForbiddenException` → 403 `{"detail": "..."}`
        - `MethodArgumentNotValidException` → 422 `{"detail":"Validation error","errors":[...],"body":null}`
        - `DataIntegrityViolationException` → 409 `{"detail": "A record with this value already exists."}`
        - `Exception` (catch-all) → 500 `{"detail": "An internal server error occurred."}`
      - `src/main/java/com/medicare360/exception/ResourceNotFoundException.java`
      - `src/main/java/com/medicare360/exception/BadRequestException.java`
      - `src/main/java/com/medicare360/exception/ForbiddenException.java`

      Error response body must exactly match Python's `{"detail": "string"}` shape so the frontend works without change.

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 3. **Implement JWT and security infrastructure**

      Create the security layer: JWT service, token blacklist, filter, and Spring Security config.

      Files to create:
      - `src/main/java/com/medicare360/security/JwtService.java`
        - `generateAccessToken(userId, role)` → signs HS256 JWT with claims `sub` (userId as String), `role`, `type="access"`, `jti`, `iat`, `exp` (iat+60min)
        - `generateRefreshToken(userId, role)` → same with `type="refresh"`, exp = iat+7days
        - `validateToken(token)` → returns parsed `Claims` or null on error
        - `extractUserId(claims)` → `Long.parseLong(claims.getSubject())`
        - `extractRole(claims)` → `claims.get("role", String.class)`
        - `extractType(claims)` → `claims.get("type", String.class)`
        - `extractJti(claims)` → `claims.get("jti", String.class)`
        - Uses `io.jsonwebtoken.Jwts` with `Keys.hmacShaKeyFor(secret.getBytes(UTF_8))`
        - Secret injected via `@Value("${jwt.secret}")`

      - `src/main/java/com/medicare360/security/TokenBlacklistService.java`
        - `@Component` singleton with `ConcurrentHashMap.newKeySet()` (thread-safe Set)
        - `blacklist(String jti)`, `isBlacklisted(String jti)` (checks by JTI not full token — safer than full token comparison)
        - Note: Python blacklists the raw token string; Java blacklists the `jti` claim. This is functionally equivalent and more memory-efficient. The JTI is unique per token.

      - `src/main/java/com/medicare360/security/JwtAuthFilter.java`
        - `OncePerRequestFilter`
        - Extracts `Authorization: Bearer <token>` header
        - Calls `jwtService.validateToken(token)`, checks type == "access", checks JTI not blacklisted
        - Loads user from `UserRepository` by userId
        - Checks `user.isActive()`
        - Sets `UsernamePasswordAuthenticationToken` into `SecurityContextHolder`
        - On any failure: continues filter chain without setting auth (Spring Security returns 401 automatically)

      - `src/main/java/com/medicare360/security/SecurityConfig.java`
        - `@Configuration @EnableWebSecurity`
        - `SecurityFilterChain` bean: stateless, no CSRF, add `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`
        - Permit: `GET /health`, `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/check-admin`, `POST /api/v1/auth/setup-admin`, `POST /api/v1/auth/refresh`, `/api/v1/docs/**`, `/api/v1/openapi.json`, `/swagger-ui/**`
        - All other: `authenticated()`
        - `BCryptPasswordEncoder` bean with strength 12
        - CORS bean reading `cors.allowed-origins` from properties

      - `src/main/java/com/medicare360/security/UserPrincipal.java`
        - Implements `UserDetails`, holds `userId` (Long), `email`, `role` (UserRole enum), `isActive`
        - `getAuthorities()` returns `List.of(new SimpleGrantedAuthority(role.name()))` (no `ROLE_` prefix)

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 4. **Create JPA entities for all 18 tables**

      Create one entity per table. Map every column with the exact DB column name via `@Column(name=...)`. Use `@Enumerated(EnumType.STRING)` with custom `@Converter` for title-case enum values. Do NOT map `alembic_version`.

      Files to create (package `com.medicare360.entity`):
      - `UserRole.java` — enum: `PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, ADMIN`
      - `AppointmentStatus.java` — enum with `dbValue`: `SCHEDULED("Scheduled")`, `CONFIRMED("Confirmed")`, `COMPLETED("Completed")`, `CANCELLED("Cancelled")`, `NO_SHOW("No-show")` + static `fromDbValue(String)`
      - `PaymentStatus.java` — enum with `dbValue`: `PENDING("Pending")`, `PAID("Paid")`, `PARTIAL("Partial")`, `CANCELLED("Cancelled")`, `REFUNDED("Refunded")` + static `fromDbValue(String)`
      - `AppointmentStatusConverter.java` — `@Converter` AttributeConverter<AppointmentStatus, String>
      - `PaymentStatusConverter.java` — `@Converter` AttributeConverter<PaymentStatus, String>
      - `User.java`
      - `Patient.java`
      - `Doctor.java`
      - `Department.java`
      - `Appointment.java`
      - `MedicalRecord.java`
      - `Prescription.java`
      - `PrescriptionItem.java`
      - `Medicine.java`
      - `MedicineIssueRecord.java`
      - `Invoice.java`
      - `Notification.java`
      - `AuditLog.java`
      - `Nurse.java`
      - `Receptionist.java`
      - `Pharmacist.java`
      - `StaffSchedule.java`

      Follow `entity-mapping.md` exactly. Key points:
      - `@Table(name="exact_table_name")` on every entity
      - `Instant` for all DATETIME columns + `@Column(columnDefinition="DATETIME")`
      - FetchType.LAZY on all `@ManyToOne` and `@OneToMany` to avoid N+1 queries
      - `@JsonIgnore` on bidirectional back-references (e.g., `User.notifications`) to prevent serialization cycles
      - Do not add `@GeneratedValue` with SEQUENCE — use `IDENTITY` (SQLite autoincrement)

      **Verify:** `mvn compile -q` — BUILD SUCCESS (no missing import errors, no annotation processor errors).

---

- [ ] 5. **Create Spring Data JPA repositories**

      One `JpaRepository` interface per entity that needs querying. Add custom query methods for the service layer.

      Files to create (package `com.medicare360.repository`):
      - `UserRepository.java` — `findByEmailIgnoreCase`, `findByRole`, `existsByEmail`
      - `PatientRepository.java` — `findByPatientId`, `findByUserId`, `findByFullNameContainingIgnoreCaseOrPatientIdContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrEmailContainingIgnoreCase` (for search), `existsByEmail`
      - `DoctorRepository.java` — `findByDoctorId`, `findByUserId`, `findByDepartmentId`, `findByStatus`
      - `DepartmentRepository.java` — `findByCode`, `findByIsActive`
      - `AppointmentRepository.java` — `findByPatientId`, `findByDoctorId`, `findByStatus`, `findByAppointmentDate`, plus combined filter method `findAll(Specification<Appointment>)` — use `JpaSpecificationExecutor`
      - `MedicalRecordRepository.java` — `findByPatientIdOrderByCreatedAtDesc`, `findByRecordNumber`
      - `PrescriptionRepository.java` — `findByPatientId`, `findByDoctorId`, `findByPrescriptionNumber`
      - `PrescriptionItemRepository.java` — `findByPrescriptionId`
      - `MedicineRepository.java` — `findByCode`, `findByName`, `findByStockQuantityLessThanEqual` (for low-stock), search by name/generic_name/category
      - `MedicineIssueRecordRepository.java` — basic paged listing, `count()`
      - `InvoiceRepository.java` — `findByPatientId`, `findByPaymentStatus`, `JpaSpecificationExecutor`
      - `NotificationRepository.java` — `findByUserIdOrUserIdIsNull`, `countByUserIdAndIsReadFalse`, `findByIdAndUserId`
      - `AuditLogRepository.java` — `findByAction`, `findByResource`, `JpaSpecificationExecutor`
      - `NurseRepository.java` — `findByUserId`, `findByNurseId`, `existsByEmail`
      - `ReceptionistRepository.java` — `findByUserId`, `findByReceptionistId`, `existsByEmail`
      - `PharmacistRepository.java` — `findByUserId`, `findByPharmacistId`, `existsByEmail`
      - `StaffScheduleRepository.java` — `findByStaffType`, `findByDayOfWeek`

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 6. **Create DTOs (request/response records)**

      Create Java record-based DTOs matching Python Pydantic schemas. Use Jakarta Validation annotations where Python used `Field(min_length=...)` constraints.

      Files to create (package `com.medicare360.dto`):

      **Auth DTOs:**
      - `LoginRequest.java` — `email`, `password`, `role` (optional String)
      - `RegisterRequest.java` — `email`, `password`, `fullName`, `phoneNumber`, `role` (String, defaulted to PATIENT server-side)
      - `TokenResponse.java` — `accessToken`, `refreshToken`, `tokenType`, `user` (UserResponse)
      - `RefreshTokenRequest.java` — `refreshToken`

      **User DTOs:**
      - `UserResponse.java` — `id`, `email`, `fullName`, `role`, `phone`, `isActive`, `isVerified`, `lastLogin`, `profileId`, `department`, `createdAt`, `updatedAt`
      - `UserCreateRequest.java` — `email`, `password`, `fullName`, `role`, `phoneNumber`, `department`
      - `UserUpdateRequest.java` — all optional: `fullName`, `phone`, `isActive`, `role`, `password`

      **Patient DTOs:**
      - `PatientCreateRequest.java` / `PatientUpdateRequest.java` / `PatientResponse.java`
      - Response includes computed `firstName`, `lastName`, `phoneNumber`, `medicalRecordNumber` (= patientId)

      **Doctor DTOs:**
      - `DoctorCreateRequest.java` / `DoctorUpdateRequest.java` / `DoctorResponse.java`
      - Response includes `name` (= fullName), `consultationFee`, `experienceYears`, `department` (resolved from relationship)

      **Department, Appointment, MedicalRecord, Prescription, PrescriptionItem, Medicine, MedicineIssue, Invoice, Billing, Notification, AuditLog, Staff (Nurse/Receptionist/Pharmacist/Schedule), Report DTOs** — one Create + one Update + one Response per domain, matching field names from `api-contracts.md`

      **Report DTOs:**
      - `PatientStatsResponse.java` — `totalPatients`, `genderDistribution`, `bloodGroupDistribution`, `newPatientsLast30Days`
      - `AppointmentStatsResponse.java` — `totalAppointments`, `byStatus`, `todayCount`, `upcomingCount`
      - `BillingStatsResponse.java` — `totalInvoiced`, `totalPaid`, `totalPending`, `byStatus`, `invoiceCount`
      - `PharmacyStatsResponse.java` — `totalMedicines`, `lowStockCount`, `outOfStockCount`, `totalDispensed`

      JSON field naming: use `@JsonProperty("snake_case_name")` to match Python response field names exactly (e.g., `@JsonProperty("access_token")` on `accessToken`). This is critical — the frontend expects the Python naming convention.

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 7. **Implement AuthService and UserService**

      Implement the auth and user management business logic matching the Python `AuthService` exactly.

      Files to create (package `com.medicare360.service`):
      - `AuthService.java`:
        - `register(RegisterRequest, ipAddress)` → creates User, then creates role-linked profile (Patient/Doctor/Nurse/Receptionist/Pharmacist) using same ID pattern as Python (e.g., `"PAT-" + 6-digit random`, `"DOC-" + UUID hex 6 chars upper`)
        - `authenticate(LoginRequest, ipAddress)` → case-insensitive email lookup, optional role enforcement (if role sent, must match), bcrypt verify, update `lastLogin`, issue tokens, write audit log
        - `refreshToken(String refreshToken)` → validate type=="refresh", blacklist old JTI, issue new pair
        - `logout(String token, User, ipAddress)` → extract JTI, blacklist it, write audit log
        - `checkAdminExists(UserRepository)` → boolean
      - `UserService.java`:
        - `createUser(UserCreateRequest)` → delegates to AuthService.register
        - `listUsers(skip, limit, role)` → paginated
        - `getUserById(Long)` → or throw 404
        - `updateUser(Long, UserUpdateRequest, currentUser)` → all optional field updates with same guards as Python (no self-deactivate, no non-admin assigning ADMIN)
        - `deleteUser(Long, currentUser)` → guard against self-delete

      **Verify:** `mvn test -pl . -Dtest=AuthServiceTest,UserServiceTest` — all tests pass (write unit tests with Mockito mocks in step 13).

---

- [ ] 8. **Implement Patient, Doctor, Department services**

      Files to create (package `com.medicare360.service`):
      - `PatientService.java`:
        - `create(PatientCreateRequest, createdBy)` → auto-generate `patient_id` as `"PAT-" + 6 random digits` if not provided, create associated User if password provided, persist Patient
        - `getMulti(skip, limit, search)` → search across fullName, patientId, phone, email
        - `getById(Long)` → or 404
        - `update(Long, PatientUpdateRequest, updatedBy)` → partial update
        - `delete(Long, deletedBy)` → audit log
      - `DoctorService.java`:
        - `create(DoctorCreateRequest, createdBy)` → generate `doctor_id`, create User if needed, persist Doctor
        - `getMulti(skip, limit, departmentId, isAvailable)` → filter by status="Available" when isAvailable=true
        - `getById(Long)` → or 404
        - `update(Long, DoctorUpdateRequest, updatedBy)` → partial update
      - `DepartmentService.java`:
        - Standard CRUD, auto-generate `code` if not provided (e.g., `DEPT-{name_abbrev}`)
        - `getMulti(skip, limit, isActive)` → filter

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 9. **Implement Appointment, MedicalRecord, Prescription services**

      Files to create (package `com.medicare360.service`):
      - `AppointmentService.java`:
        - `create(AppointmentCreateRequest, createdBy)` → auto-generate `appointment_number` as `"APT-" + UUID hex 6 chars upper`
        - `getMulti(skip, limit, patientId?, doctorId?, status?, appointmentDate?)` → dynamic Specification filter
        - `getById(Long)` → or 404
        - `update(Long, AppointmentUpdateRequest, updatedBy)` → partial
        - `updateStatus(Long, AppointmentStatusUpdateRequest, updatedBy)` → patch status+notes
        - `delete(Long, deletedBy)` → hard delete, audit log

      - `MedicalRecordService.java`:
        - `create(MedicalRecordCreateRequest, createdBy)` → generate `record_number` as `"REC-" + UUID hex 6 chars upper`
        - `getMulti(skip, limit)`, `getPatientHistory(patientId, skip, limit)`, `getById(Long)`, `update(Long, ..., updatedBy)`

      - `PrescriptionService.java`:
        - `create(PrescriptionCreateRequest, createdBy)` → generate `prescription_number` as `"PRESC-" + UUID hex 6 chars upper`, persist Prescription + PrescriptionItems in same transaction
        - `getMulti(skip, limit, patientId?, doctorId?)`, `getById(Long)`, `update(Long, ..., updatedBy)`
        - `addItem(prescriptionId, PrescriptionItemCreateRequest, createdBy)` → append item to existing prescription

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 10. **Implement Pharmacy, Billing, and Report services**

      Files to create (package `com.medicare360.service`):
      - `PharmacyService.java`:
        - `createMedicine(MedicineCreateRequest, createdBy)` → persist
        - `getMedicines(skip, limit, search?, category?)` → search by name/genericName/category
        - `getLowStockMedicines()` → `stock_quantity <= min_stock_threshold`
        - `getMedicineById(Long)` → or 404
        - `updateMedicine(Long, ..., updatedBy)` → partial
        - `updateStock(Long medicineId, int quantityDelta, updatedBy)` → `medicine.stockQuantity += delta`, update status (`Available`/`Low Stock`/`Out of Stock`), audit log
        - `issueMedicine(MedicineIssueCreateRequest, issuedBy)` → decrement stock, persist MedicineIssueRecord, `dispensedBy = issuedBy.fullName`
        - `getIssueRecords(skip, limit)`

      - `BillingService.java`:
        - `create(InvoiceCreateRequest, createdBy)` → auto-generate `invoice_number` as `"INV-" + UUID hex 6 chars upper`, serialize `items` list to `items_json` String
        - `getMulti(skip, limit, patientId?, paymentStatus?)` → dynamic Specification
        - `getById(Long)` → or 404
        - `update(Long, ..., updatedBy)` → partial
        - `updateStatus(Long, InvoiceStatusUpdateRequest, updatedBy)` → set paymentStatus + paymentMethod + paidAt if status=PAID

      - `ReportService.java`:
        - `getPatientStats()` → count total, count by gender, count by blood_group, count last 30 days
        - `getAppointmentStats()` → count total, group by status, count where date=today, count where date>today
        - `getBillingStats()` → sum total_amount, sum where paid, sum where pending, group by status, count
        - `getPharmacyStats()` → count total medicines, count low stock (stock<=threshold), count out of stock (stock=0), count total MedicineIssueRecord rows

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 11. **Implement Staff, Notification, and AuditLog services**

      Files to create (package `com.medicare360.service`):
      - `StaffService.java`:
        - `createNurse(NurseCreateRequest, createdBy)` → generate `nurse_id` as `"NUR-" + UUID hex 6 upper`, create User(NURSE) if password provided
        - `getNurses(skip, limit)`, `getNurseById(Long)` → or 404
        - `createReceptionist(ReceptionistCreateRequest, createdBy)` → generate `"REC-" + UUID hex 6 upper`
        - `getReceptionists(skip, limit)`
        - `createPharmacist(PharmacistCreateRequest, createdBy)` → generate `"PHAR-" + UUID hex 6 upper`
        - `getPharmacists(skip, limit)`
        - `createSchedule(StaffScheduleCreateRequest, createdBy)` → persist
        - `getSchedules(skip, limit, staffType?, date?)` → filter by staffType and/or dayOfWeek

      - `NotificationService.java`:
        - `getUserNotifications(userId, skip, limit)` → `user_id = userId OR user_id IS NULL` order by `created_at DESC`
        - `markAsRead(notificationId, userId)` → find by id where `user_id = userId OR user_id IS NULL`, set `is_read=true`, `read_at=now()`
        - `markAllAsRead(userId)` → bulk update all unread for user, return count
        - `send(userId?, title, message, type, link?)` — internal utility used by other services (optional for Phase 1)

      - `AuditService.java`:
        - `logAction(db, action, resource, user, resourceId, details, ipAddress)` → persist AuditLog synchronously
        - `getLogs(skip, limit, action?, resource?)` → dynamic filter

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 12. **Implement all 14 REST controllers**

      One `@RestController` per route group, matching Python path prefixes exactly. Use `@PreAuthorize` with `hasAuthority("ROLE_NAME")` for role enforcement (no `ROLE_` prefix since authorities are stored plain).

      Files to create (package `com.medicare360.controller`):
      - `AuthController.java` — prefix `/api/v1/auth`
      - `UserController.java` — prefix `/api/v1/users`
      - `PatientController.java` — prefix `/api/v1/patients`
      - `DoctorController.java` — prefix `/api/v1/doctors`
      - `AppointmentController.java` — prefix `/api/v1/appointments`
      - `MedicalRecordController.java` — prefix `/api/v1/medical-records`
      - `PrescriptionController.java` — prefix `/api/v1/prescriptions`
      - `PharmacyController.java` — prefix `/api/v1/pharmacy`
      - `BillingController.java` — prefix `/api/v1/billing`
      - `DepartmentController.java` — prefix `/api/v1/departments`
      - `StaffController.java` — prefix `/api/v1/staff`
      - `NotificationController.java` — prefix `/api/v1/notifications`
      - `ReportController.java` — prefix `/api/v1/reports`
      - `AuditLogController.java` — prefix `/api/v1/audit-logs`
      - `HealthController.java` — `GET /health`

      Each controller method:
      - Injects `HttpServletRequest` for IP address when needed (auth/logout)
      - Injects `@AuthenticationPrincipal UserPrincipal` for current user
      - Returns `ResponseEntity<T>` with explicit HTTP status codes matching Python
      - All list endpoints accept `skip` (int, default 0) and `limit` (int, default varies) query params → translate to Spring `Pageable` (page = skip/limit, size = limit)

      **PATCH /notifications/read-all** must be mapped BEFORE `PATCH /notifications/{id}/read` to avoid Spring treating "read-all" as a path variable. Use alphabetical path ordering: declare `/read-all` first in the class.

      **Verify:** `mvn compile -q` — BUILD SUCCESS.

---

- [ ] 13. **Write unit tests**

      Write JUnit 5 + Mockito tests. Cover: authentication (all roles), RBAC guard rejection, and representative endpoints in each controller group.

      Files to create (package `com.medicare360` in `src/test/`):
      - `AuthServiceTest.java`:
        - `testLogin_success_admin()` — mock UserRepository, bcrypt match, verify token claims
        - `testLogin_wrongRole_rejected()` — PATIENT user trying ADMIN role returns 401
        - `testLogin_inactiveUser_rejected()` — isActive=false → 400
        - `testLogin_wrongPassword_rejected()` → 401
        - `testRefreshToken_validRefreshToken_returnsNewPair()`
        - `testRefreshToken_accessTokenAsRefresh_rejected()` — type != "refresh" → 401
        - `testLogout_blacklistsToken()`
        - `testRegister_duplicateEmail_rejected()`

      - `JwtServiceTest.java`:
        - `testGenerateAndValidateAccessToken()`
        - `testExpiredToken_returnsNull()`
        - `testTamperedToken_returnsNull()`
        - `testRefreshTokenType()`

      - `PatientControllerTest.java` (using `@WebMvcTest` + `@MockBean`):
        - `testListPatients_asAdmin_returns200()`
        - `testListPatients_asPharmacist_returns403()` — PHARMACIST not in allowed roles
        - `testCreatePatient_asReceptionist_returns201()`
        - `testDeletePatient_asNonAdmin_returns403()`

      - `DoctorControllerTest.java`:
        - `testListDoctors_asPatient_returns200()` — all authenticated users can list
        - `testCreateDoctor_asDoctor_returns403()` — only ADMIN
        - `testCreateDoctor_asAdmin_returns201()`

      - `AppointmentControllerTest.java`:
        - `testCreateAppointment_asPatient_returns201()`
        - `testDeleteAppointment_asPatient_returns403()`
        - `testUpdateStatus_asNurse_returns200()`

      - `BillingControllerTest.java`:
        - `testListInvoices_asReceptionist_returns200()`
        - `testListInvoices_asDoctor_returns403()`

      - `PharmacyControllerTest.java`:
        - `testListMedicines_asPatient_returns200()` — all authenticated users can read
        - `testIssueMedicine_asNurse_returns403()` — only ADMIN/PHARMACIST

      - `NotificationControllerTest.java`:
        - `testGetNotifications_anyRole_returns200()`
        - `testMarkAllRead_returns200()`

      **Verify:** `mvn test` — all tests pass (green).

---

- [ ] 14. **Integration smoke test and configuration validation**

      Run the application against the real SQLite database and verify it starts and responds.

      Steps:
      1. Set env var `JWT_SECRET_KEY` to the same value as the Python `SECRET_KEY` in `.env`.
      2. Start: `mvn spring-boot:run` from `java-backend/`
      3. `curl http://localhost:8000/health` → `{"status":"healthy","service":"medicare360","version":"1.0.0"}`
      4. `curl http://localhost:8000/api/v1/auth/check-admin` → `{"hasAdmin":true}` (3 users, 1 is ADMIN)
      5. Login with the existing admin credentials:
         `curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"..."}'`
         → HTTP 200, `access_token` present
      6. Use the token: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/departments`
         → HTTP 200, JSON array of 8 departments (matches DB row count)
      7. Verify `spring.jpa.hibernate.ddl-auto=validate` logs no schema errors on startup.
      8. Verify no Hibernate SQL logged modifying the schema (no CREATE/DROP/ALTER).

      **Verify:** All 8 curl checks return expected HTTP status codes.

---

- [ ] 15. **Produce build artifact and startup script**

      Create a runnable JAR and a startup script so the Java backend can replace the Python server.

      Files to create:
      - `java-backend/pom.xml` → add `spring-boot-maven-plugin` with `repackage` goal (already in Spring Boot parent, just confirm it is active)
      - `java-backend/start.cmd` (Windows):
        ```bat
        @echo off
        set JWT_SECRET_KEY=<set-from-env>
        java -jar target\medicare360-1.0.0.jar
        ```
      - `java-backend/start.sh` (Linux/Mac):
        ```bash
        #!/bin/bash
        export JWT_SECRET_KEY="${JWT_SECRET_KEY:?Must set JWT_SECRET_KEY}"
        java -jar target/medicare360-1.0.0.jar
        ```
      - Update `migration-docs/migration-plan.md` with the final build command:
        ```
        mvn clean package -DskipTests
        ```

      **Verify:** `mvn clean package -DskipTests -q` produces `target/medicare360-1.0.0.jar`.

---

## Directory Layout (final)

```
java-backend/
├── pom.xml
├── start.cmd
├── start.sh
└── src/
    ├── main/java/com/medicare360/
    │   ├── MediCare360Application.java
    │   ├── common/
    │   │   ├── BaseEntity.java
    │   │   └── ApiResponse.java
    │   ├── config/
    │   │   └── CorsConfig.java              (extracted from SecurityConfig if needed)
    │   ├── controller/
    │   │   ├── AuthController.java
    │   │   ├── UserController.java
    │   │   ├── PatientController.java
    │   │   ├── DoctorController.java
    │   │   ├── AppointmentController.java
    │   │   ├── MedicalRecordController.java
    │   │   ├── PrescriptionController.java
    │   │   ├── PharmacyController.java
    │   │   ├── BillingController.java
    │   │   ├── DepartmentController.java
    │   │   ├── StaffController.java
    │   │   ├── NotificationController.java
    │   │   ├── ReportController.java
    │   │   ├── AuditLogController.java
    │   │   └── HealthController.java
    │   ├── dto/                             (all request/response DTOs)
    │   ├── entity/                          (all JPA entities + enums + converters)
    │   ├── exception/
    │   │   ├── GlobalExceptionHandler.java
    │   │   ├── ResourceNotFoundException.java
    │   │   ├── BadRequestException.java
    │   │   └── ForbiddenException.java
    │   ├── repository/                      (all Spring Data repositories)
    │   ├── security/
    │   │   ├── JwtService.java
    │   │   ├── JwtAuthFilter.java
    │   │   ├── SecurityConfig.java
    │   │   ├── TokenBlacklistService.java
    │   │   └── UserPrincipal.java
    │   └── service/                         (all service classes)
    └── main/resources/
        └── application.properties
    └── test/java/com/medicare360/
        ├── AuthServiceTest.java
        ├── JwtServiceTest.java
        ├── PatientControllerTest.java
        ├── DoctorControllerTest.java
        ├── AppointmentControllerTest.java
        ├── BillingControllerTest.java
        ├── PharmacyControllerTest.java
        └── NotificationControllerTest.java
```

---

## Key Design Decisions

1. **Single Maven module** (not multi-module) — the Python backend is a single process and the migration surface is self-contained. A flat single module is simpler to verify and deploy.

2. **JJWT 0.12.x** — chosen over spring-security-oauth2 because the existing Python token format is a hand-crafted HS256 JWT (not OAuth2). JJWT gives direct claim-level control to reproduce `sub/role/type/jti/iat/exp` exactly.

3. **JTI blacklisting instead of raw-token blacklisting** — Python blacklists the raw token string in a Set. Java blacklists the `jti` claim. Both are functionally equivalent (the JTI is unique per token). JTI blacklisting is more memory-efficient for long tokens.

4. **Instant for DATETIME columns** — SQLite stores datetimes as strings. The SQLite Hibernate dialect handles conversion. `Instant` is preferred over `LocalDateTime` to keep UTC semantics explicit and consistent with Python's `datetime.now(timezone.utc)`.

5. **String for date/time business fields** (appointment_date, visit_date, date_of_birth, expiry_date) — Python stores these as `String(50)` in the DB (not DATETIME). Java maps them as `String` too — no conversion needed, no format risk.

6. **Title-case enum storage** — Python SQLAlchemy stores `AppointmentStatus.SCHEDULED` as `"Scheduled"` (the enum's string value). Java must use an `AttributeConverter` to map between the Java enum constant and the stored string value. This is non-negotiable; if stored as `"SCHEDULED"` the existing rows (0 rows currently, but future inserts) will be inconsistent with Python.

7. **`@JsonProperty` for snake_case** — Spring Boot default is camelCase. The Python API returns snake_case (`access_token`, `is_active`, etc.). Adding `@JsonProperty` or configuring `PropertyNamingStrategies.SNAKE_CASE` globally ensures the frontend receives identical field names.

8. **`skip`/`limit` → `Pageable`** — Python uses raw SQL offset/limit. Java translates: `page = skip/limit` (integer division), `size = limit`. For skip values that don't align cleanly, use raw offset in a custom `@Query` as fallback.

9. **No Alembic table entity** — Hibernate `validate` mode only validates mapped entities. `alembic_version` is unmapped and untouched.

10. **Port 8000** — Python FastAPI runs on 8000 (standard uvicorn default). Java uses the same port so the frontend requires no URL change when switching backends.
