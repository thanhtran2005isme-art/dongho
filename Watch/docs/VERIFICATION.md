# Kết quả kiểm tra phiên bản đầu

## Quản lý đợt QA và khôi phục — kết quả mới nhất

Ngày 24/11/2026, chạy toàn bộ `qa.spec.js`: **7/7 đạt (5.4s)**. Bốn ca cũ tiếp tục đạt. QA-05 xác minh đợt mới độc lập và chuyển lại giữ kết quả; QA-06 xuất/nhập thành đợt mới, chặn trạng thái thiếu bằng chứng và mã trùng; QA-07 chuyển dữ liệu v1 sang v2 mà không xóa khóa cũ.

File nhập được kiểm tra định dạng, số ca, mã/yêu cầu, trạng thái, độ dài nội dung và các trường bắt buộc. Nhập luôn tạo đợt mới sau xác nhận, không hợp nhất hoặc ghi đè. Metadata và kết quả do người dùng khai báo, chưa xác minh bằng chứng. Báo cáo: `evidence/qa-runs-2026-11-24/playwright-report/index.html`.

## Công cụ theo dõi QA — 24/11/2026

Thêm `qa.html`, `qa.css`, `qa.js`, dùng dữ liệu nguồn CSV và khóa lưu kết quả riêng. Đã chạy **4/4 bài UI đạt (3.3s)**: 60 ca được tải đúng, lọc, bắt buộc actual/evidence/Bug ID, reload giữ dữ liệu, Blocked không tính vào executed, xuất JSON/Markdown. Lần đầu locator select chưa phù hợp đã được sửa trong test trước lần chạy đạt.

Không thay đổi mã nghiệp vụ cửa hàng. Mở Go Live tại qa.html để tự ghi kết quả thực. Bộ test chỉ dùng dữ liệu giả lập trong context riêng. Báo cáo: `evidence/qa-tracker-2026-11-24/playwright-report/index.html`.

## Đợt kiểm thử biên — kết quả mới nhất

Ngày 24/11/2026: **E2E-21 đến E2E-26 đạt 6/6 (5.2s)**, không sửa mã ứng dụng. Tổng số kịch bản E2E đã chạy đạt qua ba đợt là 26.

| Kịch bản | Kết quả quan sát |
|---|---|
| E2E-21 | Phiên được đặt hết hạn khi đang mở form; lưu bị chặn và dữ liệu không đổi; reload về đăng nhập |
| E2E-22 | Đổi giá SE001 lên 13 triệu; đơn nháp cũ sửa số lượng 2 vẫn dùng giá 12,5 triệu, tổng 25 triệu |
| E2E-23 | Hủy đơn nháp giữ tồn 8, không còn sửa/xác nhận |
| E2E-24 | Ngày ngược báo lỗi và giữ tổng cũ; khoảng năm 2000 cho tổng 0; Toàn bộ khôi phục tổng |
| E2E-25 | File 300 KB + 1 byte bị chặn; file giả PNG không được preview; dữ liệu cũ giữ nguyên |
| E2E-26 | Giả lập QuotaExceededError: giữ form và dữ liệu cũ; khôi phục Storage API rồi lưu thành công đúng một khách |

Report: `evidence/e2e-boundary-2026-11-24/playwright-report/index.html`. Lần chạy đầu có hai lỗi test harness đã được sửa trước lần chạy đạt. Không suy diễn các kiểm tra tự động này thành kết quả của toàn bộ 60 ca thủ công.

## Đợt bổ sung — khóa tài khoản, nhiều tab, in và ảnh lỗi

Ngày 24/11/2026, chạy E2E-16 đến E2E-20: **5/5 đạt (4.9s)**. Không thay đổi mã ứng dụng. Kết hợp 15 ca đã đạt trước đó, hiện có 20 kịch bản E2E đã chạy thành công qua hai đợt.

- E2E-16: tạo nhân viên, khóa chặn đăng nhập, mở khóa cho đăng nhập lại.
- E2E-17: khóa staff từ tab admin làm tab staff hiện tại mất phiên qua sự kiện storage.
- E2E-18: hai tab xếp hàng cùng khóa ghi, xác nhận hai đơn mua chiếc cuối: chỉ một đơn xác nhận, tồn 0, một dòng xuất kho. Đã kiểm tra cả hai yêu cầu cùng chờ trước khi thả khóa.
- E2E-19: nút in gọi hàm in, CSS print ẩn điều khiển, mã/tổng đúng và dữ liệu không đổi. Đã xem ảnh chụp chế độ in; chưa thử máy in hoặc hộp thoại hệ điều hành.
- E2E-20: URL ảnh được mô phỏng trả 404, giao diện hiển thị phần thay thế ở preview và danh sách.

