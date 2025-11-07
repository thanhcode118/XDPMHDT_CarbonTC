import api from '../api/apiCarbonLifecycle'; // Đảm bảo import file ở Bước 1

/**
 * Tải lên file hành trình (CSV hoặc JSON).
 */
export const uploadJourneyFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file); 

  return api.post('/api/evjourneys/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Lấy danh sách hành trình của người dùng đang đăng nhập.
 * (Backend tự lấy ID từ token)
 */
export const getMyJourneys = async () => {
  // Sửa route thành "my-journeys" và không cần ownerId
  return api.get('/api/evjourneys/my-journeys');
};

/**
 * Lấy chi tiết một hành trình theo ID.
 */
export const getJourneyById = async (journeyId) => {
    if (!journeyId) {
        throw new Error('Journey ID is required.');
    }
    return api.get(`/api/evjourneys/journey/${journeyId}`);
};