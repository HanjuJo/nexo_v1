# 넥소코리아 고객관리 서비스 툴

고객관리, 상담, 견적, 계약, 설치/AS 관리를 위한 통합 관리 시스템

## 프로젝트 구조

```
고객관리/
├── backend/          # FastAPI 백엔드 서버
│   ├── app/
│   │   ├── models/   # 데이터베이스 모델
│   │   ├── schemas/  # Pydantic 스키마
│   │   ├── api/      # API 라우터
│   │   ├── core/     # 설정, 보안 등
│   │   └── db/       # 데이터베이스 연결
│   └── requirements.txt
├── admin-web/        # 관리자 웹 애플리케이션 (React)
├── mobile-app/       # 모바일 앱 (React Native)
│   ├── sales-app/    # 영업자 앱
│   └── technician-app/ # 기사 앱
└── README.md
```

## 기술 스택

### 백엔드
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- JWT 인증

### 프론트엔드
- React + TypeScript
- React Native

## 주요 기능

### 관리자 웹 (20개 모듈)
- 관리자 로그인 및 계정 관리
- 직원 관리
- 거래처 관리
- 품목 관리
- 상담 관리
- 견적 관리
- 계약 관리
- 설치 및 AS 관리
- 재고 관리

### 영업자 앱 (13개 화면)
- 로그인
- 상담 관리
- 견적 관리
- 계약 관리
- 거래처 관리
- 마이페이지

### 기사 앱 (9개 화면)
- 로그인
- 작업 리스트 (진행중/완료)
- 설치 및 AS 결과 등록
- 고객 이력 조회
- 마이페이지

## 설치 및 실행

### 백엔드
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 관리자 웹
```bash
cd admin-web
npm install
npm start
```

### 모바일 앱
```bash
cd mobile-app
npm install
npm run android  # 또는 npm run ios
```


