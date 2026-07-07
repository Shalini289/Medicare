export const normalizePhone = (value = "") =>
  String(value || "").replace(/\D/g, "").slice(0, 10);

export const isTenDigitPhone = (value = "", { required = false } = {}) => {
  const phone = normalizePhone(value);
  if (!phone) return !required;
  return phone.length === 10;
};

export const phoneError = (value = "", label = "Phone", options = {}) =>
  isTenDigitPhone(value, options) ? "" : `${label} must be exactly 10 digits.`;
