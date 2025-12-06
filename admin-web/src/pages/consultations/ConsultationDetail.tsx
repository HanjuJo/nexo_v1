import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface ConsultationFormData {
  client_id: number | '';
  consultation_date: string;
  content: string;
  notes: string;
}

const ConsultationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState<ConsultationFormData>({
    client_id: '',
    consultation_date: new Date().toISOString().slice(0, 16),
    content: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
    if (id && id !== 'new') {
      fetchConsultation();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchConsultation = async () => {
    try {
      const response = await api.get(`/consultations/${id}`);
      const data = response.data;
      setFormData({
        client_id: data.client_id,
        consultation_date: new Date(data.consultation_date).toISOString().slice(0, 16),
        content: data.content || '',
        notes: data.notes || '',
      });
    } catch (error) {
      alert('상담 정보를 불러올 수 없습니다.');
      navigate('/consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        client_id: Number(formData.client_id),
        consultation_date: new Date(formData.consultation_date).toISOString(),
      };
      
      const isNew = !id || id === 'new';
      if (isNew) {
        await api.post('/consultations', submitData);
      } else {
        const consultationId = parseInt(id, 10);
        if (isNaN(consultationId)) {
          alert('유효하지 않은 상담 ID입니다.');
          return;
        }
        await api.put(`/consultations/${consultationId}`, submitData);
      }
      navigate('/consultations');
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
      await api.delete(`/consultations/${id}`);
      navigate('/consultations');
    } catch (error: any) {
      alert(error.response?.data?.detail || '삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '상담 등록' : '상담 정보 수정'}</h1>
        {id !== 'new' && (
          <button className="btn-delete" onClick={handleDelete}>
            삭제
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
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

          <div className="form-group">
            <label>상담일 *</label>
            <input
              type="datetime-local"
              value={formData.consultation_date}
              onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>상담 내용 *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={6}
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/consultations')}>
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

export default ConsultationDetail;
