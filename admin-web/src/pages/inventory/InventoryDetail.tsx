import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface InventoryFormData {
  item_id: string | number;
  quantity: number;
  min_stock_level: number;
  location: string;
  notes: string;
}

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<InventoryFormData>({
    item_id: '',
    quantity: 0,
    min_stock_level: 0,
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchItems();
    if (id && id !== 'new') {
      fetchInventory();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/inventory/${id}`);
      const data = response.data;
      setFormData({
        item_id: data.item_id ? String(data.item_id) : '',
        quantity: data.quantity || 0,
        min_stock_level: data.min_stock_level || 0,
        location: data.location || '',
        notes: data.notes || '',
      });
    } catch (error) {
      alert('재고 정보를 불러올 수 없습니다.');
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.item_id || formData.item_id === '') {
        alert('품목을 선택하세요.');
        return;
      }

      const isNew = !id || id === 'new';
      
      if (isNew) {
        // 등록 시에는 item_id 포함
        const submitData = {
          item_id: Number(formData.item_id),
          quantity: Number(formData.quantity),
          min_stock_level: Number(formData.min_stock_level),
          location: formData.location || '',
          notes: formData.notes || '',
        };
        await api.post('/inventory', submitData);
        alert('재고가 등록되었습니다.');
      } else {
        // 수정 시에는 item_id 제외 (품목은 변경 불가)
        const inventoryId = parseInt(id, 10);
        if (isNaN(inventoryId)) {
          alert('유효하지 않은 재고 ID입니다.');
          return;
        }
        const submitData = {
          quantity: Number(formData.quantity),
          min_stock_level: Number(formData.min_stock_level),
          location: formData.location || '',
          notes: formData.notes || '',
        };
        await api.put(`/inventory/${inventoryId}`, submitData);
        alert('재고가 수정되었습니다.');
      }
      navigate('/inventory');
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
      await api.delete(`/inventory/${id}`);
      navigate('/inventory');
    } catch (error: any) {
      alert(error.response?.data?.detail || '삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '재고 등록' : '재고 정보 수정'}</h1>
        {id !== 'new' && (
          <button className="btn-delete" onClick={handleDelete}>
            삭제
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>품목 *</label>
          <select
            value={String(formData.item_id || '')}
            onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
            required
            disabled={id !== 'new' && id !== undefined}
          >
            <option value="">선택하세요</option>
            {items.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
          {id !== 'new' && id !== undefined && (
            <small style={{ color: '#7f8c8d' }}>품목은 변경할 수 없습니다.</small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>현재 재고 *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>최소 재고량</label>
            <input
              type="number"
              value={formData.min_stock_level}
              onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>재고 위치</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="예: 창고 A-1"
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/inventory')}>
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

export default InventoryDetail;
