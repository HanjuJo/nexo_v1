# 관리자 웹과 백엔드 연결 테스트 가이드

## 사전 준비

### 1. 백엔드 서버 실행
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
```

백엔드 서버가 `http://localhost:8000`에서 실행되어야 합니다.

### 2. 관리자 웹 서버 실행
```bash
cd admin-web
npm install  # 처음 실행 시에만
npm start
```

관리자 웹이 `http://localhost:3000`에서 실행됩니다.

## 자동 테스트 (Node.js 스크립트)

### Node.js 스크립트로 테스트
```bash
cd admin-web
node test_api_connection.js
```

이 스크립트는 다음을 테스트합니다:
1. 로그인
2. 현재 사용자 정보 조회
3. 관리자 계정 목록 조회
4. 직원 목록 조회
5. 거래처 목록 조회
6. 품목 목록 조회
7. 상담 목록 조회
8. 설치/AS 목록 조회

## 수동 테스트

### 1. 브라우저에서 테스트

#### 로그인 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인 페이지에서 다음 정보로 로그인:
   - 사용자명: `admin`
   - 비밀번호: `admin123`
3. 로그인 성공 시 대시보드로 이동하는지 확인

#### 주요 기능 테스트
1. **관리자 계정 관리**
   - 대시보드에서 "관리자 계정 관리" 클릭
   - 관리자 계정 목록이 표시되는지 확인
   - "관리자 계정 등록" 버튼 클릭하여 모달이 열리는지 확인

2. **직원 관리**
   - "직원 관리" 메뉴 클릭
   - 직원 목록이 표시되는지 확인
   - 검색 기능 테스트
   - "직원 등록" 버튼 클릭

3. **거래처 관리**
   - "거래처 관리" 메뉴 클릭
   - 거래처 목록이 표시되는지 확인
   - 검색 기능 테스트
   - "거래처 등록" 버튼 클릭

4. **상담 관리**
   - "상담 관리" 메뉴 클릭
   - 상담 목록이 표시되는지 확인
   - 상담 등록/수정/삭제 기능 테스트

5. **견적 관리**
   - "견적 관리" 메뉴 클릭
   - 견적 목록이 표시되는지 확인
   - 견적 등록/수정/삭제 기능 테스트

6. **계약 관리**
   - "계약 관리" 메뉴 클릭
   - 계약 목록이 표시되는지 확인
   - 계약 등록/수정/삭제 기능 테스트

7. **설치/AS 관리**
   - "설치 및 AS 관리" 메뉴 클릭
   - 설치/AS 목록이 표시되는지 확인
   - 작업 등록/수정/완료 처리 기능 테스트

8. **재고 관리**
   - "재고 관리" 메뉴 클릭
   - 재고 목록이 표시되는지 확인
   - 재고 등록/수정 기능 테스트

### 2. 브라우저 개발자 도구로 확인

#### Network 탭 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭 선택
3. 각 기능을 사용하면서 API 요청 확인:
   - 요청 URL이 올바른지 확인 (`http://localhost:8000/api/...`)
   - 요청 헤더에 `Authorization: Bearer <token>`이 포함되는지 확인
   - 응답 상태 코드가 200인지 확인

#### Console 탭 확인
1. Console 탭에서 JavaScript 오류 확인
2. API 호출 실패 시 오류 메시지 확인

## 문제 해결

### CORS 오류
백엔드의 CORS 설정을 확인하세요:
- `backend/app/core/config.py`에서 `ALLOWED_ORIGINS` 확인
- `http://localhost:3000`이 포함되어 있는지 확인

### 401 Unauthorized 오류
- 로그인 토큰이 만료되었을 수 있습니다. 다시 로그인하세요.
- `localStorage`에 토큰이 저장되어 있는지 확인하세요.

### 404 Not Found 오류
- API 엔드포인트 경로가 올바른지 확인하세요.
- 백엔드 라우터가 올바르게 등록되어 있는지 확인하세요.

### 500 Internal Server Error
- 백엔드 서버 로그를 확인하세요.
- 데이터베이스 연결이 정상인지 확인하세요.

## API 엔드포인트 목록

### 인증
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 관리자
- `GET /api/admin/accounts` - 관리자 계정 목록
- `POST /api/admin/accounts` - 관리자 계정 등록
- `PUT /api/admin/accounts/{id}` - 관리자 계정 수정
- `DELETE /api/admin/accounts/{id}` - 관리자 계정 삭제

### 직원
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

### 상담
- `GET /api/consultations` - 상담 목록
- `POST /api/consultations` - 상담 등록
- `GET /api/consultations/{id}` - 상담 상세
- `PUT /api/consultations/{id}` - 상담 수정
- `DELETE /api/consultations/{id}` - 상담 삭제

### 견적
- `GET /api/quotations` - 견적 목록
- `POST /api/quotations` - 견적 등록
- `GET /api/quotations/{id}` - 견적 상세
- `PUT /api/quotations/{id}` - 견적 수정
- `DELETE /api/quotations/{id}` - 견적 삭제

### 계약
- `GET /api/contracts` - 계약 목록
- `POST /api/contracts` - 계약 등록
- `GET /api/contracts/{id}` - 계약 상세
- `PUT /api/contracts/{id}` - 계약 수정
- `DELETE /api/contracts/{id}` - 계약 삭제

### 설치/AS
- `GET /api/installations` - 설치/AS 목록
- `POST /api/installations` - 설치/AS 등록
- `GET /api/installations/{id}` - 설치/AS 상세
- `PUT /api/installations/{id}` - 설치/AS 수정
- `PUT /api/installations/{id}/complete` - 설치/AS 완료 처리

### 재고
- `GET /api/inventory` - 재고 목록
- `POST /api/inventory` - 재고 등록
- `GET /api/inventory/{id}` - 재고 상세
- `PUT /api/inventory/{id}` - 재고 수정
- `DELETE /api/inventory/{id}` - 재고 삭제

### 품목
- `GET /api/items` - 품목 목록
- `POST /api/items` - 품목 등록
- `GET /api/items/{id}` - 품목 상세
- `PUT /api/items/{id}` - 품목 수정
- `DELETE /api/items/{id}` - 품목 삭제

## 테스트 체크리스트

- [ ] 백엔드 서버 실행 확인
- [ ] 관리자 웹 서버 실행 확인
- [ ] 로그인 기능 테스트
- [ ] 관리자 계정 관리 기능 테스트
- [ ] 직원 관리 기능 테스트
- [ ] 거래처 관리 기능 테스트
- [ ] 상담 관리 기능 테스트
- [ ] 견적 관리 기능 테스트
- [ ] 계약 관리 기능 테스트
- [ ] 설치/AS 관리 기능 테스트
- [ ] 재고 관리 기능 테스트
- [ ] 품목 관리 기능 테스트
- [ ] 브라우저 개발자 도구에서 오류 확인
- [ ] Network 탭에서 API 요청 확인

