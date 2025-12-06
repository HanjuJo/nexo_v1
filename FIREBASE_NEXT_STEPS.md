# Firebase 배포 다음 단계

Firebase 초기화가 완료되었습니다! 이제 배포를 진행하세요.

## 📋 배포 단계

### 1단계: 백엔드 서버 배포 (필수!)

Firebase Hosting은 프론트엔드만 서빙하므로, 백엔드는 별도로 배포해야 합니다.

#### 옵션 A: Railway (무료 티어) - 추천 ⭐

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 백엔드 저장소 선택

3. **서비스 추가**
   - "New" → "GitHub Repo" 선택
   - 백엔드 디렉토리 선택

4. **환경 변수 설정**
   ```
   DATABASE_URL=sqlite:///./nexo_crm.db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ALLOWED_ORIGINS=
   ```

5. **배포 설정**
   - Root Directory: `backend`
   - Start Command: `python run.py`
   - Python Version: 3.11

6. **URL 확인**
   - 배포 완료 후 URL 확인 (예: `https://your-app.railway.app`)

#### 옵션 B: Render (무료 티어)

1. https://render.com 접속
2. "New Web Service" 생성
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python run.py`
5. 환경 변수 설정
6. 배포

#### 옵션 C: VPS (DigitalOcean, Linode 등)

기존 VPS 배포 가이드 참고

### 2단계: 프론트엔드 빌드 및 배포

백엔드 URL을 확인한 후:

```bash
cd admin-web

# 백엔드 URL 설정 (옵션 1에서 얻은 URL)
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env
# 예: echo "REACT_APP_API_URL=https://nexo-backend.railway.app/api" > .env

# 빌드
npm run build

# Firebase에 배포
firebase deploy --only hosting
```

배포 완료 후 URL이 표시됩니다:
```
https://nexo-71cef.web.app
또는
https://nexo-71cef.firebaseapp.com
```

### 3단계: 백엔드 CORS 설정

백엔드에서 Firebase 도메인을 허용하도록 설정:

`backend/app/core/config.py`:
```python
ALLOWED_ORIGINS: List[str] = [
    "https://nexo-71cef.web.app",
    "https://nexo-71cef.firebaseapp.com",
]
```

또는 모든 origin 허용 (개발용):
```python
ALLOWED_ORIGINS: List[str] = []  # 빈 리스트 = 모든 origin 허용
```

백엔드 서버 재시작 필요

## ✅ 완료!

이제 인터넷 어디서든 접속할 수 있습니다:
- https://nexo-71cef.web.app
- https://nexo-71cef.firebaseapp.com

## 🔒 보안 설정 (필수!)

### 1. 기본 비밀번호 변경
배포 후 즉시 `admin123` 비밀번호를 변경하세요!

### 2. SECRET_KEY 변경
백엔드 `.env` 파일에서:
```bash
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
```

## 🔄 업데이트 방법

코드를 수정한 후:

```bash
cd admin-web
npm run build
firebase deploy --only hosting
```

## 💡 커스텀 도메인 설정 (선택사항)

1. Firebase Console → Hosting → "도메인 추가"
2. 도메인 입력
3. DNS 레코드 추가 (Firebase가 안내)
4. SSL 인증서 자동 발급 (몇 분 소요)

## 📝 체크리스트

- [ ] 백엔드 서버 배포 (Railway, Render 등)
- [ ] 백엔드 URL 확인
- [ ] 프론트엔드 .env 파일에 API URL 설정
- [ ] 프론트엔드 빌드
- [ ] Firebase 배포
- [ ] 백엔드 CORS 설정
- [ ] 접속 테스트
- [ ] 기본 비밀번호 변경
- [ ] SECRET_KEY 변경

