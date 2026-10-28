# Phase 1 — Python Backend Error Fixes

**Date:** 2026-10-28  
**Target:** MediCare360 FastAPI backend (`backend/`)  
**Outcome:** Backend starts cleanly; `GET /health` returns `{"status": "healthy", ...}` HTTP 200.

---

## Summary

The backend imported without errors and its database initialization succeeded on first attempt.
Three concrete bugs were identified and fixed: a model–schema–service mismatch on the
`notifications` table, an incorrect required-field annotation in the Notification schema, and a
non-installable dependency in `requirements.txt`.

---

## Fixes Applied

### 1. `backend/app/models/notification.py` — Add `link` and `read_at` columns

**Problem:**  
`NotificationService.send()` sets a `link` attribute on the `Notification` ORM object.  
`NotificationService.mark_as_read()` sets a `read_at` attribute on the same object.  
Neither column existed in the SQLAlchemy model, so any attempt to create a notification with a
link or to mark one as read would raise `AttributeError` at runtime.

The `NotificationResponse` Pydantic schema also declared `read_at: Optional[datetime]` and the
`NotificationBase` declared `link: Optional[str]`, but neither field was mapped to a DB column.

**Fix:**  
Added two new mapped columns to `Notification`:
```python
link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
```
Also added the missing `DateTime` import.

**Schema migration:**  
The existing SQLite database was updated in-place (no data loss) using `ALTER TABLE`:
```sql
ALTER TABLE notifications ADD COLUMN link VARCHAR(500);
ALTER TABLE notifications ADD COLUMN read_at DATETIME;
```

---

### 2. `backend/app/schemas/notification.py` — Make `user_id` optional, normalize `type` default

**Problem:**  
`NotificationBase.user_id` was typed as `int` (required), but the model column is `nullable=True`
to support global broadcast notifications (user_id = NULL). Attempting to serialize a global
notification through this schema would raise a Pydantic `ValidationError`.

The default value of `type` was `"general"` in the schema but the model comment said `"INFO"`.
While not a hard error, it created an inconsistency with the accepted values documented in the model.

**Fix:**
```python
user_id: Optional[int] = None   # was: user_id: int
type: str = "INFO"               # was: type: str = "general"
```

---

### 3. `backend/requirements.txt` — Remove `psycopg[binary]>=3.1.18`

**Problem:**  
`psycopg` (psycopg3) binary wheels are not available for Python 3.14 on Windows. The package
would fail to install with `pip install -r requirements.txt`, blocking CI and fresh environment
setup.

The application already falls back to `psycopg2-binary` (also listed) and ultimately to SQLite
if no PostgreSQL is reachable, so removing `psycopg[binary]` has no effect on runtime behaviour.

**Fix:**  
Removed the line `psycopg[binary]>=3.1.18` from `requirements.txt`.  
`psycopg2-binary>=2.9.9` remains and is confirmed installed and functional.

---

## Verification

All checks performed inside the Python process using FastAPI's `TestClient`:

| Check | Result |
|---|---|
| `GET /health` | 200 `{"status":"healthy",...}` |
| `GET /api/v1/auth/check-admin` | 200 |
| `POST /api/v1/auth/login` | 200 |
| `GET /api/v1/notifications` | 200 |
| `PATCH /api/v1/notifications/read-all` | 200 |
| All 14 route modules imported | OK |
| All 12 service modules imported | OK |
| Database init (tables + seed departments) | OK |

No import errors, no startup errors, no test failures.

---

## Files Changed

| File | Change |
|---|---|
| `backend/app/models/notification.py` | Added `link` and `read_at` mapped columns |
| `backend/app/schemas/notification.py` | Made `user_id` optional; normalized `type` default to `"INFO"` |
| `backend/requirements.txt` | Removed `psycopg[binary]>=3.1.18` |

**Database mutated (non-destructively):**  
`backend/medicare360.db` — `notifications` table: two columns added via `ALTER TABLE`.  
No existing rows were affected; no tables were dropped or recreated.
