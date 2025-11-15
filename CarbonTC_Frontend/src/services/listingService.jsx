import apiClientPD from './apiClientPD.jsx';

export const getUserIdFromToken = () => {
    const token = localStorage.getItem("userToken");
    if (!token) return null;

    try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        
        // Lấy userId từ các key có thể chứa nó
        return (
            payload["sub"] ||
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
        );
    } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        return null;
    }
};



/**
 * Lấy danh sách listings với các tham số query
 * @param {object} params - Các tham số query (pageNumber, pageSize, type, status, v.v.)
 */
export const getListings = (params) => {
  return apiClientPD.get('/Listing', { params });
};

/**
 * Lấy giá niêm yết gợi ý từ AI.
 * @param {string} [creditId] - (Tùy chọn) ID của tín chỉ để lấy giá cụ thể.
 */
export const getSuggestedPrice = (creditId) => {
  let url = '/Listing/suggest-price';
  if (creditId) {
    url += `?creditId=${creditId}`;
  }
  return apiClientPD.post(url, {}); 
};

export const getMyListings = () => {
  return apiClientPD.get('/Listing/my-listing');
};


/**
 * Tạo một listing mới (bán hoặc đấu giá)
 * @param {object} data - Dữ liệu của listing (theo DTO của API)
 */
export const createListing = (data) => {
  return apiClientPD.post('/Listing', data);
};

export const createAuction = () => {
  return apiClientPD.get('/Listing/my-listing');
};

/**
 * Lấy thông tin chi tiết của một listing bằng ID
 * @param {string} id - ID của listing
 */
export const getListingById = (id) => {
  return apiClientPD.get(`/Listing/${id}`);
};

/**
 * Cập nhật một listing
 * @param {string} id - ID của listing
 * @param {object} data - Dữ liệu cần cập nhật (theo format body của PUT)
 */
export const updateListing = (id, data) => {
  return apiClientPD.put(`/Listing/${id}`, data);
};

/**
 * Xóa (hủy) một listing bằng ID
 * @param {string} id - ID của listing
 */
export const deleteListing = (id) => {
  return apiClientPD.delete(`/Listing/${id}`);
};

/**
 * Lấy thông tin tồn kho (inventory) của một Credit
 * @param {string} creditId - ID của Carbon Credit
 */
export const getCreditInventory = (creditId) => {
  return apiClientPD.get(`/CreditInventory?creditId=${creditId}`);
};

/**
 * Mua tín chỉ từ một listing (giá cố định)
 * @param {string} listingId - ID của listing cần mua
 * @param {number} amount - Số lượng tín chỉ muốn mua
 */
export const buyListing = (listingId, amount) => {
  const body = { amount: amount }; 
  return apiClientPD.post(`/Listing/${listingId}/buy`, body);
};

/**
 * Đặt giá cho một phiên đấu giá
 * @param {string} listingId - ID của listing đấu giá
 * @param {number} bidAmount - Số tiền muốn đặt
 */
export const placeBid = (listingId, bidAmount) => {
  const body = { bidAmount: bidAmount };
  return apiClientPD.post(`/Listing/auctions/${listingId}/bids`, body);
};


/**
 * Lấy danh sách giao dịch BÁN của user
 * @param {object} params - Các tham số query (status, pageNumber, sortBy, ...)
 */
export const getSalesTransactions = (params) => {
    return apiClientPD.get('/users/me/transactions/sales', { params });
};

/**
 * Lấy danh sách giao dịch MUA của user
 * @param {object} params - Các tham số query
 */
export const getPurchasesTransactions = (params) => {
    return apiClientPD.get('/users/me/transactions/purchases', { params });
};

/**
 * Lấy dữ liệu thống kê tóm tắt giao dịch
 */
export const getTransactionSummary = () => {
    // Lưu ý: Endpoint là /Transaction/summary, không phải /users/me/...
    // Điều này có nghĩa là nó có thể là API của Admin.
    // Hãy đảm bảo apiClient của bạn có quyền truy cập endpoint này.
    return apiClientPD.get('/Transaction/summary');
};

/**
 * Lấy dữ liệu thống kê tóm tắt cho Wallet
 */
export const getWalletSummary = () => {
  return apiClientPD.get('/Transaction/wallet-summary');
};

/**
 * Lấy dữ liệu biểu đồ thống kê
 * @param {number} period - 0 = Tuần, 1 = Tháng, 2 = Năm
 */
export const getTransactionChartData = (period) => {
  return apiClientPD.get('/Transaction/summary/chart', { 
    params: { period } 
  });
};

/**
 * Lấy danh sách tín chỉ (credits) của một người dùng cụ thể
 * @param {string} userId - ID của người dùng (từ token hoặc ID khác)
 */
export const getUserCredits = (userId) => {
  // Sẽ gọi đến [BASE_URL]/api/CarbonCredits/user/{userId}
  return apiClientPD.get(`/CarbonCredits/user/${userId}`);
};


/**
 * Gửi báo cáo khiếu nại (dispute)
 * @param {object} disputeData - Dữ liệu khiếu nại
 * @param {string} disputeData.transactionId - ID của giao dịch
 * @param {string} disputeData.reason - Lý do khiếu nại
 * @param {string} disputeData.description - Mô tả chi tiết
 */
export const submitDispute = (disputeData) => {
  return apiClientPD.post('/admin/disputes', disputeData);
};

/**
 * Kiểm tra xem một giao dịch đã có khiếu nại hay chưa.
 * @param {string} transactionId - Mã giao dịch (ví dụ: 'TXN-2024-010')
 * @returns {Promise<Object>} - Toàn bộ phản hồi từ API
 */
export const getDisputeByTransactionId = (transactionId) => {
  return apiClientPD.get(`/admin/disputes/transaction/${transactionId}`);
};
