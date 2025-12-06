# 넥소코리아 고객관리 API 서버

FastAPI 기반 백엔드 서버

## 설치

1. 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 패키지 설치
```bash
pip install -r requirements.txt
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 URL 등을 설정하세요
```

4. 데이터베이스 설정
- PostgreSQL을 설치하고 데이터베이스를 생성하세요
- 또는 SQLite를 사용하려면 DATABASE_URL을 `sqlite:///./nexo_crm.db`로 변경하세요

5. 데이터베이스 초기화
```bash
python -m app.db.init_db
```

## 실행

```bash
python run.py
# 또는
uvicorn app.main:app --reload
```

서버가 http://localhost:8000 에서 실행됩니다.

API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/register` - 사용자 등록 (관리자만)

### 관리자
- `GET /api/admin/accounts` - 관리자 계정 목록 (슈퍼관리자만)
- `POST /api/admin/accounts` - 관리자 계정 등록
- `PUT /api/admin/accounts/{id}` - 관리자 계정 수정
- `DELETE /api/admin/accounts/{id}` - 관리자 계정 삭제

### 직원
- `GET /api/employees` - 직원 목록
- `POST /api/employees` - 직원 등록
- `PUT /api/employees/{id}` - 직원 정보 수정
- `DELETE /api/employees/{id}` - 직원 삭제

### 거래처
- `GET /api/clients` - 거래처 목록
- `POST /api/clients` - 거래처 등록
- `PUT /api/clients/{id}` - 거래처 수정
- `DELETE /api/clients/{id}` - 거래처 삭제

### 상담
- `GET /api/consultations` - 상담 목록
- `POST /api/consultations` - 상담 등록
- `PUT /api/consultations/{id}` - 상담 수정
- `DELETE /api/consultations/{id}` - 상담 삭제

### 견적
- `GET /api/quotations` - 견적 목록
- `POST /api/quotations` - 견적 등록
- `PUT /api/quotations/{id}` - 견적 수정
- `DELETE /api/quotations/{id}` - 견적 삭제

### 계약
- `GET /api/contracts` - 계약 목록
- `POST /api/contracts` - 계약 등록
- `PUT /api/contracts/{id}` - 계약 수정
- `DELETE /api/contracts/{id}` - 계약 삭제

### 설치/AS
- `GET /api/installations` - 설치/AS 목록
- `POST /api/installations` - 설치/AS 등록
- `PUT /api/installations/{id}/complete` - 설치/AS 완료 처리 (사진 업로드 포함)
- `GET /api/installations/client/{client_id}/history` - 고객 이력 조회

### 재고
- `GET /api/inventory` - 재고 목록
- `POST /api/inventory` - 재고 등록
- `PUT /api/inventory/{id}` - 재고 수정

### 품목
- `GET /api/items` - 품목 목록
- `POST /api/items` - 품목 등록
- `PUT /api/items/{id}` - 품목 수정


