from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    unit_price = Column(Numeric(15, 2), nullable=False)
    unit = Column(String(20), default="개")  # 단위
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    quotation_items = relationship("QuotationItem", back_populates="item")
    contract_items = relationship("ContractItem", back_populates="item")
    inventory = relationship("Inventory", back_populates="item")

    def __repr__(self):
        return f"<Item(id={self.id}, code={self.code}, name={self.name})>"

