# Firebase 빠른 배포 가이드

## 🚀 5분 안에 배포하기

### 1단계: Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `nexo-crm`)
4. 프로젝트 생성

### 2단계: Firebase CLI 설치 및 로그인

```bash
npm install -g firebase-tools
firebase login
```

### 3단계: Firebase 초기화

```bash
cd admin-web
firebase init
```

선택 사항:
- ✅ **Hosting** 선택
- 프로젝트 선택 (방금 생성한 프로젝트)
- **Public directory**: `build`
- **Single-page app**: `Yes`
- **Automatic builds**: `No`

### 4단계: 백엔드 서버 배포 (필수)

Firebase Hosting은 프론트엔드만 서빙하므로, 백엔드는 별도로 배포해야 합니다.

**옵션 A: Railway (무료 티어) - 추천**
1. https://railway.app 접속
2. GitHub 연동
3. 백엔드 프로젝트 배포
4. URL 확인 (예: `https://your-app.railway.app`)

**옵션 B: Render (무료 티어)**
1. https://render.com 접속
2. Web Service 생성
3. 백엔드 배포

**옵션 C: VPS**
- DigitalOcean, Linode 등 사용

### 5단계: 프론트엔드 빌드 및 배포

```bash
cd admin-web

# 백엔드 URL 설정 (옵션 4에서 얻은 URL)
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

### 6단계: 접속!

배포 완료 후 표시된 URL로 접속:
```
https://your-project.web.app
```

## ✅ 완료!

이제 인터넷 어디서든 접속할 수 있습니다!

## 🔄 업데이트 방법

```bash
cd admin-web
npm run build
firebase deploy --only hosting
```

또는 간단하게:
```bash
npm run deploy
```

## 🔒 보안 주의사항

1. **기본 비밀번호 변경**: `admin123` → 강력한 비밀번호로 변경
2. **SECRET_KEY 변경**: 백엔드 `.env` 파일에서 변경
3. **CORS 설정**: 백엔드에서 Firebase 도메인 허용

## 💡 팁

- Firebase는 자동으로 HTTPS를 제공합니다
- 커스텀 도메인도 무료로 연결 가능합니다
- 배포는 몇 초 안에 완료됩니다

