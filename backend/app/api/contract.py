from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_user
from app.models.contract import Contract, ContractItem, ContractStatus
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime, date
from decimal import Decimal

router = APIRouter()


class ContractItemBase(BaseModel):
    item_id: int
    quantity: int
    unit_price: Decimal
    notes: Optional[str] = None


class ContractItemCreate(ContractItemBase):
    pass


class ContractItemResponse(ContractItemBase):
    id: int
    total_price: Decimal

    class Config:
        from_attributes = True


class ContractBase(BaseModel):
    contract_number: str
    client_id: int
    quotation_id: Optional[int] = None
    status: ContractStatus = ContractStatus.DRAFT
    contract_date: date
    notes: Optional[str] = None
    items: List[ContractItemCreate] = []


class ContractCreate(ContractBase):
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


class ContractResponse(ContractBase):
    id: int
    salesperson_id: int
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[ContractItemResponse] = []
    client: Optional[ClientInfo] = None
    salesperson: Optional[SalespersonInfo] = None

    class Config:
        from_attributes = True


@router.get("/")
async def get_contracts(
    skip: int = 0,
    limit: int = 100,
    client_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """계약 목록 조회"""
    query = db.query(Contract)
    
    if client_name:
        from app.models.client import Client
        query = query.join(Client).filter(Client.name.contains(client_name))
    
    # 영업자는 자신의 계약만 조회
    if current_user.role.value == "sales" and not current_user.is_admin:
        query = query.filter(Contract.salesperson_id == current_user.id)
    
    contracts = query.options(
        joinedload(Contract.client),
        joinedload(Contract.salesperson)
    ).offset(skip).limit(limit).all()
    
    # 관계 데이터를 수동으로 포함
    result = []
    for contract in contracts:
        contract_dict = {
            "id": contract.id,
            "contract_number": contract.contract_number,
            "client_id": contract.client_id,
            "quotation_id": contract.quotation_id,
            "salesperson_id": contract.salesperson_id,
            "status": contract.status,
            "contract_date": contract.contract_date,
            "total_amount": contract.total_amount,
            "notes": contract.notes,
            "created_at": contract.created_at,
            "updated_at": contract.updated_at,
            "items": [{"id": item.id, "item_id": item.item_id, "quantity": item.quantity, 
                      "unit_price": item.unit_price, "total_price": item.total_price, 
                      "notes": item.notes} for item in contract.items],
        }
        if contract.client:
            contract_dict["client"] = {
                "id": contract.client.id,
                "name": contract.client.name,
            }
        if contract.salesperson:
            contract_dict["salesperson"] = {
                "id": contract.salesperson.id,
                "full_name": contract.salesperson.full_name,
            }
        result.append(contract_dict)
    
    return result


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """계약 상세 조회"""
    contract = db.query(Contract).options(
        joinedload(Contract.client),
        joinedload(Contract.salesperson),
        joinedload(Contract.items)
    ).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다")
    
    contract_dict = {
        "id": contract.id,
        "contract_number": contract.contract_number,
        "client_id": contract.client_id,
        "quotation_id": contract.quotation_id,
        "salesperson_id": contract.salesperson_id,
        "status": contract.status,
        "contract_date": contract.contract_date,
        "total_amount": contract.total_amount,
        "notes": contract.notes,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "items": [{"id": item.id, "item_id": item.item_id, "quantity": item.quantity, 
                  "unit_price": item.unit_price, "total_price": item.total_price, 
                  "notes": item.notes} for item in contract.items],
    }
    if contract.client:
        contract_dict["client"] = {
            "id": contract.client.id,
            "name": contract.client.name,
        }
    if contract.salesperson:
        contract_dict["salesperson"] = {
            "id": contract.salesperson.id,
            "full_name": contract.salesperson.full_name,
        }
    
    return contract_dict


@router.post("/", response_model=ContractResponse)
async def create_contract(
    contract_data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """계약 등록"""
    items_data = contract_data.items
    contract_dict = contract_data.dict()
    contract_dict.pop("items")
    
    total_amount = sum(item.quantity * item.unit_price for item in items_data)
    
    new_contract = Contract(
        **contract_dict,
        salesperson_id=current_user.id,
        total_amount=total_amount
    )
    db.add(new_contract)
    db.flush()
    
    # 계약 항목 추가
    for item_data in items_data:
        total_price = item_data.quantity * item_data.unit_price
        contract_item = ContractItem(
            contract_id=new_contract.id,
            item_id=item_data.item_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price,
            notes=item_data.notes
        )
        db.add(contract_item)
    
    db.commit()
    db.refresh(new_contract)
    return new_contract


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: int,
    contract_data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """계약 수정"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다")
    
    items_data = contract_data.items
    contract_dict = contract_data.dict()
    contract_dict.pop("items")
    
    total_amount = sum(item.quantity * item.unit_price for item in items_data)
    
    for key, value in contract_dict.items():
        setattr(contract, key, value)
    contract.total_amount = total_amount
    
    # 기존 항목 삭제 후 새로 추가
    db.query(ContractItem).filter(ContractItem.contract_id == contract_id).delete()
    
    for item_data in items_data:
        total_price = item_data.quantity * item_data.unit_price
        contract_item = ContractItem(
            contract_id=contract.id,
            item_id=item_data.item_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price,
            notes=item_data.notes
        )
        db.add(contract_item)
    
    db.commit()
    db.refresh(contract)
    return contract


@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """계약 삭제"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다")
    
    db.delete(contract)
    db.commit()
    return {"message": "계약이 삭제되었습니다"}

