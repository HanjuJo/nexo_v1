"""
서버 실행 스크립트
"""
import uvicorn
import os

if __name__ == "__main__":
    # 프로덕션 모드 확인
    is_production = os.getenv("PRODUCTION", "false").lower() == "true"
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=not is_production  # 프로덕션에서는 reload 비활성화
    )