Báo cáo đợt bổ sung: `evidence/e2e-extra-2026-11-24/playwright-report/index.html`. Các giới hạn trong ghi chép cũ bên dưới cần đọc cùng kết quả mới nhất này. Không tự đánh dấu bộ CSV thủ công là đã thực thi.

## Đợt thực thi E2E — kết quả mới nhất 24/11/2026

- Đã cài Playwright 1.65.1 và Chromium 159.0.8154.6; package-lock lưu phiên bản phụ thuộc.
- Bộ Node chạy lại: **47/47 đạt**. Kiểm tra cú pháp ứng dụng, test E2E, config và server đạt.
- Bộ Playwright sau sửa locator của ô chọn: **15/15 đạt**, thời gian suite 7.9 giây. Không suy ra hiệu năng website từ thời gian này.
- Đã xác minh bằng tự động: đăng nhập/đăng xuất, staff, tạo sản phẩm/lưu qua reload, mã trùng, bộ lọc, khách hàng, bán/hủy/hoàn kho, thiếu tồn, nhập kho, đổi danh mục, báo cáo, chuỗi XSS, tải/gỡ ảnh PNG và chiều rộng mobile.
- Bản report ổn định và giới hạn xem `TEST-SUMMARY.md`. Các ghi chú “chưa thực thi UI” bên dưới là lịch sử của đợt trước, không phải kết quả mới nhất.
- 60 case thủ công và các ca bổ sung vẫn Not Run. Icon CDN, bản in, review trực quan và nhiều tab chưa được xác nhận bởi suite này.

## Cập nhật 1.2 — 24/11/2026

- Thêm ảnh sản phẩm từ file PNG/JPG/WebP ≤ 300 KB hoặc URL HTTPS, xem trước và gỡ ảnh. Dữ liệu cũ không có ảnh vẫn được hỗ trợ.
- Thêm bộ lọc kết hợp thương hiệu/loại/trạng thái và sắp xếp theo giá/tồn/tên.
- `node --test tests/store.test.js`: **47 đạt, 0 lỗi**; kiểm tra cú pháp app.js và store.js đạt.
- Các bài mới xác minh quy tắc nguồn ảnh, cập nhật không mất ảnh cũ, gỡ ảnh, dữ liệu cũ, lọc kết hợp và sắp xếp không sửa dữ liệu gốc.
- Chưa thực thi UI cho bản 1.2; chưa xác minh file picker, giải mã ảnh, ảnh thay thế khi lỗi tải hoặc responsive trực tiếp trên trình duyệt. Test nguồn ảnh chỉ kiểm tra quy tắc chuỗi, không xác minh máy chủ ảnh có trả ảnh thật.

| Case | Các bước / dữ liệu | Mong đợi | Trạng thái |
|---|---|---|---|
| V12-01 | Admin sửa sản phẩm, chọn PNG thật ≤ 300 KB, lưu rồi tải lại | Xem trước đúng; ảnh tồn tại trong danh sách và sau tải lại | Not Run |
| V12-02 | Chọn JPG/WebP thật, sau đó thử file > 300 KB hoặc file giả đổi đuôi | Ảnh thật đọc được; file sai báo lỗi; ảnh đã lưu không thay đổi | Not Run |
| V12-03 | Nhập URL HTTPS ảnh; lưu; sau đó thử URL ảnh không tồn tại | Ảnh hợp lệ hiển thị; ảnh lỗi có biểu tượng thay thế | Not Run |
| V12-04 | Gỡ ảnh rồi đóng không lưu; mở lại; gỡ ảnh và lưu | Lần đầu giữ ảnh cũ; lần sau xóa ảnh | Not Run |
| V12-05 | Lọc Seiko + Đồng hồ cơ + Đang kinh doanh ở dữ liệu mẫu | Chỉ SE001; đổi trạng thái Ngừng kinh doanh chỉ SE002 | Not Run |
| V12-06 | Kết hợp tìm kiếm không có kết quả; nhấn Xóa bộ lọc | Có thông báo rỗng; xóa lọc trả về 7 sản phẩm mẫu, trang 1 | Not Run |
| V12-07 | Sắp xếp giá tăng/giảm, chuyển trang, sửa giá rồi xem lại | Thứ tự đúng trên toàn danh sách, không chỉ trang hiện tại | Not Run |
| V12-08 | Staff xem sản phẩm có ảnh | Xem được ảnh và thông tin; không có biểu mẫu sửa ảnh | Not Run |
| V12-09 | Giả lập localStorage hết dung lượng trong môi trường kiểm thử rồi lưu ảnh | Báo bộ nhớ đầy, dữ liệu đã lưu trước đó còn nguyên | Not Run |
| V12-10 | Mở nhiều tab; tab khác cập nhật khi đang chọn ảnh | Không ghi ảnh vào biểu mẫu khác, dữ liệu mới được cập nhật | Not Run |

