import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const InstallationList: React.FC = () => {
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstallations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstallations();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const fetchInstallations = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.get('/installations', { params });
      let filtered = response.data;
      if (search) {
        filtered = filtered.filter((inst: any) => 
          inst.client?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setInstallations(filtered);
    } catch (error) {
      console.error('Failed to fetch installations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    return type === 'installation' ? '설치' : 'AS';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '대기중',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status;
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>설치 및 AS 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/installations/new')}>
          + 설치/AS 등록
        </button>
      </div>
      <div className="page-filters">
        <input
          type="text"
          placeholder="거래처명으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{ marginRight: '10px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="search-input"
          style={{ width: '150px' }}
        >
          <option value="">전체 상태</option>
          <option value="pending">대기중</option>
          <option value="in_progress">진행중</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소됨</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>거래처</th>
              <th>유형</th>
              <th>상태</th>
              <th>담당 기사</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {installations.map((installation) => (
              <tr key={installation.id}>
                <td>{installation.id}</td>
                <td>{installation.client?.name || installation.client_id}</td>
                <td>{getTypeText(installation.installation_type)}</td>
                <td>{getStatusText(installation.status)}</td>
                <td>{installation.technician?.full_name || installation.technician_id}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/installations/${installation.id}`)}>
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstallationList;

