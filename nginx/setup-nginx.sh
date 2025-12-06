#!/bin/bash

# nginx 설정 스크립트
# 사용법: sudo ./nginx/setup-nginx.sh

set -e

echo "======================================"
echo "넥소코리아 고객관리 시스템 - nginx 설정"
echo "======================================"

# 현재 디렉토리 확인
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "프로젝트 디렉토리: $PROJECT_DIR"

# nginx 설치 확인
if ! command -v nginx &> /dev/null; then
    echo "nginx가 설치되어 있지 않습니다."
    echo "설치 중..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y nginx
        elif command -v yum &> /dev/null; then
            sudo yum install -y nginx
        else
            echo "지원되지 않는 Linux 배포판입니다."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install nginx
        else
            echo "Homebrew가 설치되어 있지 않습니다."
            echo "Homebrew 설치: https://brew.sh"
            exit 1
        fi
    else
        echo "지원되지 않는 운영체제입니다."
        exit 1
    fi
fi

echo "✓ nginx 설치 확인 완료"

# 프론트엔드 빌드 확인
if [ ! -d "$PROJECT_DIR/admin-web/build" ]; then
    echo "프론트엔드가 빌드되지 않았습니다."
    echo "빌드 중..."
    cd "$PROJECT_DIR/admin-web"
    npm install
    npm run build
    echo "✓ 프론트엔드 빌드 완료"
fi

# nginx 설정 파일 생성
NGINX_CONF="$SCRIPT_DIR/nexo-admin.conf"
NGINX_TARGET=""

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    NGINX_TARGET="/etc/nginx/sites-available/nexo-admin"
    NGINX_ENABLED="/etc/nginx/sites-enabled/nexo-admin"
    
    # 설정 파일 복사
    sudo cp "$NGINX_CONF" "$NGINX_TARGET"
    
    # 경로 수정
    sudo sed -i "s|/path/to/admin-web/build|$PROJECT_DIR/admin-web/build|g" "$NGINX_TARGET"
    
    # 심볼릭 링크 생성
    if [ ! -L "$NGINX_ENABLED" ]; then
        sudo ln -s "$NGINX_TARGET" "$NGINX_ENABLED"
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    NGINX_TARGET="/usr/local/etc/nginx/servers/nexo-admin.conf"
    
    # nginx 서버 디렉토리 생성
    sudo mkdir -p /usr/local/etc/nginx/servers
    
    # 설정 파일 복사
    sudo cp "$NGINX_CONF" "$NGINX_TARGET"
    
    # 경로 수정
    sudo sed -i '' "s|/path/to/admin-web/build|$PROJECT_DIR/admin-web/build|g" "$NGINX_TARGET"
fi

echo "✓ nginx 설정 파일 생성 완료: $NGINX_TARGET"

# nginx 설정 테스트
echo "nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo "✓ nginx 설정 테스트 성공"
else
    echo "✗ nginx 설정 테스트 실패"
    exit 1
fi

# nginx 재시작
echo "nginx 재시작 중..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl reload nginx
    echo "✓ nginx 재시작 완료"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    sudo nginx -s reload
    echo "✓ nginx 재시작 완료"
fi

echo ""
echo "======================================"
echo "설정 완료!"
echo "======================================"
echo ""
echo "접속 주소:"
echo "  - 로컬: http://localhost:3000"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  - 네트워크: http://$(hostname -I | awk '{print $1}'):3000"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - 네트워크: http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):3000"
fi
echo ""
echo "백엔드 서버가 실행 중인지 확인하세요:"
echo "  cd backend && source venv/bin/activate && python run.py"
echo ""
