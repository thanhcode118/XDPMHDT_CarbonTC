import apiClientPD from './apiClientPD.jsx';

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