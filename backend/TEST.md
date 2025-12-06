# 백엔드 테스트 가이드

## 1. 환경 설정

### 1.1 가상환경 생성 및 활성화

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 1.2 패키지 설치

```bash
pip install -r requirements.txt
```

### 1.3 환경 변수 설정

`.env` 파일을 생성하거나 다음 중 하나를 사용하세요:

**SQLite (개발/테스트용 - 추천)**
```env
DATABASE_URL=sqlite:///./nexo_crm.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

**PostgreSQL (운영용)**
```env
DATABASE_URL=postgresql://user:password@localhost/nexo_crm
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

## 2. 데이터베이스 초기화

```bash
python -m app.db.init_db
```

이 명령어는 슈퍼관리자 계정을 생성합니다:
- 사용자명: `admin`
- 비밀번호: `admin123`
- ⚠️ 운영 환경에서는 반드시 비밀번호를 변경하세요!

## 3. 서버 실행

```bash
python run.py
```

또는:

```bash
uvicorn app.main:app --reload
```

서버가 http://localhost:8000 에서 실행됩니다.

## 4. API 테스트

### 4.1 브라우저에서 확인

- API 문서: http://localhost:8000/docs
- 대체 문서: http://localhost:8000/redoc

### 4.2 Python 테스트 스크립트 실행

```bash
# 테스트 패키지 설치
pip install requests

# 테스트 실행
python test_backend.py
```

### 4.3 curl로 테스트

**서버 헬스 체크:**
```bash
curl http://localhost:8000/health
```

**로그인:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

**현재 사용자 정보 (토큰 필요):**
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 5. 주요 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 관리자 (슈퍼관리자만)
- `GET /api/admin/accounts` - 관리자 계정 목록
- `POST /api/admin/accounts` - 관리자 계정 등록
- `PUT /api/admin/accounts/{id}` - 관리자 계정 수정
- `DELETE /api/admin/accounts/{id}` - 관리자 계정 삭제

### 직원 (관리자만)
- `GET /api/employees` - 직원 목록
- `POST /api/employees` - 직원 등록
- `GET /api/employees/{id}` - 직원 상세
- `PUT /api/employees/{id}` - 직원 수정
- `DELETE /api/employees/{id}` - 직원 삭제

### 거래처
- `GET /api/clients` - 거래처 목록
- `POST /api/clients` - 거래처 등록
- `GET /api/clients/{id}` - 거래처 상세
- `PUT /api/clients/{id}` - 거래처 수정
- `DELETE /api/clients/{id}` - 거래처 삭제

### 기타
- `GET /api/items` - 품목 목록
- `GET /api/consultations` - 상담 목록
- `GET /api/quotations` - 견적 목록
- `GET /api/contracts` - 계약 목록
- `GET /api/installations` - 설치/AS 목록
- `GET /api/inventory` - 재고 목록

## 6. 문제 해결

### 6.1 데이터베이스 연결 오류

**SQLite 사용 시:**
- 파일 경로가 올바른지 확인
- 파일 쓰기 권한이 있는지 확인

**PostgreSQL 사용 시:**
- PostgreSQL이 실행 중인지 확인
- 데이터베이스가 생성되어 있는지 확인
- 연결 정보가 올바른지 확인

### 6.2 포트가 이미 사용 중

```bash
# 포트 사용 중인 프로세스 확인 (macOS/Linux)
lsof -i :8000

# 포트 사용 중인 프로세스 확인 (Windows)
netstat -ano | findstr :8000
```

다른 포트로 실행하려면:
```bash
uvicorn app.main:app --reload --port 8001
```

### 6.3 모듈을 찾을 수 없음

```bash
# 가상환경이 활성화되어 있는지 확인
which python  # macOS/Linux
where python  # Windows

# 패키지 재설치
pip install -r requirements.txt --force-reinstall
```

## 7. 다음 단계

백엔드가 정상적으로 작동하는 것을 확인했다면:

1. 관리자 웹 애플리케이션과 연결 테스트
2. 모바일 앱 개발 시작
3. 추가 기능 구현

