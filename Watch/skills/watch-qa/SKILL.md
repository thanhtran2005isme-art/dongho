---
name: watch-qa
description: Thiết kế, thực thi và báo cáo kiểm thử cho website cửa hàng đồng hồ CHRONO trong thư mục Watch khi người dùng yêu cầu công việc tester/QA cho đồ án này.
---

# Watch QA

Làm việc trên web tĩnh CHRONO (`index.html`, `store.js`, `app.js`) và trang tester (`qa.html`). Dùng `docs/TEST-PLAN.md` làm nguồn yêu cầu, `docs/TEST-CASES.csv` làm ma trận ca thủ công, `docs/TEST-SUMMARY.md` làm nhật ký kết quả. Đọc tài liệu cần thiết theo yêu cầu cụ thể; không tải toàn bộ hồ sơ nếu không cần.

## Thiết kế test

Gắn mỗi ca với FR/NFR, tiền điều kiện, dữ liệu, bước, mong đợi và kỹ thuật thiết kế. Ưu tiên tiền, tồn kho, trạng thái đơn, quyền mô phỏng. Tách ca hợp lệ, không hợp lệ, biên và chuyển trạng thái. Khi AI hỗ trợ đề xuất ca, review với quy tắc thực tế trước khi đưa vào CSV.

## Thực thi và bằng chứng

- Web chạy bằng `npm start` hoặc Go Live; `npm test` kiểm tra nghiệp vụ/dữ liệu demo, `npm run test:e2e` kiểm tra trình duyệt. Trang QA có bộ 24 ca nghiệp vụ trên dữ liệu riêng và sổ 90 ca thủ công. `lab.html` có test design, prompt AI, skill và checklist bảo vệ.
- Ghi rõ loại kiểm thử, phiên bản nguồn, môi trường, thời điểm, số Pass/Fail/Blocked/Not Run và đường dẫn bằng chứng. Không nhập kết quả tự động vào ca thủ công nếu người thực thi chưa chạy ca đó.
- Với Fail thật, ghi Bug ID, bước tái hiện, mong đợi/thực tế và ảnh hoặc log; sau sửa thì retest và regression. Fail do cố ý mô phỏng phải ghi nhãn mô phỏng.
- Không suy ra có backend, API, MySQL hoặc bảo mật máy chủ. Postman chỉ phù hợp nếu phạm vi sau này có API.

## Công cụ bắt buộc cho đồ án

- Katalon: đọc `docs/KATALON.md`, dùng 12 script trong `testing/katalon/`. Chỉ ghi Pass sau khi chạy thực tế trong Studio và có report/ảnh/log.
- JMeter: đọc `docs/JMETER.md`, dùng `testing/jmeter/chrono-static.jmx`. Phạm vi là HTTP tài nguyên tĩnh; không kết luận về đăng nhập/đơn hàng/localStorage từ JMeter.
- Nạp demo là thao tác thay dữ liệu sau xác nhận trong Báo cáo; xuất JSON trước, giữ dữ liệu sổ QA. Không tự nạp demo khi đang kiểm tra ca có tiền điều kiện bộ gốc.

## Bàn giao

Cập nhật `docs/TEST-SUMMARY.md` theo kết quả thật, liên kết bằng chứng và phần chưa chạy. Khi chuẩn bị bảo vệ, dùng `docs/DEFENSE.md` để diễn tập, đồng thời nêu nguồn web AI hỗ trợ theo `docs/AI-PROVENANCE.md`. Không tự đặt ra yêu cầu bắt buộc của giảng viên nếu chưa có đề cương môn học.
