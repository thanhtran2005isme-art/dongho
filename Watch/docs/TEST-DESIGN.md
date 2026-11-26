# Thiết kế kiểm thử chức năng CHRONO

Thiết kế từ yêu cầu FR-01 đến FR-12 và NFR-01 đến NFR-03 trong `TEST-PLAN.md`. Mỗi ca ở `TEST-CASES.csv` có tiền điều kiện, dữ liệu, bước và mong đợi; trạng thái ban đầu Not Run.

| Kỹ thuật | Phân tích cụ thể | Ca minh họa |
|---|---|---|
| Phân vùng tương đương | Giá nguyên dương hợp lệ; 0, âm, thập phân không hợp lệ | TC-007, TC-014, TC-015, TC-016 |
| Giá trị biên | Tên sản phẩm 100 ký tự được nhận, 101 bị giới hạn; tồn 0 và âm | TC-012, TC-013, TC-017, TC-018 |
| Bảng quyết định | Đăng nhập admin/staff, sai mật khẩu, tài khoản bị khóa | TC-001, TC-002, TC-003, TC-006 |
| Chuyển trạng thái | Nháp → xác nhận → hủy; nháp → hủy; chặn xử lý lặp | TC-033, TC-040, TC-043, TC-045, TC-046, TC-047 |
| Tình huống nhiều điều kiện | Đơn hai dòng, dòng sau thiếu kho: không được trừ dở dòng trước | TC-042 |
| Quyền theo vai trò | Staff không thấy và không thực hiện thao tác quản trị trên UI | TC-057 |
| Bảo toàn dữ liệu | Giá đơn lịch sử không đổi khi sửa giá sản phẩm; đơn hủy không tính doanh thu | TC-053, TC-054 |
| Phi chức năng | Dữ liệu tồn tại qua reload, chuỗi đặc biệt hiển thị như văn bản, mobile | TC-058, TC-059, TC-060 |

## Thứ tự ưu tiên

Ưu tiên cao cho tiền, tồn kho, trạng thái đơn và quyền mô phỏng. Thực thi một ca độc lập trên dữ liệu mẫu hoặc ghi rõ phụ thuộc; đối chiếu trạng thái trước và sau thao tác. Không đánh dấu Pass chỉ vì có test tự động gần giống.

## Bao phủ và phần chưa kết luận

CSV có 60 ca thiết kế và liên kết tới yêu cầu qua cột `Requirement ID`. Báo cáo `TEST-SUMMARY.md` nêu kết quả tự động đã chạy. 60 ca thủ công chỉ có kết quả khi tester thực hiện trên web, ghi quan sát và bằng chứng vào trang QA. Chưa có cơ sở khẳng định bao phủ toàn bộ hành vi hoặc đạt yêu cầu của giảng viên nếu chưa xem rubric.
