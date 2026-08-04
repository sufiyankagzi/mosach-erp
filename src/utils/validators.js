export const validateEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateMobile = (mobile) => {
  if (!mobile) return true;
  return /^[6-9]\d{9}$/.test(mobile);
};

export const validateGST = (gst) => {
  if (!gst) return true;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/.test(gst);
};

export const validatePAN = (pan) => {
  if (!pan) return true;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
};