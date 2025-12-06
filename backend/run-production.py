"""
프로덕션 서버 실행 스크립트
"""
import uvicorn
import os

if __name__ == "__main__":
    # 프로덕션 모드
    os.environ["PRODUCTION"] = "true"
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=4  # 워커 프로세스 수 (선택사항)
    )

