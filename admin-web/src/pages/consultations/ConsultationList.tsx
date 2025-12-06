import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const ConsultationList: React.FC = () => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsultations();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchConsultations = async () => {
    try {
      const params: any = {};
      if (search) params.client_name = search;
      const response = await api.get('/consultations', { params });
      setConsultations(response.data);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>상담 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/consultations/new')}>
          + 상담 등록
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
              <th>거래처</th>
              <th>상담일</th>
              <th>담당자</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => (
              <tr key={consultation.id}>
                <td>{consultation.id}</td>
                <td>{consultation.client?.name || consultation.client_id}</td>
                <td>{new Date(consultation.consultation_date).toLocaleDateString('ko-KR')}</td>
                <td>{consultation.salesperson?.full_name || consultation.salesperson_id}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/consultations/${consultation.id}`)}>
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

export default ConsultationList;

