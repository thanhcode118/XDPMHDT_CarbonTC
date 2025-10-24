export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
};

export const calculateTotal = (quantity, price) => {
  return quantity * price;
};