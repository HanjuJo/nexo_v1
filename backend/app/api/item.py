from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_admin
from app.models.item import Item
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

router = APIRouter()


class ItemBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    unit_price: Decimal
    unit: str = "개"


class ItemCreate(ItemBase):
    pass


class ItemResponse(ItemBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ItemResponse])
async def get_items(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """품목 목록 조회"""
    query = db.query(Item)
    
    if search:
        query = query.filter(Item.name.contains(search))
    
    items = query.offset(skip).limit(limit).all()
    return items


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """품목 상세 조회"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="품목을 찾을 수 없습니다")
    return item


@router.post("/", response_model=ItemResponse)
async def create_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """품목 등록"""
    if db.query(Item).filter(Item.code == item_data.code).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 품목 코드입니다")
    
    new_item = Item(**item_data.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """품목 수정"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="품목을 찾을 수 없습니다")
    
    # 코드 중복 확인
    if item_data.code != item.code:
        if db.query(Item).filter(Item.code == item_data.code).first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 품목 코드입니다")
    
    for key, value in item_data.dict().items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """품목 삭제"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="품목을 찾을 수 없습니다")
    
    item.is_active = False
    db.commit()
    return {"message": "품목이 비활성화되었습니다"}


