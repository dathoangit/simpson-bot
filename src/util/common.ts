export const isEmail = (email: string): boolean => {
  // Biểu thức chính quy để kiểm tra địa chỉ email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};
