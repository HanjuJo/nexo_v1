from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_user
from app.models.client import Client, ClientType
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ClientBase(BaseModel):
    name: str
    client_type: ClientType
    personal_name: Optional[str] = None
    personal_phone: Optional[str] = None
    personal_email: Optional[str] = None
    company_name: Optional[str] = None
    business_number: Optional[str] = None
    representative_name: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """거래처 목록 조회 (거래처명으로 검색 가능)"""
    query = db.query(Client)
    
    if search:
        query = query.filter(Client.name.contains(search))
    
    clients = query.offset(skip).limit(limit).all()
    return clients


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """거래처 상세 조회"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다")
    return client


@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """거래처 등록"""
    new_client = Client(**client_data.dict())
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """거래처 정보 수정"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다")
    
    for key, value in client_data.dict().items():
        setattr(client, key, value)
    
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """거래처 삭제"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다")
    
    db.delete(client)
    db.commit()
    return {"message": "거래처가 삭제되었습니다"}


