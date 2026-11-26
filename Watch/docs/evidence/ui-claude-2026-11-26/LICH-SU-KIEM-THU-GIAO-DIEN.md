# Lịch sử kiểm thử giao diện, truy cập, tương thích, bảo mật cơ bản và khả năng sử dụng (UI-001…027)

**Người thực thi:** Claude (AI) điều khiển trình duyệt tự động. **Không phải thao tác tay của sinh viên.** Mô tả ca: [TEST-CASES-UI.csv](../../TEST-CASES-UI.csv). Mỗi lần chạy được cộng dồn; Fail thật được giữ nguyên trong lịch sử, không xóa khi đã sửa.

## Các lần chạy

| Lần | Thời điểm | Pass | Fail | Blocked | Trình duyệt |
|---|---|---|---|---|---|
| R01 | 12:45:02 26/11/26 | 23 | 4 | 0 | Chrome 158.0.8127.88 |
| R02 | 12:46:57 26/11/26 | 26 | 1 | 0 | Chrome 158.0.8127.88 |
| R03 | 12:48:20 26/11/26 | 27 | 0 | 0 | Chrome 158.0.8127.88 |
| R04 | 12:49:33 26/11/26 | 27 | 0 | 0 | Chrome 158.0.8127.88 |

## Chi tiết lần mới nhất (R04)

