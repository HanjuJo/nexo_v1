from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime, date


class ContractStatus(str, enum.Enum):
    DRAFT = "draft"  # 작성중
    SIGNED = "signed"  # 계약완료
    IN_PROGRESS = "in_progress"  # 진행중
    COMPLETED = "completed"  # 완료
    CANCELLED = "cancelled"  # 취소됨


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    salesperson_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ContractStatus), default=ContractStatus.DRAFT, nullable=False)
    contract_date = Column(Date, nullable=False, default=date.today)
    total_amount = Column(Numeric(15, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    client = relationship("Client", back_populates="contracts")
    quotation = relationship("Quotation", back_populates="contracts")
    salesperson = relationship("User", back_populates="contracts")
    items = relationship("ContractItem", back_populates="contract", cascade="all, delete-orphan")
    installations = relationship("Installation", back_populates="contract")

    def __repr__(self):
        return f"<Contract(id={self.id}, number={self.contract_number}, status={self.status})>"


class ContractItem(Base):
    __tablename__ = "contract_items"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(15, 2), nullable=False)
    total_price = Column(Numeric(15, 2), nullable=False)
    notes = Column(Text)

    # 관계
    contract = relationship("Contract", back_populates="items")
    item = relationship("Item", back_populates="contract_items")

    def __repr__(self):
        return f"<ContractItem(id={self.id}, contract_id={self.contract_id}, item_id={self.item_id})>"


