import apiClientTK from './apiClientTK.jsx';

const unwrap = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    const apiError = error.response?.data ?? {};
    return Promise.reject({
      ...apiError,
      status: error.response?.status,
      message: apiError.message || error.message || 'Đã xảy ra lỗi không xác định'
    });
  }
};

// Carbon wallet
export const getMyCarbonWallet = () => unwrap(
  apiClientTK.get('/carbon-wallet/my-wallet')
);

export const getCarbonWalletHistory = () => unwrap(
  apiClientTK.get('/carbon-wallet/history')
);

// E-wallet (fiat)
export const getMyEWallet = () => unwrap(
  apiClientTK.get('/wallet/my-wallet')
);

export const getMyEWalletTransactions = () => unwrap(
  apiClientTK.get('/wallet/my-wallet/transactions')
);

// Payments / deposit
export const createDepositPayment = (amount) => unwrap(
  apiClientTK.post('/payments/deposit', { amount })
);

// Withdraw requests (money out)
export const createWithdrawRequest = ({ userId, amount, bankAccountNumber, bankName }) => {
  const payload = { userId, amount, bankAccountNumber, bankName };
  return unwrap(apiClientTK.post('/withdraw-requests', payload));
};

// Certificate download (PDF)
export const downloadCertificate = (uniqueHash) => {
  return apiClientTK.get(`/certificates/download/${uniqueHash}`, {
    responseType: 'blob'
  });
};
