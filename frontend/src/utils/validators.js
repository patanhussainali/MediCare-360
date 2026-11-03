export const validateEmail = (email) => {
  if (!email) return 'Email address is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Mobile number is required';
  if (!/^\d{10}$/.test(String(phone).trim())) return 'Enter exactly 10 digits using numbers only';
  return null;
};

export const sanitizePhoneInput = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};
