export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return ''; 
  const date = new Date(dateString); 
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export const convertUTCToVnTime = (utcTime) => {
  if (!utcTime) return '';
  const date = new Date(utcTime);
  const vnTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  return vnTime;
};

export const convertVnTimeToUTC = (localDateTime) => {
  if (!localDateTime) return '';
  return new Date(localDateTime).toISOString();
};



export const calculateTotal = (quantity, price) => {
  if (!quantity || !price) return 0;
  return quantity * price;
};

export const formatForDateTimeInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
};