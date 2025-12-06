from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 데이터베이스 설정
    DATABASE_URL: str = "sqlite:///./nexo_crm.db"  # 기본값: SQLite (개발용)
    
    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 설정
    # 내부 네트워크 사용을 위해 빈 리스트로 설정하면 모든 origin 허용
    # 특정 IP만 허용하려면 아래처럼 설정하세요:
    # ALLOWED_ORIGINS: List[str] = ["http://192.168.0.100:3000", "http://192.168.0.101:3000"]
    ALLOWED_ORIGINS: List[str] = []  # 빈 리스트 = 모든 origin 허용 (내부 네트워크용)
    
    # 파일 업로드 설정
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"


settings = Settings()


