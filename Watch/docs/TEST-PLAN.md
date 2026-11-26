# Kế hoạch kiểm thử — CHRONO v1

## Mục tiêu và phạm vi

Xác minh website tĩnh chạy qua Live Server đáp ứng quy tắc quản lý sản phẩm, khách hàng, đơn hàng và kho. Chất lượng đánh giá bằng bằng chứng thực thi; không suy luận rằng toàn hệ thống an toàn chỉ vì unit test đạt.

| Mã yêu cầu | Nội dung / tiêu chí chấp nhận |
|---|---|
| FR-01 | Đăng nhập đúng tài khoản hoạt động; đăng xuất và hết hạn phiên không tiếp tục thao tác |
| FR-02 | Quyền mô phỏng: admin quản lý sản phẩm, kho, danh mục, tài khoản; staff xem và xử lý bán hàng |
| FR-03 | Sản phẩm có mã duy nhất chuẩn hóa, tên 1–100 ký tự, giá nguyên dương, tồn nguyên không âm |
| FR-04 | Tìm kiếm, lọc và phân trang sản phẩm, khách hàng, đơn hàng, kho |
| FR-05 | Khách hàng có tên hợp lệ, số điện thoại 10 số bắt đầu 0; email tùy chọn nhưng đúng định dạng |
| FR-06 | Đơn nháp có khách hàng và ít nhất một dòng sản phẩm, số lượng nguyên dương, không trùng dòng |
| FR-07 | Xác nhận kiểm tra đủ kho mọi dòng trước khi trừ, không xử lý hai lần |
| FR-08 | Hủy đơn xác nhận hoàn kho một lần; hủy nháp không đổi tồn; không sửa đơn đã xử lý |
| FR-09 | Nhập kho nguyên dương, có lý do và lịch sử |
| FR-10 | Danh mục không trùng, không xóa khi có sản phẩm sử dụng |
| FR-11 | Thống kê chỉ đơn xác nhận theo ngày xác nhận ở Asia/Ho_Chi_Minh; lưu giá đơn độc lập giá sản phẩm |
| FR-12 | Tạo/khóa/mở khóa nhân viên, không khóa admin |
| NFR-01 | Giao diện dùng được ở 390px và 1440px, bảng rộng cuộn bên trong |
| NFR-02 | Lưu dữ liệu qua tải lại; dữ liệu xuất JSON không chứa tài khoản |
| NFR-03 | Hiển thị chuỗi người dùng như văn bản; kiểm tra form và nghiệp vụ |

Ngoài phạm vi: API/Postman, cơ sở dữ liệu, kiểm thử bảo mật server, thanh toán, nhiều cửa hàng, nhiều thiết bị, cam kết hiệu năng. Phân quyền và đăng nhập chỉ là mô phỏng client. Không báo Pass cho các yêu cầu bảo mật production.

## Chiến lược

- Smoke: đăng nhập, mở sản phẩm, tạo khách hàng, tạo/xác nhận/hủy đơn.
- Ưu tiên cao: tính tiền, tồn kho, trạng thái đơn, quyền mô phỏng.
- Phân vùng tương đương: giá hợp lệ / âm / chữ / rỗng.
- Biên: tên 0/1/100/101 ký tự; tồn 0; bán bằng và vượt tồn.
- Chuyển trạng thái: Nháp → Xác nhận → Hủy; Nháp → Hủy; chặn xác nhận/hủy lặp.
- Bảng quyết định: đúng/sai thông tin đăng nhập × tài khoản hoạt động/khóa.
- Regression: chạy lại bộ Node sau thay đổi nghiệp vụ; chạy thủ công luồng bán/hủy và báo cáo.
- Thăm dò: nhiều tab, refresh, DevTools storage, mất mạng icon, màn hình nhỏ, bàn phím.

## Môi trường và dữ liệu

Windows, VS Code Live Server, Chrome/Edge bản cài trên máy. Ghi phiên bản trình duyệt, URL/port, commit hoặc bản sao nguồn và thời gian mỗi đợt chạy. Reset dữ liệu trước test độc lập; dùng dữ liệu giả. Web Locks và localStorage cần được phép trên origin.

## Điều kiện

Bắt đầu khi web mở được và smoke đăng nhập đạt. Tạm dừng luồng nếu không lưu được dữ liệu hoặc lỗi nền tảng gây mất trạng thái. Tiếp tục sau khi sửa và retest. Mục tiêu kết thúc: thực thi toàn bộ test ưu tiên cao, không còn lỗi nghiêm trọng về tiền/tồn, ghi nhận rõ phần chưa chạy và lỗi còn mở. Đây là mục tiêu, không phải kết quả hiện tại.

## Kế hoạch 6 tuần

1. Chốt yêu cầu và giới hạn frontend, review tiêu chí chấp nhận.
2. Hoàn thiện web và dữ liệu, review nghiệp vụ.
3. Thiết kế test case và ma trận truy vết, chuẩn bị môi trường.
4. Chạy thủ công, lưu bằng chứng, tạo bug report.
5. Sửa, retest, hồi quy và tự động hóa các luồng cần thiết.
6. Tổng hợp số liệu thực, báo cáo và luyện demo.

## QA và quản lý lỗi

Review yêu cầu trước code; review thay đổi nghiệp vụ trước bàn giao; giữ phiên bản nguồn và kết quả chạy; liên kết Bug ID vào test case. Tách Severity (tác động) và Priority (thứ tự sửa). Vòng đời: New → Confirmed → In Progress → Fixed → Retest → Closed hoặc Reopened.

Bug report: ID, tiêu đề, môi trường/phiên bản, test case liên quan, tiền điều kiện, dữ liệu, bước tái hiện, mong đợi, thực tế, mức độ và ưu tiên có lý do, bằng chứng, trạng thái, kết quả retest. Không tạo lỗi giả rồi báo là đã phát hiện.

## Chỉ số và báo cáo

- Bao phủ thiết kế = số yêu cầu có ít nhất một case / số yêu cầu trong phạm vi.
- Tỷ lệ thực thi = (Pass + Fail) / tổng case; Blocked ghi riêng.
- Tỷ lệ đạt = Pass / (Pass + Fail); nếu chưa chạy ghi N/A.
- Lỗi mở lại = số lỗi Reopened / số lỗi đã retest, kèm số lượng mẫu.
- Đếm lỗi theo severity và tình trạng; không dùng số case đạt để khẳng định không có lỗi.

CSV là ma trận Requirement → Test Case; cột Bug ID nối sang lỗi thực tế. Tất cả case thủ công ban đầu Not Run. Báo cáo cuối phải có phạm vi, phiên bản, môi trường, số case thực thi, lỗi còn mở, rủi ro, bằng chứng và đề xuất bàn giao. Lưu ảnh/log vào thư mục bằng chứng do người thực thi tạo.
