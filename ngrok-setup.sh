#!/bin/bash

# ngrok 빠른 설정 스크립트
# 사용법: ./ngrok-setup.sh

echo "======================================"
echo "ngrok 인터넷 접속 설정"
echo "======================================"
echo ""

# ngrok 설치 확인
if ! command -v ngrok &> /dev/null; then
    echo "ngrok이 설치되어 있지 않습니다."
    echo "설치 중..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ngrok
    else
        echo "다음 링크에서 다운로드하세요: https://ngrok.com/download"
        exit 1
    fi
fi

echo "✓ ngrok 설치 확인 완료"
echo ""

# ngrok 토큰 확인
if [ ! -f ~/.ngrok2/ngrok.yml ]; then
    echo "⚠️  ngrok 인증 토큰이 설정되지 않았습니다."
    echo ""
    echo "다음 단계를 진행하세요:"
    echo "1. https://ngrok.com 에서 무료 계정 생성"
    echo "2. 대시보드에서 인증 토큰(Auth Token) 복사"
    echo "3. 다음 명령어 실행:"
    echo "   ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo ""
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "======================================"
echo "터미널별 실행 명령어"
echo "======================================"
echo ""
echo "터미널 1 - 백엔드 서버:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "터미널 2 - 백엔드 ngrok 터널:"
echo "  ngrok http 8000"
echo "  (표시된 URL을 복사하세요, 예: https://abc123.ngrok.io)"
echo ""
echo "터미널 3 - 프론트엔드 서버:"
echo "  cd admin-web"
echo "  echo 'REACT_APP_API_URL=https://백엔드ngrokURL/api' > .env"
echo "  npm start"
echo ""
echo "터미널 4 - 프론트엔드 ngrok 터널:"
echo "  ngrok http 3000"
echo "  (표시된 URL을 복사하세요, 예: https://xyz789.ngrok.io)"
echo ""
echo "======================================"
echo "접속"
echo "======================================"
echo "터미널 4에서 표시된 URL로 접속하세요!"
echo "예: https://xyz789.ngrok.io"
echo ""
echo "⚠️  주의:"
echo "- ngrok 무료 버전은 URL이 매번 변경됩니다"
echo "- 고정 URL이 필요하면 유료 플랜 사용 ($8/월)"
echo "- 기본 비밀번호(admin123)를 반드시 변경하세요!"
echo ""

