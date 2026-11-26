# Katalon Studio — thực hành kiểm thử CHRONO

Trạng thái bộ script: **Not Run bằng Katalon**. Không dùng kết quả Playwright để ghi các ca Katalon là Pass.

## Chuẩn bị

1. Tại thư mục có `package.json`, chạy `npm start`. Web phục vụ tại `http://127.0.0.1:5517`.
2. Mở Katalon Studio, tạo một project Web UI. Tạo các test case `KT-001` đến `KT-022` (12 ca cốt lõi, 4 ca luồng khách `KT-013`–`KT-016`, 6 ca giao diện/truy cập/bảo mật `KT-017`–`KT-022`).
3. Mở Script View của từng ca, thay nội dung bằng file cùng tên trong `testing/katalon/`. Không chạy Groovy bằng Node.js.
4. Tạo Test Suite, thêm các ca, chạy bằng Chrome. Bộ này không cần Object Repository vì mỗi script tạo TestObject CSS bằng mã.

Script mặc định trỏ tới cổng 5517. Nếu dùng Go Live cổng khác, đổi giá trị `base` trong script hoặc cấu hình Java system property `chrono.baseUrl`.

**Dữ liệu:** mỗi ca mở browser kiểm thử và xóa riêng các khóa CHRONO ở origin đó trước khi chạy. Chỉ dùng browser do Katalon mở, không cấu hình dùng profile Chrome cá nhân. Không dùng dữ liệu thật. Cửa sổ/tab thông thường của người dùng không phải nơi chạy các lệnh reset của bộ script.

## Các ca và tiêu chí đạt

| Mã | Phạm vi | Mong đợi chính |
|---|---|---|
| KT-001 | Đăng nhập admin/đăng xuất | Có menu quản trị; đăng xuất về form |
| KT-002 | Staff | Không có nút quản lý tài khoản hoặc tạo sản phẩm |
| KT-003 | Sai mật khẩu | Hiện lỗi; không có phiên |
| KT-004 | Mã sản phẩm trùng sau chuẩn hóa | Báo trùng; số sản phẩm không đổi |
| KT-005 | Giá bằng 0 | Native validation chặn; không ghi sản phẩm |
| KT-006 | Tạo khách | Có khách trên UI và dữ liệu được lưu |
| KT-007 | Nháp → xác nhận → hủy | Tồn SE001: 8 → 8 → 6 → 8 |
| KT-008 | Bán vượt tồn | Đơn giữ Nháp; tồn vẫn 8 |
| KT-009 | Tìm kiếm trang chủ | Tìm Seiko đúng 1 sản phẩm; từ khóa lạ hiện rỗng |
| KT-010 | 24 ca nghiệp vụ QA | 24 Pass; dữ liệu cửa hàng vẫn có 7 sản phẩm |
| KT-011 | Demo Fail và retest | 11 Pass/1 Fail mô phỏng → 12 Pass; có so sánh |
| KT-012 | Mobile | QA/lab không tràn toàn trang ở viewport 390px |
| KT-013 | Đăng ký & đăng nhập khách | Tài khoản khách tách biệt admin/staff; chặn `admin / Admin@123` tại `login.html` |
| KT-014 | Khách đặt hàng → Admin xác nhận → Khách xem đơn | Checkout tạo đơn nháp (tồn giữ 8) → Admin xác nhận (tồn còn 6) → Khách thấy Đã xác nhận |
| KT-015 | Giỏ hàng đối chiếu giá cửa hàng | Sửa `price=1` trong `chrono-cart-v1` vẫn tính tổng theo giá thật 12.500.000 VND |
| KT-016 | Cô lập đơn & responsive trang khách | Không tràn ngang 390px trên các trang khách; URL đơn sai bị chặn hiển thị |
| KT-017 | Giao diện nhất quán và nhận diện | 13 trang có thanh tiện ích, thương hiệu AUREL, footer 4 cột giống nhau; nút chính `rgb(8, 123, 106)`; tiêu đề dùng Aurel Display |
| KT-018 | Khả năng truy cập cấu trúc | `lang=vi`, title khác nhau, đúng 1 h1, có main/header/footer, nav có nhãn, ảnh có alt |
| KT-019 | Khả năng truy cập biểu mẫu | Ô nhập có nhãn; lỗi thanh toán có `aria-invalid`, `aria-describedby`, `role=alert` |
| KT-020 | Responsive | Menu đổi giữa 390px và 1440px; không tràn ngang ở 320/390/768/1440px |
| KT-021 | Bảo mật cơ bản (mô phỏng) | Quản lý chưa đăng nhập không lộ đơn; mật khẩu khách không lưu dạng rõ; phiên hết hạn bị đăng xuất |
| KT-022 | Khả năng sử dụng | Thông báo lỗi tiếng Việt, không lộ lỗi kỹ thuật; số tiền theo mẫu 12.500.000 ₫ |

Lưu ý: 12 ca cốt lõi (`KT-001`–`KT-012`) vẫn giữ nguyên cho phòng thực hành `lab.html#katalon`. Bốn ca mở rộng (`KT-013`–`KT-016`) nằm trong `testing/katalon/` dành cho luồng khách hàng AUREL mới và đều ở trạng thái **Not Run bằng Katalon** cho đến khi chạy thực tế trên Katalon Studio. Không dùng kết quả Playwright để đánh dấu các ca Katalon là Pass.

KT-011 là ca kiểm tra cơ chế demo. Ca này được coi là Pass khi UI phát hiện đúng lỗi cố ý rồi chạy lại đạt; không ghi lỗi mô phỏng thành bug sản phẩm. Tương tự, ca nhập sai mật khẩu được Pass khi hệ thống từ chối đúng.

## Bằng chứng cần lưu

Tạo thư mục riêng cho từng lần chạy, ví dụ `docs/evidence/katalon-2026-11-26/`. Lưu report do Katalon xuất, ảnh lỗi, log, phiên bản Studio/Chrome, URL, thời gian, người chạy và mã nguồn đã dùng. Ghi kết quả vào sổ QA khi test case tương ứng thực sự được thực hiện, có kết quả thực tế và đường dẫn bằng chứng. Những ca chưa chạy vẫn Not Run.

## Nguồn hướng dẫn

- [Katalon: tạo/chỉnh script trong Script View](https://docs.katalon.com/katalon-studio/create-test-cases/generate-test-steps-in-katalon-studio-script-view).
- [Katalon: quản lý Web test objects](https://docs.katalon.com/katalon-studio/docs/manage-web-test-object.html).

Script trong dự án do AI hỗ trợ tạo cho CHRONO, không phải source của website bên thứ ba. Cần thực thi trong bản Katalon Studio cài trên máy trước khi kết luận tương thích hoàn toàn.


Ghi chú: `KT-017`…`KT-022` tương ứng các ca `UI-001…027` đã được chạy bằng Playwright ([lịch sử](evidence/ui-claude-2026-11-26/LICH-SU-KIEM-THU-GIAO-DIEN.md)); script Katalon chưa được chạy trong Katalon Studio nên vẫn là **Not Run**. File `testing/katalon-scripts.zip` chỉ chứa 12 ca cốt lõi; các ca `KT-013`…`KT-022` lấy trực tiếp trong thư mục `testing/katalon/`.
