# AUREL

Website thực hành đồ án kiểm thử, trước đây mang tên CHRONO. HTML/CSS/JavaScript thuần, dữ liệu lưu tại `localStorage`/`sessionStorage`, không có backend hoặc MySQL.

## Các khu vực chính
- **Trang khách hàng:** `home.html`, `product.html`, `cart.html`, `checkout.html`, `order-success.html`, `register.html`, `login.html`, `account.html`, `orders.html`, `order-detail.html`, `wishlist.html`, `about.html`, `contact.html` dùng chung `storefront.js` và `storefront.css`.
- **Quản lý cửa hàng:** `index.html` (`app.js`, `store.js`, `demo-data.js`) liên thông trực tiếp dữ liệu sản phẩm, khách hàng và đơn hàng qua khóa `chrono-watch-v1`.
- **Không gian QA:** `qa.html`, `lab.html`, `qa-portfolio.html` cùng bộ 90 ca thủ công (`docs/TEST-CASES.csv`), 24 ca khách hàng mới (`docs/TEST-CASES-CUSTOMER.csv`), kịch bản Katalon và plan JMeter.

## Nguyên tắc và giới hạn trung thực
- Người dùng chốt tên **AUREL** và tông **trắng / xanh ngọc (`#087b6a`)** ngày 26/11/2026.
- Ảnh đồng hồ mặc định trong `assets/images/` do AI tạo để minh họa, không phải ảnh chính thức của Seiko, Citizen, Casio, Orient, Tissot.
- Đặt hàng, tài khoản khách, kiểm soát hiển thị đơn hàng và biểu mẫu liên hệ đều là **mô phỏng cục bộ trên trình duyệt**, không thu thập thẻ, không thanh toán thật, không gửi yêu cầu tới doanh nghiệp thật và không thay thế bảo mật production.
- Đơn khách đặt qua `checkout.html` luôn tạo đơn **Nháp** (chưa trừ tồn kho); quản trị viên xác nhận trong `index.html` mới kiểm tra đủ tồn mọi dòng và trừ kho; hủy đơn đã xác nhận hoàn kho đúng một lần; giữ giá lịch sử trong đơn.
- Namespace dữ liệu `chrono-*` và hồ sơ/bằng chứng cũ được giữ nguyên để tương thích và không làm mất dữ liệu đã lưu.
