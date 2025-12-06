from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # 데이터베이스 설정
    DATABASE_URL: str = "sqlite:///./nexo_crm.db"  # 기본값: SQLite (개발용)
    
    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 설정
    # 환경 변수에서 쉼표로 구분된 문자열을 받아서 리스트로 변환
    # 예: ALLOWED_ORIGINS=https://example.com,https://another.com
    # 또는 JSON 형식: ALLOWED_ORIGINS=["https://example.com"]
    # 빈 문자열이면 모든 origin 허용
    ALLOWED_ORIGINS: str = ""  # 문자열로 받음
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """ALLOWED_ORIGINS를 리스트로 변환"""
        if not self.ALLOWED_ORIGINS:
            return []  # 빈 리스트 = 모든 origin 허용
        
        # JSON 형식인지 확인
        if self.ALLOWED_ORIGINS.strip().startswith('['):
            import json
            try:
                return json.loads(self.ALLOWED_ORIGINS)
            except:
                pass
        
        # 쉼표로 구분된 문자열 파싱
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
        return origins if origins else []
    
    # 파일 업로드 설정
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"


settings = Settings()


