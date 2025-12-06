# Vercel 빠른 배포 가이드

## 🚀 3단계로 배포하기

### 1단계: Vercel에 프로젝트 연결

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - 또는 "Import Git Repository" 클릭

3. **저장소 선택**
   - GitHub 저장소 선택
   - 또는 Git 저장소 URL 입력:
     ```
     https://github.com/your-username/your-repo
     ```

4. **프로젝트 설정**
   - **Framework Preset**: Create React App
   - **Root Directory**: `admin-web`
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `build` (자동 감지됨)

5. **배포**
   - "Deploy" 클릭
   - 배포 완료까지 1-2분 소요

### 2단계: 백엔드 서버 배포

**Railway 사용 (추천):**

1. https://railway.app 접속
2. "New Project" → "Deploy from GitHub repo"
3. 백엔드 저장소 선택
4. 환경 변수 설정
5. 배포 완료 후 URL 확인

### 3단계: 환경 변수 설정 및 재배포

1. **Vercel 대시보드에서**
   - 프로젝트 → Settings → Environment Variables
   - `REACT_APP_API_URL` 추가:
     ```
     https://your-backend-url.railway.app/api
     ```

2. **재배포**
   - Deployments → 최신 배포 → "Redeploy"

## ✅ 완료!

이제 인터넷 어디서든 접속할 수 있습니다!

## 🔄 자동 배포

Git에 푸시하면 자동으로 재배포됩니다:

```bash
git add .
git commit -m "Update"
git push
```

## 💡 팁

- Vercel은 무료로 제공됩니다
- HTTPS가 자동으로 설정됩니다
- 커스텀 도메인도 무료로 연결 가능합니다
- PR마다 프리뷰 배포가 자동으로 생성됩니다

