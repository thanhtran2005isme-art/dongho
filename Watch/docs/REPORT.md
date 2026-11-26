# Đồ án: Triển khai kiểm thử và đảm bảo chất lượng website quản lý cửa hàng đồng hồ

Tác giả: [Điền họ tên] · Lớp: [Điền] · Giảng viên: [Điền]

Đây là bản thảo nội dung báo cáo cho CHRONO 1.2. Các mục kết quả chưa thực thi được ghi rõ; cần bổ sung ảnh, log và nhận xét thực tế trước khi nộp.

## Chương 1. Tổng quan

Cửa hàng cần quản lý danh mục đồng hồ, thông tin khách hàng, đơn bán hàng và tồn kho nhất quán. Rủi ro quan trọng là tính sai tiền, bán vượt tồn, hoàn kho nhiều lần khi hủy đơn và cho nhân viên thao tác ngoài quyền mô phỏng.

Mục tiêu đồ án là xây dựng một đối tượng kiểm thử nhỏ, mô tả quy tắc có thể xác minh, thiết kế ca kiểm thử và lưu bằng chứng thực thi. Website dùng HTML/CSS/JavaScript thuần, chạy bằng Live Server. Dữ liệu được lưu ở trình duyệt, phù hợp thực hành cá nhân.

Phạm vi gồm đăng nhập mô phỏng, sản phẩm có ảnh, khách hàng, danh mục, nhập kho, đơn nháp/xác nhận/hủy, báo cáo và tài khoản nhân viên. Không có API, MySQL, thanh toán, vận chuyển hoặc bảo mật máy chủ. Quyền trong JavaScript có thể bị người dùng DevTools sửa, nên không được kết luận hệ thống đủ an toàn để bán hàng thực tế.

## Chương 2. Cơ sở lý thuyết

**QA (đảm bảo chất lượng)** là hoạt động phòng ngừa vấn đề trong quy trình: review yêu cầu, quy ước quản lý phiên bản, checklist mã nguồn và điều kiện bàn giao. **Testing (kiểm thử)** thực thi hoặc phân tích phần mềm để tìm sai lệch giữa hành vi thực tế và mong đợi. Trong đồ án, review quy tắc hoàn kho thuộc QA; chạy test hủy đơn hai lần thuộc Testing.

Kiểm thử chức năng xác minh nghiệp vụ; kiểm thử phi chức năng đánh giá khả năng sử dụng, tính tương thích và các thuộc tính khác. Smoke test xác nhận các luồng cơ bản đủ ổn để kiểm thử sâu. Retest chạy lại tình huống lỗi sau sửa. Regression test kiểm tra những phần có nguy cơ bị ảnh hưởng bởi thay đổi.

Các kỹ thuật áp dụng:

| Kỹ thuật | Áp dụng cụ thể |
|---|---|
| Phân vùng tương đương | Giá nguyên dương hợp lệ; giá âm, bằng 0, thập phân, chữ không hợp lệ |
| Giá trị biên | Tên 0/1/100/101 ký tự; bán 7/8/9 khi tồn 8 |
| Chuyển trạng thái | Nháp → Xác nhận → Hủy hoặc Nháp → Hủy; chặn chuyển từ Hủy |
| Bảng quyết định | Đúng/sai thông tin đăng nhập kết hợp tài khoản hoạt động/khóa |
| Dựa trên rủi ro | Ưu tiên tiền, tồn kho và hành vi lặp hơn lỗi trang trí |
| Thăm dò | Đổi tab, tải lại khi thao tác, ảnh lỗi, màn hình nhỏ, dung lượng lưu trữ |

Severity là mức ảnh hưởng của lỗi; Priority là thứ tự cần sửa. Ví dụ sai tồn kho có ảnh hưởng lớn và ưu tiên cao, còn lỗi căn lề nhỏ thường có ảnh hưởng thấp hơn.

## Chương 3. Phân tích và thiết kế

### Kiến trúc và mô hình dữ liệu

`index.html` nạp `styles.css`, `store.js` và `app.js`. `store.js` chứa dữ liệu mẫu và quy tắc. `app.js` hiển thị giao diện, xử lý form và lưu dữ liệu vào khóa `chrono-watch-v1`. Phiên được lưu trong sessionStorage, thời hạn 8 giờ.

| Thực thể | Trường quan trọng | Quan hệ |
|---|---|---|
| User | id, username, password demo, name, role, active | Tạo đơn và giao dịch kho |
| Product | id, code, name, brand, type, price, stock, active, image | Có nhiều dòng đơn, giao dịch kho |
| Customer | id, name, phone, email, address | Có nhiều đơn |
| Order | id, code, customerId, items, total, status, createdAt, confirmedAt | Thuộc một khách, gồm nhiều dòng |
| Order item | productId, code, name, price, quantity | Chụp thông tin và giá lúc thêm vào đơn |
| Movement | id, productId, quantity, reason, createdAt, userId | Lịch sử nhập/bán/hủy |
| Brand / Type | Chuỗi tên trong mảng | Đổi tên cập nhật sản phẩm liên quan |

Đây là mô hình dữ liệu logic trong JSON, không phải cơ sở dữ liệu quan hệ đã triển khai. Nếu mở rộng backend, cần bảng riêng, khóa ngoại, ràng buộc duy nhất và giao dịch nguyên tử.

