# 배포 가이드

넥소코리아 고객관리 시스템을 배포하는 방법입니다.

## 📋 배포 옵션

### 옵션 1: 프로덕션 빌드 (로컬 서버) - 추천

사무실 내부에서 사용하는 경우 가장 간단한 방법입니다.

#### 백엔드 배포

1. **서버 컴퓨터에서 백엔드 실행:**
   ```bash
   cd backend
   source venv/bin/activate
   python run.py
   ```

2. **시스템 서비스로 등록 (선택사항, 자동 시작):**
   
   **macOS (launchd):**
   ```bash
   # ~/Library/LaunchAgents/com.nexo.backend.plist 생성
   ```
   
   **Linux (systemd):**
   ```bash
   # /etc/systemd/system/nexo-backend.service 생성
   ```

#### 프론트엔드 배포

1. **프로덕션 빌드:**
   ```bash
   cd admin-web
   npm run build
   ```
   
   `build/` 폴더에 최적화된 파일이 생성됩니다.

2. **정적 파일 서버 실행:**
   
   **옵션 A: Python으로 서빙 (간단)**
   ```bash
   cd admin-web/build
   python3 -m http.server 3000
   ```
   
   **옵션 B: nginx 사용 (권장)**
   ```bash
   # nginx 설치 후 설정
   sudo apt-get install nginx  # Ubuntu/Debian
   # 또는
   brew install nginx  # macOS
   ```

### 옵션 2: Docker 배포

컨테이너화된 배포 방법입니다.

#### Dockerfile 생성

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**admin-web/Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml 생성

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/nexo_crm.db:/app/nexo_crm.db
      - ./backend/uploads:/app/uploads
    environment:
      - DATABASE_URL=sqlite:///./nexo_crm.db
      - SECRET_KEY=your-secret-key-here

  frontend:
    build: ./admin-web
    ports:
      - "3000:80"
    depends_on:
      - backend
```

#### 실행

```bash
docker-compose up -d
```

### 옵션 3: 클라우드 배포

#### AWS 배포

1. **EC2 인스턴스 생성**
2. **백엔드 배포:**
   - EC2에 Python 환경 설정
   - 백엔드 코드 업로드
   - systemd로 서비스 등록

3. **프론트엔드 배포:**
   - S3 + CloudFront 사용
   - 또는 EC2에 nginx 설치하여 서빙

#### Google Cloud 배포

1. **Compute Engine 인스턴스 생성**
2. **Cloud Run 사용 (서버리스)**
3. **App Engine 사용**

#### Azure 배포

1. **App Service 사용**
2. **Container Instances 사용**

### 옵션 4: VPS 배포

DigitalOcean, Linode, Vultr 등의 VPS 사용.

## 🚀 빠른 배포 (프로덕션 빌드)

### 1단계: 백엔드 설정

```bash
cd backend

# 가상환경 활성화
source venv/bin/activate

# 환경 변수 설정 (.env 파일)
cat > .env << EOF
DATABASE_URL=sqlite:///./nexo_crm.db
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
EOF

# 데이터베이스 초기화 (처음 한 번만)
python -m app.db.init_db

# 서버 실행
python run.py
```

### 2단계: 프론트엔드 빌드

```bash
cd admin-web

# 환경 변수 설정 (.env 파일)
cat > .env << EOF
REACT_APP_API_URL=http://서버IP주소:8000/api
EOF

# 프로덕션 빌드
npm run build
```

### 3단계: 정적 파일 서빙

**옵션 A: Python (간단)**
```bash
cd admin-web/build
python3 -m http.server 3000
```

**옵션 B: nginx (권장)**

`/etc/nginx/sites-available/nexo-admin` 파일 생성:
```nginx
server {
    listen 3000;
    server_name _;

    root /path/to/admin-web/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/nexo-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 보안 설정

### 1. 비밀번호 변경

기본 비밀번호(`admin123`)를 반드시 변경하세요.

### 2. SECRET_KEY 변경

```bash
# .env 파일에서
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
```

### 3. HTTPS 설정 (인터넷 접속 시)

**Let's Encrypt 사용:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 4. 방화벽 설정

```bash
# 필요한 포트만 열기
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

## 📦 시스템 서비스 등록 (자동 시작)

### 백엔드 서비스 (systemd)

`/etc/systemd/system/nexo-backend.service` 생성:
```ini
[Unit]
Description=Nexo Korea CRM Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/python run.py
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

### 백엔드 서비스 (macOS launchd)

`~/Library/LaunchAgents/com.nexo.backend.plist` 생성:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nexo.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/backend/venv/bin/python</string>
        <string>/path/to/backend/run.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/backend</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

로드:
```bash
launchctl load ~/Library/LaunchAgents/com.nexo.backend.plist
```

## 📝 배포 체크리스트

### 사전 준비
- [ ] 데이터베이스 백업 (있는 경우)
- [ ] 환경 변수 설정
- [ ] SECRET_KEY 생성 및 설정
- [ ] 기본 비밀번호 변경

### 백엔드
- [ ] 가상환경 설정
- [ ] 패키지 설치
- [ ] 데이터베이스 초기화
- [ ] 서버 실행 테스트
- [ ] 시스템 서비스 등록 (선택)

### 프론트엔드
- [ ] 프로덕션 빌드
- [ ] 정적 파일 서버 설정
- [ ] API URL 설정 확인

### 보안
- [ ] 비밀번호 변경
- [ ] 방화벽 설정
- [ ] HTTPS 설정 (인터넷 접속 시)

### 테스트
- [ ] 로그인 테스트
- [ ] 주요 기능 테스트
- [ ] 네트워크 접속 테스트

## 🔄 업데이트 방법

### 백엔드 업데이트

```bash
cd backend
source venv/bin/activate
git pull  # 또는 코드 업데이트
pip install -r requirements.txt
# 시스템 서비스 사용 시
sudo systemctl restart nexo-backend
```

### 프론트엔드 업데이트

```bash
cd admin-web
git pull  # 또는 코드 업데이트
npm install
npm run build
# nginx 사용 시
sudo systemctl reload nginx
```

## 💡 추천 배포 방법

### 사무실 내부 사용 (2-3명)
- **프로덕션 빌드 + Python HTTP 서버** (가장 간단)
- 또는 **nginx 사용** (더 안정적)

### 더 많은 사용자
- **nginx + systemd 서비스** (권장)
- 또는 **Docker 사용**

### 인터넷 접속 필요
- **VPS + nginx + Let's Encrypt** (HTTPS)
- 또는 **클라우드 서비스** (AWS, GCP, Azure)

## ❓ 문제 해결

### 포트가 이미 사용 중일 때

```bash
# 포트 확인
lsof -i :8000
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### 권한 오류

```bash
# 파일 권한 설정
chmod +x run.py
chmod -R 755 backend
chmod -R 755 admin-web/build
```

### 데이터베이스 오류

```bash
# 데이터베이스 파일 권한 확인
ls -la backend/nexo_crm.db
chmod 644 backend/nexo_crm.db
```

## 📚 추가 리소스

- nginx 설정: https://nginx.org/en/docs/
- systemd 서비스: https://www.freedesktop.org/software/systemd/man/systemd.service.html
- Docker: https://docs.docker.com/

