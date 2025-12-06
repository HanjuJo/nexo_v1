from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime


class UserRole(str, enum.Enum):
    SALES = "sales"  # 영업자
    TECHNICIAN = "technician"  # 기사
    ADMIN = "admin"  # 일반 관리자
    SUPER_ADMIN = "super_admin"  # 슈퍼관리자


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.SALES, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    consultations = relationship("Consultation", back_populates="salesperson")
    quotations = relationship("Quotation", back_populates="salesperson")
    contracts = relationship("Contract", back_populates="salesperson")
    installations = relationship("Installation", back_populates="technician")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"


