export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Chuyển về dạng tổ hợp
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu tiếng Việt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w-]+/g, '') // Xóa các ký tự đặc biệt
    .replace(/--+/g, '-'); // Thay nhiều dấu gạch ngang liên tiếp bằng 1 dấu
};