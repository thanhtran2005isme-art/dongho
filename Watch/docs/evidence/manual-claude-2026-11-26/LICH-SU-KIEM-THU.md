# Lịch sử thực thi ca kiểm thử khách hàng (CUS-001…024)

**Người thực thi:** Claude (AI) điều khiển Chrome tự động, thao tác theo đúng các bước trong [TEST-CASES-CUSTOMER.csv](../../TEST-CASES-CUSTOMER.csv). **Không phải thao tác tay của sinh viên** — sinh viên nên tự chạy lại các ca khi cần ghi vào sổ QA của mình (`qa.html`).

## Các lần chạy

| Lần | Thời điểm | Pass | Fail | Trình duyệt | Máy |
|---|---|---|---|---|---|
| R01 | 10:25:17 26/11/26 | 21 | 3 | Chrome 158.0.8127.88 | win32 10.0.26300 |
| R02 | 10:27:13 26/11/26 | 24 | 0 | Chrome 158.0.8127.88 | win32 10.0.26300 |
| R03 | 10:29:29 26/11/26 | 24 | 0 | Chrome 158.0.8127.88 | win32 10.0.26300 |
| R04 | 12:50:12 26/11/26 | 24 | 0 | Chrome 158.0.8127.88 | win32 10.0.26300 |

## Chi tiết lần mới nhất (R04)

