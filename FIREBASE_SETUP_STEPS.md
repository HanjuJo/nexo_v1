# Firebase 설정 단계별 가이드

## 🔧 현재 상황

`.firebaserc` 파일에 실제 프로젝트 ID가 없어서 오류가 발생했습니다.

## ✅ 해결 방법

### 방법 1: Firebase 프로젝트 생성 후 초기화 (추천)

#### 1단계: Firebase Console에서 프로젝트 생성

1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `nexo-crm`)
4. Google Analytics 설정 (선택사항, 건너뛰어도 됨)
5. 프로젝트 생성 완료
6. **프로젝트 ID 확인** (프로젝트 설정에서 확인 가능)

#### 2단계: Firebase 초기화

```bash
cd admin-web

# 기존 .firebaserc 파일 삭제 또는 수정
# (이미 빈 파일로 수정되어 있음)

# Firebase 초기화
firebase init
```

선택 사항:
- ✅ **Hosting** 선택 (스페이스바로 선택, 엔터로 확인)
- **Use an existing project** 선택
- 방금 생성한 프로젝트 선택
- **Public directory**: `build` 입력
- **Single-page app**: `Yes`
- **Automatic builds**: `No`
- **Overwrite index.html**: `No` (이미 있으므로)

### 방법 2: 수동으로 프로젝트 ID 설정

Firebase 프로젝트를 이미 생성했다면:

```bash
cd admin-web

# 프로젝트 ID 확인 (Firebase Console에서)
# 예: nexo-crm-12345

# .firebaserc 파일 수정
nano .firebaserc
```

다음과 같이 수정:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

저장 후:
```bash
firebase init
```

## 📋 다음 단계

Firebase 초기화가 완료되면:

### 1. 백엔드 서버 배포

Firebase Hosting은 프론트엔드만 서빙하므로, 백엔드는 별도로 배포해야 합니다.

**추천: Railway (무료)**
1. https://railway.app 접속
2. GitHub 연동
3. 백엔드 프로젝트 배포
4. URL 확인

### 2. 프론트엔드 빌드 및 배포

```bash
cd admin-web

# 백엔드 URL 설정
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

## ❓ 문제 해결

### 프로젝트를 찾을 수 없을 때

1. Firebase Console에서 프로젝트가 생성되었는지 확인
2. 올바른 Google 계정으로 로그인했는지 확인:
   ```bash
   firebase login --reauth
   ```
3. 프로젝트 목록 확인:
   ```bash
   firebase projects:list
   ```

### 프로젝트 ID를 모를 때

1. Firebase Console 접속
2. 프로젝트 설정 (톱니바퀴 아이콘)
3. "프로젝트 ID" 확인

## 💡 팁

- Firebase 프로젝트 ID는 변경할 수 없습니다
- 프로젝트 이름과 프로젝트 ID는 다릅니다
- 프로젝트 ID는 고유해야 합니다 (이미 사용 중이면 다른 이름 사용)