| Ca | Loại | Mục tiêu | Trạng thái | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|---|
| UI-001 | Giao diện | Header, thanh tiện ích và footer 4 cột nhất quán trên 13 trang khách | **Pass** | ✔ 13 trang đều có thanh tiện ích, thương hiệu AUREL, ≥3 liên kết điều hướng, footer 4 cột \| ✔ Nội dung footer giống nhau trên cả 13 trang | [ảnh](anh/UI-001.png) |
| UI-002 | Giao diện | Màu xanh ngọc #087b6a, nền trắng, font Cormorant/Be Vietnam Pro đúng nhận diện | **Pass** | ✔ Nội dung dùng ""Be Vietnam Pro"", tiêu đề dùng ""Aurel Display"" \| ✔ @font-face: "Aurel Display" → cormorant-garamond.ttf, "Be Vietnam Pro" → be-vietnam-pro.ttf (tự lưu trên máy) \| ✔ Hai font đã tải (document.fonts.check) \| ✔ Nút chính có nền rgb(8, 123, 106) = #087b6a \| ✔ Nền trang rgb(255, 255, 255) (trắng) | [ảnh](anh/UI-002.png) |
| UI-003 | Giao diện | Không phụ thuộc tài nguyên ngoài, không request lỗi, không lỗi console | **Pass** | ✔ Mọi request tới 127.0.0.1 (không có tài nguyên ngoài) \| ✔ Không có request mã ≥ 400 \| ✔ Không có lỗi JavaScript/console | [ảnh](anh/UI-003.png) |
| UI-004 | Giao diện | Trạng thái rỗng, không tìm thấy, lỗi và thành công hiển thị rõ | **Pass** | ✔ cart.html: "Giỏ hàng đang trống" \| ✔ wishlist.html: "Chưa có sản phẩm yêu thích" \| ✔ checkout.html: "Không có sản phẩm để đặt hàng" \| ✔ product.html?id=missing: "Không tìm thấy sản phẩm" \| ✔ order-success.html?id=fake: "Không tìm thấy đơn hàng hợp lệ" \| ✔ order-detail.html?id=fake: "Không tìm thấy đơn hàng" | [ảnh](anh/UI-004.png) |
| UI-005 | Giao diện | Nút bị vô hiệu hóa trông khác nút bình thường | **Pass** | ✔ Nút p7 có thuộc tính disabled, nút p1 thì không \| ✔ Kiểu hiển thị khác nút bình thường (độ mờ 0.56 so với 1, con trỏ not-allowed) | [ảnh](anh/UI-005.png) |
| UI-006 | Giao diện | Ảnh sản phẩm có alt, kích thước khai báo và tải được | **Pass** | ✔ Trang chủ có 6 ảnh sản phẩm \| ✔ Mọi ảnh có alt không rỗng \| ✔ Mọi ảnh khai báo width và height (tránh giật bố cục) \| ✔ Mọi ảnh tải được | [ảnh](anh/UI-006.png) |
| UI-007 | Giao diện | Ảnh minh họa AI được ghi nguồn rõ | **Pass** | ✔ Nhãn ảnh: "Ảnh minh họa AI — không phải ảnh chính thức của hãng" \| ✔ Footer ghi "Ảnh đồng hồ do AI minh họa" | [ảnh](anh/UI-007.png) |
| UI-008 | Giao diện | Không có liên kết chết hoặc liên kết giả (href="#") | **Pass** | ✔ Không có liên kết rỗng hoặc href="#" \| ✔ 25 liên kết khác nhau đều trả 200 | [ảnh](anh/UI-008.png) |
| UI-009 | Giao diện | Badge giỏ hàng cập nhật ở tab khác khi thêm sản phẩm | **Pass** | ✔ Tab 2: badge giỏ từ 0 thành 1 không cần tải lại | [ảnh](anh/UI-009.png) |
| UI-010 | Responsive | Menu đổi theo kích thước màn hình | **Pass** | ✔ 390px: menu desktop none, menu nhanh flex \| ✔ 1440px: menu desktop flex, menu nhanh none | [ảnh](anh/UI-010.png) |
| UI-011 | Responsive | Nút và ô nhập đủ lớn trên 390px | **Pass** | ✔ Mọi nút/ô nhập ≥ 24×24px ở 390px \| ✔ Nút hành động chính cao ≥ 40px | [ảnh](anh/UI-011.png) |
| UI-012 | Responsive | Không tràn ngang khi phóng to tương đương 200% (720px) và 400% (320px) | **Pass** | ✔ 6 trang × 2 độ rộng (720px, 320px) không tràn ngang | [ảnh](anh/UI-012.png) |
| UI-013 | Khả năng truy cập | Mỗi trang có lang=vi, title riêng và đúng một h1 | **Pass** | ✔ 13 trang đều lang="vi", có title và đúng 1 h1 \| ✔ Title mỗi trang khác nhau | [ảnh](anh/UI-013.png) |
| UI-014 | Khả năng truy cập | Mọi ô nhập có nhãn liên kết | **Pass** | ✔ Mọi ô nhập trên 7 trang có nhãn (label hoặc aria-label) | [ảnh](anh/UI-014.png) |
| UI-015 | Khả năng truy cập | Chữ đạt tỷ lệ tương phản tối thiểu 4,5:1 (3:1 với chữ lớn) | **Pass** | ✔ Đã đo 516 phần tử chữ trên 8 trang: tất cả đạt ngưỡng tương phản | [ảnh](anh/UI-015.png) |
| UI-016 | Khả năng truy cập | Điều hướng bằng Tab đến được nút đặt hàng và mọi điểm dừng có dấu hiệu focus | **Pass** | ✔ Tab đến được nút Xác nhận đặt hàng sau 21 lần nhấn \| ✔ Cả 21 điểm dừng đều có dấu hiệu focus | [ảnh](anh/UI-016.png) |
| UI-017 | Khả năng truy cập | Lỗi biểu mẫu được gắn aria-invalid, aria-describedby và role=alert | **Pass** | ✔ Cả 4 ô lỗi có aria-invalid="true", aria-describedby trỏ tới thông báo role="alert" có nội dung | [ảnh](anh/UI-017.png) |
| UI-018 | Khả năng truy cập | Mọi ảnh trên 13 trang có thuộc tính alt | **Pass** | ✔ Không ảnh nào thiếu thuộc tính alt trên 13 trang | [ảnh](anh/UI-018.png) |
| UI-019 | Khả năng truy cập | Trang có vùng main, header, footer và nav có nhãn | **Pass** | ✔ 13 trang đều có 1 main, header, footer và nav có aria-label | [ảnh](anh/UI-019.png) |
| UI-020 | Tương thích | Luồng khách đặt hàng → quản lý thấy đơn chạy trên Chrome và Edge | **Pass** | ✔ Chrome 158.0.8127.88: đơn xuất hiện trong quản lý ở trạng thái Nháp \| ✔ Edge 158.0.4370.33: đơn xuất hiện trong quản lý ở trạng thái Nháp \| ✔ Cả Chrome và Edge cho cùng kết quả | [ảnh](anh/UI-020.png) |
| UI-021 | Bảo mật cơ bản | Chưa đăng nhập không xem được dữ liệu quản lý | **Pass** | ✔ Chỉ hiện form đăng nhập, không có menu Đơn hàng \| ✔ Không lộ mã đơn, doanh thu hay tồn kho | [ảnh](anh/UI-021.png) |
| UI-022 | Bảo mật cơ bản | Mật khẩu khách không lưu dạng rõ | **Pass** | ✔ Mật khẩu gốc không xuất hiện trong dữ liệu lưu \| ✔ Có trường passwordHash (băm mô phỏng) | [ảnh](anh/UI-022.png) |
| UI-023 | Bảo mật cơ bản | Máy chủ không phục vụ file ngoài danh sách (path traversal) | **Pass** | ✔ /package.json → 404 \| ✔ /package-lock.json → 404 \| ✔ /tests/store.test.js → 404 \| ✔ /scripts/test-server.cjs → 404 \| ✔ /node_modules/.bin/playwright → 404 \| ✔ /.gitignore → 404 \| ✔ /../package.json → 404 \| ✔ /%2e%2e/package.json → 404 \| ✔ /docs/../package.json → 404 \| ✔ /assets/../package.json → 404 \| ✔ /docs/%2e%2e/%2e%2e/Windows/win.ini → 404 \| ✔ 11 đường dẫn nhạy cảm/traversal đều không trả 200 | [ảnh](anh/UI-023.png) |
| UI-024 | Bảo mật cơ bản | Phiên khách hết hạn thì bị đăng xuất | **Pass** | ✔ Phiên hết hạn → hiện trạng thái chưa đăng nhập \| ✔ Phiên hết hạn bị xóa khỏi bộ nhớ | [ảnh](anh/UI-024.png) |
| UI-025 | Khả năng sử dụng | Thông báo lỗi bằng tiếng Việt, dễ hiểu, không lộ lỗi kỹ thuật | **Pass** | ✔ 9 thông báo lỗi đều có tiếng Việt và không lộ lỗi kỹ thuật | [ảnh](anh/UI-025.png) |
| UI-026 | Khả năng sử dụng | Số tiền VND hiển thị nhất quán (dấu chấm nghìn + ₫) | **Pass** | ✔ 22 số tiền trên 5 trang đều theo mẫu 12.500.000 ₫ | [ảnh](anh/UI-026.png) |
| UI-027 | Khả năng sử dụng | Từ mọi trang đến giỏ/trang chủ/tài khoản chỉ 1 lần bấm và trang trong có breadcrumb | **Pass** | ✔ 13 trang đều có liên kết giỏ, trang chủ, tài khoản; 12 trang trong có breadcrumb | [ảnh](anh/UI-027.png) |

