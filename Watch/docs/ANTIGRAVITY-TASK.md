# Giao việc Antigravity — hoàn thiện các trang khách AUREL

Người dùng đã yêu cầu điều phối Antigravity để hoàn thiện đầy đủ các trang. Đây là chỉ dẫn của tác vụ hiện tại. Dự án nguồn: `C:/Users/Modern 14/Downloads/Watch/Watch`, package `aurel-watch-qa`, HTML/CSS/JS thuần, localStorage, không backend/MySQL.

## Hiện trạng và nhận diện phải giữ

Đọc PRODUCT.md, DESIGN.md, home.html/home.css/home.js, store.js, app.js và demo-data.js trước khi sửa. AUREL, trắng & xanh ngọc #087b6a, font self-host Cormorant Garamond/Be Vietnam Pro. Ảnh AI đã có trong assets/images. Các luồng quản lý và QA đã có 72 ca Playwright đạt. Không đổi tên manufacturer, không xóa/reset dữ liệu người dùng khi chỉ mở trang. Giữ namespace chrono-* để tương thích. Ảnh minh họa cần ghi nguồn, không tuyên bố là ảnh chính thức của hãng.

## Phần Antigravity chịu trách nhiệm

Triển khai giao diện và hành vi đầy đủ, responsive cho các trang khách sau; có thể dùng chung CSS/JS mới để tránh trùng lặp:

1. home.html: giữ trang chủ đang có, danh sách/tìm/lọc, thêm liên kết chi tiết sản phẩm, giỏ và tài khoản khách.
2. product.html?id=...: ảnh, tên, giá, thương hiệu/loại, mô tả, tồn, chọn số lượng, thêm giỏ và yêu thích; xử lý ID không tồn tại/ngừng bán/hết hàng.
3. cart.html: giỏ local, đổi số lượng, xóa dòng, tổng tiền, trạng thái rỗng, điều hướng checkout; không tin giá được sửa trong localStorage giỏ, đối chiếu dữ liệu sản phẩm thật.
4. checkout.html: khách vãng lai hoặc tài khoản khách, form tên/điện thoại/email/địa chỉ, tóm tắt đơn, kiểm tra lại sản phẩm/tồn/giá khi gửi. Chỉ đặt hàng mô phỏng, không nhận thẻ hay thanh toán thật. Chống gửi lặp bằng nút vô hiệu hóa/idempotency.
5. order-success.html: chỉ hiển thị đơn đã tạo hợp lệ, mã/tổng và lối xem đơn; không tự tạo đơn khi reload URL.
6. login.html + register.html: đăng nhập/đăng ký tài khoản KHÁCH riêng, không dùng tài khoản admin/staff của app.js. Validate, chống trùng email, lỗi rõ ràng, có đăng xuất. Nêu đây là mô phỏng local, không khẳng định bảo mật production.
7. account.html: xem/sửa hồ sơ khách đã đăng nhập, điều hướng lịch sử và yêu thích, trạng thái chưa đăng nhập rõ ràng.
8. orders.html + order-detail.html?id=...: lịch sử/chi tiết đơn thuộc tài khoản khách; không hiển thị đơn của tài khoản khác khi sửa URL. Khách vãng lai chỉ xem đơn vừa tạo trong phiên hoặc tra cứu theo thông tin đối chiếu, không liệt kê toàn bộ đơn cửa hàng.
9. wishlist.html: yêu thích lưu local, thêm/xóa và lối về chi tiết sản phẩm.
10. about.html + contact.html: nội dung AUREL đồ án trung thực, không bịa địa chỉ/chính sách bảo hành/đối tác. Form liên hệ chỉ lưu yêu cầu mô phỏng local, thông báo rõ chưa gửi đến doanh nghiệp.

Checkout phải tạo đơn NHÁP hiển thị trong trang quản lý hiện có với cùng dữ liệu sản phẩm/khách/đơn. Giữ quy tắc: nháp chưa trừ kho; quản trị xác nhận thì kiểm tra toàn bộ dòng/trừ kho; hủy xác nhận hoàn một lần. Có thể thêm thuộc tính liên kết tài khoản khách vào đơn để truy vết. Không sửa business rules đã có. Việc xác thực/ẩn đơn phía client chỉ là mô phỏng, phải nói rõ.

Tất cả trang có header/footer nhất quán, liên kết thật, form có label, thông báo lỗi/loading/empty, không tràn ở 390/768/1440. Có data-testid ổn định cho luồng chính. Nếu cần chuỗi minh họa, không đưa dữ liệu cá nhân thật vào mã. Mọi tính tiền phải là số nguyên VND an toàn, không tính giảm giá/ship/thuế nếu chưa có yêu cầu. Không dựng nút trông bấm được nhưng không hoạt động.

## Quyền chỉnh sửa để tránh xung đột

Antigravity được sửa home.html/home.css/home.js, PRODUCT.md/DESIGN.md theo trải nghiệm thật và tạo các trang/module khách mới, tài liệu hướng dẫn khách. Có thể đọc mọi mã hiện có. Không sửa app.js/store.js/qa*/lab*, scripts/test-server.cjs, package*.json, tests/* hoặc báo cáo bằng chứng: Codex phụ trách tích hợp, server và kiểm thử các phần đó. Nếu cần thay đổi những tệp này, ghi đề xuất trong bàn giao để Codex xử lý.

Không cài framework/package mới, không chạy git reset/clean, không xóa các file hoặc dữ liệu hiện có, không thay cổng server đang dùng (5518 xem trước, 5517 dành cho test). Không xuất bản lên internet. Không sửa ảnh/giấy phép đã có. Dùng DOM textContent/escape cho nội dung người dùng, không innerHTML với chuỗi chưa escape.

## Tiêu chí bàn giao

Thực hiện mã nguồn, không chỉ lập kế hoạch. Kiểm tra cú pháp các JS mới. Tự kiểm tra các luồng có thể chạy; báo thật phần chưa kiểm tra. Khi xong, tạo `docs/ANTIGRAVITY-HANDOFF.md` ghi: DONE hoặc BLOCKED, danh sách file, API module/dữ liệu mới, cách test checkout → admin → lịch sử khách, vấn đề còn lại. Trả lời trong chat Antigravity khi hoàn tất. Codex sẽ review, tích hợp server và chạy hồi quy, không suy kết quả cũ thành kết quả mới.
