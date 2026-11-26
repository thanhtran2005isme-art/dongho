# Các loại kiểm thử đã làm với AUREL (trả lời câu hỏi 4 và 7 của đồ án)

Cập nhật 26/11/2026. Trạng thái ghi đúng thực tế: **Pass thật** là đã chạy và có kết quả; **Not Run** là đã chuẩn bị nhưng chưa chạy. Người chạy các bộ ca có lịch sử là **Claude (AI) điều khiển trình duyệt tự động**, không phải sinh viên thao tác tay.

| Loại kiểm thử | Nội dung | Ca / bằng chứng | Công cụ | Trạng thái |
|---|---|---|---|---|
| Chức năng | Mua hàng, tài khoản khách, yêu thích, liên hệ, quản lý xử lý đơn | 24 ca khách `CUS-001…024`; 24 ca nghiệp vụ trên `qa.html`; 67 ca Node; 84 ca Playwright | Playwright, Node | **Pass thật** (CUS: 24/24 ở lần R04, [lịch sử](evidence/manual-claude-2026-11-26/LICH-SU-KIEM-THU.md)) |
| Giá trị biên / validation | Số lượng 0, 99, thập phân; SĐT, email, địa chỉ sai | CUS-003, CUS-009; unit test | Playwright, Node | **Pass thật** |
| Tích hợp khách ↔ quản lý | Đơn nháp → xác nhận trừ kho → hủy hoàn kho; giữ giá lịch sử | CUS-016…018 | Playwright | **Pass thật** |
| Giao diện (UI) | Header/footer nhất quán, nhận diện AUREL, trạng thái rỗng/lỗi, ảnh, liên kết, đồng bộ giữa tab | `UI-001…009` ([lịch sử](evidence/ui-claude-2026-11-26/LICH-SU-KIEM-THU-GIAO-DIEN.md)) | Playwright; Katalon `KT-017`; Selenium IDE (`aurel-ui.side`, 7 test) | **Pass thật** (Playwright); Katalon **Not Run**; Selenium IDE: các bước đã kiểm tra bằng Playwright, **chưa chạy trong Selenium IDE** |
| Responsive | Menu theo màn hình, không tràn ngang 320/390/768/1440px, nút đủ lớn | `UI-010…012`, CUS-023 | Playwright; Katalon `KT-016`, `KT-020` | **Pass thật**; Katalon **Not Run** |
| Khả năng truy cập | lang, title, h1, nhãn ô nhập, tương phản, bàn phím, aria khi lỗi, alt ảnh, landmark | `UI-013…019` | Playwright; Katalon `KT-018`, `KT-019` | **Pass thật**; Katalon **Not Run** |
| Tương thích trình duyệt | Luồng đặt hàng → quản lý thấy đơn | `UI-020` | Chrome và Edge | **Pass thật** trên 2 trình duyệt. **Firefox/Safari chưa chạy** |
| Bảo mật cơ bản | XSS, không lộ file (path traversal), mật khẩu không lưu dạng rõ, phiên hết hạn, quản lý chưa đăng nhập, cô lập đơn | CUS-007, 014, 019, 020, 024; `UI-021…024` | Playwright; Katalon `KT-021` | **Pass thật**; Katalon **Not Run**. Chỉ mô phỏng phía trình duyệt, không chứng minh an toàn production |
| Khả năng sử dụng | Thông báo lỗi tiếng Việt, định dạng tiền VND, điều hướng, breadcrumb | `UI-025…027` | Playwright; Katalon `KT-022` | **Pass thật**; Katalon **Not Run** |
| Hiệu năng | Tải HTTP tài nguyên tĩnh, kiểm tra 200 và dưới 3 giây | `aurel-performance.jmx` (13 nhóm, 36 request) | Apache JMeter | Sinh viên đã mở và chạy trong giao diện JMeter (lần đầu lỗi kết nối vì chưa bật website); **số liệu chưa được ghi vào báo cáo**. Chưa có `.jtl` hay báo cáo HTML |
| Hồi quy | Chạy lại toàn bộ sau mỗi lần sửa | Playwright 84 ca; lịch sử nhiều lần chạy | Playwright | **Pass thật** |
| Thủ công cũ | 90 ca `TC-001…090` | [TEST-CASES.csv](TEST-CASES.csv) | Con người | **Not Run** |

## Fail thật đã tìm thấy và sửa
Xem [BUG-REPORTS.md](BUG-REPORTS.md): BUG-R01…R05 (dữ liệu hỏng, ghi đè khách hàng, tràn ngang, nút bị che, focus) và **BUG-R06** (trang không có thẻ h1 ở trạng thái chưa đăng nhập hoặc đơn không hợp lệ, do ca `UI-013` phát hiện).

## Số lượng ca (câu hỏi 7)
90 ca thủ công cũ + 24 ca khách + 27 ca giao diện/truy cập/tương thích/bảo mật/khả năng sử dụng + 24 ca nghiệp vụ trên `qa.html` + 67 ca Node + 84 ca Playwright + 22 script Katalon (`KT-001…022`) + 36 request JMeter. Các con số này không cộng được thành "một con số test case" vì chúng đo các lớp kiểm thử khác nhau; khi bảo vệ nên nêu từng loại.

## Chưa kiểm thử
- Backend, API, MySQL: dự án không có.
- Đo tải trình duyệt thật (chạy JavaScript, giỏ hàng, đặt hàng): JMeter chỉ đo HTTP tài nguyên tĩnh.
- Firefox, Safari, điện thoại thật.
- Trình đọc màn hình thật (NVDA, VoiceOver). Các kiểm tra truy cập ở trên là kiểm tra tự động, không thay thế được.
