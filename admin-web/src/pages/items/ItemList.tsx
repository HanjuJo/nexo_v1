import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface Item {
  id: number;
  code: string;
  name: string;
  unit_price: number;
  unit: string;
  is_active: boolean;
}

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchItems();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) return <div className="page-loading">로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>품목 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/items/new')}>
          + 품목 등록
        </button>
      </div>

      <div className="page-filters">
        <input
          type="text"
          placeholder="품목명으로 검색..."
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
              <th>품목 코드</th>
              <th>품목명</th>
              <th>단가</th>
              <th>단위</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.unit_price.toLocaleString()}원</td>
                <td>{item.unit}</td>
                <td>{item.is_active ? '활성' : '비활성'}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/items/${item.id}`)}>
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

export default ItemList;

