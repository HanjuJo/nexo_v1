import React, { useState } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../pages/common/PageCommon.css';

interface BackupFile {
  filename: string;
  size: number;
  created_at: string;
  modified_at: string;
}

const Backup: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const handleCreateBackup = async () => {
    if (!window.confirm('백업을 생성하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await api.get('/backup/create');
      success('백업이 생성되었습니다.');
      fetchBackupList(); // 목록 새로고침
    } catch (err: any) {
      showError(err.response?.data?.detail || '백업 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupList = async () => {
    setLoadingList(true);
    try {
      const response = await api.get('/backup/list');
      setBackups(response.data.backups || []);
    } catch (err: any) {
      showError('백업 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await api.get(`/backup/download/${filename}`, {
        responseType: 'blob',
      });

      // Blob을 파일로 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      success('백업 파일이 다운로드되었습니다.');
    } catch (err: any) {
      showError('백업 다운로드에 실패했습니다.');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/backup/${filename}`);
      success('백업 파일이 삭제되었습니다.');
      fetchBackupList();
    } catch (err: any) {
      showError(err.response?.data?.detail || '백업 삭제에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  React.useEffect(() => {
    fetchBackupList();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>데이터 백업</h1>
        <button
          className="btn-primary"
          onClick={handleCreateBackup}
          disabled={loading}
        >
          {loading ? '백업 생성 중...' : '+ 백업 생성'}
        </button>
      </div>

      <div className="page-filters">
        <button
          className="btn-secondary"
          onClick={fetchBackupList}
          disabled={loadingList}
        >
          {loadingList ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {loadingList ? (
        <LoadingSpinner message="백업 목록을 불러오는 중..." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>파일명</th>
                <th>크기</th>
                <th>생성일</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    백업 파일이 없습니다.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.filename}>
                    <td>{backup.filename}</td>
                    <td>{formatFileSize(backup.size)}</td>
                    <td>{formatDate(backup.created_at)}</td>
                    <td>{formatDate(backup.modified_at)}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleDownload(backup.filename)}
                      >
                        다운로드
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(backup.filename)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>백업 안내</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>백업은 데이터베이스의 전체 내용을 저장합니다.</li>
          <li>정기적으로 백업을 생성하여 데이터를 안전하게 보관하세요.</li>
          <li>백업 파일은 로컬 컴퓨터에 다운로드하여 보관하세요.</li>
          <li>백업 파일은 안전한 곳에 보관하시기 바랍니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default Backup;

