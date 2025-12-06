# Firebase 배포 가이드

Firebase를 사용하여 인터넷에서 접속 가능하도록 배포하는 방법입니다.

## 🚀 빠른 시작

### 1단계: Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `nexo-crm`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2단계: Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 3단계: Firebase 로그인

```bash
firebase login
```

브라우저가 열리면 Google 계정으로 로그인하세요.

### 4단계: Firebase 프로젝트 연결

```bash
cd admin-web
firebase init
```

설정 선택:
- **Hosting**: ✅ 선택
- **프로젝트 선택**: 방금 생성한 프로젝트 선택
- **Public directory**: `build` 입력
- **Single-page app**: `Yes`
- **Automatic builds**: `No` (수동 빌드)

### 5단계: 프론트엔드 빌드

```bash
cd admin-web

# 백엔드 API URL 설정
# 옵션 1: 환경 변수로 설정
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env

# 옵션 2: 빌드 시 직접 설정
REACT_APP_API_URL=https://your-backend-url.com/api npm run build

# 빌드
npm run build
```

### 6단계: Firebase에 배포

```bash
firebase deploy --only hosting
```

배포 완료 후 URL이 표시됩니다:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

## 🔧 백엔드 배포 옵션

### 옵션 1: 현재 FastAPI 서버 유지 (추천)

백엔드는 별도 서버에서 실행하고, Firebase Hosting은 프론트엔드만 서빙합니다.

**백엔드 배포 방법:**
- VPS (DigitalOcean, Linode 등)
- Heroku
- Railway
- Render

**프론트엔드 API URL 설정:**
```bash
# .env 파일
REACT_APP_API_URL=https://your-backend-server.com/api
```

### 옵션 2: Firebase Functions 사용

백엔드를 Firebase Functions로 마이그레이션 (복잡함, 권장하지 않음)

## 📋 상세 설정

### Firebase 프로젝트 ID 설정

`.firebaserc` 파일에서 프로젝트 ID 확인/수정:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 환경 변수 설정

프로덕션 빌드 시 API URL 설정:

**방법 1: .env 파일 사용**
```bash
cd admin-web
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env
npm run build
```

**방법 2: 빌드 시 직접 설정**
```bash
REACT_APP_API_URL=https://your-backend-url.com/api npm run build
```

### 커스텀 도메인 설정 (선택사항)

1. Firebase Console → Hosting → "도메인 추가"
2. 도메인 입력
3. DNS 레코드 추가 (Firebase가 안내)
4. SSL 인증서 자동 발급 (몇 분 소요)

## 🔄 업데이트 방법

코드를 수정한 후:

```bash
cd admin-web

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

## 🔒 보안 설정

### 1. 기본 비밀번호 변경

배포 후 즉시 기본 비밀번호(`admin123`)를 변경하세요!

### 2. SECRET_KEY 변경

백엔드 `.env` 파일에서:
```bash
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
```

### 3. CORS 설정

백엔드에서 Firebase 도메인 허용:

`backend/app/core/config.py`:
```python
ALLOWED_ORIGINS: List[str] = [
    "https://your-project.web.app",
    "https://your-project.firebaseapp.com",
    "https://your-custom-domain.com",  # 커스텀 도메인 사용 시
]
```

## 📝 배포 체크리스트

### 사전 준비
- [ ] Firebase 프로젝트 생성
- [ ] Firebase CLI 설치
- [ ] Firebase 로그인
- [ ] 백엔드 서버 배포 (VPS 등)

### 프론트엔드 배포
- [ ] Firebase 프로젝트 연결 (`firebase init`)
- [ ] API URL 환경 변수 설정
- [ ] 프론트엔드 빌드 (`npm run build`)
- [ ] Firebase 배포 (`firebase deploy`)

### 보안
- [ ] 기본 비밀번호 변경
- [ ] SECRET_KEY 변경
- [ ] CORS 설정 확인
- [ ] HTTPS 확인 (Firebase는 자동)

### 테스트
- [ ] 로그인 테스트
- [ ] 주요 기능 테스트
- [ ] 모바일에서 접속 테스트

## 💡 추천 구성

### 프론트엔드: Firebase Hosting
- 무료 호스팅
- 자동 HTTPS
- 글로벌 CDN
- 커스텀 도메인 지원

### 백엔드: VPS 또는 클라우드 서비스
- DigitalOcean: $6/월
- Railway: 무료 티어 있음
- Render: 무료 티어 있음
- Heroku: 유료

## ❓ 문제 해결

### 빌드 실패

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 배포 실패

```bash
# Firebase 로그인 확인
firebase login --reauth

# 프로젝트 확인
firebase projects:list

# 프로젝트 재설정
firebase use --add
```

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- API URL이 올바른지 확인

## 📚 참고 자료

- Firebase 공식 문서: https://firebase.google.com/docs/hosting
- Firebase CLI: https://firebase.google.com/docs/cli

