# 인터넷 접속 설정 가이드

누구든지 인터넷을 통해 접속할 수 있도록 설정하는 방법입니다.

## 🚀 옵션 비교

### 옵션 1: ngrok (가장 간단) ⭐ 추천
- **장점**: 5분 안에 설정 가능, 별도 서버 불필요
- **단점**: 무료 버전은 URL이 매번 변경됨
- **비용**: 무료 (유료 플랜도 있음)

### 옵션 2: VPS (가장 안정적) ⭐⭐ 추천
- **장점**: 고정 IP, 도메인 연결 가능, 안정적
- **단점**: 월 비용 발생 (약 $5-20)
- **비용**: 월 $5-20

### 옵션 3: 클라우드 배포 (확장 가능)
- **장점**: 자동 확장, 관리 편리
- **단점**: 설정 복잡, 비용 높음
- **비용**: 월 $10-50+

## 📋 옵션 1: ngrok 사용 (가장 간단)

### 1단계: ngrok 설치

```bash
# macOS
brew install ngrok

# 또는 직접 다운로드
# https://ngrok.com/download
```

### 2단계: ngrok 계정 생성 및 토큰 설정

1. https://ngrok.com 에서 무료 계정 생성
2. 대시보드에서 인증 토큰 복사
3. 토큰 설정:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3단계: 백엔드 터널 생성

**터미널 1: 백엔드 서버 실행**
```bash
cd backend
source venv/bin/activate
python run.py
```

**터미널 2: ngrok 터널 (백엔드)**
```bash
ngrok http 8000
```

백엔드 URL이 표시됩니다 (예: `https://abc123.ngrok.io`)

### 4단계: 프론트엔드 터널 생성

**터미널 3: 관리자 웹 실행**
```bash
cd admin-web
npm start
```

**터미널 4: ngrok 터널 (프론트엔드)**
```bash
ngrok http 3000
```

프론트엔드 URL이 표시됩니다 (예: `https://xyz789.ngrok.io`)

### 5단계: 프론트엔드 API URL 설정

프론트엔드가 백엔드 ngrok URL을 사용하도록 설정:

**방법 A: 환경 변수 사용**

`admin-web/.env` 파일 생성:
```env
REACT_APP_API_URL=https://abc123.ngrok.io/api
```

그리고 `npm start` 재시작

**방법 B: 빌드 시 설정**

```bash
cd admin-web
REACT_APP_API_URL=https://abc123.ngrok.io/api npm run build
```

### 6단계: 접속

브라우저에서 프론트엔드 ngrok URL로 접속:
```
https://xyz789.ngrok.io
```

### ⚠️ 주의사항

- ngrok 무료 버전은 URL이 매번 변경됩니다
- 고정 URL이 필요하면 유료 플랜 사용 ($8/월)
- HTTPS가 자동으로 설정됩니다

## 📋 옵션 2: VPS 배포 (안정적)

### 추천 VPS 서비스

- **DigitalOcean**: $6/월부터
- **Linode**: $5/월부터
- **Vultr**: $2.50/월부터
- **AWS Lightsail**: $3.50/월부터

### 1단계: VPS 생성

1. VPS 서비스에서 서버 생성
2. Ubuntu 22.04 LTS 선택
3. SSH 키 설정

### 2단계: 서버 접속 및 설정

```bash
# SSH로 서버 접속
ssh root@your-server-ip

# 시스템 업데이트
apt update && apt upgrade -y

# 필수 패키지 설치
apt install -y python3 python3-pip python3-venv nodejs npm nginx git

# 프로젝트 클론 또는 업로드
git clone YOUR_REPO_URL
# 또는 scp로 파일 업로드
```

### 3단계: 백엔드 설정

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 환경 변수 설정
cat > .env << EOF
DATABASE_URL=sqlite:///./nexo_crm.db
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
EOF

# 데이터베이스 초기화
python -m app.db.init_db

# systemd 서비스 등록
sudo nano /etc/systemd/system/nexo-backend.service
```

서비스 파일 내용:
```ini
[Unit]
Description=Nexo Korea CRM Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/고객관리/backend
Environment="PATH=/root/고객관리/backend/venv/bin"
ExecStart=/root/고객관리/backend/venv/bin/python run-production.py
Restart=always

