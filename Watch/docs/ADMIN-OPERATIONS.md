# Sáu phân hệ quản trị AUREL

- Nhà cung cấp: tạo, sửa, ngừng/mở hợp tác; không xóa lịch sử.
- Phiếu nhập: một sản phẩm, nhà cung cấp, giá nhập và số lượng. Nháp → Đã nhập (cộng tồn) hoặc Đã hủy.
- Thanh toán: chọn đơn đã xác nhận, tiền mặt/chuyển khoản/COD; chờ → đã thanh toán → hoàn tiền (ghi nhận thủ công, không chuyển tiền thật).
- Giao hàng: đơn đã xác nhận, đơn vị, mã vận đơn, địa chỉ; chờ → đang giao → đã giao, hoặc giao thất bại và giao lại.
- Bảo hành: đơn đã xác nhận, sản phẩm thuộc đơn, serial duy nhất, thời hạn 1–60 tháng; theo dõi tình trạng.
- Đổi trả: đơn đã xác nhận, sản phẩm, số lượng không vượt đã mua, lý do; chờ → duyệt/từ chối → hoàn tất. Không tự hoàn tiền hoặc hoàn kho; chưa thay đổi luồng hủy đơn và báo cáo cũ.

Dữ liệu lưu trong operations của chrono-watch-v1. Xuất JSON hiện có bao gồm dữ liệu này; nhập JSON cũ hoặc nạp demo thay thế và xóa các hồ sơ mở rộng. Các hồ sơ có thông tin lịch sử độc lập; hủy đơn gốc không tự hủy hồ sơ mở rộng. Admin tạo/sửa/chuyển trạng thái; Staff chỉ xem. Không có backend/DB.

## Kiểm tra

Mở index.html sau npm start, đăng nhập admin. Thêm nhà cung cấp, tạo phiếu nhập, xác nhận rồi đối chiếu kho. Tạo và xác nhận đơn hàng trước khi sử dụng bốn phân hệ còn lại. Chạy npm test để kiểm tra nghiệp vụ, npm run check để kiểm tra cú pháp. Chưa có kết quả Playwright/Katalon/JMeter mới cho 6 màn hình; không dùng kết quả cũ thay thế.

## Điều hướng Admin

Admin dùng hash routing `index.html#/dashboard`, `#/products`, `#/orders`, `#/customers`, `#/inventory`, `#/categories`, `#/reports`, `#/suppliers`, `#/receipts`, `#/payments`, `#/deliveries`, `#/warranties`, `#/returns`, `#/users`. Mở link trực tiếp hoặc tải lại giữ đúng phân hệ; Back/Forward hoạt động qua lịch sử trình duyệt. Route sai hoặc Staff mở trang tài khoản sẽ về tổng quan. Khi chưa đăng nhập, giữ đích để mở sau khi đăng nhập; đăng xuất đặt lại tổng quan. Không tạo HTML riêng cho từng route; hash không gửi đến HTTP server, JMeter vẫn chỉ đo tài nguyên tĩnh. Bộ kiểm tra mới: `npx playwright test tests/e2e/admin-routing.spec.js`.
