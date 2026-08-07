// Nội dung các trang chính sách tĩnh (mẫu, có thể chỉnh sửa sau).
export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Policy {
  slug: 'privacy' | 'terms' | 'shipping' | 'return';
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
}

const STORE = 'Hương Small House';

export const policies: Record<Policy['slug'], Policy> = {
  privacy: {
    slug: 'privacy',
    title: 'Chính sách bảo mật',
    updated: '01/2026',
    intro: `${STORE} cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng cho mục đích phục vụ đơn hàng, chăm sóc và cải thiện trải nghiệm mua sắm.`,
    sections: [
      {
        heading: 'Thông tin chúng tôi thu thập',
        bullets: [
          'Họ tên, số điện thoại, email và địa chỉ nhận hàng khi bạn đặt đơn.',
          'Lịch sử mua hàng và tương tác trên website để gợi ý sản phẩm phù hợp.',
          'Dữ liệu kỹ thuật cơ bản (trình duyệt, thiết bị) nhằm tối ưu hiển thị.',
        ],
      },
      {
        heading: 'Mục đích sử dụng',
        bullets: [
          'Xử lý, giao và chăm sóc sau đơn hàng.',
          'Gửi thông tin khuyến mãi khi bạn đồng ý nhận tin.',
          'Nâng cao chất lượng dịch vụ và bảo mật hệ thống.',
        ],
      },
      {
        heading: 'Bảo mật và chia sẻ',
        paragraphs: [
          'Thông tin của bạn được lưu trữ an toàn và không được bán cho bên thứ ba. Chúng tôi chỉ chia sẻ dữ liệu tối thiểu cho đơn vị vận chuyển và thanh toán để hoàn tất đơn hàng.',
          'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân bằng cách liên hệ bộ phận CSKH.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Điều khoản sử dụng',
    updated: '01/2026',
    intro: `Khi truy cập và mua sắm tại ${STORE}, bạn đồng ý với các điều khoản dưới đây nhằm đảm bảo quyền lợi cho cả khách hàng và cửa hàng.`,
    sections: [
      {
        heading: 'Tài khoản',
        bullets: [
          'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.',
          'Thông tin cung cấp khi đặt hàng cần chính xác và trung thực.',
        ],
      },
      {
        heading: 'Sản phẩm và giá',
        paragraphs: [
          'Sản phẩm là thực phẩm chức năng, không phải thuốc và không thay thế thuốc chữa bệnh. Vui lòng đọc kỹ hướng dẫn sử dụng.',
          'Giá và khuyến mãi có thể thay đổi; giá áp dụng là giá hiển thị tại thời điểm đặt hàng thành công.',
        ],
      },
      {
        heading: 'Trách nhiệm',
        paragraphs: [
          `${STORE} cam kết cung cấp hàng chính hãng và hỗ trợ khách hàng tận tâm. Chúng tôi không chịu trách nhiệm với thiệt hại phát sinh do sử dụng sai hướng dẫn.`,
        ],
      },
    ],
  },
  shipping: {
    slug: 'shipping',
    title: 'Chính sách vận chuyển',
    updated: '01/2026',
    intro: `${STORE} giao hàng toàn quốc, nhanh chóng và có theo dõi trạng thái đơn.`,
    sections: [
      {
        heading: 'Thời gian giao hàng',
        bullets: [
          'Nội thành Hà Nội: 1–2 ngày làm việc.',
          'Các tỉnh thành khác: 2–5 ngày làm việc tuỳ khu vực.',
          'Đơn đặt sau 17h được xử lý vào ngày làm việc kế tiếp.',
        ],
      },
      {
        heading: 'Phí vận chuyển',
        bullets: [
          'Miễn phí giao hàng cho đơn từ 500.000đ.',
          'Đơn dưới 500.000đ áp dụng phí theo bảng giá đối tác vận chuyển.',
        ],
      },
      {
        heading: 'Theo dõi đơn hàng',
        paragraphs: [
          'Sau khi đơn được gửi đi, bạn sẽ nhận mã vận đơn qua SMS/email để theo dõi. Nếu cần hỗ trợ, vui lòng liên hệ hotline 0336 064 040.',
        ],
      },
    ],
  },
  return: {
    slug: 'return',
    title: 'Chính sách đổi trả',
    updated: '01/2026',
    intro: `${STORE} hỗ trợ đổi trả để bạn yên tâm mua sắm.`,
    sections: [
      {
        heading: 'Điều kiện đổi trả',
        bullets: [
          'Trong vòng 7 ngày kể từ khi nhận hàng.',
          'Sản phẩm còn nguyên tem, nhãn, bao bì và chưa qua sử dụng.',
          'Có hoá đơn hoặc thông tin đơn hàng hợp lệ.',
        ],
      },
      {
        heading: 'Các trường hợp được hỗ trợ',
        bullets: [
          'Sản phẩm bị lỗi, hư hỏng hoặc sai so với đơn đặt.',
          'Sản phẩm hết hạn hoặc gần hạn sử dụng khi giao.',
        ],
      },
      {
        heading: 'Quy trình',
        paragraphs: [
          'Liên hệ CSKH qua hotline hoặc email kèm hình ảnh sản phẩm. Chúng tôi sẽ xác nhận và hướng dẫn đổi trả trong 24–48 giờ làm việc.',
        ],
      },
    ],
  },
};
