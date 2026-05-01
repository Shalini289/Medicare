export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN");
};

export const formatTime = (time) => {
  return time;
};

export const formatCurrency = (amount) => {
  return `Rs ${amount}`;
};
