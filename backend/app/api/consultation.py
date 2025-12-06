from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_user
from app.models.consultation import Consultation
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ConsultationBase(BaseModel):
    client_id: int
    consultation_date: datetime
    content: str
    notes: Optional[str] = None


class ConsultationCreate(ConsultationBase):
    pass


class ClientInfo(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


class SalespersonInfo(BaseModel):
    id: int
    full_name: str
    
    class Config:
        from_attributes = True


class ConsultationResponse(ConsultationBase):
    id: int
    salesperson_id: int
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientInfo] = None
    salesperson: Optional[SalespersonInfo] = None

    class Config:
        from_attributes = True


@router.get("/")
async def get_consultations(
    skip: int = 0,
    limit: int = 100,
    client_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담 목록 조회 (거래처명으로 검색 가능)"""
    query = db.query(Consultation)
    
    if client_name:
        from app.models.client import Client
        query = query.join(Client).filter(Client.name.contains(client_name))
    
    # 영업자는 자신의 상담만 조회
    if current_user.role.value == "sales" and not current_user.is_admin:
        query = query.filter(Consultation.salesperson_id == current_user.id)
    
    consultations = query.options(
        joinedload(Consultation.client),
        joinedload(Consultation.salesperson)
    ).offset(skip).limit(limit).all()
    
    # 관계 데이터를 수동으로 포함
    result = []
    for consultation in consultations:
        consultation_dict = {
            "id": consultation.id,
            "client_id": consultation.client_id,
            "salesperson_id": consultation.salesperson_id,
            "consultation_date": consultation.consultation_date,
            "content": consultation.content,
            "notes": consultation.notes,
            "created_at": consultation.created_at,
            "updated_at": consultation.updated_at,
        }
        if consultation.client:
            consultation_dict["client"] = {
                "id": consultation.client.id,
                "name": consultation.client.name,
            }
        if consultation.salesperson:
            consultation_dict["salesperson"] = {
                "id": consultation.salesperson.id,
                "full_name": consultation.salesperson.full_name,
            }
        result.append(consultation_dict)
    
    return result


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담 상세 조회"""
    consultation = db.query(Consultation).options(
        joinedload(Consultation.client),
        joinedload(Consultation.salesperson)
    ).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="상담을 찾을 수 없습니다")
    
    # 영업자는 자신의 상담만 조회 가능
    if current_user.role.value == "sales" and not current_user.is_admin:
        if consultation.salesperson_id != current_user.id:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
    
    consultation_dict = {
        "id": consultation.id,
        "client_id": consultation.client_id,
        "salesperson_id": consultation.salesperson_id,
        "consultation_date": consultation.consultation_date,
        "content": consultation.content,
        "notes": consultation.notes,
        "created_at": consultation.created_at,
        "updated_at": consultation.updated_at,
    }
    if consultation.client:
        consultation_dict["client"] = {
            "id": consultation.client.id,
            "name": consultation.client.name,
        }
    if consultation.salesperson:
        consultation_dict["salesperson"] = {
            "id": consultation.salesperson.id,
            "full_name": consultation.salesperson.full_name,
        }
    
    return consultation_dict


@router.post("/", response_model=ConsultationResponse)
async def create_consultation(
    consultation_data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담 등록"""
    new_consultation = Consultation(
        **consultation_data.dict(),
        salesperson_id=current_user.id
    )
    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)
    return new_consultation


@router.put("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: int,
    consultation_data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담 수정"""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="상담을 찾을 수 없습니다")
    
    # 영업자는 자신의 상담만 수정 가능
    if current_user.role.value == "sales" and not current_user.is_admin:
        if consultation.salesperson_id != current_user.id:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
    
    for key, value in consultation_data.dict().items():
        setattr(consultation, key, value)
    
    db.commit()
    db.refresh(consultation)
    return consultation


@router.delete("/{consultation_id}")
async def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담 삭제"""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="상담을 찾을 수 없습니다")
    
    # 영업자는 자신의 상담만 삭제 가능
    if current_user.role.value == "sales" and not current_user.is_admin:
        if consultation.salesperson_id != current_user.id:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
    
    db.delete(consultation)
    db.commit()
    return {"message": "상담이 삭제되었습니다"}

