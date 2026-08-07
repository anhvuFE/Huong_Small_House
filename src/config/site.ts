/**
 * Cấu hình site — nguồn sự thật cho thông tin liên hệ & tham số nghiệp vụ.
 * Dùng chung cho Header, Footer, trang Liên hệ… thay vì hardcode rải rác.
 */
export const SITE = {
  name: 'Hương Small House',
  nameBrand: 'HƯƠNG',
  nameShort: 'Small House',
  tagline: 'Thực phẩm chức năng chính hãng',

  phone: '0336 064 040',
  phoneHref: 'tel:0336064040',
  email: 'vuquynhhuong171298@gmail.com',
  get emailHref() {
    return `mailto:${this.email}`;
  },

  address: '120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
  addressShort: '120 Hoàng Quốc Việt, Hà Nội',
  addressFull: 'Chung cư nhà A 9 tầng, Ngõ 120 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội',
  workingHours: '8:00 - 22:00 (Tất cả các ngày)',

  // Nghiệp vụ
  freeShipThreshold: 500000, // đồng — miễn phí giao hàng từ mức này
  newCustomerDiscount: 10, // %

  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  },
} as const;
