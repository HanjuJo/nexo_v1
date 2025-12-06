#!/bin/bash

# nginx 수동 설정 스크립트
# 사용법: 이 스크립트의 명령어를 하나씩 실행하세요

echo "======================================"
echo "nginx 수동 설정 가이드"
echo "======================================"
echo ""
echo "다음 명령어를 순서대로 실행하세요:"
echo ""

PROJECT_DIR="/Users/soriul79/Desktop/넥소코리아/고객관리"

echo "1. 로그 디렉토리 생성:"
echo "   sudo mkdir -p /usr/local/var/log/nginx"
echo "   sudo mkdir -p /usr/local/var/run"
echo ""

echo "2. nginx 기본 설정 파일 복사:"
echo "   sudo cp $PROJECT_DIR/nginx/nginx.conf /usr/local/etc/nginx/nginx.conf"
echo ""

echo "3. mime.types 파일 생성 (기본 설정):"
echo "   sudo cp /opt/homebrew/etc/nginx/mime.types /usr/local/etc/nginx/mime.types 2>/dev/null || echo 'mime.types는 자동으로 생성됩니다'"
echo ""

echo "4. 서버 설정 파일 복사:"
echo "   sudo mkdir -p /usr/local/etc/nginx/servers"
echo "   sudo cp $PROJECT_DIR/nginx/nexo-admin.conf /usr/local/etc/nginx/servers/nexo-admin.conf"
echo ""

echo "5. 경로 수정:"
echo "   sudo nano /usr/local/etc/nginx/servers/nexo-admin.conf"
echo "   /path/to/admin-web/build 를 다음으로 변경:"
echo "   $PROJECT_DIR/admin-web/build"
echo ""

echo "6. 프론트엔드 빌드 (아직 안 했다면):"
echo "   cd $PROJECT_DIR/admin-web"
echo "   npm run build"
echo ""

echo "7. nginx 설정 테스트:"
echo "   sudo nginx -t"
echo ""

echo "8. nginx 시작:"
echo "   sudo nginx"
echo ""

echo "9. 접속 확인:"
echo "   http://localhost:3000"
echo ""

