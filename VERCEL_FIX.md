# Vercel 404 에러 해결 방법

## 🔍 문제 원인

404 에러가 발생하는 주요 원인:
1. **Root Directory 설정 누락**: Vercel이 프로젝트 루트에서 시작하지만, 실제 앱은 `admin-web` 폴더에 있습니다
2. **빌드 설정 오류**: 빌드 명령어나 출력 디렉토리가 잘못 설정되었을 수 있습니다

## ✅ 해결 방법

### 방법 1: Vercel 대시보드에서 설정 (추천)

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Settings → General**
   - **Root Directory**: `admin-web` 설정
   - 저장

3. **Settings → Build & Development Settings**
   - **Framework Preset**: Create React App (자동 감지)
   - **Build Command**: `npm run build` (자동 감지)
   - **Output Directory**: `build` (자동 감지)
   - **Install Command**: `npm install` (자동 감지)

4. **재배포**
   - Deployments → 최신 배포 → "Redeploy"

### 방법 2: vercel.json 수정 (이미 완료됨)

`admin-web/vercel.json` 파일을 더 간단하게 수정했습니다:
- 불필요한 `builds` 섹션 제거
- Create React App 자동 감지 활용

### 방법 3: 프로젝트 루트에 vercel.json 생성

만약 Root Directory를 설정하지 않으려면, 프로젝트 루트에 `vercel.json`을 만들 수도 있습니다:

```json
{
  "buildCommand": "cd admin-web && npm run build",
  "outputDirectory": "admin-web/build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

하지만 **방법 1 (Root Directory 설정)이 가장 깔끔합니다.**

## 📝 체크리스트

배포 전 확인사항:

- [ ] Vercel 대시보드에서 Root Directory가 `admin-web`으로 설정되어 있는지 확인
- [ ] Build Command가 `npm run build`인지 확인
- [ ] Output Directory가 `build`인지 확인
- [ ] `admin-web/package.json`에 `build` 스크립트가 있는지 확인
- [ ] Git에 `admin-web/vercel.json`이 커밋되어 있는지 확인

## 🔄 재배포 방법

### 자동 재배포
```bash
# Git에 푸시하면 자동으로 재배포됩니다
git add admin-web/vercel.json
git commit -m "Fix Vercel configuration"
git push
```

### 수동 재배포
1. Vercel 대시보드 → Deployments
2. 최신 배포 클릭
3. "Redeploy" 버튼 클릭

## 🧪 로컬 빌드 테스트

배포 전에 로컬에서 빌드가 잘 되는지 확인:

```bash
cd admin-web
npm install
npm run build
```

빌드가 성공하면 `build/` 폴더가 생성됩니다.

## ❓ 여전히 문제가 있다면

1. **Vercel 대시보드에서 로그 확인**
   - Deployments → 실패한 배포 클릭
   - "Build Logs" 탭에서 에러 메시지 확인

2. **일반적인 문제들**
   - `package.json`에 `build` 스크립트가 없음
   - `node_modules`가 Git에 포함되어 있음 (`.gitignore` 확인)
   - 환경 변수 누락

3. **완전히 새로 시작**
   - Vercel 대시보드에서 프로젝트 삭제
   - 새로 프로젝트 생성
   - Root Directory를 `admin-web`으로 설정
   - 배포

## 💡 팁

- Vercel은 Create React App을 자동으로 감지하므로, `vercel.json`이 없어도 작동합니다
- Root Directory만 올바르게 설정하면 대부분의 문제가 해결됩니다
- 빌드 로그를 항상 확인하세요 - 거기에 정확한 에러 원인이 있습니다

