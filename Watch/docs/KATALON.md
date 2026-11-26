# Katalon Studio — AUREL

Bộ 22 script Groovy KT-001…KT-022 và hai gói ZIP cũ đã được gỡ bỏ theo yêu cầu. Không sử dụng bộ này để triển khai mới. Chưa xác minh báo cáo Katalon thực tế.

## Triển khai mới

1. Chạy `npm start` tại thư mục `Watch/` (URL `http://127.0.0.1:5517`).
2. Tạo Web UI project trong Katalon Studio, thiết kế Test Case theo từng chức năng quản trị và khách hàng từ nghiệp vụ hiện hành; đối chiếu các bộ CSV nhưng không coi kết quả cũ là kết quả mới.
3. Tạo Test Suite theo nhóm chức năng và Test Suite Collection nếu cần chạy toàn bộ. Dùng trình duyệt kiểm thử riêng và chuẩn bị dữ liệu phù hợp từng ca; không xóa dữ liệu trình duyệt cá nhân.
4. Chạy bằng Katalon Studio, lưu report, log, ảnh và thông tin môi trường. Ghi PASS/FAIL theo thực thi thật; chưa chạy giữ Not Run. Playwright không thay thế Katalon.

Các kết quả lịch sử vẫn lưu ở `TEST-SUMMARY.md`.
