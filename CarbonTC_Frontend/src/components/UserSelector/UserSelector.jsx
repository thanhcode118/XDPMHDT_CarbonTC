import React, { useState, useEffect } from 'react';
import './UserSelector.css'; 

const UserSelector = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Danh sách users với token
  const users = [
    {
      id: 1,
      name: 'User 1',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImQ1MTkwZTNhLWUxYmQtNGU4Mi04NTcxLTM4MDk3YzNhOTY1MiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vcm1hbC51c2VyQGNhcmJvbnRjLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjE3OTMwMTkzODV9.Bj_6gdpSNuvxKxkUWLZkR_T4PVKtBfYbexQ7v0qkELg'
    },
    {
      id: 2,
      name: 'User 2',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImY2NTBlYzk3LTEyNzgtNDkwZi05Mjk2LTlmZjY5MGJlMWU2YyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vcm1hbC51c2VyQGNhcmJvbnRjLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjI3OTMwMTkzODV9.cm87EkGQyX51byTb-SkbzD2z7aJ_3uq3tboR_yYv9zU'
    },
    {
      id: 3,
      name: 'User 3',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6Ijk3ZGVlNjNlLTdiZTMtNDkxOC1hZDg1LTIwN2EyMzQwODMyMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vcm1hbC51c2VyQGNhcmJvbnRjLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjI3OTMwMTkzODV9.pKUadLUeXRBlVjbvdTcw8W4vvV8CSe8Vrbowe3FGaKQ'
    }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('userToken');
    
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const selectUser = (user) => {
    setCurrentUser(user);
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userToken', user.token);
    
    console.log(`Đã chọn ${user.name}`);
    console.log('Token đã được lưu vào localStorage');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    console.log('Đã đăng xuất');
  };

  const displayToken = (token) => {
    if (!token) return '';
    const start = token.substring(0, 20);
    const end = token.substring(token.length - 20);
    return `${start}...${end}`;
  };

  return (
    <div className="user-selector">
      <h2>Chọn User</h2>
      
      <div className="user-buttons">
        {users.map(user => (
          <button
            key={user.id}
            className={`user-btn ${currentUser?.id === user.id ? 'active' : ''}`}
            onClick={() => selectUser(user)}
          >
            {user.name}
          </button>
        ))}
      </div>

      {currentUser && (
        <div className="user-info">
          <h3>Thông tin User hiện tại:</h3>
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Token:</strong> {displayToken(currentUser.token)}</p>
          <button className="logout-btn" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      )}

      <div className="storage-info">
        <h4>Kiểm tra localStorage:</h4>
        <button 
          className="check-btn"
          onClick={() => {
            const token = localStorage.getItem('userToken');
            alert(`Token trong localStorage: ${displayToken(token || '')}`);
          }}
        >
          Kiểm tra Token
        </button>
        
        <button 
          className="clear-btn"
          onClick={() => {
            localStorage.clear();
            setCurrentUser(null);
            alert('Đã xóa tất cả dữ liệu localStorage');
          }}
        >
          Xóa localStorage
        </button>
      </div>
    </div>
  );
};

export default UserSelector;