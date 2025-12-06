from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_admin
from app.models.inventory import Inventory
from app.models.item import Item
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class InventoryBase(BaseModel):
    item_id: int
    quantity: int
    min_stock_level: int = 0
    location: Optional[str] = None
    notes: Optional[str] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    item: dict = None

    class Config:
        from_attributes = True


@router.get("/")
async def get_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """재고 목록 조회"""
    inventory_list = db.query(Inventory).options(
        joinedload(Inventory.item)
    ).offset(skip).limit(limit).all()
    
    # 관계 데이터를 수동으로 포함
    result = []
    for inv in inventory_list:
        inv_dict = {
            "id": inv.id,
            "item_id": inv.item_id,
            "quantity": inv.quantity,
            "min_stock_level": inv.min_stock_level,
            "location": inv.location,
            "notes": inv.notes,
            "created_at": inv.created_at,
            "updated_at": inv.updated_at,
        }
        if inv.item:
            inv_dict["item"] = {
                "id": inv.item.id,
                "name": inv.item.name,
                "code": inv.item.code,
            }
        result.append(inv_dict)
    
    return result


@router.get("/{inventory_id}")
async def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """재고 상세 조회"""
    inventory = db.query(Inventory).options(
        joinedload(Inventory.item)
    ).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="재고를 찾을 수 없습니다")
    
    inventory_dict = {
        "id": inventory.id,
        "item_id": inventory.item_id,
        "quantity": inventory.quantity,
        "min_stock_level": inventory.min_stock_level,
        "location": inventory.location,
        "notes": inventory.notes,
        "created_at": inventory.created_at,
        "updated_at": inventory.updated_at,
    }
    if inventory.item:
        inventory_dict["item"] = {
            "id": inventory.item.id,
            "name": inventory.item.name,
            "code": inventory.item.code,
        }
    
    return inventory_dict


@router.post("/")
async def create_inventory(
    inventory_data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """재고 등록"""
    # 품목 확인
    item = db.query(Item).filter(Item.id == inventory_data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="품목을 찾을 수 없습니다")
    
    # 이미 재고가 있는지 확인
    existing = db.query(Inventory).filter(Inventory.item_id == inventory_data.item_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 재고가 등록된 품목입니다")
    
    new_inventory = Inventory(**inventory_data.dict())
    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)
    
    # 관계 데이터 포함하여 반환
    inventory_dict = {
        "id": new_inventory.id,
        "item_id": new_inventory.item_id,
        "quantity": new_inventory.quantity,
        "min_stock_level": new_inventory.min_stock_level,
        "location": new_inventory.location,
        "notes": new_inventory.notes,
        "created_at": new_inventory.created_at,
        "updated_at": new_inventory.updated_at,
    }
    
    return inventory_dict


class InventoryUpdate(BaseModel):
    quantity: int
    min_stock_level: int = 0
    location: Optional[str] = None
    notes: Optional[str] = None


@router.put("/{inventory_id}")
async def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """재고 수정 (품목은 변경 불가)"""
    inventory = db.query(Inventory).options(
        joinedload(Inventory.item)
    ).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="재고를 찾을 수 없습니다")
    
    # item_id는 변경하지 않음 (품목은 변경 불가)
    for key, value in inventory_data.dict().items():
        setattr(inventory, key, value)
    
    db.commit()
    db.refresh(inventory)
    
    # 관계 데이터 포함하여 반환
    inventory_dict = {
        "id": inventory.id,
        "item_id": inventory.item_id,
        "quantity": inventory.quantity,
        "min_stock_level": inventory.min_stock_level,
        "location": inventory.location,
        "notes": inventory.notes,
        "created_at": inventory.created_at,
        "updated_at": inventory.updated_at,
    }
    if inventory.item:
        inventory_dict["item"] = {
            "id": inventory.item.id,
            "name": inventory.item.name,
            "code": inventory.item.code,
        }
    
    return inventory_dict


@router.delete("/{inventory_id}")
async def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """재고 삭제"""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="재고를 찾을 수 없습니다")
    
    db.delete(inventory)
    db.commit()
    return {"message": "재고가 삭제되었습니다"}


