# Dùng AI hỗ trợ thiết kế và rà soát test

## Prompt mẫu cho bài bảo vệ

> Bạn là tester cho website quản lý cửa hàng đồng hồ chạy HTML/CSS/JavaScript, dữ liệu lưu localStorage. Hãy thiết kế test cho FR-07: chỉ xác nhận đơn nháp khi mọi dòng còn đủ tồn; kiểm tra tất cả dòng trước khi trừ; không xác nhận lặp. Trả về mã ca, tiền điều kiện, dữ liệu, bước, kết quả mong đợi, kỹ thuật thiết kế và rủi ro. Nêu cả ca hợp lệ, giá trị biên và tình huống hai dòng có dòng sau thiếu kho. Không tự đánh dấu Pass/Fail.

## Cách dùng kết quả AI

1. Đối chiếu đề xuất với quy tắc trong `TEST-PLAN.md` và mã `store.js`; bỏ giả định về backend/API vì web không có.
2. Gộp ca trùng, bổ sung dữ liệu cụ thể và hậu điều kiện tồn kho. Ví dụ: TC-040 bán đúng tồn, TC-041 vượt tồn, TC-042 thiếu kho ở dòng thứ hai, TC-043 xác nhận lặp.
3. Chuyển ca đã review vào `TEST-CASES.csv`, giữ liên kết yêu cầu. AI chỉ hỗ trợ thiết kế; kết quả thực thi phải do công cụ hoặc tester tạo ra.
4. Chạy thật, lưu ảnh/log và Bug ID. Khi một ca Fail, ghi đúng môi trường, bước tái hiện, mong đợi và thực tế; sau sửa lỗi thì retest và chạy regression.

## Giới hạn cần nói rõ

AI có thể đề xuất test hợp lý nhưng vẫn bỏ sót biên hoặc tưởng tượng chức năng chưa tồn tại. Một câu trả lời của AI không chứng minh web đã đạt chất lượng. Các lỗi Fail mô phỏng chỉ dùng để trình diễn khả năng phát hiện lỗi, không ghi thành bug thật của sản phẩm.
