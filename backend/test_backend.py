"""
백엔드 기본 테스트 스크립트
서버가 정상적으로 실행되는지 확인합니다.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_server_health():
    """서버 헬스 체크"""
    print("🔍 서버 헬스 체크 중...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 서버가 정상적으로 실행 중입니다!")
            print(f"   응답: {response.json()}")
            return True
        else:
            print(f"❌ 서버 응답 오류: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("   서버가 실행 중인지 확인하세요: python run.py")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def test_api_root():
    """API 루트 엔드포인트 테스트"""
    print("\n🔍 API 루트 엔드포인트 테스트 중...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API 루트 엔드포인트 정상!")
            print(f"   응답: {response.json()}")
            return True
        else:
            print(f"❌ API 루트 응답 오류: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def test_api_docs():
    """API 문서 엔드포인트 테스트"""
    print("\n🔍 API 문서 엔드포인트 테스트 중...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API 문서 페이지 접근 가능!")
            print(f"   문서 URL: {BASE_URL}/docs")
            return True
        else:
            print(f"❌ API 문서 접근 오류: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def test_login_endpoint():
    """로그인 엔드포인트 구조 테스트 (실제 로그인은 하지 않음)"""
    print("\n🔍 로그인 엔드포인트 테스트 중...")
    try:
        # 잘못된 자격증명으로 테스트 (엔드포인트가 존재하는지 확인)
        form_data = {
            'username': 'test_user',
            'password': 'test_password'
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", data=form_data)
        
        # 401 오류가 나오는 것은 정상 (엔드포인트는 존재하지만 인증 실패)
        if response.status_code in [401, 422]:
            print("✅ 로그인 엔드포인트가 존재합니다!")
            if response.status_code == 401:
                print("   (인증 실패는 예상된 동작입니다)")
            return True
        else:
            print(f"⚠️  예상치 못한 응답 코드: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def main():
    print("=" * 50)
    print("넥소코리아 고객관리 시스템 - 백엔드 테스트")
    print("=" * 50)
    
    results = []
    
    # 테스트 실행
    results.append(("서버 헬스 체크", test_server_health()))
    results.append(("API 루트", test_api_root()))
    results.append(("API 문서", test_api_docs()))
    results.append(("로그인 엔드포인트", test_login_endpoint()))
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("테스트 결과 요약")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ 통과" if result else "❌ 실패"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n총 {total}개 테스트 중 {passed}개 통과")
    
    if passed == total:
        print("\n🎉 모든 테스트가 통과했습니다!")
    else:
        print(f"\n⚠️  {total - passed}개 테스트가 실패했습니다.")
        print("서버 로그를 확인하고 오류를 수정하세요.")

if __name__ == "__main__":
    main()

