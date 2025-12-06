import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../common/PageCommon.css';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'sales',
    password: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      const data = response.data;
      setFormData({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || '',
        role: data.role,
        password: '',
      });
    } catch (error) {
      alert('직원 정보를 불러올 수 없습니다.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 비밀번호가 없으면 제외 (수정 시)
      const submitData: any = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone || '',
        role: formData.role,
      };
      
      // 새 직원이거나 비밀번호가 입력된 경우에만 비밀번호 포함
      const isNew = !id || id === 'new';
      if (isNew || formData.password) {
        submitData.password = formData.password;
      }
      
      // id가 없거나 'new'이면 POST (등록), 그 외는 PUT (수정)
      if (isNew) {
        await api.post('/employees', submitData);
      } else {
        // id가 숫자인지 확인
        const employeeId = parseInt(id, 10);
        if (isNaN(employeeId)) {
          alert('유효하지 않은 직원 ID입니다.');
          return;
        }
        await api.put(`/employees/${employeeId}`, submitData);
      }
      navigate('/employees');
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

  if (loading) {
    return <div className="page-loading">로딩 중...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id === 'new' ? '직원 등록' : '직원 정보 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>사용자명 *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>이메일 *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>역할 *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            <option value="sales">영업자</option>
            <option value="technician">기사</option>
          </select>
        </div>

        <div className="form-group">
          <label>비밀번호 {id !== 'new' && '(변경 시에만 입력)'}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={id === 'new'}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/employees')}>
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

export default EmployeeDetail;

