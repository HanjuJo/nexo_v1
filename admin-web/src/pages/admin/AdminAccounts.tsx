import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AdminAccounts.css';

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_super_admin: boolean;
  is_active: boolean;
}

const AdminAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/admin/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch admin accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/admin/accounts/${id}`);
      fetchAccounts();
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="admin-accounts">
      <div className="page-header">
        <h1>관리자 계정 관리</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + 관리자 계정 등록
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
              <th>권한</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.username}</td>
                <td>{account.email}</td>
                <td>{account.full_name}</td>
                <td>{account.role}</td>
                <td>{account.is_super_admin ? '슈퍼관리자' : '일반관리자'}</td>
                <td>{account.is_active ? '활성' : '비활성'}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingAccount(account);
                      setShowModal(true);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(account.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AdminAccountModal
          account={editingAccount}
          onClose={() => {
            setShowModal(false);
            setEditingAccount(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAccount(null);
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
};

interface AdminAccountModalProps {
  account: AdminAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAccountModal: React.FC<AdminAccountModalProps> = ({
  account,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    username: account?.username || '',
    email: account?.email || '',
    full_name: account?.full_name || '',
    password: '',
    role: account?.role || 'admin',
    is_super_admin: account?.is_super_admin || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (account) {
        await api.put(`/admin/accounts/${account.id}`, formData);
      } else {
        await api.post('/admin/accounts', formData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.detail || '저장에 실패했습니다.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{account ? '관리자 계정 수정' : '관리자 계정 등록'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>사용자명</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>비밀번호 {account && '(변경 시에만 입력)'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!account}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_super_admin}
                onChange={(e) => setFormData({ ...formData, is_super_admin: e.target.checked })}
              />
              슈퍼관리자
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccounts;

