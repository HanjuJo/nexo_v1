import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface Client {
  id: number;
  name: string;
  client_type: string;
  company_name?: string;
  personal_name?: string;
  personal_phone?: string;
  personal_email?: string;
  company_phone?: string;
  company_email?: string;
  phone?: string; // 호환성을 위해 유지
  email?: string; // 호환성을 위해 유지
}

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/clients', { params });
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchClients();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>거래처 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          + 거래처 등록
        </button>
      </div>

      <div className="page-filters">
        <input
          type="text"
          placeholder="거래처명으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>거래처명</th>
              <th>유형</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>
                  <Link to={`/clients/${client.id}`}>{client.name}</Link>
                </td>
                <td>{client.client_type === 'individual' ? '개인' : client.client_type === 'company' ? '기업' : '기관'}</td>
                <td>
                  {client.client_type === 'individual' 
                    ? (client.personal_phone || client.phone || '-')
                    : (client.company_phone || client.phone || '-')}
                </td>
                <td>
                  {client.client_type === 'individual'
                    ? (client.personal_email || client.email || '-')
                    : (client.company_email || client.email || '-')}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/clients/${client.id}`)}>
                    수정
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(client.id)}>
                    삭제
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

export default ClientList;

