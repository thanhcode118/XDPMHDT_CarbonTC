import React, { useState, useEffect } from 'react';
import styles from './TokenTestHelper.module.css';

/**
 * Component helper để test token nhanh khi chưa có auth service
 * Chỉ hiển thị trong development mode
 */
const TokenTestHelper = () => {
  const [token, setToken] = useState('');
  const [currentToken, setCurrentToken] = useState('');

  // Token test mặc định
  const DEFAULT_TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImExYjJjM2Q0LXRlc3QtdXNlci1hMjQxLTAwMTU1ZDBjYmY0MCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vcm1hbC51c2VyQGNhcmJvbnRjLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjE3OTMwMTkzODV9.82VvuC8_O-QP9ElWq5Fnf-SECXfRyKIvhwlSFUMA2r0';

  useEffect(() => {
    // Load token hiện tại từ localStorage
    const stored = localStorage.getItem('accessToken');
    setCurrentToken(stored || '');
    if (!stored) {
      setToken(DEFAULT_TEST_TOKEN);
    } else {
      setToken(stored);
    }
  }, []);

  const handleSetToken = () => {
    if (token.trim()) {
      localStorage.setItem('accessToken', token.trim());
      setCurrentToken(token.trim());
      alert('✅ Token đã được lưu vào localStorage (accessToken)');
      window.location.reload(); // Reload để các API call mới có token
    } else {
      alert('❌ Vui lòng nhập token');
    }
  };

  const handleUseDefault = () => {
    setToken(DEFAULT_TEST_TOKEN);
    localStorage.setItem('accessToken', DEFAULT_TEST_TOKEN);
    setCurrentToken(DEFAULT_TEST_TOKEN);
    alert('✅ Đã set token mặc định');
    window.location.reload();
  };

  const handleClearToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userToken');
    setCurrentToken('');
    setToken('');
    alert('✅ Đã xóa token');
    window.location.reload();
  };

  // Chỉ hiển thị trong development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <i className="bi bi-key"></i>
        <span>Token Test Helper (Dev Only)</span>
      </div>
      <div className={styles.content}>
        <div className={styles.inputGroup}>
          <label>Access Token:</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Nhập token JWT..."
            rows={3}
            className={styles.tokenInput}
          />
        </div>
        <div className={styles.status}>
          <strong>Token hiện tại:</strong>
          <span className={currentToken ? styles.hasToken : styles.noToken}>
            {currentToken ? '✅ Đã set' : '❌ Chưa set'}
          </span>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSetToken} className={styles.btnSet}>
            <i className="bi bi-check-circle"></i> Set Token
          </button>
          <button onClick={handleUseDefault} className={styles.btnDefault}>
            <i className="bi bi-arrow-clockwise"></i> Dùng Token Mặc Định
          </button>
          <button onClick={handleClearToken} className={styles.btnClear}>
            <i className="bi bi-x-circle"></i> Xóa Token
          </button>
        </div>
        <div className={styles.info}>
          <small>
            💡 Token được lưu vào <code>localStorage.accessToken</code>
            <br />
            Các API calls sẽ tự động lấy token từ đây
          </small>
        </div>
      </div>
    </div>
  );
};

export default TokenTestHelper;

