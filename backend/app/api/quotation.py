from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_user
from app.models.quotation import Quotation, QuotationItem, QuotationStatus
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

router = APIRouter()


class QuotationItemBase(BaseModel):
    item_id: int
    quantity: int
    unit_price: Decimal
    notes: Optional[str] = None


class QuotationItemCreate(QuotationItemBase):
    pass


class QuotationItemResponse(QuotationItemBase):
    id: int
    total_price: Decimal

    class Config:
        from_attributes = True


class QuotationBase(BaseModel):
    quotation_number: str
    client_id: int
    consultation_id: Optional[int] = None
    status: QuotationStatus = QuotationStatus.DRAFT
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    items: List[QuotationItemCreate] = []


class QuotationCreate(QuotationBase):
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


class QuotationResponse(QuotationBase):
    id: int
    salesperson_id: int
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[QuotationItemResponse] = []
    client: Optional[ClientInfo] = None
    salesperson: Optional[SalespersonInfo] = None

    class Config:
        from_attributes = True


@router.get("/")
async def get_quotations(
    skip: int = 0,
    limit: int = 100,
    client_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """견적 목록 조회"""
    query = db.query(Quotation)
    
    if client_name:
        from app.models.client import Client
        query = query.join(Client).filter(Client.name.contains(client_name))
    
    # 영업자는 자신의 견적만 조회
    if current_user.role.value == "sales" and not current_user.is_admin:
        query = query.filter(Quotation.salesperson_id == current_user.id)
    
    quotations = query.options(
        joinedload(Quotation.client),
        joinedload(Quotation.salesperson)
    ).offset(skip).limit(limit).all()
    
    # 관계 데이터를 수동으로 포함
    result = []
    for quotation in quotations:
        quotation_dict = {
            "id": quotation.id,
            "quotation_number": quotation.quotation_number,
            "client_id": quotation.client_id,
            "consultation_id": quotation.consultation_id,
            "salesperson_id": quotation.salesperson_id,
            "status": quotation.status,
            "total_amount": quotation.total_amount,
            "valid_until": quotation.valid_until,
            "notes": quotation.notes,
            "created_at": quotation.created_at,
            "updated_at": quotation.updated_at,
            "items": [{"id": item.id, "item_id": item.item_id, "quantity": item.quantity, 
                      "unit_price": item.unit_price, "total_price": item.total_price, 
                      "notes": item.notes} for item in quotation.items],
        }
        if quotation.client:
            quotation_dict["client"] = {
                "id": quotation.client.id,
                "name": quotation.client.name,
            }
        if quotation.salesperson:
            quotation_dict["salesperson"] = {
                "id": quotation.salesperson.id,
                "full_name": quotation.salesperson.full_name,
            }
        result.append(quotation_dict)
    
    return result


@router.get("/{quotation_id}", response_model=QuotationResponse)
async def get_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """견적 상세 조회"""
    quotation = db.query(Quotation).options(
        joinedload(Quotation.client),
        joinedload(Quotation.salesperson),
        joinedload(Quotation.items)
    ).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="견적을 찾을 수 없습니다")
    
    quotation_dict = {
        "id": quotation.id,
        "quotation_number": quotation.quotation_number,
        "client_id": quotation.client_id,
        "consultation_id": quotation.consultation_id,
        "salesperson_id": quotation.salesperson_id,
        "status": quotation.status,
        "total_amount": quotation.total_amount,
        "valid_until": quotation.valid_until,
        "notes": quotation.notes,
        "created_at": quotation.created_at,
        "updated_at": quotation.updated_at,
        "items": [{"id": item.id, "item_id": item.item_id, "quantity": item.quantity, 
                  "unit_price": item.unit_price, "total_price": item.total_price, 
                  "notes": item.notes} for item in quotation.items],
    }
    if quotation.client:
        quotation_dict["client"] = {
            "id": quotation.client.id,
            "name": quotation.client.name,
        }
    if quotation.salesperson:
        quotation_dict["salesperson"] = {
            "id": quotation.salesperson.id,
            "full_name": quotation.salesperson.full_name,
        }
    
    return quotation_dict


@router.post("/", response_model=QuotationResponse)
async def create_quotation(
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """견적 등록"""
    items_data = quotation_data.items
    quotation_dict = quotation_data.dict()
    quotation_dict.pop("items")
    
    total_amount = sum(item.quantity * item.unit_price for item in items_data)
    
    new_quotation = Quotation(
        **quotation_dict,
        salesperson_id=current_user.id,
        total_amount=total_amount
    )
    db.add(new_quotation)
    db.flush()
    
    # 견적 항목 추가
    for item_data in items_data:
        total_price = item_data.quantity * item_data.unit_price
        quotation_item = QuotationItem(
            quotation_id=new_quotation.id,
            item_id=item_data.item_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price,
            notes=item_data.notes
        )
        db.add(quotation_item)
    
    db.commit()
    db.refresh(new_quotation)
    return new_quotation


@router.put("/{quotation_id}", response_model=QuotationResponse)
async def update_quotation(
    quotation_id: int,
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """견적 수정"""
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="견적을 찾을 수 없습니다")
    
    items_data = quotation_data.items
    quotation_dict = quotation_data.dict()
    quotation_dict.pop("items")
    
    total_amount = sum(item.quantity * item.unit_price for item in items_data)
    
    for key, value in quotation_dict.items():
        setattr(quotation, key, value)
    quotation.total_amount = total_amount
    
    # 기존 항목 삭제 후 새로 추가
    db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation_id).delete()
    
    for item_data in items_data:
        total_price = item_data.quantity * item_data.unit_price
        quotation_item = QuotationItem(
            quotation_id=quotation.id,
            item_id=item_data.item_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price,
            notes=item_data.notes
        )
        db.add(quotation_item)
    
    db.commit()
    db.refresh(quotation)
    return quotation


@router.delete("/{quotation_id}")
async def delete_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """견적 삭제"""
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="견적을 찾을 수 없습니다")
    
    db.delete(quotation)
    db.commit()
    return {"message": "견적이 삭제되었습니다"}

