# Checklist đảm bảo chất lượng và thu thập bằng chứng

Đánh dấu sau khi có bằng chứng. Ô trống không có nghĩa đạt.

## Trước khi viết hoặc sửa chức năng

- [ ] Yêu cầu có mã, dữ liệu đầu vào, quy tắc và mong đợi rõ ràng.
- [ ] Quyền admin/staff và giới hạn frontend được ghi đúng.
- [ ] Quy tắc mới không mâu thuẫn trạng thái đơn hoặc giá lịch sử.
- [ ] Xác định ca test bị ảnh hưởng và dữ liệu cần chuẩn bị.

## Review mã nguồn

- [ ] Chuỗi người dùng được escape trước khi đưa vào HTML.
- [ ] Hàm nghiệp vụ kiểm tra quyền, kiểu dữ liệu và giới hạn số.
- [ ] Xác nhận đơn kiểm tra tất cả dòng trước khi cập nhật tồn.
- [ ] Không dùng index hiển thị làm định danh dữ liệu.
- [ ] Sửa ảnh có giới hạn dung lượng, loại file và thông báo khi lưu thất bại.
- [ ] Dữ liệu cũ vẫn đọc được; không reset dữ liệu thật để sửa lỗi giao diện.
- [ ] Có trạng thái rỗng, lỗi, disabled và nhãn biểu mẫu.
- [ ] Icon có nguồn; tài liệu không nói frontend có bảo mật server.

## Thực thi

- [ ] Ghi phiên bản nguồn, OS, trình duyệt/Node, URL và thời gian.
- [ ] Chạy smoke trước bộ test sâu.
- [ ] Dùng dữ liệu giả; reset giữa ca độc lập sau khi đã lưu bằng chứng.
- [ ] Ghi Actual Result, Status, Evidence, Bug ID vào đúng ca.
- [ ] Chạy retest và regression sau sửa lỗi.
- [ ] Kiểm tra mobile, bàn phím, hộp in và tải icon riêng.

## Bằng chứng cần thu

| Tên gợi ý | Nội dung |
|---|---|
| TC-xxx-before.png | Tiền điều kiện và dữ liệu trước thao tác |
| TC-xxx-after.png | Kết quả sau thao tác; thấy mã đơn/sản phẩm liên quan |
| BUG-xxx-steps.mp4 | Video ngắn tái hiện lỗi khi ảnh không đủ |
| unit-run.txt | Lệnh, môi trường, kết quả Node đầy đủ |
| e2e-report/ | Bản lưu report và trace đúng lần chạy |
| run-info.txt | Phiên bản nguồn, thời điểm, người thực thi, ghi chú môi trường |

Tránh chụp thông tin cá nhân ngoài đồ án. Khi chia sẻ báo cáo, liên kết tới bản bằng chứng được lưu ổn định, không chỉ thư mục report có thể bị ghi đè ở lần chạy sau.

## Trước bàn giao

- [ ] Không còn lỗi nghiêm trọng chưa xử lý; nêu rõ phần Not Run/Blocked.
- [ ] Tỷ lệ đạt tính riêng cho unit, E2E và thủ công, không cộng lẫn.
- [ ] Không tính 5 lỗi giả lập là lỗi phát hiện thực tế.
- [ ] Chạy được theo README từ thư mục nguồn và package-lock.
- [ ] Có bản sao nguồn, test case, báo cáo, log và danh sách giới hạn.
- [ ] Bản báo cáo có tên sinh viên/lớp/giảng viên và số liệu thực.

## Quy ước phiên bản gợi ý

Nếu sử dụng Git: mỗi thay đổi nghiệp vụ một commit có mô tả vấn đề; chạy kiểm tra trước commit; dùng nhánh riêng cho chức năng lớn và review trước hợp nhất. Không commit node_modules, báo cáo chứa dữ liệu riêng hoặc mật khẩu ngoài dữ liệu demo đã công bố. Quy trình này là đề xuất; chưa khởi tạo hoặc công bố repository thay người dùng.
