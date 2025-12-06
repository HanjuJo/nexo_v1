import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface QuotationItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

interface QuotationFormData {
  quotation_number: string;
  client_id: number | '';
  consultation_id: number | '';
  status: string;
  valid_until: string;
  notes: string;
  items: QuotationItem[];
}

const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<QuotationFormData>({
    quotation_number: '',
    client_id: '',
    consultation_id: '',
    status: 'draft',
    valid_until: '',
    notes: '',
    items: [],
  });

  useEffect(() => {
    fetchClients();
    fetchItems();
    if (id && id !== 'new') {
      fetchQuotation();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (formData.client_id) {
      fetchConsultations();
    }
  }, [formData.client_id]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations', {
        params: { client_id: formData.client_id },
      });
      setConsultations(response.data);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/quotations/${id}`);
      const data = response.data;
      setFormData({
        quotation_number: data.quotation_number || '',
        client_id: data.client_id || '',
        consultation_id: data.consultation_id || '',
        status: data.status || 'draft',
        valid_until: data.valid_until ? new Date(data.valid_until).toISOString().slice(0, 16) : '',
        notes: data.notes || '',
        items: data.items || [],
      });
    } catch (error) {
      alert('견적 정보를 불러올 수 없습니다.');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: 0, quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // 단가 자동 계산
    if (field === 'item_id' && value) {
      const item = items.find(i => i.id === value);
      if (item) {
        newItems[index].unit_price = item.unit_price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        quotation_number: formData.quotation_number,
        client_id: Number(formData.client_id),
        consultation_id: formData.consultation_id ? Number(formData.consultation_id) : null,
        status: formData.status,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        notes: formData.notes,
        items: formData.items.map(item => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          notes: item.notes,
        })),
      };

      const isNew = !id || id === 'new';
      if (isNew) {
        await api.post('/quotations', submitData);
      } else {
        const quotationId = parseInt(id, 10);
        if (isNaN(quotationId)) {
          alert('유효하지 않은 견적 ID입니다.');
          return;
        }
        await api.put(`/quotations/${quotationId}`, submitData);
      }
      navigate('/quotations');
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

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unit_price));
    }, 0);
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '견적 등록' : '견적 정보 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>견적번호 *</label>
            <input
              type="text"
              value={formData.quotation_number}
              onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>상태 *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="draft">작성중</option>
              <option value="submitted">제출됨</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
              <option value="expired">만료됨</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>거래처 *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value as any, consultation_id: '' })}
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
            <label>상담</label>
            <select
              value={formData.consultation_id}
              onChange={(e) => setFormData({ ...formData, consultation_id: e.target.value as any })}
            >
              <option value="">선택하세요</option>
              {consultations.map((consultation) => (
                <option key={consultation.id} value={consultation.id}>
                  {new Date(consultation.consultation_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>유효기한</label>
          <input
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>견적 항목</label>
          <button type="button" className="btn-secondary" onClick={addItem} style={{ marginBottom: '10px' }}>
            + 항목 추가
          </button>
          {formData.items.length > 0 && (
            <table style={{ width: '100%', marginBottom: '10px' }}>
              <thead>
                <tr>
                  <th>품목</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>금액</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={item.item_id}
                        onChange={(e) => updateItem(index, 'item_id', Number(e.target.value))}
                        required
                      >
                        <option value={0}>선택하세요</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} ({it.code})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                        required
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                        min="0"
                        required
                        style={{ width: '120px' }}
                      />
                    </td>
                    <td>{(item.quantity * item.unit_price).toLocaleString()}원</td>
                    <td>
                      <button type="button" className="btn-delete" onClick={() => removeItem(index)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>총액:</td>
                  <td style={{ fontWeight: 'bold' }}>{calculateTotal().toLocaleString()}원</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/quotations')}>
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

export default QuotationDetail;
