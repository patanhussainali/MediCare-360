from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class MedicalRecord(Base, TimestampMixin):
    __tablename__ = "medical_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    record_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    examination_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    vital_signs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON or text (BP, Pulse, Temp, SpO2)
    attachments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visit_date: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
