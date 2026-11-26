# Nguồn web kiểm thử và dấu vết sử dụng AI

## Cập nhật 26/11/2026 — trang khách hàng AUREL

Theo yêu cầu của sinh viên, các trang khách hàng (`home`, `product`, `cart`, `checkout`, `order-success`, `login`, `register`, `account`, `orders`, `order-detail`, `wishlist`, `about`, `contact`) do công cụ AI **Antigravity** tạo mã; sau đó AI **Claude** (Claude Code) đọc lại, chạy thử, sửa 6 lỗi (BUG-R01…R06), bổ sung test và viết `docs/CLAUDE-HANDOFF.md`. Nhận diện AUREL (trắng/xanh ngọc `#087b6a`) do sinh viên chọn. Ảnh đồng hồ mặc định là ảnh AI minh họa.

Giống phần dưới đây, đây là ghi chép bằng văn bản, **chưa phải ảnh chụp hội thoại**. Khi nộp cần chụp lại hội thoại gốc với Antigravity và Claude (kèm ngày) và để vào thư mục bằng chứng riêng; hiện chưa có ảnh được xác minh trong thư mục `docs/evidence`.

## Cập nhật 26/11/2026 — yêu cầu hiện tại

Người dùng đã yêu cầu “đọc hiểu dự án trước”, sau đó “tiếp tục làm thêm cho đạt yêu cầu tôi gửi”, chấp nhận “có thể chạy dữ liệu local ko cần be cũng được” và chốt “tập trung vào giao diện và test”. AI đã đọc mã hiện có rồi bổ sung phòng thực hành, dữ liệu demo, script Katalon và plan JMeter. Không có backend/MySQL trong bản 1.3.

Đây là ghi chép bằng văn bản dựa trên lời nhắc trong phiên làm việc, không phải ảnh chụp hay lịch sử Git độc lập. Cần nộp ảnh hội thoại gốc để chứng minh theo yêu cầu của giảng viên. Biểu tượng bản 1.3 là SVG nội bộ do AI hỗ trợ tạo; các đoạn Flaticon bên dưới mô tả phiên bản trước.

## Web đang kiểm thử

- Website quản lý cửa hàng đồng hồ CHRONO: `index.html`, `styles.css`, `app.js`, `store.js` trong thư mục `Watch`.
- Trang làm việc của tester: `qa.html`, `qa.css`, `qa.js`, `qa-runner.js`.
- Chạy bằng VS Code Live Server (Go Live). Dữ liệu mẫu và dữ liệu thử lưu trong trình duyệt; không có API/backend.

## Cách tạo nguồn

Người dùng đã yêu cầu Codex trong cuộc hội thoại này xây web quản lý cửa hàng đồng hồ bằng HTML/CSS/JavaScript thuần, đổi sang tông đỏ và tiếp tục phát triển phần kiểm thử. Vì vậy mô tả trung thực khi bảo vệ là: **web được xây cho đồ án với sự hỗ trợ tạo mã của AI, dưới yêu cầu và kiểm tra của sinh viên**. Biểu tượng dùng Flaticon Uicons, có ghi nguồn trong giao diện.

Các trích đoạn lời nhắc trong cuộc hội thoại hiện tại:

> “bắt đầu làm theo promt và web chạy bằng golive với html css java scrit đơn giản và icon các biểu tượng thì lấy tưd trang web này https://www.flaticon.com/”

> “đổi sang tông web màu đỏ và tiếp tục làm”

> “hãy tập trung vào phần kiểm thử các chức năng vì bây giờ đã có web rồi”

Đây là trích đoạn để nhắc lại quá trình, chưa phải ảnh chụp màn hình có thể đối chiếu độc lập. Khi nộp, hãy chụp các tin nhắn gốc trong Codex/ChatGPT, kèm ngày và tên thư mục dự án nếu giao diện hiển thị.

Tài liệu này ghi lại nguồn theo lời yêu cầu và các tệp hiện có; nó **không thay thế ảnh chụp cuộc hội thoại** hoặc lịch sử phiên bản. Trước khi nộp, sinh viên cần thêm ảnh chụp các lời nhắc yêu cầu AI tạo web, các lần chỉnh sửa, và bản mã nguồn đã nộp vào thư mục bằng chứng riêng. Hiện thư mục này chưa có ảnh hội thoại được xác minh.

## Minh chứng có sẵn

| Nội dung | Vị trí |
|---|---|
| Mã web cửa hàng | `index.html`, `app.js`, `store.js`, `styles.css` |
| Mã trang kiểm thử | `qa.html`, `qa.js`, `qa-runner.js`, `qa.css` |
| Kế hoạch và 90 ca thiết kế | `docs/TEST-PLAN.md`, `docs/TEST-CASES.csv` |
| Lệnh và cấu hình kiểm thử tự động | `package.json`, `playwright.config.js`, `tests/` |
| Báo cáo chạy đã lưu | `docs/TEST-SUMMARY.md`, `docs/evidence/` |

Không có commit Git định danh tại thời điểm lập hồ sơ. Khi báo cáo, dùng ảnh hội thoại và bản mã nguồn cùng thời điểm để chứng minh quá trình làm, không khẳng định một ảnh hoặc một con số test là bằng chứng cho toàn bộ nguồn.
