import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'individual' as 'individual' | 'company' | 'institution',
    personal_name: '',
    personal_phone: '',
    personal_email: '',
    company_name: '',
    business_number: '',
    representative_name: '',
    company_phone: '',
    company_email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchClient();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      const data = response.data;
      setFormData({
        name: data.name || '',
        client_type: data.client_type || 'individual',
        personal_name: data.personal_name || '',
        personal_phone: data.personal_phone || '',
        personal_email: data.personal_email || '',
        company_name: data.company_name || '',
        business_number: data.business_number || '',
        representative_name: data.representative_name || '',
        company_phone: data.company_phone || '',
        company_email: data.company_email || '',
        address: data.address || '',
        notes: data.notes || '',
      });
    } catch (error) {
      alert('거래처 정보를 불러올 수 없습니다.');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // id가 'new'이거나 undefined이면 POST (등록)
      if (!id || id === 'new') {
        await api.post('/clients', formData);
      } else {
        // id가 숫자인지 확인
        const clientId = parseInt(id, 10);
        if (isNaN(clientId)) {
          alert('유효하지 않은 거래처 ID입니다.');
          return;
        }
        await api.put(`/clients/${clientId}`, formData);
      }
      navigate('/clients');
    } catch (error: any) {
      let errorMessage = '저장에 실패했습니다.';
      
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Pydantic validation errors
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

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '거래처 등록' : '거래처 정보 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>거래처명 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>유형 *</label>
            <select
              value={formData.client_type}
              onChange={(e) => setFormData({ ...formData, client_type: e.target.value as any })}
              required
            >
              <option value="individual">개인</option>
              <option value="company">기업</option>
              <option value="institution">기관</option>
            </select>
          </div>
        </div>

        {formData.client_type === 'individual' ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>이름 *</label>
                <input
                  type="text"
                  value={formData.personal_name}
                  onChange={(e) => setFormData({ ...formData, personal_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  value={formData.personal_phone}
                  onChange={(e) => setFormData({ ...formData, personal_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={formData.personal_email}
                onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>회사명 *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>사업자번호</label>
                <input
                  type="text"
                  value={formData.business_number}
                  onChange={(e) => setFormData({ ...formData, business_number: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>대표자명</label>
                <input
                  type="text"
                  value={formData.representative_name}
                  onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={formData.company_email}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>주소</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>비고</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/clients')}>
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

export default ClientDetail;

