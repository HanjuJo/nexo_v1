#!/bin/bash

echo "======================================"
echo "넥소코리아 고객관리 시스템 - 백엔드 테스트 설정"
echo "======================================"

# Python 가상환경 확인
if [ ! -d "venv" ]; then
    echo "📦 가상환경 생성 중..."
    python3 -m venv venv
fi

echo "🔧 가상환경 활성화..."
source venv/bin/activate

echo "📥 패키지 설치 중..."
pip install -r requirements.txt

# 환경 변수 파일 확인
if [ ! -f ".env" ]; then
    echo "📝 .env 파일이 없습니다. SQLite를 사용하는 기본 설정을 생성합니다..."
    cat > .env << EOF
DATABASE_URL=sqlite:///./nexo_crm.db
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
EOF
    echo "✅ .env 파일이 생성되었습니다."
else
    echo "✅ .env 파일이 이미 존재합니다."
fi

# 업로드 디렉토리 생성
mkdir -p uploads

echo ""
echo "======================================"
echo "설정 완료!"
echo "======================================"
echo ""
echo "다음 명령어로 서버를 실행하세요:"
echo "  python run.py"
echo ""
echo "또는:"
echo "  uvicorn app.main:app --reload"
echo ""

