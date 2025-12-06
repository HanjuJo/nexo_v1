from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime, date


class InstallationType(str, enum.Enum):
    INSTALLATION = "installation"  # 설치
    AS = "as"  # AS


class InstallationStatus(str, enum.Enum):
    PENDING = "pending"  # 대기중
    IN_PROGRESS = "in_progress"  # 진행중
    COMPLETED = "completed"  # 완료
    CANCELLED = "cancelled"  # 취소됨


class Installation(Base):
    __tablename__ = "installations"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    installation_type = Column(Enum(InstallationType), nullable=False)
    status = Column(Enum(InstallationStatus), default=InstallationStatus.PENDING, nullable=False)
    scheduled_date = Column(Date)
    completed_date = Column(DateTime)
    result_text = Column(Text)
    photo_url_1 = Column(String(500))  # 사진 최대 2장
    photo_url_2 = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    contract = relationship("Contract", back_populates="installations")
    client = relationship("Client", back_populates="installations")
    technician = relationship("User", back_populates="installations")

    def __repr__(self):
        return f"<Installation(id={self.id}, type={self.installation_type}, status={self.status})>"


