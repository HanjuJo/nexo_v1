from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.db.dependencies import get_current_user
from app.models.installation import Installation, InstallationType, InstallationStatus
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime, date
import os
import shutil
from app.core.config import settings

router = APIRouter()


class InstallationBase(BaseModel):
    contract_id: int
    client_id: int
    installation_type: InstallationType
    status: InstallationStatus = InstallationStatus.PENDING
    scheduled_date: Optional[date] = None
    result_text: Optional[str] = None
    notes: Optional[str] = None


class InstallationCreate(InstallationBase):
    pass


class ClientInfo(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


class TechnicianInfo(BaseModel):
    id: int
    full_name: str
    
    class Config:
        from_attributes = True


class InstallationResponse(InstallationBase):
    id: int
    technician_id: int
    completed_date: Optional[datetime] = None
    photo_url_1: Optional[str] = None
    photo_url_2: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientInfo] = None
    technician: Optional[TechnicianInfo] = None

    class Config:
        from_attributes = True


@router.get("/")
async def get_installations(
    skip: int = 0,
    limit: int = 100,
    status: Optional[InstallationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 목록 조회"""
    query = db.query(Installation)
    
    if status:
        query = query.filter(Installation.status == status)
    
    # 기사는 자신의 작업만 조회
    if current_user.role.value == "technician" and not current_user.is_admin:
        query = query.filter(Installation.technician_id == current_user.id)
    
    installations = query.options(
        joinedload(Installation.client),
        joinedload(Installation.technician)
    ).offset(skip).limit(limit).all()
    
    # 관계 데이터를 수동으로 포함
    result = []
    for installation in installations:
        installation_dict = {
            "id": installation.id,
            "contract_id": installation.contract_id,
            "client_id": installation.client_id,
            "technician_id": installation.technician_id,
            "installation_type": installation.installation_type,
            "status": installation.status,
            "scheduled_date": installation.scheduled_date,
            "completed_date": installation.completed_date,
            "result_text": installation.result_text,
            "photo_url_1": installation.photo_url_1,
            "photo_url_2": installation.photo_url_2,
            "notes": installation.notes,
            "created_at": installation.created_at,
            "updated_at": installation.updated_at,
        }
        if installation.client:
            installation_dict["client"] = {
                "id": installation.client.id,
                "name": installation.client.name,
            }
        if installation.technician:
            installation_dict["technician"] = {
                "id": installation.technician.id,
                "full_name": installation.technician.full_name,
            }
        result.append(installation_dict)
    
    return result


@router.get("/{installation_id}", response_model=InstallationResponse)
async def get_installation(
    installation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 상세 조회"""
    installation = db.query(Installation).options(
        joinedload(Installation.client),
        joinedload(Installation.technician)
    ).filter(Installation.id == installation_id).first()
    if not installation:
        raise HTTPException(status_code=404, detail="설치/AS를 찾을 수 없습니다")
    
    installation_dict = {
        "id": installation.id,
        "contract_id": installation.contract_id,
        "client_id": installation.client_id,
        "technician_id": installation.technician_id,
        "installation_type": installation.installation_type,
        "status": installation.status,
        "scheduled_date": installation.scheduled_date,
        "completed_date": installation.completed_date,
        "result_text": installation.result_text,
        "photo_url_1": installation.photo_url_1,
        "photo_url_2": installation.photo_url_2,
        "notes": installation.notes,
        "created_at": installation.created_at,
        "updated_at": installation.updated_at,
    }
    if installation.client:
        installation_dict["client"] = {
            "id": installation.client.id,
            "name": installation.client.name,
        }
    if installation.technician:
        installation_dict["technician"] = {
            "id": installation.technician.id,
            "full_name": installation.technician.full_name,
        }
    
    return installation_dict


@router.get("/client/{client_id}/history", response_model=List[InstallationResponse])
async def get_client_installation_history(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """고객의 설치/AS 이력 조회"""
    installations = db.query(Installation).filter(
        Installation.client_id == client_id
    ).order_by(Installation.created_at.desc()).all()
    return installations


@router.post("/", response_model=InstallationResponse)
async def create_installation(
    installation_data: InstallationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 등록 (관리자만)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다")
    
    new_installation = Installation(
        **installation_data.dict(),
        technician_id=current_user.id
    )
    db.add(new_installation)
    db.commit()
    db.refresh(new_installation)
    return new_installation


@router.put("/{installation_id}/complete", response_model=InstallationResponse)
async def complete_installation(
    installation_id: int,
    result_text: str,
    photo1: Optional[UploadFile] = File(None),
    photo2: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 완료 처리 (사진 최대 2장)"""
    installation = db.query(Installation).filter(Installation.id == installation_id).first()
    if not installation:
        raise HTTPException(status_code=404, detail="설치/AS를 찾을 수 없습니다")
    
    # 기사는 자신의 작업만 완료 처리 가능
    if current_user.role.value == "technician" and not current_user.is_admin:
        if installation.technician_id != current_user.id:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
    
    # 업로드 디렉토리 생성
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # 사진 업로드 처리
    photo_url_1 = None
    photo_url_2 = None
    
    if photo1:
        file_path = os.path.join(settings.UPLOAD_DIR, f"installation_{installation_id}_1.jpg")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo1.file, buffer)
        photo_url_1 = f"/uploads/installation_{installation_id}_1.jpg"
    
    if photo2:
        file_path = os.path.join(settings.UPLOAD_DIR, f"installation_{installation_id}_2.jpg")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo2.file, buffer)
        photo_url_2 = f"/uploads/installation_{installation_id}_2.jpg"
    
    installation.status = InstallationStatus.COMPLETED
    installation.completed_date = datetime.utcnow()
    installation.result_text = result_text
    installation.photo_url_1 = photo_url_1
    installation.photo_url_2 = photo_url_2
    
    db.commit()
    db.refresh(installation)
    return installation


@router.put("/{installation_id}", response_model=InstallationResponse)
async def update_installation(
    installation_id: int,
    installation_data: InstallationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 수정"""
    installation = db.query(Installation).filter(Installation.id == installation_id).first()
    if not installation:
        raise HTTPException(status_code=404, detail="설치/AS를 찾을 수 없습니다")
    
    for key, value in installation_data.dict().items():
        setattr(installation, key, value)
    
    db.commit()
    db.refresh(installation)
    return installation


@router.delete("/{installation_id}")
async def delete_installation(
    installation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """설치/AS 삭제"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다")
    
    installation = db.query(Installation).filter(Installation.id == installation_id).first()
    if not installation:
        raise HTTPException(status_code=404, detail="설치/AS를 찾을 수 없습니다")
    
    db.delete(installation)
    db.commit()
    return {"message": "설치/AS가 삭제되었습니다"}


