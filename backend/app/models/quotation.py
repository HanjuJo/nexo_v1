from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime


class QuotationStatus(str, enum.Enum):
    DRAFT = "draft"  # 작성중
    SUBMITTED = "submitted"  # 제출됨
    APPROVED = "approved"  # 승인됨
    REJECTED = "rejected"  # 거절됨
    EXPIRED = "expired"  # 만료됨


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String(50), unique=True, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"))
    salesperson_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(QuotationStatus), default=QuotationStatus.DRAFT, nullable=False)
    total_amount = Column(Numeric(15, 2), default=0)
    valid_until = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    client = relationship("Client", back_populates="quotations")
    consultation = relationship("Consultation", back_populates="quotations")
    salesperson = relationship("User", back_populates="quotations")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="quotation")

    def __repr__(self):
        return f"<Quotation(id={self.id}, number={self.quotation_number}, status={self.status})>"


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(15, 2), nullable=False)
    total_price = Column(Numeric(15, 2), nullable=False)
    notes = Column(Text)

    # 관계
    quotation = relationship("Quotation", back_populates="items")
    item = relationship("Item", back_populates="quotation_items")

    def __repr__(self):
        return f"<QuotationItem(id={self.id}, quotation_id={self.quotation_id}, item_id={self.item_id})>"


