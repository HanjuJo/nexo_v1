# nginx 빠른 설정 가이드

## 현재 위치 확인

현재 `admin-web` 디렉토리에 있다면, 프로젝트 루트로 이동하세요:

```bash
cd ..
```

또는 절대 경로로:

```bash
cd /Users/soriul79/Desktop/넥소코리아/고객관리
```

## 단계별 설정

### 1단계: 프로젝트 루트로 이동

```bash
cd /Users/soriul79/Desktop/넥소코리아/고객관리
```

### 2단계: 프론트엔드 빌드 (아직 안 했다면)

```bash
cd admin-web
npm run build
cd ..
```

### 3단계: nginx 설정 파일 복사

**macOS:**
```bash
sudo mkdir -p /usr/local/etc/nginx/servers
sudo cp nginx/nexo-admin.conf /usr/local/etc/nginx/servers/nexo-admin.conf
```

### 4단계: 경로 수정

```bash
sudo nano /usr/local/etc/nginx/servers/nexo-admin.conf
```

다음 줄을 찾아서:
```nginx
root /path/to/admin-web/build;
```

다음으로 변경:
```nginx
root /Users/soriul79/Desktop/넥소코리아/고객관리/admin-web/build;
```

저장: `Ctrl + O`, `Enter`, `Ctrl + X`

### 5단계: nginx 설정 테스트

```bash
sudo nginx -t
```

### 6단계: nginx 재시작

```bash
sudo nginx -s reload
```

## 완료!

이제 `http://localhost:3000`으로 접속할 수 있습니다.

## 백엔드 서버 실행

새 터미널에서:

```bash
cd /Users/soriul79/Desktop/넥소코리아/고객관리/backend
source venv/bin/activate
python run.py
```

## 문제 해결

### nginx가 실행되지 않을 때

```bash
# nginx 시작
sudo nginx

# 상태 확인
ps aux | grep nginx
```

### 포트 3000이 이미 사용 중일 때

```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### 설정 파일을 찾을 수 없을 때

프로젝트 루트에서 실행하는지 확인:

```bash
pwd
# 출력: /Users/soriul79/Desktop/넥소코리아/고객관리

ls nginx/
# nexo-admin.conf 파일이 보여야 함
```

