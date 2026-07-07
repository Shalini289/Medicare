const normalizePhone = (value = "") => String(value || "").replace(/\D/g, "");

const isValidPhone = (value = "", { required = false } = {}) => {
  const phone = normalizePhone(value);

  if (!phone) return !required;
  return phone.length === 10;
};

const validatePhone = (value = "", label = "Phone", options = {}) => {
  if (!isValidPhone(value, options)) {
    return `${label} must be exactly 10 digits`;
  }

  return "";
};

module.exports = {
  normalizePhone,
  isValidPhone,
  validatePhone,
};