[Install]
WantedBy=multi-user.target
```

활성화:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nexo-backend
sudo systemctl start nexo-backend
```

### 4단계: 프론트엔드 빌드 및 배포

```bash
cd admin-web
npm install
npm run build

# nginx 설정
sudo cp nginx/nexo-admin.conf /etc/nginx/sites-available/nexo-admin
sudo ln -s /etc/nginx/sites-available/nexo-admin /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/nexo-admin
# 경로 수정

sudo nginx -t
sudo systemctl reload nginx
```

### 5단계: 도메인 연결 (선택사항)

1. 도메인 구매 (예: namecheap, cloudflare)
2. DNS A 레코드 설정: `@ -> 서버IP주소`
3. nginx 설정에 도메인 추가

### 6단계: HTTPS 설정 (Let's Encrypt)

```bash
# certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

## 📋 옵션 3: 클라우드 배포

### AWS 배포

1. **EC2 인스턴스 생성**
2. **Elastic Beanstalk 사용** (간단)
3. **ECS/Fargate 사용** (컨테이너)

### Google Cloud 배포

1. **Compute Engine** 사용
2. **Cloud Run** 사용 (서버리스)
3. **App Engine** 사용

### Azure 배포

1. **App Service** 사용
2. **Container Instances** 사용

## 🔒 보안 설정 (필수!)

### 1. 기본 비밀번호 변경

로그인 후 관리자 계정 관리에서 `admin123` 비밀번호를 반드시 변경하세요!

### 2. 방화벽 설정

```bash
# UFW 사용 (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. SECRET_KEY 변경

`.env` 파일에서 강력한 SECRET_KEY 생성:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
```

### 4. 접근 제한 (선택사항)

특정 IP만 허용하려면 nginx 설정에서:

```nginx
location / {
    allow 192.168.1.0/24;  # 허용할 IP 범위
    deny all;
}
```

## 🚀 빠른 시작 (ngrok)

가장 빠른 방법:

```bash
# 1. ngrok 설치
brew install ngrok

# 2. ngrok 계정 생성 후 토큰 설정
ngrok config add-authtoken YOUR_TOKEN

# 3. 백엔드 실행 (터미널 1)
cd backend && source venv/bin/activate && python run.py

# 4. 백엔드 터널 (터미널 2)
ngrok http 8000
# URL 복사 (예: https://abc123.ngrok.io)

# 5. 프론트엔드 실행 (터미널 3)
cd admin-web && npm start

# 6. 프론트엔드 터널 (터미널 4)
ngrok http 3000
# URL 복사 (예: https://xyz789.ngrok.io)

# 7. 프론트엔드 API URL 설정
cd admin-web
echo "REACT_APP_API_URL=https://abc123.ngrok.io/api" > .env
npm start
```

## 📝 체크리스트

### ngrok 사용 시:
- [ ] ngrok 설치
- [ ] ngrok 계정 생성 및 토큰 설정
- [ ] 백엔드 서버 실행
- [ ] 백엔드 ngrok 터널 생성
- [ ] 프론트엔드 서버 실행
- [ ] 프론트엔드 ngrok 터널 생성
- [ ] API URL 설정
- [ ] 접속 테스트
- [ ] 비밀번호 변경

### VPS 배포 시:
- [ ] VPS 서버 생성
- [ ] SSH 접속 설정
- [ ] 백엔드 배포
- [ ] 프론트엔드 빌드 및 배포
- [ ] nginx 설정
- [ ] 도메인 연결 (선택)
- [ ] HTTPS 설정 (Let's Encrypt)
- [ ] 방화벽 설정
- [ ] 비밀번호 변경
- [ ] SECRET_KEY 변경

## 💡 추천 방법

**초기 테스트/소규모 사용**: ngrok (무료, 빠름)
**안정적인 운영**: VPS + 도메인 + HTTPS (월 $5-10)

어떤 방법을 사용하시겠습니까?

