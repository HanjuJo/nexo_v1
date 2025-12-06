from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.dependencies import get_current_super_admin
from app.models.user import User
from app.schemas.auth import UserResponse, UserCreate
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/accounts", response_model=List[UserResponse])
async def get_admin_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """관리자 계정 목록 조회 (슈퍼관리자만)"""
    users = db.query(User).filter(User.is_admin == True).offset(skip).limit(limit).all()
    return users


@router.get("/accounts/{user_id}", response_model=UserResponse)
async def get_admin_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """관리자 계정 상세 조회"""
    user = db.query(User).filter(User.id == user_id, User.is_admin == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="관리자 계정을 찾을 수 없습니다")
    return user


@router.post("/accounts", response_model=UserResponse)
async def create_admin_account(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """관리자 계정 등록"""
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명입니다")
    
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        is_admin=True,
        is_super_admin=user_data.is_super_admin
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/accounts/{user_id}", response_model=UserResponse)
async def update_admin_account(
    user_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """관리자 계정 수정"""
    user = db.query(User).filter(User.id == user_id, User.is_admin == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="관리자 계정을 찾을 수 없습니다")
    
    # 중복 확인 (자기 자신 제외)
    if user_data.username != user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명입니다")
    
    if user_data.email != user.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    
    user.username = user_data.username
    user.email = user_data.email
    user.full_name = user_data.full_name
    user.phone = user_data.phone
    user.role = user_data.role
    if user_data.password:
        user.hashed_password = get_password_hash(user_data.password)
    user.is_super_admin = user_data.is_super_admin
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/accounts/{user_id}")
async def delete_admin_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)
):
    """관리자 계정 삭제"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자기 자신은 삭제할 수 없습니다")
    
    user = db.query(User).filter(User.id == user_id, User.is_admin == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="관리자 계정을 찾을 수 없습니다")
    
    db.delete(user)
    db.commit()
    return {"message": "관리자 계정이 삭제되었습니다"}


