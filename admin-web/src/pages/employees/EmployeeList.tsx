import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

interface Employee {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/employees', { params });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchEmployees();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="page-loading">로딩 중...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>직원 관리</h1>
        <button className="btn-primary" onClick={() => navigate('/employees/new')}>
          + 직원 등록
        </button>
      </div>

      <div className="page-filters">
        <input
          type="text"
          placeholder="직원 이름으로 검색..."
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
              <th>사용자명</th>
              <th>이름</th>
              <th>이메일</th>
              <th>전화번호</th>
              <th>역할</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.username}</td>
                <td>
                  <Link to={`/employees/${employee.id}`}>{employee.full_name}</Link>
                </td>
                <td>{employee.email}</td>
                <td>{employee.phone || '-'}</td>
                <td>{employee.role}</td>
                <td>{employee.is_active ? '활성' : '비활성'}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    수정
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(employee.id)}
                  >
                    삭제
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

export default EmployeeList;

