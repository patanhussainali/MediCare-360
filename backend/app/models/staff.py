from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Nurse(Base, TimestampMixin):
    __tablename__ = "nurses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nurse_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    shift: Mapped[str] = mapped_column(String(50), default="Morning", nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)


class Receptionist(Base, TimestampMixin):
    __tablename__ = "receptionists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    receptionist_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    shift: Mapped[str] = mapped_column(String(50), default="Day", nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)


class Pharmacist(Base, TimestampMixin):
    __tablename__ = "pharmacists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pharmacist_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)


class StaffSchedule(Base, TimestampMixin):
    __tablename__ = "staff_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    staff_type: Mapped[str] = mapped_column(String(50), nullable=False)  # DOCTOR, NURSE, RECEPTIONIST, PHARMACIST
    staff_id: Mapped[int] = mapped_column(Integer, nullable=False)
    staff_name: Mapped[str] = mapped_column(String(255), nullable=False)
    day_of_week: Mapped[str] = mapped_column(String(20), nullable=False)
    shift_start: Mapped[str] = mapped_column(String(20), nullable=False)
    shift_end: Mapped[str] = mapped_column(String(20), nullable=False)
    duty_location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
