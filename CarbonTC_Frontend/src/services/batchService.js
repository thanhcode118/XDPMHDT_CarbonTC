import api from '../api/apiCarbonLifecycle'; 

/**
 * Tạo một lô hành trình mới.
 * (Backend tự lấy ownerId từ token)
 */
export const createJourneyBatch = async (name, journeyIds) => {
  if (!name || !journeyIds || journeyIds.length === 0) {
    throw new Error('Batch name and at least one journey ID are required.');
  }

  const payload = {
    Name: name, 
    JourneyIds: journeyIds,
  };
  return api.post('/api/evjourneys/batch', payload);
};

/**
 * Lấy danh sách các lô hành trình của người dùng đang đăng nhập.
 * (Backend tự lấy ID từ token)
 */
export const getMyJourneyBatches = async () => {
    try {
        const batches = await api.get('/api/journeybatches/mybatches');
        return batches || []; 
    } catch (error) {
        console.error("Error fetching my journey batches:", error);
        throw error;
    }
};