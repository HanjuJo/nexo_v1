# Vercel 배포 가이드

Vercel을 사용하여 인터넷에서 접속 가능하도록 배포하는 방법입니다.

## 🚀 빠른 시작

### 1단계: Vercel에 프로젝트 연결

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - 또는 "Import Git Repository" 클릭

3. **저장소 선택**
   - GitHub 저장소 선택
   - 또는 Git 저장소 URL 입력

4. **프로젝트 설정**
   - **Framework Preset**: Create React App 선택
   - **Root Directory**: `admin-web` (또는 프로젝트 구조에 맞게)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **환경 변수 설정**
   - "Environment Variables" 섹션에서 추가:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```
   - 백엔드 URL은 나중에 설정해도 됩니다

6. **배포**
   - "Deploy" 클릭

### 2단계: 백엔드 서버 배포 (필수!)

Vercel은 프론트엔드만 서빙하므로, 백엔드는 별도로 배포해야 합니다.

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

6. **URL 확인**
   - 배포 완료 후 URL 확인 (예: `https://your-app.railway.app`)

#### 옵션 B: Render (무료 티어)

1. https://render.com 접속
2. "New Web Service" 생성
3. GitHub 저장소 연결
4. 설정 후 배포

#### 옵션 C: Vercel Serverless Functions (고급)

백엔드를 Vercel Functions로 마이그레이션 (복잡함, 권장하지 않음)

### 3단계: 환경 변수 설정

백엔드 URL을 확인한 후:

1. **Vercel 대시보드에서**
   - 프로젝트 → Settings → Environment Variables
   - `REACT_APP_API_URL` 추가:
     ```
     https://your-backend-url.railway.app/api
     ```

2. **재배포**
   - Deployments → 최신 배포 → "Redeploy"

또는 로컬에서:

```bash
cd admin-web

# .env.local 파일 생성
echo "REACT_APP_API_URL=https://your-backend-url.railway.app/api" > .env.local

# Git에 커밋 및 푸시
git add .env.local
git commit -m "Add API URL"
git push
```

Vercel이 자동으로 재배포합니다.

### 4단계: 백엔드 CORS 설정

백엔드에서 Vercel 도메인을 허용하도록 설정:

`backend/app/core/config.py`:
```python
ALLOWED_ORIGINS: List[str] = [
    "https://your-project.vercel.app",
    "https://your-project.vercel.app",
]
```

또는 모든 origin 허용 (개발용):
```python
ALLOWED_ORIGINS: List[str] = []  # 빈 리스트 = 모든 origin 허용
```

백엔드 서버 재시작 필요

## ✅ 완료!

이제 인터넷 어디서든 접속할 수 있습니다:
- https://your-project.vercel.app

## 🔒 보안 설정 (필수!)

### 1. 기본 비밀번호 변경
배포 후 즉시 `admin123` 비밀번호를 변경하세요!

### 2. SECRET_KEY 변경
백엔드 `.env` 파일에서:
```bash
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
```

## 🔄 업데이트 방법

코드를 수정하고 Git에 푸시하면 Vercel이 자동으로 재배포합니다:

```bash
git add .
git commit -m "Update"
git push
```

또는 수동 재배포:
- Vercel 대시보드 → Deployments → "Redeploy"

## 💡 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가
3. DNS 레코드 추가 (Vercel이 안내)
4. SSL 인증서 자동 발급

## 📝 체크리스트

- [ ] Vercel 계정 생성 및 로그인
- [ ] GitHub 저장소 연결
- [ ] Vercel 프로젝트 생성
- [ ] 백엔드 서버 배포 (Railway, Render 등)
- [ ] 백엔드 URL 확인
- [ ] Vercel 환경 변수 설정 (REACT_APP_API_URL)
- [ ] 배포 완료 확인
- [ ] 백엔드 CORS 설정
- [ ] 접속 테스트
- [ ] 기본 비밀번호 변경
- [ ] SECRET_KEY 변경

## 🎯 Vercel의 장점

- ✅ 무료 호스팅
- ✅ 자동 HTTPS
- ✅ 글로벌 CDN
- ✅ 자동 배포 (Git 푸시 시)
- ✅ 프리뷰 배포 (PR마다)
- ✅ 커스텀 도메인 지원
- ✅ 환경 변수 관리
- ✅ 빠른 배포 속도

## ❓ 문제 해결

### 빌드 실패

- Vercel 대시보드 → Deployments → 실패한 배포 클릭 → 로그 확인
- 로컬에서 빌드 테스트: `npm run build`

### 환경 변수 적용 안 됨

- 환경 변수 설정 후 재배포 필요
- Production, Preview, Development 환경별로 설정 가능

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 환경 변수 `REACT_APP_API_URL` 확인

## 📚 참고 자료

- Vercel 공식 문서: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli

