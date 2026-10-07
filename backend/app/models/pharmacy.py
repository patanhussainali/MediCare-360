from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Medicine(Base, TimestampMixin):
    __tablename__ = "medicines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    generic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # Antibiotics, Analgesics, etc.
    manufacturer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    min_stock_threshold: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Available", nullable=False)  # Available, Low Stock, Out of Stock


class MedicineIssueRecord(Base, TimestampMixin):
    __tablename__ = "medicine_issue_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prescription_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("prescriptions.id", ondelete="SET NULL"), nullable=True)
    medicine_id: Mapped[int] = mapped_column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    dispensed_by: Mapped[str] = mapped_column(String(255), nullable=False)
    dispensed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
