"""
데이터베이스 초기화 스크립트
슈퍼관리자 계정을 생성합니다.
"""
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def init_db():
    """초기 데이터베이스 설정"""
    db: Session = SessionLocal()
    
    try:
        # 슈퍼관리자 계정이 있는지 확인
        admin = db.query(User).filter(User.is_super_admin == True).first()
        
        if not admin:
            # 기본 슈퍼관리자 계정 생성
            admin = User(
                username="admin",
                email="admin@nexo.com",
                hashed_password=get_password_hash("admin123"),
                full_name="시스템 관리자",
                role=UserRole.SUPER_ADMIN,
                is_admin=True,
                is_super_admin=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ 슈퍼관리자 계정이 생성되었습니다.")
            print("   사용자명: admin")
            print("   비밀번호: admin123")
            print("   ⚠️  운영 환경에서는 반드시 비밀번호를 변경하세요!")
        else:
            print("ℹ️  슈퍼관리자 계정이 이미 존재합니다.")
    
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()