## Cập nhật 1.1 — 24/11/2026

- Đổi màu giao diện sang đỏ burgundy, bổ sung focus bàn phím và trạng thái nút vô hiệu hóa rõ hơn.
- Sửa tên danh mục, cập nhật sản phẩm liên quan; in phiếu nội bộ từ chi tiết đơn.
- Kiểm tra cú pháp app.js và store.js: đạt.
- `node --test tests/store.test.js`: **35 đạt, 0 lỗi**. Năm bài mới kiểm tra đổi tên thương hiệu/loại, chặn tên trùng, quyền nhân viên và dữ liệu không hợp lệ.
- Chưa kiểm tra trực quan tông màu hoặc hộp thoại in trên trình duyệt trong lần cập nhật này. Bộ case thủ công phía dưới cần được thực thi và lưu bằng chứng.

| Case | Các bước / dữ liệu | Mong đợi | Trạng thái |
|---|---|---|---|
| V11-01 | Mở đăng nhập, tổng quan, sản phẩm ở desktop và màn hình 390px | Chủ đạo đỏ; chữ dễ đọc; nút và biểu mẫu không bị cắt | Not Run |
| V11-02 | Admin đổi Seiko thành Seiko Japan; xem sản phẩm đang bán và ngừng bán | Tất cả sản phẩm Seiko đổi thương hiệu, giá/tồn không đổi | Not Run |
| V11-03 | Đổi Seiko thành Citizen, sau đó thử tên chỉ có khoảng trắng | Báo lỗi; danh mục và sản phẩm không đổi | Not Run |
| V11-04 | Đăng nhập staff; mở danh mục | Không có nút Sửa tên | Not Run |
| V11-05 | Mở chi tiết đơn có nhiều dòng; In phiếu; xem preview/Save as PDF | Có mã, khách, trạng thái, dòng hàng và tổng; không có sidebar/nút thao tác | Not Run |
| V11-06 | Mở đơn nháp, xác nhận và hủy để in từng trạng thái | Phiếu ghi đúng trạng thái; in không thay đổi kho hoặc đơn | Not Run |
| V11-07 | Mở web với dữ liệu cũ sau cập nhật; Ctrl+F5 | Dữ liệu vẫn còn, giao diện chuyển đỏ | Not Run |

## Kết quả phiên bản 1.0

Ngày thực hiện: 24/11/2026.

| Kiểm tra | Kết quả thực tế |
|---|---|
| `node --check app.js` | Đạt — không có lỗi cú pháp |
| `node --check store.js` | Đạt — không có lỗi cú pháp |
| `node --test tests/store.test.js` | 30 bài đạt, 0 thất bại; Node.js v25.8.1 |
| Browser preview | Blocked — công cụ trình duyệt và yêu cầu HTTP không kết nối được 127.0.0.1:5500 trong phiên kiểm tra |
| Bộ 60 test case thủ công | Not Run — đã thiết kế, chưa thực thi đầy đủ |

Kiểm thử tự động bao phủ các quy tắc trong store.js: chuẩn hóa mã, validation, quyền mô phỏng, đơn nháp/xác nhận/hủy, tính tiền, hoàn kho, giá lịch sử, danh mục và tài khoản. Bài hai đơn kiểm tra xử lý nối tiếp trên cùng dữ liệu; không phải kiểm thử đồng thời giữa hai trình duyệt.

Lỗi cú pháp trong file kiểm thử đã được sửa trước lần chạy đạt cuối cùng. Chưa có kết quả kiểm thử trực quan, Playwright, trình duyệt di động, khả năng tải icon CDN hoặc bài thử nhiều tab. Không coi kết quả unit test là xác nhận toàn bộ UI hoạt động.

Máy chủ preview tạm đã dừng. Sử dụng Live Server theo README để chạy sản phẩm bàn giao.
