from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.SALES


class UserCreate(UserBase):
    password: Optional[str] = None
    is_admin: bool = False
    is_super_admin: bool = False


class UserUpdate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.SALES
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    is_super_admin: bool

    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm_user(cls, user):
        """User 모델에서 UserResponse 생성"""
        return cls(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role.value if hasattr(user.role, 'value') else user.role,
            is_active=user.is_active,
            is_admin=user.is_admin,
            is_super_admin=user.is_super_admin
        )


