import apiClient from './apiClient.jsx';

// Carbon wallet
export async function getMyCarbonWallet() {
  const { data } = await apiClient.get('/api/carbon-wallet/my-wallet');
  return data; // ApiResponseCarbonWalletResponse
}

// E-wallet transactions (fiat/money)
export async function getMyEWalletTransactions() {
  const { data } = await apiClient.get('/api/wallet/my-wallet/transactions');
  return data; // ApiResponseListTransactionLogResponse
}

// Payments / deposit
export async function createDepositPayment(amount) {
  const { data } = await apiClient.post('/api/payments/deposit', { amount });
  return data; // ApiResponseString (e.g., payment URL or message)
}

// VNPay return handler - pass through raw query params (flattened)
export async function vnpayReturn(rawParams) {
  const { data } = await apiClient.get('/api/payments/vnpay-return', {
    params: rawParams
  });
  return data; // ApiResponseString
}

// Withdraw requests (money out)
export async function createWithdrawRequest({ userId, amount, bankAccountNumber, bankName }) {
  const payload = { userId, amount, bankAccountNumber, bankName };
  const { data } = await apiClient.post('/api/withdraw-requests', payload);
  return data; // ApiResponseWithdrawRequestResponse
}

// E-wallet detail (fiat)
export async function getMyEWallet() {
  const { data } = await apiClient.get('/api/wallet/my-wallet');
  return data; // ApiResponseEWalletResponse
}

// Certificate download (PDF)
export async function downloadCertificate(uniqueHash) {
  const response = await apiClient.get(`/api/certificates/download/${uniqueHash}`, {
    responseType: 'blob'
  });
  return response.data; // Blob
}


