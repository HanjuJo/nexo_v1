"""
데이터 백업 API
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from datetime import datetime
import os
import shutil
from pathlib import Path
from app.db.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# 데이터베이스 파일 경로
DB_PATH = "nexo_crm.db"
BACKUP_DIR = "backups"

# 백업 디렉토리 생성
os.makedirs(BACKUP_DIR, exist_ok=True)


@router.get("/create")
async def create_backup(current_user: User = Depends(get_current_user)):
    """
    데이터베이스 백업 생성
    """
    try:
        if not os.path.exists(DB_PATH):
            raise HTTPException(status_code=404, detail="데이터베이스 파일을 찾을 수 없습니다.")
        
        # 백업 파일명 생성 (날짜/시간 포함)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"nexo_crm_backup_{timestamp}.db"
        backup_path = os.path.join(BACKUP_DIR, backup_filename)
        
        # 데이터베이스 파일 복사
        shutil.copy2(DB_PATH, backup_path)
        
        return {
            "success": True,
            "message": "백업이 생성되었습니다.",
            "backup_file": backup_filename,
            "backup_path": backup_path,
            "timestamp": timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백업 생성 실패: {str(e)}")


@router.get("/list")
async def list_backups(current_user: User = Depends(get_current_user)):
    """
    백업 파일 목록 조회
    """
    try:
        if not os.path.exists(BACKUP_DIR):
            return {"backups": []}
        
        backups = []
        for filename in os.listdir(BACKUP_DIR):
            if filename.endswith(".db"):
                file_path = os.path.join(BACKUP_DIR, filename)
                file_stat = os.stat(file_path)
                backups.append({
                    "filename": filename,
                    "size": file_stat.st_size,
                    "created_at": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                    "modified_at": datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })
        
        # 최신순으로 정렬
        backups.sort(key=lambda x: x["modified_at"], reverse=True)
        
        return {"backups": backups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백업 목록 조회 실패: {str(e)}")


@router.get("/download/{filename}")
async def download_backup(filename: str, current_user: User = Depends(get_current_user)):
    """
    백업 파일 다운로드
    """
    try:
        # 보안: 파일명에 경로 조작 방지
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="잘못된 파일명입니다.")
        
        backup_path = os.path.join(BACKUP_DIR, filename)
        
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail="백업 파일을 찾을 수 없습니다.")
        
        return FileResponse(
            backup_path,
            media_type="application/octet-stream",
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백업 다운로드 실패: {str(e)}")


@router.delete("/{filename}")
async def delete_backup(filename: str, current_user: User = Depends(get_current_user)):
    """
    백업 파일 삭제
    """
    try:
        # 보안: 파일명에 경로 조작 방지
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="잘못된 파일명입니다.")
        
        backup_path = os.path.join(BACKUP_DIR, filename)
        
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail="백업 파일을 찾을 수 없습니다.")
        
        os.remove(backup_path)
        
        return {
            "success": True,
            "message": "백업 파일이 삭제되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백업 삭제 실패: {str(e)}")