## Diễn biến từng ca qua các lần chạy

| Ca | R01 | R02 | R03 | R04 |
|---|---|---|---|---|
| UI-001 | Pass | Pass | Pass | Pass |
| UI-002 | Fail* | Pass | Pass | Pass |
| UI-003 | Pass | Pass | Pass | Pass |
| UI-004 | Pass | Fail* | Pass | Pass |
| UI-005 | Pass | Pass | Pass | Pass |
| UI-006 | Pass | Pass | Pass | Pass |
| UI-007 | Pass | Pass | Pass | Pass |
| UI-008 | Pass | Pass | Pass | Pass |
| UI-009 | Fail* | Pass | Pass | Pass |
| UI-010 | Pass | Pass | Pass | Pass |
| UI-011 | Pass | Pass | Pass | Pass |
| UI-012 | Pass | Pass | Pass | Pass |
| UI-013 | Fail | Pass | Pass | Pass |
| UI-014 | Pass | Pass | Pass | Pass |
| UI-015 | Pass | Pass | Pass | Pass |
| UI-016 | Fail* | Pass | Pass | Pass |
| UI-017 | Pass | Pass | Pass | Pass |
| UI-018 | Pass | Pass | Pass | Pass |
| UI-019 | Pass | Pass | Pass | Pass |
| UI-020 | Pass | Pass | Pass | Pass |
| UI-021 | Pass | Pass | Pass | Pass |
| UI-022 | Pass | Pass | Pass | Pass |
| UI-023 | Pass | Pass | Pass | Pass |
| UI-024 | Pass | Pass | Pass | Pass |
| UI-025 | Pass | Pass | Pass | Pass |
| UI-026 | Pass | Pass | Pass | Pass |
| UI-027 | Pass | Pass | Pass | Pass |

\* Fail do lỗi của chính bài test, không phải lỗi website (nguyên nhân trong history.json). Riêng UI-013 ở R01 là **lỗi thật** của website (trang không có thẻ h1 ở trạng thái chưa đăng nhập / đơn không hợp lệ) và đã được sửa.

Bằng chứng: [anh](anh/), [history.json](history.json), bộ chạy [run-ui-cases.cjs](run-ui-cases.cjs).
