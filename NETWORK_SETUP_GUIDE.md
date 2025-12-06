# 사무실 내부 네트워크 설정 가이드

2명 이상의 직원이 함께 사용할 수 있도록 네트워크 설정하는 방법입니다.

## 📋 설정 방법

### 방법 1: 한 컴퓨터에서 서버 실행 (추천)

**서버 컴퓨터 (메인 컴퓨터)에서:**

1. **백엔드 서버 실행**
   ```bash
   cd backend
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python run.py
   ```
   서버가 `0.0.0.0:8000`에서 실행됩니다.

2. **관리자 웹 실행**
   ```bash
   cd admin-web
   npm start
   ```
   웹이 `localhost:3000`에서 실행됩니다.

3. **서버 컴퓨터의 IP 주소 확인**
   - macOS/Linux:
     ```bash
     ifconfig | grep "inet " | grep -v 127.0.0.1
     ```
   - Windows:
     ```bash
     ipconfig
     ```
   예: `192.168.0.100` (이 IP를 기록해두세요)

**다른 컴퓨터에서 접속:**

1. 브라우저에서 접속:
   - `http://서버IP주소:3000` (예: `http://192.168.0.100:3000`)

2. **API URL 설정** (필요한 경우):
   - 브라우저 개발자 도구(F12) → Console에서:
     ```javascript
     localStorage.setItem('API_BASE_URL', 'http://서버IP주소:8000/api');
     ```
   - 또는 `admin-web/src/services/api.ts` 파일을 수정:
     ```typescript
     const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://서버IP주소:8000/api';
     ```

### 방법 2: 각 컴퓨터에서 독립적으로 실행 (데이터 공유 안됨)

각 컴퓨터에서 독립적으로 실행하면 데이터가 공유되지 않습니다.
**방법 1을 추천합니다.**

## 🔧 고급 설정

### CORS 설정 수정 (필요한 경우)

`backend/app/core/config.py` 파일에서 CORS 설정을 수정할 수 있습니다:

```python
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://192.168.0.100:3000",  # 서버 컴퓨터 IP
    "http://192.168.0.101:3000",  # 다른 컴퓨터 IP (있는 경우)
    # 또는 모든 내부 네트워크 허용 (보안 주의)
    "http://192.168.0.0/16:3000",  # 192.168.x.x 모두 허용
]
```

### 환경 변수로 API URL 설정

**관리자 웹에서:**

1. `.env` 파일 생성 (`admin-web/.env`):
   ```env
   REACT_APP_API_URL=http://서버IP주소:8000/api
   ```

2. `admin-web/src/services/api.ts` 수정:
   ```typescript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
   ```

3. 서버 재시작:
   ```bash
   npm start
   ```

## 🔒 보안 주의사항

1. **방화벽 설정**
   - 서버 컴퓨터의 방화벽에서 포트 8000, 3000을 허용해야 합니다.

2. **비밀번호 변경**
   - 기본 비밀번호(`admin123`)를 반드시 변경하세요.
   - 관리자 계정 관리에서 비밀번호를 변경할 수 있습니다.

3. **네트워크 격리**
   - 사무실 내부 네트워크에서만 접근 가능하도록 설정하세요.
   - 외부 인터넷에서 접근할 수 없도록 해야 합니다.

## 🚀 빠른 시작 (2명 사용)

### 서버 컴퓨터에서:

```bash
# 터미널 1: 백엔드 서버 실행
cd backend
source venv/bin/activate
python run.py

# 터미널 2: 관리자 웹 실행
cd admin-web
npm start
```

### 다른 컴퓨터에서:

1. 서버 컴퓨터의 IP 주소 확인 (서버 컴퓨터에서 `ifconfig` 또는 `ipconfig` 실행)
2. 브라우저에서 `http://서버IP주소:3000` 접속
3. 로그인 (기본: admin / admin123)

## 📝 체크리스트

- [ ] 서버 컴퓨터에서 백엔드 서버 실행 확인
- [ ] 서버 컴퓨터에서 관리자 웹 실행 확인
- [ ] 서버 컴퓨터의 IP 주소 확인
- [ ] 다른 컴퓨터에서 접속 테스트
- [ ] 로그인 테스트
- [ ] 데이터 등록/수정 테스트
- [ ] 두 컴퓨터에서 동시 접속 테스트

## ❓ 문제 해결

### 접속이 안 될 때:

1. **방화벽 확인**
   - macOS: 시스템 설정 → 보안 및 개인 정보 보호 → 방화벽
   - Windows: Windows Defender 방화벽

2. **네트워크 확인**
   - 같은 네트워크(Wi-Fi/이더넷)에 연결되어 있는지 확인
   - `ping 서버IP주소` 명령어로 연결 확인

3. **포트 확인**
   - 서버 컴퓨터에서 `netstat -an | grep 8000` (또는 `lsof -i :8000`)로 포트 확인

### CORS 오류가 발생할 때:

1. `backend/app/core/config.py`에서 CORS 설정 확인
2. 서버 재시작

## 💡 팁

- 서버 컴퓨터를 항상 켜두고 백엔드 서버를 실행해두면, 다른 컴퓨터에서 언제든 접속할 수 있습니다.
- 서버 컴퓨터의 IP 주소가 변경되지 않도록 네트워크 설정에서 고정 IP를 사용하는 것을 추천합니다.

