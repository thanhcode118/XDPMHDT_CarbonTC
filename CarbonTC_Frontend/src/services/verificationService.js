import api from '../api/apiCarbonLifecycle'; 

/**
 * Gửi yêu cầu xác minh cho một lô hành trình.
 */
export const submitVerificationRequest = async (journeyBatchId) => {
  if (!journeyBatchId) {
    throw new Error('Journey Batch ID is required to submit verification.');
  }
  const payload = {
    JourneyBatchId: journeyBatchId,
  };
  return api.post('/api/verificationrequests', payload);
};