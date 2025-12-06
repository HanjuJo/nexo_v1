import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>재고 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/inventory/new')}>
          + 재고 등록
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>품목</th>
              <th>현재 재고</th>
              <th>최소 재고</th>
              <th>위치</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.item?.name || item.item_id} {item.item?.code && `(${item.item.code})`}</td>
                <td>{item.quantity}</td>
                <td>{item.min_stock_level}</td>
                <td>{item.location || '-'}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/inventory/${item.id}`)}>
                    수정
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

export default InventoryList;

