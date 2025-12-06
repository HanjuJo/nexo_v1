# nginx 배포 가이드

nginx를 사용한 프로덕션 배포 방법입니다.

## 🚀 빠른 시작

### 자동 설정 (추천)

```bash
# 스크립트에 실행 권한 부여
chmod +x nginx/setup-nginx.sh

# nginx 설정 및 설치
sudo ./nginx/setup-nginx.sh
```

### 수동 설정

#### 1단계: nginx 설치

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install nginx
```

**macOS:**
```bash
brew install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

#### 2단계: 프론트엔드 빌드

```bash
cd admin-web
npm install
npm run build
```

#### 3단계: nginx 설정 파일 복사

**Linux:**
```bash
sudo cp nginx/nexo-admin.conf /etc/nginx/sites-available/nexo-admin
```

**macOS:**
```bash
sudo mkdir -p /usr/local/etc/nginx/servers
sudo cp nginx/nexo-admin.conf /usr/local/etc/nginx/servers/nexo-admin.conf
```

#### 4단계: 경로 수정

설정 파일에서 `/path/to/admin-web/build`를 실제 경로로 변경:

**Linux:**
```bash
sudo nano /etc/nginx/sites-available/nexo-admin
```

**macOS:**
```bash
sudo nano /usr/local/etc/nginx/servers/nexo-admin.conf
```

다음 줄을 찾아서:
```nginx
root /path/to/admin-web/build;
```

실제 경로로 변경:
```nginx
root /Users/soriul79/Desktop/넥소코리아/고객관리/admin-web/build;
```

#### 5단계: 설정 활성화 (Linux만)

```bash
sudo ln -s /etc/nginx/sites-available/nexo-admin /etc/nginx/sites-enabled/
```

#### 6단계: nginx 설정 테스트

```bash
sudo nginx -t
```

#### 7단계: nginx 재시작

**Linux:**
```bash
sudo systemctl reload nginx
```

**macOS:**
```bash
sudo nginx -s reload
```

## ✅ 완료!

이제 `http://localhost:3000`으로 접속할 수 있습니다.

## 🔧 백엔드 서버 실행

nginx는 프론트엔드만 서빙하고, 백엔드는 별도로 실행해야 합니다:

```bash
cd backend
source venv/bin/activate
python run.py
```

또는 시스템 서비스로 등록 (자동 시작):

```bash
# systemd 서비스 파일 생성 (Linux)
sudo nano /etc/systemd/system/nexo-backend.service
```

내용:
```ini
[Unit]
Description=Nexo Korea CRM Backend
After=network.target

[Service]
Type=simple
User=your-username
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

## 📝 nginx 설정 설명

### 주요 설정

1. **포트 3000에서 서빙**
   ```nginx
   listen 3000;
   ```

2. **정적 파일 서빙**
   ```nginx
   root /path/to/admin-web/build;
   ```

3. **React Router 지원 (SPA)**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

4. **API 프록시**
   ```nginx
   location /api {
       proxy_pass http://localhost:8000;
   }
   ```

## 🔒 보안 설정

### HTTPS 설정 (Let's Encrypt)

```bash
# certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 방화벽 설정

```bash
# 필요한 포트만 열기
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

## 🔄 업데이트 방법

### 프론트엔드 업데이트

```bash
cd admin-web
npm run build
sudo systemctl reload nginx  # 또는 sudo nginx -s reload
```

### 백엔드 업데이트

```bash
cd backend
source venv/bin/activate
git pull  # 또는 코드 업데이트
pip install -r requirements.txt
sudo systemctl restart nexo-backend  # 시스템 서비스 사용 시
```

## ❓ 문제 해결

### nginx가 시작되지 않을 때

```bash
# 상태 확인
sudo systemctl status nginx  # Linux
# 또는
sudo nginx -t  # 설정 테스트
```

### 502 Bad Gateway 오류

- 백엔드 서버가 실행 중인지 확인
- `http://localhost:8000/health` 접속 테스트

### 404 오류 (React Router)

- `try_files` 설정이 올바른지 확인
- 빌드 파일이 올바른 위치에 있는지 확인

### 포트 충돌

```bash
# 포트 사용 확인
sudo lsof -i :3000
sudo lsof -i :8000

# 프로세스 종료
sudo kill -9 <PID>
```

## 📊 로그 확인

```bash
# 접근 로그
sudo tail -f /var/log/nginx/nexo-admin-access.log

# 에러 로그
sudo tail -f /var/log/nginx/nexo-admin-error.log

# nginx 에러 로그 (전체)
sudo tail -f /var/log/nginx/error.log
```

## 💡 팁

1. **성능 최적화**
   - Gzip 압축 활성화 (이미 설정됨)
   - 정적 파일 캐싱 (이미 설정됨)

2. **모니터링**
   - nginx 상태 모니터링
   - 백엔드 서버 상태 모니터링

3. **백업**
   - 데이터베이스 파일 백업
   - 업로드 파일 백업

## 📚 참고 자료

- nginx 공식 문서: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/