| Ca | Chức năng | Mục tiêu | Trạng thái | Kết quả thực tế | Bằng chứng |
|---|---|---|---|---|---|
| CUS-001 | Trang chủ | Điều hướng tách biệt tài khoản khách và quản lý cửa hàng | **Pass** | ✔ Liên kết "Quản lý cửa hàng" trỏ tới index.html \| ✔ Nút tài khoản khách (chưa đăng nhập) trỏ tới login.html \| ✔ Bấm tài khoản khách mở login.html \| ✔ Bấm Quản lý cửa hàng mở index.html | [ảnh](anh/CUS-001.png) |
| CUS-002 | Trang chủ | Mở chi tiết sản phẩm và theo dõi số lượng giỏ trên header | **Pass** | ✔ Mở đúng product.html?id=p1 \| ✔ Badge giỏ hiển thị 2 sau khi thêm 2 chiếc \| ✔ Quay lại home.html badge vẫn là 2 \| ✔ Tải lại trang badge vẫn là 2 | [ảnh](anh/CUS-002.png) |
| CUS-003 | Chi tiết sản phẩm | Từ chối số lượng không hợp lệ và số lượng vượt tồn kho | **Pass** | Tồn kho hiển thị: Còn 8 chiếc trong kho \| ✔ Số lượng 0 bị chặn: "Số lượng không hợp lệ. Vui lòng nhập số nguyên từ 1 trở lên." \| ✔ Số lượng 99 bị chặn: "Không đủ tồn kho. Hiện chỉ còn 8 chiếc (giỏ đã có 0)." \| ✔ Giỏ vẫn 0 sau hai lần nhập sai | [ảnh](anh/CUS-003.png) |
| CUS-004 | Chi tiết sản phẩm | Xử lý sản phẩm ngừng kinh doanh và ID không tồn tại | **Pass** | ✔ p7 hiển thị cảnh báo Ngừng kinh doanh \| ✔ Nút Thêm vào giỏ của p7 bị vô hiệu hóa \| ✔ ID "missing" hiển thị trạng thái Không tìm thấy sản phẩm | [ảnh](anh/CUS-004.png) |
| CUS-005 | Chi tiết sản phẩm | Xử lý ảnh URL lỗi bằng ảnh minh họa thay thế | **Pass** | ✔ Ảnh lỗi tự chuyển sang assets/images/aurel-steel.png \| ✔ Ảnh thay thế tải được (naturalWidth=1254), khung không vỡ | [ảnh](anh/CUS-005.png) |
| CUS-006 | Giỏ hàng | Sửa số lượng xóa sản phẩm và tính tổng VND chính xác | **Pass** | Giỏ ban đầu: 26.250.000 ₫ \| ✔ Đã xóa dòng p6 \| ✔ Giảm p1 xuống 1: tạm tính 12.500.000 ₫ \| ✔ Sau tải lại giỏ giữ nguyên (12.500.000 ₫) | [ảnh](anh/CUS-006.png) |
| CUS-007 | Giỏ hàng | Không tin giá bị sửa trong localStorage giỏ hàng | **Pass** | ✔ Đã sửa price=100 nhưng đơn giá hiển thị 12.500.000 ₫, tạm tính 12.500.000 ₫ | [ảnh](anh/CUS-007.png) |
| CUS-008 | Giỏ hàng | Cảnh báo đổi giá và chặn đặt hàng khi sản phẩm hết hàng hoặc ngừng bán | **Pass** | ✔ Đổi giá → hiển thị thông báo giá đã cập nhật \| ✔ Tạm tính theo giá mới 13.000.000 \| ✔ stock=0 → hiển thị lỗi cần xử lý \| ✔ Nút Tiến hành đặt hàng bị vô hiệu hóa | [ảnh](anh/CUS-008.png) |
| CUS-009 | Đặt hàng | Validate biểu mẫu đặt hàng và báo lỗi tại từng trường | **Pass** | ✔ Lỗi tại trường name: "Họ tên phải có từ 1 đến 100 ký tự." \| ✔ Lỗi tại trường phone: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0." \| ✔ Lỗi tại trường email: "Email không đúng định dạng." \| ✔ Lỗi tại trường address: "Địa chỉ nhận hàng phải có từ 5 đến 300 ký tự." \| ✔ Focus vào trường lỗi đầu tiên (co-name) \| ✔ Không tạo đơn | [ảnh](anh/CUS-009.png) |
| CUS-010 | Đặt hàng | Kiểm tra lại giá khi bấm gửi nếu cửa hàng vừa thay đổi giá | **Pass** | ✔ Hiển thị cảnh báo: "Giá sản phẩm Seiko Presage Cocktail Time đã thay đổi theo dữ liệu cửa hàng. Vui lòng kiểm tra lại tổng tiền." \| ✔ Chưa tạo đơn theo giá cũ \| ✔ Tóm tắt cập nhật theo giá mới 14.000.000 \| ✔ Xác nhận lại → đơn tạo theo giá mới 14.000.000 | [ảnh](anh/CUS-010.png) |
| CUS-011 | Đặt hàng | Chống tạo hai đơn khi gửi lặp và khi reload trang thành công | **Pass** | ✔ Nhấn 3 lần + tải lại 3 lần → 1 đơn \| ✔ Đơn là Nháp, tồn p1 vẫn 8 | [ảnh](anh/CUS-011.png) |
| CUS-012 | Đặt hàng thành công | Không hiển thị thành công khi truy cập trực tiếp không có đơn hợp lệ | **Pass** | ✔ Không có ?id: "Chưa có đơn hàng hợp lệ" \| ✔ ?id=fake: "Không tìm thấy đơn hàng hợp lệ" \| ✔ Không hiển thị thông báo đặt hàng thành công | [ảnh](anh/CUS-012.png) |
| CUS-013 | Tài khoản khách | Đăng ký khách hàng hợp lệ và từ chối email trùng hoặc mật khẩu không khớp | **Pass** | ✔ Mật khẩu xác nhận lệch → báo "không khớp" \| ✔ Đăng ký hợp lệ chuyển sang account.html \| ✔ Email trùng (khác hoa/thường) bị chặn: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác." | [ảnh](anh/CUS-013.png) |
| CUS-014 | Tài khoản khách | Tách biệt tài khoản khách với admin/staff | **Pass** | ✔ Trang đăng nhập ghi rõ xác thực mô phỏng local \| ✔ Từ chối admin: "Tài khoản admin/staff dành cho trang Quản lý cửa hàng (index.html), không dùng để đăng nhập khách hàng." | [ảnh](anh/CUS-014.png) |
| CUS-015 | Hồ sơ khách | Xem và cập nhật thông tin cá nhân giữ qua tải lại | **Pass** | ✔ Hiển thị thông báo lưu thành công \| ✔ Sau tải lại: "Lê Hồ Sơ Mới" / "99 Đường Mới, Quận 1" | [ảnh](anh/CUS-015.png) |
| CUS-016 | Liên thông quản lý | Đơn đặt từ khách tạo trạng thái Nháp chưa trừ kho và hiện trong quản lý | **Pass** | ✔ Khách đặt xong, mã đơn DH0001 \| ✔ Quản lý thấy DH0001 trạng thái Nháp \| ✔ Chi tiết đơn ghi nguồn "Website khách" \| ✔ Tồn p1 vẫn là 8 (đơn nháp chưa trừ kho) | [ảnh](anh/CUS-016.png) |
| CUS-017 | Liên thông quản lý | Admin xác nhận đơn trừ kho và giữ nguyên giá lịch sử khi đổi giá sản phẩm | **Pass** | ✔ Admin xác nhận → tồn p1 giảm từ 8 còn 6 \| ✔ Khách thấy trạng thái Đã xác nhận \| ✔ Giá lịch sử vẫn 12.500.000 ₫ dù admin đổi giá lên 15.000.000 | [ảnh](anh/CUS-017.png) |
| CUS-018 | Liên thông quản lý | Admin hủy đơn đã xác nhận hoàn kho một lần và cập nhật phía khách | **Pass** | ✔ Hủy đơn đã xác nhận → tồn p1 hoàn về 8 (đúng một lần) \| ✔ Khách tải lại thấy trạng thái Đã hủy \| ✔ Tải lại, tồn p1 vẫn 8 (không hoàn thêm) | [ảnh](anh/CUS-018.png) |
| CUS-019 | Phân tách đơn hàng | Không hiển thị đơn của tài khoản khách khác khi sửa ID trên URL | **Pass** | ✔ Khách B: orders.html chỉ hiện trạng thái rỗng \| ✔ Sửa URL sang đơn của A → bị từ chối hiển thị \| ✔ Không lộ tên Khách A trên trang | [ảnh](anh/CUS-019.png) |
| CUS-020 | Khách vãng lai | Không liệt kê toàn bộ đơn cửa hàng và chỉ cho xem sau đối chiếu hợp lệ | **Pass** | ✔ Tab mới: không liệt kê đơn sẵn \| ✔ SĐT sai: "Không tìm thấy đơn hàng khớp với thông tin đối chiếu." \| ✔ SĐT đúng → mở đúng chi tiết DH0001 | [ảnh](anh/CUS-020.png) |
| CUS-021 | Yêu thích | Thêm xóa sản phẩm yêu thích và thêm vào giỏ từ trang yêu thích | **Pass** | ✔ Yêu thích p3 vẫn còn sau tải lại \| ✔ Thêm giỏ từ trang yêu thích: badge = 1 \| ✔ Bỏ thích → hiển thị trạng thái rỗng | [ảnh](anh/CUS-021.png) |
| CUS-022 | Giới thiệu & Liên hệ | Validate form liên hệ mô phỏng và thông báo chưa gửi doanh nghiệp thật | **Pass** | ✔ Gửi khi rỗng → báo lỗi tại trường \| ✔ Thông báo nêu rõ chưa gửi đến doanh nghiệp thật \| ✔ Sau tải lại vẫn thấy yêu cầu đã lưu \| ✔ chrono-contact-messages-v1 có 1 bản ghi | [ảnh](anh/CUS-022.png) |
| CUS-023 | Responsive | Không tràn ngang toàn trang ở 390px 768px và 1440px | **Pass** | ✔ 13 trang × 3 độ rộng = 39 lần đo, không có trang nào tràn ngang \| ✔ Nút "Tiến hành đặt hàng" nằm trọn trong màn hình 390px (x=35, rộng 320) | [ảnh](anh/CUS-023.png) |
| CUS-024 | An toàn hiển thị | Escape chuỗi HTML/XSS trong hồ sơ địa chỉ ghi chú và liên hệ | **Pass** | ✔ Order-detail hiển thị payload như văn bản thuần \| ✔ Không có thẻ <img src="x"> được chèn vào order-detail \| ✔ Liên hệ: payload không chèn thẻ img sau khi lưu và tải lại \| ✔ Trang quản lý hiển thị payload dạng văn bản, không chèn img \| ✔ Không có hộp thoại alert nào được kích hoạt | [ảnh](anh/CUS-024.png) |

