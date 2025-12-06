# 백엔드 테스트 가이드

이 가이드는 백엔드를 테스트하고 실행하는 방법을 안내합니다.

## 📋 사전 준비

1. Python 3.11 이상 설치 확인
   ```bash
   python3 --version
   ```

2. 프로젝트 디렉토리로 이동
   ```bash
   cd backend
   ```

## 🚀 빠른 시작 (SQLite 사용 - 추천)

### 1단계: 가상환경 생성 및 활성화

```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2단계: 패키지 설치

```bash
pip install -r requirements.txt
```

### 3단계: 환경 변수 설정 (선택사항)

`.env` 파일을 생성하여 데이터베이스 URL 등을 설정할 수 있습니다. 
생성하지 않으면 SQLite를 기본값으로 사용합니다.

```bash
# .env 파일 생성 (선택사항)
cat > .env << EOF
DATABASE_URL=sqlite:///./nexo_crm.db
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
EOF
```

### 4단계: 데이터베이스 초기화

```bash
python -m app.db.init_db
```

이 명령어는 슈퍼관리자 계정을 생성합니다:
- **사용자명**: `admin`
- **비밀번호**: `admin123`
- ⚠️ 운영 환경에서는 반드시 비밀번호를 변경하세요!

### 5단계: 모듈 Import 테스트

```bash
python quick_test.py
```

모든 모듈이 정상적으로 import되는지 확인합니다.

### 6단계: 서버 실행

```bash
python run.py
```

또는:

```bash
uvicorn app.main:app --reload
```

서버가 http://localhost:8000 에서 실행됩니다.

### 7단계: 서버 확인

브라우저에서 다음 URL을 열어보세요:
- **API 문서**: http://localhost:8000/docs
- **서버 상태**: http://localhost:8000/health

## 🧪 API 테스트

### 브라우저에서 테스트

1. http://localhost:8000/docs 접속
2. `/api/auth/login` 엔드포인트 찾기
3. "Try it out" 클릭
4. 다음 정보 입력:
   - username: `admin`
   - password: `admin123`
5. "Execute" 클릭하여 로그인 테스트

### Python 스크립트로 테스트

```bash
# requests 설치 (아직 설치하지 않은 경우)
pip install requests

# 테스트 실행
python test_backend.py
```

### curl로 테스트

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

응답 예시:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@nexo.com",
    "full_name": "시스템 관리자",
    "role": "super_admin",
    "is_admin": true,
    "is_super_admin": true
  }
}
```

**현재 사용자 정보 조회 (토큰 필요):**
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 주요 API 엔드포인트

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

## 🔧 문제 해결

### 패키지 설치 오류

```bash
# pip 업그레이드
pip install --upgrade pip

# 패키지 재설치
pip install -r requirements.txt --force-reinstall
```

### 포트가 이미 사용 중

다른 포트로 실행:
```bash
uvicorn app.main:app --reload --port 8001
```

### 데이터베이스 오류

SQLite 파일이 손상되었거나 문제가 있는 경우:
```bash
# 데이터베이스 파일 삭제 (주의: 모든 데이터가 삭제됩니다)
rm nexo_crm.db

# 다시 초기화
python -m app.db.init_db
```

### 모듈을 찾을 수 없음

```bash
# 가상환경 활성화 확인
which python  # macOS/Linux
where python  # Windows

# 현재 디렉토리 확인
pwd
```

## ✅ 테스트 체크리스트

- [ ] 가상환경 생성 및 활성화
- [ ] 패키지 설치 완료
- [ ] 데이터베이스 초기화 완료
- [ ] 서버 실행 성공
- [ ] http://localhost:8000/docs 접속 가능
- [ ] 로그인 테스트 성공
- [ ] API 엔드포인트 접근 가능

## 📝 다음 단계

백엔드 테스트가 완료되면:

1. ✅ **백엔드 테스트 완료** (현재)
2. ⏭️ 관리자 웹 애플리케이션 개발 완성
3. ⏭️ 모바일 앱 개발 시작
4. ⏭️ 통합 테스트

## 💡 팁

- 개발 중에는 SQLite를 사용하는 것이 편리합니다
- 프로덕션 환경에서는 PostgreSQL 사용을 권장합니다
- API 문서 (`/docs`)를 활용하여 모든 엔드포인트를 테스트할 수 있습니다
- 서버를 `--reload` 옵션으로 실행하면 코드 변경 시 자동으로 재시작됩니다

