import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit_price: '',
    unit: '개',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchItem();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}`);
      const data = response.data;
      setFormData({
        code: data.code || '',
        name: data.name || '',
        description: data.description || '',
        unit_price: data.unit_price?.toString() || '',
        unit: data.unit || '개',
      });
    } catch (error) {
      alert('품목 정보를 불러올 수 없습니다.');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
      };
      const isNew = !id || id === 'new';
      if (isNew) {
        await api.post('/items', submitData);
      } else {
        const itemId = parseInt(id, 10);
        if (isNaN(itemId)) {
          alert('유효하지 않은 품목 ID입니다.');
          return;
        }
        await api.put(`/items/${itemId}`, submitData);
      }
      navigate('/items');
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

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '품목 등록' : '품목 정보 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>품목 코드 *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>단위</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>품목명 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>단가 *</label>
          <input
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/items')}>
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

export default ItemDetail;