## Diễn biến theo từng ca qua các lần chạy

| Ca | R01 | R02 | R03 | R04 |
|---|---|---|---|---|
| CUS-001 | Pass | Pass | Pass | Pass |
| CUS-002 | Pass | Pass | Pass | Pass |
| CUS-003 | Pass | Pass | Pass | Pass |
| CUS-004 | Pass | Pass | Pass | Pass |
| CUS-005 | Pass | Pass | Pass | Pass |
| CUS-006 | Pass | Pass | Pass | Pass |
| CUS-007 | Pass | Pass | Pass | Pass |
| CUS-008 | Fail* | Pass | Pass | Pass |
| CUS-009 | Pass | Pass | Pass | Pass |
| CUS-010 | Pass | Pass | Pass | Pass |
| CUS-011 | Pass | Pass | Pass | Pass |
| CUS-012 | Pass | Pass | Pass | Pass |
| CUS-013 | Pass | Pass | Pass | Pass |
| CUS-014 | Pass | Pass | Pass | Pass |
| CUS-015 | Pass | Pass | Pass | Pass |
| CUS-016 | Pass | Pass | Pass | Pass |
| CUS-017 | Fail* | Pass | Pass | Pass |
| CUS-018 | Fail* | Pass | Pass | Pass |
| CUS-019 | Pass | Pass | Pass | Pass |
| CUS-020 | Pass | Pass | Pass | Pass |
| CUS-021 | Pass | Pass | Pass | Pass |
| CUS-022 | Pass | Pass | Pass | Pass |
| CUS-023 | Pass | Pass | Pass | Pass |
| CUS-024 | Pass | Pass | Pass | Pass |

\* Fail do lỗi bộ chạy (script), không phải lỗi sản phẩm: ở R01, ba ca CUS-008/017/018 hỏng vì bộ chạy đọc dữ liệu cửa hàng khi chưa được ghi và đăng nhập admin lặp. Đã sửa bộ chạy rồi chạy lại.

Bằng chứng: thư mục [anh](anh/) (ảnh chụp trang sau khi chạy ca), [history.json](history.json) (dữ liệu đầy đủ), bộ chạy [run-manual-cases.cjs](run-manual-cases.cjs).
