# Demo và bảo vệ đồ án

## Kịch bản QA mở rộng 12–15 phút

1. Mở `qa-portfolio.html`: chỉ rõ `index.html` là web được kiểm thử, `qa.html` là trang tester; nêu nguồn AI hỗ trợ và ảnh cuộc chat cần nộp.
2. Trình bày `TEST-PLAN.md` và `TEST-DESIGN.md`: chọn ví dụ giá 0/âm/thập phân, bán đúng/vượt tồn, nháp → xác nhận → hủy. Mở ma trận 90 ca, giải thích Requirement ID, bước và mong đợi.
3. Trình bày `AI-TESTING.md`: AI đề xuất ca cho FR-07, tester so với quy tắc thật và sửa ca trước khi dùng. Mở skill mẫu `skills/watch-qa/SKILL.md` và nêu đây là bản thực hành trong workspace.
4. Trên web cửa hàng, tạo một đơn nháp, kiểm tra kho chưa giảm; xác nhận rồi hủy và đối chiếu kho/báo cáo.
5. Trên `qa.html`, nhấn **Chạy 24 ca** và đọc kết quả. Nhấn **Demo Fail mô phỏng** để thấy AT-001 Fail trong nhóm cơ bản. Chọn **Lọc kết quả → Fail**, sau đó nhấn **Chạy 12 ca** để minh họa Fail → Pass.
6. Mở một ca thủ công chưa chạy, nêu cách ghi Actual Result, Status, Evidence và Bug ID. Chỉ ghi Pass/Fail nếu thật sự thực hiện; không điền dữ liệu giả vào hồ sơ nộp.
7. Mở `lab.html#katalon`: chạy suite Katalon đã chuẩn bị và đọc report thật. Mở `lab.html#jmeter`: chạy plan HTTP rồi nêu Error %, p95, throughput. Nêu rõ JMeter không chạy JavaScript/localStorage. Nếu công cụ chưa chạy được, giữ Not Run và trình bày giới hạn.
8. Mở báo cáo Playwright đã lưu và đối chiếu kết quả trong `TEST-SUMMARY.md`.
9. Chốt giới hạn: frontend/localStorage, không có API/server nên không chứng minh bảo mật production; 90 ca thủ công chưa tự động Pass; rubric công cụ/số ca/demo cần hỏi giảng viên.

Chuẩn bị trước giờ bảo vệ: Go Live ở đúng cổng, tab cửa hàng và tab QA, ảnh hội thoại AI, file bằng chứng test thủ công và báo cáo HTML đã lưu. Nút demo Fail chỉ dùng dữ liệu giả lập trong trang QA.

## Kịch bản 10 phút

| Thời gian | Nội dung | Bằng chứng cần chuẩn bị |
|---|---|---|
| 0:00–1:00 | Nêu bài toán, phạm vi frontend và rủi ro sai tiền/tồn | Slide phạm vi |
| 1:00–2:00 | Giải thích QA và Testing, ma trận quyền | Test plan |
| 2:00–3:00 | Đăng nhập admin, sản phẩm và validation mã trùng | TC và thông báo lỗi |
| 3:00–5:00 | Tạo nháp SE001 ×2, tồn 8 chưa giảm; xác nhận còn 6 | Chi tiết đơn và kho |
| 5:00–6:00 | Hủy đơn, tồn về 8 và tổng bán loại đơn hủy | Kho và báo cáo |
| 6:00–7:00 | Staff chỉ xem sản phẩm, không nhập kho/quản lý user | Giao diện staff |
| 7:00–8:30 | Chạy bộ Node; E2E chỉ demo khi đã cài và chạy thành công | Log thật, trace nếu có |
| 8:30–9:30 | Trình bày 1 lỗi thật: tái hiện, sửa, retest | Bằng chứng thật; không dùng lỗi giả làm thật |
| 9:30–10:00 | Kết luận và giới hạn, hướng backend | Báo cáo tổng kết |

