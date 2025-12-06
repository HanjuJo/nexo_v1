from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, unique=True, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    min_stock_level = Column(Integer, default=0)  # 최소 재고량
    location = Column(String(100))  # 재고 위치
    notes = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    item = relationship("Item", back_populates="inventory")

    def __repr__(self):
        return f"<Inventory(id={self.id}, item_id={self.item_id}, quantity={self.quantity})>"


