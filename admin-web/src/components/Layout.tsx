import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>넥소코리아</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard">대시보드</Link>
          </li>
          
          {user?.is_super_admin && (
            <li>
              <Link to="/admin/accounts">관리자 계정 관리</Link>
            </li>
          )}
          
          {user?.is_admin && (
            <>
              <li>
                <Link to="/employees">직원 관리</Link>
              </li>
              <li>
                <Link to="/clients">거래처 관리</Link>
              </li>
              <li>
                <Link to="/items">품목 관리</Link>
              </li>
              <li>
                <Link to="/consultations">상담 관리</Link>
              </li>
              <li>
                <Link to="/quotations">견적 관리</Link>
              </li>
              <li>
                <Link to="/contracts">계약 관리</Link>
              </li>
              <li>
                <Link to="/installations">설치 및 AS 관리</Link>
              </li>
              <li>
                <Link to="/inventory">재고 관리</Link>
              </li>
              <li>
                <Link to="/backup">데이터 백업</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button 
              className="header-toggle-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <h1>고객관리 시스템</h1>
          </div>
          <div className="header-right">
            <span className="user-name">{user?.full_name}님</span>
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

