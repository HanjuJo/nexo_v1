from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    salesperson_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultation_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    content = Column(Text, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    client = relationship("Client", back_populates="consultations")
    salesperson = relationship("User", back_populates="consultations")
    quotations = relationship("Quotation", back_populates="consultation")

    def __repr__(self):
        return f"<Consultation(id={self.id}, client_id={self.client_id}, date={self.consultation_date})>"