### Ma trận quyền mô phỏng

| Hành động | Admin | Staff |
|---|---|---|
| Xem sản phẩm, tồn, danh mục, báo cáo | Có | Có |
| Thêm/sửa/ngừng bán sản phẩm và ảnh | Có | Không |
| Quản lý khách, tạo/sửa nháp/xác nhận/hủy đơn | Có | Có |
| Nhập kho, quản lý danh mục | Có | Không |
| Tạo/khóa/mở khóa nhân viên | Có | Không |

### Use case bán hàng

Tiền điều kiện: tài khoản hoạt động, có khách và sản phẩm đang bán. Luồng chính: chọn khách → thêm dòng sản phẩm → nhập số lượng → lưu nháp → xem tổng → xác nhận. Hậu điều kiện: đơn chuyển sang đã xác nhận, tồn giảm đúng, lịch sử được ghi. Ngoại lệ: không chọn khách, dòng trùng, số lượng sai, thiếu tồn hoặc sản phẩm ngừng bán thì không xác nhận. Kiểm tra tất cả dòng trước khi trừ kho để tránh trừ một phần.

Use case hủy đơn: nhân viên/admin mở đơn chưa hủy → xác nhận hủy → nếu đơn đã xác nhận thì hoàn kho một lần, nếu nháp thì không đổi kho. Hậu điều kiện: đơn hủy không còn thao tác chỉnh sửa/xác nhận/hủy và không được tính vào tổng bán hàng.

### Quyết định thiết kế

Giá được lưu ở dòng đơn để đổi giá sản phẩm không làm đổi lịch sử. Ngừng kinh doanh thay cho xóa sản phẩm để giữ tham chiếu. Dữ liệu được đọc lại trước ghi; Web Locks tuần tự hóa thao tác ở các tab cùng origin khi trình duyệt hỗ trợ. Cơ chế này không thay thế giao dịch backend hay đồng bộ nhiều thiết bị.

## Chương 4. Kế hoạch và thiết kế kiểm thử

Sử dụng `TEST-PLAN.md` cho kế hoạch; `TEST-CASES.csv` cho 60 ca thủ công; `VERIFICATION.md` có các ca bổ sung cho phiên bản 1.1/1.2. Bộ Node kiểm tra nghiệp vụ độc lập với DOM. Bộ Playwright có 26 kịch bản kiểm tra hành vi qua giao diện, gồm khóa tài khoản, hai tab cạnh tranh tồn, ảnh lỗi, chế độ in, phiên hết hạn và lỗi lưu quota giả lập.

Mỗi ca có tiền điều kiện, dữ liệu, bước, mong đợi và mã yêu cầu. Ví dụ ca xác nhận đơn bán đúng tồn cần kiểm tra cả trạng thái đơn và tồn mới, không chỉ thông báo thành công. Đối chiếu mã ca chính xác trong CSV khi đưa bằng chứng vào báo cáo cuối.

Môi trường cần ghi: hệ điều hành, phiên bản Node, trình duyệt, phiên bản nguồn và URL/port. Mỗi test tự động dùng dữ liệu riêng; ca thủ công độc lập cần reset theo README sau khi đã lưu bằng chứng.

## Chương 5. Thực thi và đánh giá

Kết quả đã ghi nhận trước đợt bổ sung E2E: 47/47 bài nghiệp vụ Node đạt. Đây không phải kết quả của 60 ca thủ công hoặc 15 ca giao diện. Kết quả mới nhất và giới hạn nằm trong `VERIFICATION.md` và `TEST-SUMMARY.md`.

Quy trình: chốt phiên bản → smoke → thực thi và lưu ảnh/log → báo lỗi có bước tái hiện → sửa → retest → hồi quy → tổng hợp. Không dùng 5 lỗi minh họa trong `BUG-REPORTS.md` làm lỗi phát hiện thật.

Các chỉ số tính riêng cho từng bộ. Với thủ công chưa chạy, tỷ lệ đạt là N/A. Báo cáo lỗi theo severity phải dựa trên sổ lỗi thật; chưa có sổ đầy đủ không được diễn giải là hệ thống không có lỗi.

## Chương 6. Kết luận và hướng phát triển

Đã có website tĩnh làm đối tượng kiểm thử, quy tắc nghiệp vụ, dữ liệu mẫu và bộ kiểm thử. Kết quả unit test cung cấp bằng chứng cho các tình huống đã xét; chưa đủ để chứng nhận chất lượng toàn hệ thống.

Hướng phát triển gồm backend có xác thực thật, băm mật khẩu, kiểm tra quyền tại API, cơ sở dữ liệu có giao dịch, sao lưu/khôi phục và kiểm thử tải. Trước mắt cần hoàn thành các ca giao diện, thủ công, nhiều tab và bản in, sau đó đánh giá điều kiện kết thúc kiểm thử.

## Tài liệu tham khảo

- Playwright: https://playwright.dev/docs/test-configuration
- Playwright webServer: https://playwright.dev/docs/test-webserver
- Flaticon Uicons: https://www.flaticon.com/uicons/get-started
- Mã nguồn và log kiểm thử CHRONO tại thư mục bàn giao.
