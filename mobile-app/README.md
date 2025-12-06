# 넥소코리아 고객관리 모바일 앱

React Native 기반 모바일 애플리케이션

## 구조

- **sales-app/**: 영업자 앱 (13개 화면)
- **technician-app/**: 기사 앱 (9개 화면)

## 설치

```bash
npm install
```

## 실행

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## 환경 변수

`.env` 파일 생성:
```
API_BASE_URL=http://localhost:8000/api
```

## 주요 기능

### 영업자 앱
- 로그인
- 상담 관리
- 견적 관리
- 계약 관리
- 거래처 관리
- 마이페이지

### 기사 앱
- 로그인
- 작업 리스트 (진행중/완료)
- 설치 및 AS 결과 등록
- 고객 이력 조회
- 마이페이지

