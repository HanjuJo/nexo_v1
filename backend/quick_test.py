"""
빠른 백엔드 테스트 스크립트
서버가 실행 중이어야 합니다.
"""
import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """모든 모듈 import 테스트"""
    print("=" * 50)
    print("백엔드 모듈 Import 테스트")
    print("=" * 50)
    
    try:
        print("\n1. 데이터베이스 모델 import 테스트...")
        from app.models import User, Client, Item, Consultation, Quotation, Contract, Installation, Inventory
        print("   ✅ 모든 모델 import 성공")
    except Exception as e:
        print(f"   ❌ 모델 import 실패: {e}")
        return False
    
    try:
        print("\n2. API 라우터 import 테스트...")
        from app.api import auth, admin, employee, client, consultation, quotation, contract, installation, inventory, item
        print("   ✅ 모든 API 라우터 import 성공")
    except Exception as e:
        print(f"   ❌ API 라우터 import 실패: {e}")
        return False
    
    try:
        print("\n3. FastAPI 앱 생성 테스트...")
        from app.main import app
        print("   ✅ FastAPI 앱 생성 성공")
    except Exception as e:
        print(f"   ❌ FastAPI 앱 생성 실패: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    try:
        print("\n4. 설정 로드 테스트...")
        from app.core.config import settings
        print(f"   ✅ 설정 로드 성공 (DB: {settings.DATABASE_URL[:20]}...)")
    except Exception as e:
        print(f"   ❌ 설정 로드 실패: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ 모든 Import 테스트 통과!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)

