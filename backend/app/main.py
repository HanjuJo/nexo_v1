from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api import auth, admin, employee, client, consultation, quotation, contract, installation, inventory, item, backup
from app.db.init_db import init_db

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# 데이터베이스 초기화 (관리자 계정 생성)
try:
    init_db()
except Exception as e:
    print(f"⚠️  데이터베이스 초기화 중 오류 (무시 가능): {e}")

app = FastAPI(
    title="넥소코리아 고객관리 API",
    description="고객관리, 상담, 견적, 계약, 설치/AS 관리 시스템",
    version="1.0.0"
)

# CORS 설정
# 내부 네트워크 사용을 위해 유연한 설정
# ALLOWED_ORIGINS가 비어있으면 모든 origin 허용 (내부 네트워크용)
cors_origins = settings.allowed_origins_list if settings.allowed_origins_list else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(admin.router, prefix="/api/admin", tags=["관리자"])
app.include_router(employee.router, prefix="/api/employees", tags=["직원"])
app.include_router(client.router, prefix="/api/clients", tags=["거래처"])
app.include_router(consultation.router, prefix="/api/consultations", tags=["상담"])
app.include_router(quotation.router, prefix="/api/quotations", tags=["견적"])
app.include_router(contract.router, prefix="/api/contracts", tags=["계약"])
app.include_router(installation.router, prefix="/api/installations", tags=["설치/AS"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["재고"])
app.include_router(item.router, prefix="/api/items", tags=["품목"])
app.include_router(backup.router, prefix="/api/backup", tags=["백업"])


@app.get("/")
async def root():
    return {"message": "넥소코리아 고객관리 API 서버", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

