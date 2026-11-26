# CHRONO 1.3 — giao diện và kiểm thử local

## Chạy trên máy

Mở terminal tại thư mục `Watch` bên trong thư mục tải về (nơi có `package.json`):

```powershell
npm start
```

Không cần cài npm package khi chỉ mở web: script dùng Node.js built-in để phục vụ file. Không có backend nghiệp vụ hoặc MySQL. Nếu dùng VS Code Go Live vẫn được; thay cổng trong kịch bản công cụ cho đúng. Dùng một origin/cổng cố định để giữ dữ liệu localStorage.

- Cửa hàng: `http://127.0.0.1:5517/home.html`
- Quản lý: `http://127.0.0.1:5517/index.html`
- Sổ QA: `http://127.0.0.1:5517/qa.html`
- Phòng thực hành: `http://127.0.0.1:5517/lab.html`
- Hồ sơ bảo vệ: `http://127.0.0.1:5517/qa-portfolio.html`

Đăng nhập admin / Admin@123 hoặc staff / Staff@123. Đây là tài khoản mô phỏng phía trình duyệt; không sử dụng dữ liệu thật.

## Dữ liệu mẫu

Giữ bộ gốc 7 sản phẩm và 2 khách để các test case có tiền điều kiện ổn định. Muốn demo đầy đủ, đăng nhập admin → Báo cáo → Xuất dữ liệu JSON để sao lưu → Nạp bộ dữ liệu demo → đọc thông báo → Nạp dữ liệu demo.

Bộ demo có 18 sản phẩm, 10 khách và 18 đơn: 10 xác nhận, 4 hủy, 4 nháp. Các đơn phân bố trong 7 ngày gần nhất tính tại lúc nạp. Kho được thay đổi qua quy tắc xác nhận/hủy thật; có lịch sử xuất/hoàn, hàng hết và sắp hết. Các tên, điện thoại và email là dữ liệu giả lập.

Nạp demo thay dữ liệu nghiệp vụ sau khi xác nhận, giữ tài khoản và các khóa sổ QA. Đóng modal trước khi xác nhận không thay đổi dữ liệu. Khôi phục qua file JSON đã xuất nếu cần quay lại dữ liệu cũ. Bộ tự động trong QA tạo dữ liệu riêng, không dùng bộ demo để tự ghi Pass cho 90 ca thủ công.

## Các phần để trình bày

| Yêu cầu | Nơi xem/demo |
|---|---|
| Nguồn web và AI | Hồ sơ bảo vệ → Nguồn web; tài liệu AI-PROVENANCE |
| 8 câu hỏi | Hồ sơ bảo vệ → 8 câu hỏi |
| Test case nhiều, truy vết yêu cầu | QA → 90 test case; lọc chức năng/ưu tiên/trạng thái |
| Test design | Lab → thử biên; tài liệu TEST-DESIGN |
| AI hỗ trợ test | Lab → tạo/chỉnh/tải prompt; review đầu ra |
| Tự động | QA → 24 ca nghiệp vụ; 12 script Katalon; suite Playwright |
| Skill | Lab → đọc/tải skill QA trong dự án |
| Pass/Fail/retest | QA → chạy thật; Demo Fail mô phỏng → chạy lại; ghi ca thủ công có evidence |
| Katalon | Lab → Katalon; docs/KATALON.md |
| JMeter | Lab → JMeter; docs/JMETER.md |
| Demo bảo vệ | Lab → checklist lưu riêng; docs/DEFENSE.md |

90 là số ca hiện có, không phải khẳng định đáp ứng một mức số lượng bắt buộc nếu chưa có rubric của giảng viên. Không tự đánh dấu ca chưa chạy là Pass. Ảnh hội thoại AI và report Katalon/JMeter thật vẫn cần bổ sung khi thực hiện.
