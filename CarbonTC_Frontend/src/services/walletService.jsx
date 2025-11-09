import apiClientTK from './apiClientTK.jsx';

// Carbon wallet
export const getMyCarbonWallet = () => {
  return apiClientTK.get('/carbon-wallet/my-wallet');
};

export const createMyCarbonWallet = () => {
  return apiClientTK.post('/carbon-wallet/my-wallet');
};

// E-wallet (fiat)
export const getMyEWallet = () => {
  return apiClientTK.get('/wallet/my-wallet');
};

export const createMyEWallet = (currency = 'VND') => {
  return apiClientTK.post('/wallet/my-wallet', { currency });
};

export const getMyEWalletTransactions = () => {
  return apiClientTK.get('/wallet/my-wallet/transactions');
};

// Payments / deposit
export const createDepositPayment = (amount) => {
  return apiClientTK.post('/payments/deposit', { amount });
};

// Withdraw requests (money out)
export const createWithdrawRequest = ({ userId, amount, bankAccountNumber, bankName }) => {
  const payload = { userId, amount, bankAccountNumber, bankName };
  return apiClientTK.post('/withdraw-requests', payload);
};

// Certificate download (PDF)
export const downloadCertificate = (uniqueHash) => {
  return apiClientTK.get(`/certificates/download/${uniqueHash}`, {
    responseType: 'blob'
  });
};
