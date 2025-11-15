/**
 * Helper script để test token trong Console
 * 
 * Cách dùng:
 * 1. Mở DevTools Console (F12)
 * 2. Copy và paste các hàm này vào console
 * 3. Gọi: setTestToken() hoặc setTestToken('your-token-here')
 */

// Token test mặc định
const DEFAULT_TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImExYjJjM2Q0LXRlc3QtdXNlci1hMjQxLTAwMTU1ZDBjYmY0MCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vcm1hbC51c2VyQGNhcmJvbnRjLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjE3OTMwMTkzODV9.82VvuC8_O-QP9ElWq5Fnf-SECXfRyKIvhwlSFUMA2r0';

/**
 * Set token vào localStorage
 * @param {string} token - Token JWT (nếu không có sẽ dùng token mặc định)
 */
window.setTestToken = function(token = DEFAULT_TEST_TOKEN) {
  if (!token || !token.trim()) {
    console.error('❌ Token không hợp lệ');
    return;
  }
  
  localStorage.setItem('accessToken', token.trim());
  console.log('✅ Token đã được lưu vào localStorage.accessToken');
  console.log('📋 Token:', token.substring(0, 50) + '...');
  console.log('🔄 Reload trang để áp dụng token');
  
  return token;
};

/**
 * Xóa token khỏi localStorage
 */
window.clearTestToken = function() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userToken');
  console.log('✅ Đã xóa token');
  return true;
};

/**
 * Kiểm tra token hiện tại
 */
window.checkToken = function() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
  if (token) {
    console.log('✅ Token hiện tại:', token.substring(0, 50) + '...');
    console.log('📋 Full token:', token);
    
    // Decode token để xem thông tin
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      console.log('📊 Token payload:', payload);
    } catch (e) {
      console.warn('⚠️ Không thể decode token');
    }
  } else {
    console.log('❌ Chưa có token trong localStorage');
  }
  return token;
};

/**
 * Set token và reload trang
 * @param {string} token - Token JWT (nếu không có sẽ dùng token mặc định)
 */
window.setTestTokenAndReload = function(token = DEFAULT_TEST_TOKEN) {
  window.setTestToken(token);
  console.log('🔄 Đang reload trang...');
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

// Export để có thể import nếu cần
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setTestToken: window.setTestToken,
    clearTestToken: window.clearTestToken,
    checkToken: window.checkToken,
    setTestTokenAndReload: window.setTestTokenAndReload,
    DEFAULT_TEST_TOKEN
  };
}