Chuẩn bị dữ liệu trước demo, kiểm tra URL/port và font/icon. Không để lần chạy đầu hoặc cài thư viện vào thời gian bảo vệ. Nếu E2E chưa chạy được, trình bày mã và giới hạn thay vì nói đã đạt.

## Dàn ý 10 slide

1. Tên đề tài, tác giả, giảng viên.
2. Bài toán và phạm vi, ngoài phạm vi.
3. Kiến trúc HTML/CSS/JS và mô hình dữ liệu.
4. Quy tắc trạng thái đơn và tồn kho.
5. QA: review yêu cầu, phiên bản, điều kiện bàn giao.
6. Chiến lược test theo rủi ro và kỹ thuật thiết kế.
7. Ví dụ test case và truy vết yêu cầu.
8. Tự động hóa Node/Playwright, log thực thi thực tế.
9. Lỗi thật, retest/regression; số liệu có bằng chứng.
10. Hạn chế và hướng phát triển.

## 15 câu hỏi và gợi ý trả lời

1. **QA khác Testing thế nào?** QA cải thiện quy trình phòng lỗi; Testing tìm sai lệch ở sản phẩm. Review yêu cầu là QA, test hủy đơn là Testing.
2. **Tại sao chọn web tĩnh?** Phù hợp giới hạn đồ án cơ bản và chạy Go Live; vẫn có nghiệp vụ để thiết kế test. Không giả định có bảo mật server.
3. **Rủi ro lớn nhất?** Sai tiền và tồn kho; cần ưu tiên test trạng thái, số lượng, giá lịch sử và thao tác lặp.
4. **Tại sao đơn nháp không trừ kho?** Quy ước đề tài là chỉ bán khi xác nhận; nháp không giữ hàng nên phải kiểm tra lại tồn khi xác nhận.
5. **Chống bán vượt tồn ra sao?** Kiểm tra tất cả dòng trước trừ; đọc dữ liệu mới và Web Locks khi có. Chưa đảm bảo nhiều máy hoặc trình duyệt không hỗ trợ locks.
6. **Tại sao lưu giá trong dòng đơn?** Để cập nhật giá sản phẩm không thay đổi đơn đã tạo; test xác minh giá và tổng lịch sử.
7. **Unit test đạt có nghĩa hết lỗi?** Không. Chỉ các trường hợp trong code đã chạy; còn UI, tích hợp, môi trường và trường hợp chưa thiết kế.
8. **Vì sao không Postman?** Không có API; HTTP server chỉ phát file tĩnh. Postman nhận HTML không xác minh được nghiệp vụ trong trình duyệt.
9. **Chọn giá trị biên nào?** Tên 0/1/100/101; giá 0/1; số lượng bằng tồn và hơn tồn 1; ảnh quanh 300 KB.
10. **Retest và regression khác nhau?** Retest xác minh lỗi đã sửa; regression kiểm tra tác động lên chức năng liên quan.
11. **Severity khác Priority?** Một cái là tác động, một cái là thứ tự sửa; cần giải thích bằng ảnh hưởng người dùng.
12. **Tách dữ liệu test như thế nào?** Node gọi seed riêng; Playwright tạo context riêng mỗi test; thủ công reset sau khi lưu bằng chứng.
13. **Bảo mật hạn chế gì?** Mật khẩu demo và dữ liệu ở localStorage có thể sửa; phân quyền client không bảo vệ trước người dùng chủ động sửa code/storage.
14. **Báo cáo hiệu năng thế nào?** Công bố cấu hình, dữ liệu, thao tác, số lần và cách đo. Chưa đo thì không có kết luận đạt. Không suy ra tải nhiều người dùng từ web local.
15. **Khi nào bàn giao?** Đạt điều kiện test plan, không còn lỗi nghiêm trọng chưa xử lý, đủ bằng chứng; công bố rõ các phần Not Run và rủi ro còn lại.
