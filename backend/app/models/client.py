from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime


class ClientType(str, enum.Enum):
    INDIVIDUAL = "individual"  # 개인
    COMPANY = "company"  # 기업
    INSTITUTION = "institution"  # 기관


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    client_type = Column(Enum(ClientType), nullable=False)
    
    # 개인 정보
    personal_name = Column(String(50))  # 개인인 경우
    personal_phone = Column(String(20))
    personal_email = Column(String(100))
    
    # 기업/기관 정보
    company_name = Column(String(100))  # 기업/기관인 경우
    business_number = Column(String(20))  # 사업자번호
    representative_name = Column(String(50))  # 대표자명
    company_phone = Column(String(20))
    company_email = Column(String(100))
    address = Column(Text)
    
    # 공통 정보
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    consultations = relationship("Consultation", back_populates="client")
    quotations = relationship("Quotation", back_populates="client")
    contracts = relationship("Contract", back_populates="client")
    installations = relationship("Installation", back_populates="client")

    def __repr__(self):
        return f"<Client(id={self.id}, name={self.name}, type={self.client_type})>"


