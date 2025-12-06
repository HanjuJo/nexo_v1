/**
 * 관리자 웹과 백엔드 API 연결 테스트 스크립트
 * 
 * 사용법:
 * 1. 백엔드 서버가 실행 중인지 확인 (http://localhost:8000)
 * 2. node test_api_connection.js 실행
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

let authToken = '';

// 테스트 함수들
async function testLogin() {
  console.log('\n=== 1. 로그인 테스트 ===');
  try {
    // Node.js 환경에서는 URLSearchParams 사용
    const params = new URLSearchParams();
    params.append('username', 'admin');
    params.append('password', 'admin123');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    authToken = response.data.access_token;
    console.log('✓ 로그인 성공');
    console.log('  사용자:', response.data.user.full_name);
    console.log('  역할:', response.data.user.role);
    console.log('  토큰 (처음 20자):', authToken ? authToken.substring(0, 20) + '...' : '없음');
    return true;
  } catch (error) {
    console.error('✗ 로그인 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('\n=== 2. 현재 사용자 정보 조회 ===');
  try {
    if (!authToken) {
      console.error('✗ 토큰이 없습니다.');
      return false;
    }
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 사용자 정보 조회 성공');
    console.log('  이름:', response.data.full_name);
    console.log('  이메일:', response.data.email);
    return true;
  } catch (error) {
    console.error('✗ 사용자 정보 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetAdminAccounts() {
  console.log('\n=== 3. 관리자 계정 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/accounts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 관리자 계정 목록 조회 성공');
    console.log('  계정 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 관리자 계정 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetEmployees() {
  console.log('\n=== 4. 직원 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 직원 목록 조회 성공');
    console.log('  직원 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 직원 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetClients() {
  console.log('\n=== 5. 거래처 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 거래처 목록 조회 성공');
    console.log('  거래처 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 거래처 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetItems() {
  console.log('\n=== 6. 품목 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/items`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 품목 목록 조회 성공');
    console.log('  품목 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 품목 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetConsultations() {
  console.log('\n=== 7. 상담 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/consultations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 상담 목록 조회 성공');
    console.log('  상담 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 상담 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

async function testGetInstallations() {
  console.log('\n=== 8. 설치/AS 목록 조회 ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/installations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✓ 설치/AS 목록 조회 성공');
    console.log('  작업 수:', response.data.length);
    return true;
  } catch (error) {
    console.error('✗ 설치/AS 목록 조회 실패:', error.response?.data?.detail || error.message);
    return false;
  }
}

// 메인 테스트 실행
async function runTests() {
  console.log('========================================');
  console.log('관리자 웹과 백엔드 API 연결 테스트');
  console.log('========================================');
  console.log(`API Base URL: ${API_BASE_URL}`);

  const results = [];

  // 로그인 먼저 실행
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ 로그인 실패로 인해 테스트를 중단합니다.');
    console.log('백엔드 서버가 실행 중인지 확인하세요.');
    return;
  }

  // 나머지 테스트 실행
  results.push(await testGetCurrentUser());
  results.push(await testGetAdminAccounts());
  results.push(await testGetEmployees());
  results.push(await testGetClients());
  results.push(await testGetItems());
  results.push(await testGetConsultations());
  results.push(await testGetInstallations());

  // 결과 요약
  console.log('\n========================================');
  console.log('테스트 결과 요약');
  console.log('========================================');
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  console.log(`성공: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ 모든 API 연결 테스트가 성공했습니다!');
  } else {
    console.log('⚠️  일부 테스트가 실패했습니다. 위의 오류 메시지를 확인하세요.');
  }
}

// 실행
runTests().catch(console.error);

