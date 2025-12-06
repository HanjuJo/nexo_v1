import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayConsultations: 0,
    inProgressContracts: 0,
    pendingTasks: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // 오늘의 상담
      const consultationsResponse = await api.get('/consultations', {
        params: {
          skip: 0,
          limit: 1000,
        },
      });
      const todayConsultations = consultationsResponse.data.filter((c: any) => {
        const consultationDate = new Date(c.consultation_date);
        return consultationDate >= today && consultationDate <= todayEnd;
      }).length;

      // 진행 중인 계약
      const contractsResponse = await api.get('/contracts', {
        params: {
          skip: 0,
          limit: 1000,
        },
      });
      const inProgressContracts = contractsResponse.data.filter(
        (c: any) => c.status === 'in_progress' || c.status === 'signed'
      ).length;

      // 대기 중인 작업
      const installationsResponse = await api.get('/installations', {
        params: {
          status: 'pending',
          skip: 0,
          limit: 1000,
        },
      });
      const pendingTasks = installationsResponse.data.length;

      // 재고 알림 (최소 재고 수준 이하)
      const inventoryResponse = await api.get('/inventory', {
        params: {
          skip: 0,
          limit: 1000,
        },
      });
      const lowStockItems = inventoryResponse.data.filter(
        (item: any) => item.quantity <= item.min_stock_level
      ).length;

      setStats({
        todayConsultations,
        inProgressContracts,
        pendingTasks,
        lowStockItems,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>대시보드</h1>
      <div className="welcome-message">
        <h2>안녕하세요, {user?.full_name}님!</h2>
        <p>넥소코리아 고객관리 시스템에 오신 것을 환영합니다.</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>오늘의 상담</h3>
          <p className="stat-number">{loading ? '-' : stats.todayConsultations}</p>
        </div>
        <div className="stat-card">
          <h3>진행 중인 계약</h3>
          <p className="stat-number">{loading ? '-' : stats.inProgressContracts}</p>
        </div>
        <div className="stat-card">
          <h3>대기 중인 작업</h3>
          <p className="stat-number">{loading ? '-' : stats.pendingTasks}</p>
        </div>
        <div className="stat-card">
          <h3>재고 알림</h3>
          <p className="stat-number">{loading ? '-' : stats.lowStockItems}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
