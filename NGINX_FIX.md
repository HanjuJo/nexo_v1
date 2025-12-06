# nginx 설정 오류 해결 가이드

nginx 기본 설정 파일이 없어서 발생한 오류를 해결하는 방법입니다.

## 🔧 해결 방법

터미널에서 다음 명령어를 **순서대로** 실행하세요:

### 1단계: 필요한 디렉토리 생성

```bash
sudo mkdir -p /usr/local/var/log/nginx
sudo mkdir -p /usr/local/var/run
```

### 2단계: nginx 기본 설정 파일 복사

```bash
cd /Users/soriul79/Desktop/넥소코리아/고객관리
sudo cp nginx/nginx.conf /usr/local/etc/nginx/nginx.conf
```

### 3단계: mime.types 파일 확인/생성

Homebrew nginx의 mime.types 파일 위치 확인:

```bash
# Homebrew가 /opt/homebrew에 설치된 경우
ls /opt/homebrew/etc/nginx/mime.types

# 또는 /usr/local에 설치된 경우
ls /usr/local/etc/nginx/mime.types
```

파일이 있으면 복사:

```bash
# /opt/homebrew에 있는 경우
sudo cp /opt/homebrew/etc/nginx/mime.types /usr/local/etc/nginx/mime.types

# 또는 /usr/local에 있는 경우 (이미 있을 수 있음)
# sudo cp /usr/local/etc/nginx/mime.types /usr/local/etc/nginx/mime.types
```

파일이 없으면 기본 mime.types 생성:

```bash
cat > /tmp/mime.types << 'EOF'
types {
    text/html                             html htm shtml;
    text/css                              css;
    text/xml                              xml;
    image/gif                             gif;
    image/jpeg                            jpeg jpg;
    application/javascript                js;
    application/json                      json;
    application/xml                       xml;
    image/png                             png;
    image/svg+xml                         svg svgz;
    text/plain                            txt;
    text/x-component                      htc;
    text/mathml                           mml;
    image/x-icon                          ico;
    image/x-jng                           jng;
    image/vnd.wap.wbmp                    wbmp;
    application/java-archive              jar war ear;
    application/mac-binhex40              hqx;
    application/pdf                       pdf;
    application/x-cocoa                   cco;
    application/x-java-archive-diff       jardiff;
    application/x-java-jnlp-file          jnlp;
    application/x-makeself                run;
    application/x-perl                    pl pm;
    application/x-pilot                   prc pdb;
    application/x-rar-compressed         rar;
    application/x-redhat-package-manager  rpm;
    application/x-sea                     sea;
    application/x-shockwave-flash         swf;
    application/x-stuffit                 sit;
    application/x-tcl                     tcl tk;
    application/x-x509-ca-cert            der pem crt;
    application/x-xpinstall               xpi;
    application/xhtml+xml                 xhtml;
    application/zip                       zip;
    application/octet-stream              bin exe dll;
    application/octet-stream              deb;
    application/octet-stream              dmg;
    application/octet-stream              iso img;
    application/octet-stream              msi msp msm;
    audio/midi                            mid midi kar;
    audio/mpeg                            mp3;
    audio/ogg                             ogg;
    audio/x-m4a                           m4a;
    audio/x-realaudio                     ra;
    video/3gpp                            3gpp 3gp;
    video/mp4                             mp4;
    video/mpeg                            mpeg mpg;
    video/quicktime                       mov;
    video/webm                            webm;
    video/x-flv                           flv;
    video/x-m4v                           m4v;
    video/x-msvideo                       avi;
    video/x-ms-wmv                        wmv;
    video/x-ms-asf                        asx asf;
}
EOF

sudo cp /tmp/mime.types /usr/local/etc/nginx/mime.types
```

### 4단계: 서버 설정 파일 복사

```bash
sudo mkdir -p /usr/local/etc/nginx/servers
sudo cp nginx/nexo-admin.conf /usr/local/etc/nginx/servers/nexo-admin.conf
```

### 5단계: 경로 수정

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

### 6단계: 프론트엔드 빌드 (아직 안 했다면)

```bash
cd admin-web
npm run build
cd ..
```

### 7단계: nginx 설정 테스트

```bash
sudo nginx -t
```

성공 메시지가 나와야 합니다:
```
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful
```

### 8단계: nginx 시작

```bash
sudo nginx
```

### 9단계: 접속 확인

브라우저에서 `http://localhost:3000` 접속

## ✅ 완료!

이제 nginx가 정상적으로 실행됩니다.

## 🔄 nginx 재시작

설정을 변경한 후:

```bash
sudo nginx -s reload
```

nginx 중지:

```bash
sudo nginx -s stop
```

nginx 상태 확인:

```bash
ps aux | grep nginx
```

## ❓ 문제 해결

### 포트가 이미 사용 중일 때

```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
sudo kill -9 <PID>
```

### 권한 오류

```bash
# 로그 디렉토리 권한 확인
ls -la /usr/local/var/log/nginx

# 필요시 권한 수정
sudo chown -R $(whoami) /usr/local/var/log/nginx
```

