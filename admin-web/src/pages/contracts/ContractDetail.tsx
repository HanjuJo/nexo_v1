import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface ContractItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

interface ContractFormData {
  contract_number: string;
  client_id: number | '';
  quotation_id: number | '';
  status: string;
  contract_date: string;
  notes: string;
  items: ContractItem[];
}

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<ContractFormData>({
    contract_number: '',
    client_id: '',
    quotation_id: '',
    status: 'draft',
    contract_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
  });

  useEffect(() => {
    fetchClients();
    fetchItems();
    if (id && id !== 'new') {
      fetchContract();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (formData.client_id) {
      fetchQuotations();
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

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations', {
        params: { client_id: formData.client_id },
      });
      setQuotations(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
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

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${id}`);
      const data = response.data;
      setFormData({
        contract_number: data.contract_number || '',
        client_id: data.client_id || '',
        quotation_id: data.quotation_id || '',
        status: data.status || 'draft',
        contract_date: data.contract_date || new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        items: data.items || [],
      });
    } catch (error) {
      alert('계약 정보를 불러올 수 없습니다.');
      navigate('/contracts');
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

  const updateItem = (index: number, field: keyof ContractItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
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
        contract_number: formData.contract_number,
        client_id: Number(formData.client_id),
        quotation_id: formData.quotation_id ? Number(formData.quotation_id) : null,
        status: formData.status,
        contract_date: formData.contract_date,
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
        await api.post('/contracts', submitData);
      } else {
        const contractId = parseInt(id, 10);
        if (isNaN(contractId)) {
          alert('유효하지 않은 계약 ID입니다.');
          return;
        }
        await api.put(`/contracts/${contractId}`, submitData);
      }
      navigate('/contracts');
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
        <h1>{id === 'new' ? '계약 등록' : '계약 정보 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>계약번호 *</label>
            <input
              type="text"
              value={formData.contract_number}
              onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
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
              <option value="signed">계약완료</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>거래처 *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value as any, quotation_id: '' })}
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
            <label>계약일 *</label>
            <input
              type="date"
              value={formData.contract_date}
              onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>견적</label>
          <select
            value={formData.quotation_id}
            onChange={(e) => setFormData({ ...formData, quotation_id: e.target.value as any })}
          >
            <option value="">선택하세요</option>
            {quotations.map((quotation) => (
              <option key={quotation.id} value={quotation.id}>
                {quotation.quotation_number}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>계약 항목</label>
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/contracts')}>
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

export default ContractDetail;
