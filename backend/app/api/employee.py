from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_admin
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse, UserCreate, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """직원 목록 조회 (이름으로 검색 가능)"""
    query = db.query(User).filter(User.is_admin == False)
    
    if search:
        query = query.filter(User.full_name.contains(search))
    
    employees = query.offset(skip).limit(limit).all()
    return employees


@router.get("/{employee_id}", response_model=UserResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """직원 상세 조회"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.is_admin == False
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")
    
    return employee


@router.post("/", response_model=UserResponse)
async def create_employee(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """직원 등록"""
    if not user_data.password:
        raise HTTPException(status_code=400, detail="비밀번호는 필수입니다")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명입니다")
    
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    
    hashed_password = get_password_hash(user_data.password)
    new_employee = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        is_admin=False,
        is_super_admin=False
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@router.put("/{employee_id}", response_model=UserResponse)
async def update_employee(
    employee_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """직원 정보 수정"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.is_admin == False
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")
    
    # 중복 확인
    if user_data.username != employee.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명입니다")
    
    if user_data.email != employee.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    
    employee.username = user_data.username
    employee.email = user_data.email
    employee.full_name = user_data.full_name
    employee.phone = user_data.phone
    employee.role = user_data.role
    if user_data.password:
        employee.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """직원 삭제"""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.is_admin == False
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")
    
    db.delete(employee)
    db.commit()
    return {"message": "직원이 삭제되었습니다"}


