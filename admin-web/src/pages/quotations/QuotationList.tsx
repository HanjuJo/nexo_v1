import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotations();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchQuotations = async () => {
    try {
      const params: any = {};
      if (search) params.client_name = search;
      const response = await api.get('/quotations', { params });
      setQuotations(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: '작성중',
      submitted: '제출됨',
      approved: '승인됨',
      rejected: '거절됨',
      expired: '만료됨',
    };
    return statusMap[status] || status;
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>견적 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/quotations/new')}>
          + 견적 등록
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
              <th>견적번호</th>
              <th>거래처</th>
              <th>상태</th>
              <th>총액</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td>{quotation.id}</td>
                <td>{quotation.quotation_number}</td>
                <td>{quotation.client?.name || quotation.client_id}</td>
                <td>{getStatusText(quotation.status)}</td>
                <td>{quotation.total_amount?.toLocaleString()}원</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/quotations/${quotation.id}`)}>
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

export default QuotationList;

