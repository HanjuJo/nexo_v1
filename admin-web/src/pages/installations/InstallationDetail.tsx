import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface InstallationFormData {
  contract_id: number | '';
  client_id: number | '';
  installation_type: string;
  status: string;
  scheduled_date: string;
  result_text: string;
  notes: string;
}

const InstallationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [formData, setFormData] = useState<InstallationFormData>({
    contract_id: '',
    client_id: '',
    installation_type: 'installation',
    status: 'pending',
    scheduled_date: '',
    result_text: '',
    notes: '',
  });

  useEffect(() => {
    fetchContracts();
    fetchClients();
    fetchTechnicians();
    if (id && id !== 'new') {
      fetchInstallation();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/employees', {
        params: { role: 'technician' },
      });
      setTechnicians(response.data);
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  };

  const fetchInstallation = async () => {
    try {
      const response = await api.get(`/installations/${id}`);
      const data = response.data;
      setFormData({
        contract_id: data.contract_id || '',
        client_id: data.client_id || '',
        installation_type: data.installation_type || 'installation',
        status: data.status || 'pending',
        scheduled_date: data.scheduled_date || '',
        result_text: data.result_text || '',
        notes: data.notes || '',
      });
    } catch (error) {
      alert('설치/AS 정보를 불러올 수 없습니다.');
      navigate('/installations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        contract_id: Number(formData.contract_id),
        client_id: Number(formData.client_id),
        installation_type: formData.installation_type,
        status: formData.status,
        scheduled_date: formData.scheduled_date || null,
        result_text: formData.result_text,
        notes: formData.notes,
      };

      const isNew = !id || id === 'new';
      if (isNew) {
        await api.post('/installations', submitData);
      } else {
        const installationId = parseInt(id, 10);
        if (isNaN(installationId)) {
          alert('유효하지 않은 설치/AS ID입니다.');
          return;
        }
        await api.put(`/installations/${installationId}`, submitData);
      }
      navigate('/installations');
    } catch (error: any) {
      let errorMessage = '저장에 실패했습니다.';
      
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join('\n');
        } else if (error.response.data.detail) {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/installations/${id}`);
      navigate('/installations');
    } catch (error: any) {
      alert(error.response?.data?.detail || '삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '설치/AS 등록' : '설치/AS 정보 수정'}</h1>
        {id !== 'new' && (
          <button className="btn-delete" onClick={handleDelete}>
            삭제
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>계약 *</label>
            <select
              value={formData.contract_id}
              onChange={(e) => setFormData({ ...formData, contract_id: e.target.value as any })}
              required
            >
              <option value="">선택하세요</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.contract_number}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>거래처 *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value as any })}
              required
            >
              <option value="">선택하세요</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>유형 *</label>
            <select
              value={formData.installation_type}
              onChange={(e) => setFormData({ ...formData, installation_type: e.target.value })}
              required
            >
              <option value="installation">설치</option>
              <option value="as">AS</option>
            </select>
          </div>
          <div className="form-group">
            <label>상태 *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="pending">대기중</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>예정일</label>
          <input
            type="date"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>작업 결과</label>
          <textarea
            value={formData.result_text}
            onChange={(e) => setFormData({ ...formData, result_text: e.target.value })}
            rows={6}
            placeholder="작업 결과를 입력하세요..."
          />
        </div>

        <div className="form-group">
          <label>비고</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/installations')}>
            취소
          </button>
          <button type="submit" className="btn-primary">
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstallationDetail;
