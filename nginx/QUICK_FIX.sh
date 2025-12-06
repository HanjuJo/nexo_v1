#!/bin/bash

# nginx 빠른 수정 스크립트
# 사용법: 이 스크립트의 명령어를 터미널에서 하나씩 실행하세요

PROJECT_DIR="/Users/soriul79/Desktop/넥소코리아/고객관리"

echo "======================================"
echo "nginx 빠른 수정"
echo "======================================"
echo ""
echo "다음 명령어를 순서대로 실행하세요:"
echo ""

echo "1. 디렉토리 생성:"
echo "   sudo mkdir -p /usr/local/var/log/nginx"
echo "   sudo mkdir -p /usr/local/var/run"
echo ""

echo "2. nginx 기본 설정 파일 복사:"
echo "   sudo cp $PROJECT_DIR/nginx/nginx.conf /usr/local/etc/nginx/nginx.conf"
echo ""

echo "3. 서버 설정 파일 복사:"
echo "   sudo mkdir -p /usr/local/etc/nginx/servers"
echo "   sudo cp $PROJECT_DIR/nginx/nexo-admin.conf /usr/local/etc/nginx/servers/nexo-admin.conf"
echo ""

echo "4. 경로 수정 (nano 편집기 사용):"
echo "   sudo nano /usr/local/etc/nginx/servers/nexo-admin.conf"
echo "   '/path/to/admin-web/build' 를 찾아서 다음으로 변경:"
echo "   '$PROJECT_DIR/admin-web/build'"
echo "   저장: Ctrl+O, Enter, Ctrl+X"
echo ""

echo "5. 프론트엔드 빌드 (아직 안 했다면):"
echo "   cd $PROJECT_DIR/admin-web && npm run build && cd .."
echo ""

echo "6. nginx 테스트 및 시작:"
echo "   sudo nginx -t"
echo "   sudo nginx"
echo ""

echo "7. 접속: http://localhost:3000"
echo ""

