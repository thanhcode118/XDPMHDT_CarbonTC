import apiClientTK from './apiClientTK.jsx';

/**
 * Lấy URL chứng chỉ bằng Transaction ID
 * @param {string} transactionId - ID của giao dịch
 */
export const getCertificate = (transactionId) => {
    return apiClientTK.get(`/certificates/certificate/${transactionId}`);
};