# 빠른 배포 가이드

가장 간단한 방법으로 배포하는 방법입니다.

## 🚀 5분 안에 배포하기

### 1단계: 백엔드 실행

```bash
cd backend
source venv/bin/activate
python run.py
```

백엔드가 `http://0.0.0.0:8000`에서 실행됩니다.

### 2단계: 프론트엔드 빌드 및 실행

**새 터미널에서:**

```bash
cd admin-web

# 프로덕션 빌드
npm run build

# 빌드된 파일 서빙
cd build
python3 -m http.server 3000
```

### 3단계: 접속

브라우저에서:
- `http://localhost:3000` (서버 컴퓨터)
- `http://서버IP주소:3000` (다른 컴퓨터)

## ✅ 완료!

이제 프로덕션 모드로 실행 중입니다.

## 🔄 업데이트 방법

코드를 업데이트한 후:

```bash
# 프론트엔드만 업데이트
cd admin-web
npm run build
cd build
python3 -m http.server 3000
```

## 💡 더 안정적인 방법

Python HTTP 서버 대신 nginx를 사용하면 더 안정적입니다:

```bash
# nginx 설치 (Ubuntu/Debian)
sudo apt-get install nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/nexo-admin
```

설정 내용:
```nginx
server {
    listen 3000;
    root /path/to/admin-web/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/nexo-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📝 자동 시작 설정

서버가 재부팅될 때 자동으로 시작되도록 설정하려면 `DEPLOYMENT_GUIDE.md`를 참고하세요.

