# Auth & Roles — MediCare360

---

## JWT Configuration

| Setting | Value | Source |
|---|---|---|
| Algorithm | `HS256` | `settings.ALGORITHM` |
| Secret Key | env var `SECRET_KEY` | `.env` / environment |
| Access token expiry | 60 minutes | `settings.ACCESS_TOKEN_EXPIRE_MINUTES` |
| Refresh token expiry | 7 days | `settings.REFRESH_TOKEN_EXPIRE_DAYS` |
| Library (Python) | `PyJWT` | jwt.encode / jwt.decode |

---

## Token Claims Structure

### Access Token Payload
```json
{
  "sub":  "42",           // user.id as string (INTEGER cast to str)
  "role": "ADMIN",        // user.role.value  (one of the 7 role strings)
  "type": "access",       // literal "access"
  "jti":  "a3f9c1...",   // uuid4().hex — used for blacklisting
  "iat":  1700000000,     // issued-at as Unix int
  "exp":  1700003600      // expiry as Unix int (iat + 60 min)
}
```

### Refresh Token Payload
Same structure except:
- `"type": "refresh"`
- `"exp"` = iat + 7 days

---

## Token Blacklist

In-memory Python `Set[str]` — tokens are added on logout and on refresh-token rotation.  
**Java equivalent:** In-memory `ConcurrentHashSet<String>` stored in a Spring `@Component` singleton (`TokenBlacklistService`). No Redis required (mirrors Python behaviour). The blacklist is lost on restart, which is acceptable (tokens expire anyway).

---

## Authentication Flow

1. Client sends `POST /api/v1/auth/login` with `{"email","password","role?"}`.
2. Server looks up user by lower-cased email.
3. If `role` is present in request, it must match `user.role` exactly — otherwise 401.
4. `bcrypt.checkpw(plaintext, stored_hash)` — bcrypt rounds=12.
5. If valid: generate access + refresh JWT, update `user.last_login`, write audit log.
6. Tokens are returned in `Token` object (includes full `UserResponse`).
7. Subsequent requests: `Authorization: Bearer <access_token>`.
8. Server extracts token, checks blacklist, decodes with HS256, validates `type == "access"`, parses `sub` as `int`, loads user from DB, checks `is_active`.

---

## Password Hashing

- Algorithm: **bcrypt**, work factor **rounds=12**
- Python: `bcrypt.gensalt(rounds=12)` + `bcrypt.hashpw()`
- Java: `BCryptPasswordEncoder` with strength 12
  - `new BCryptPasswordEncoder(12)` — Spring Security default is 10; must specify 12.
  - `encoder.matches(rawPassword, storedHash)` for verification.
  - `encoder.encode(rawPassword)` for new hashes.
- All stored hashes in `users.hashed_password` are `$2b$12$...` format — fully compatible.

---

## Role Definitions

```
PATIENT         — Self-registered or admin-created. Can book appointments, view own records.
DOCTOR          — Created by admin. Full clinical access (records, prescriptions, appointments).
NURSE           — Created by admin. Can create/view records and appointments.
RECEPTIONIST    — Created by admin. Manages patients, appointments, billing.
PHARMACIST      — Created by admin. Manages medicines and issues/dispensing.
LAB_TECHNICIAN  — Role exists in DB enum but no dedicated staff table or UI routes in Python.
ADMIN           — System administrator. Full access to all resources.
```

---

## Role Permissions Matrix

| Endpoint Group | PATIENT | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | LAB_TECH | ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| auth (own) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| users (CRUD) | — | — | — | — | — | — | ✓ |
| patients (read) | ✓ | ✓ | ✓ | ✓ | — | — | ✓ |
| patients (write) | — | ✓ | ✓ | ✓ | — | — | ✓ |
| patients (delete) | — | — | — | — | — | — | ✓ |
| doctors (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| doctors (write) | — | — | — | — | — | — | ✓ |
| appointments (create) | ✓ | ✓ | — | ✓ | — | — | ✓ |
| appointments (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| appointments (update) | — | ✓ | — | ✓ | — | — | ✓ |
| appointments (status) | — | ✓ | ✓ | ✓ | — | — | ✓ |
| appointments (delete) | — | — | — | ✓ | — | — | ✓ |
| medical records (write) | — | ✓ | ✓ | — | — | — | ✓ |
| medical records (update) | — | ✓ | — | — | — | — | ✓ |
| medical records (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| prescriptions (write) | — | ✓ | — | — | — | — | ✓ |
| prescriptions (read) | — | ✓ | ✓ | — | ✓ | — | ✓ |
| prescriptions (any read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pharmacy medicines (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pharmacy medicines (write) | — | — | — | — | ✓ | — | ✓ |
| pharmacy issue | — | — | — | — | ✓ | — | ✓ |
| billing (write) | — | — | — | ✓ | — | — | ✓ |
| billing (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| departments (read) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| departments (write) | — | — | — | — | — | — | ✓ |
| staff (all) | — | — | — | — | — | — | ✓ |
| notifications (own) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| reports/patients | — | ✓ | — | — | — | — | ✓ |
| reports/appointments | — | ✓ | — | ✓ | — | — | ✓ |
| reports/billing | — | — | — | ✓ | — | — | ✓ |
| reports/pharmacy | — | — | — | — | ✓ | — | ✓ |
| audit-logs | — | — | — | — | — | — | ✓ |

---

## Java Spring Security Configuration Notes

- Use `OncePerRequestFilter` for the JWT filter — extract Bearer token from `Authorization` header, validate it, build `UsernamePasswordAuthenticationToken` with a `UserDetails` that holds `userId`, `email`, and `GrantedAuthority` of the role.
- Stateless session: `SessionCreationPolicy.STATELESS`.
- Public (no auth) endpoints: `GET /health`, `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/check-admin`, `POST /api/v1/auth/setup-admin`, `POST /api/v1/auth/refresh`, `GET /api/v1/{docs,openapi.json,redoc}`.
- Role names in Spring Security `GrantedAuthority` should be stored WITHOUT the `ROLE_` prefix and matched with `hasAuthority("ADMIN")` rather than `hasRole("ADMIN")` to match Python's plain-string role names.
- `PATCH /notifications/read-all` — note: in FastAPI routing this is registered BEFORE `PATCH /notifications/{notification_id}/read`. In Spring, `/read-all` is a literal path segment — no conflict.

---

## CORS Configuration

```
Allowed origins:
  http://localhost:3000
  http://localhost:3001
  http://localhost:5173
  http://127.0.0.1:3000
  http://127.0.0.1:3001

Allow methods: * (all)
Allow headers: * (all)
Allow credentials: true (since origins are explicit, not *)
```
