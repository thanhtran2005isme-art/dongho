# Hướng dẫn kiểm thử tự động

Website vẫn chạy bằng Go Live, không cần npm để sử dụng. Các bước dưới chỉ dành cho công cụ kiểm thử.

## Chuẩn bị

Mở Terminal ở thư mục Watch, dùng Node.js có npm:

```powershell
npm install
npx playwright install chromium
# Có Chrome sẵn trên Windows: cấu hình tự dùng Chrome, có thể bỏ bước cài trên.
npm run check
npm test
npm run test:e2e
```

Nếu thiếu internet hoặc quyền cài trình duyệt, ghi Blocked và giữ log lỗi. Không ghi các kịch bản E2E là Pass chỉ vì cú pháp hợp lệ hoặc liệt kê được test.

## Cách chạy

Mở `qa.html`, chọn **Mở bộ kiểm thử tự động** rồi chọn **Tất cả chức năng** để chạy 24 ca nghiệp vụ. Bạn cũng có thể chọn một nhóm, lọc kết quả Fail và xuất JSON của lần đang xem.

`npm test` chạy 67 ca Node (nghiệp vụ, dữ liệu demo, giỏ/đặt hàng/tài khoản khách). `npm run test:e2e` tự khởi động máy chủ tại 127.0.0.1:5517, chạy 84 ca trình duyệt gồm trang chủ, cửa hàng, luồng khách hàng (CUS-E2E-01…12), công cụ QA, hồ sơ đồ án, giao diện và icon Flaticon rồi đóng máy chủ.

Mỗi test có browser context riêng và tự tạo dữ liệu mẫu; đóng context là kết thúc dữ liệu test. Các hành động chính đi qua UI, còn đọc localStorage chỉ để đối chiếu hậu điều kiện. Không dùng chờ cố định. Phần lớn E2E chặn CDN Flaticon để ổn định; ca ICON-01 riêng tải CDN thật nên cần kết nối mạng.

```powershell
npm run test:e2e -- --grep E2E-08
npm run test:e2e:ui
npm run report
```

HTML report ở `playwright-report/`. Trace và ảnh lỗi ở `test-results/`. Dùng report để mở trace từng lỗi; ghi đường dẫn vào bug report. Không đưa node_modules vào hồ sơ nộp. Khi `package-lock.json` đã được tạo bởi cài đặt thành công, lưu cùng nguồn để dùng `npm ci` cho lần sau.

Bản 1.3 có 7 ca LAB-01–07: thiết kế biên và điều hướng bàn phím, xuất prompt, tải script/plan, checklist lưu riêng, nạp demo sau xác nhận, quyền staff và giao diện desktop/mobile. ICON-01 hiện kiểm tra SVG nội bộ khi chặn mạng ngoài; các đoạn CDN bên dưới thuộc lịch sử trước 1.3.

## Phạm vi và truy vết

| Kịch bản | Yêu cầu | Kiểm tra chính |
|---|---|---|
| E2E-01, 02 | FR-01 | Đăng nhập, sai mật khẩu, đăng xuất |
| E2E-03 | FR-02 | Quyền hiển thị staff |
| E2E-04, 05, 14 | FR-03 | Sản phẩm, mã trùng, ảnh |
| E2E-06 | FR-04 | Bộ lọc kết hợp |
| E2E-07 | FR-05 | Khách mới xuất hiện khi tạo đơn |
| E2E-08 | FR-06/07/08 | Nháp, xác nhận, hủy, tồn và tổng |
| E2E-09 | FR-07 | Chặn bán vượt tồn |
| E2E-10 | FR-09 | Nhập kho và lịch sử |
| E2E-11 | FR-10 | Đổi danh mục |
| E2E-12 | FR-11 | Báo cáo loại đơn hủy |
| E2E-13 | NFR-03 | Hiển thị chuỗi XSS như văn bản |
| E2E-15 | NFR-01 | Chiều rộng trang ở 390px |
| E2E-16, 17 | FR-01/12 | Tạo/khóa/mở khóa và thu hồi phiên ở tab khác |
| E2E-18 | FR-07 | Hai tab cùng chờ xác nhận chiếc cuối, Web Locks |
| E2E-19 | In phiếu | CSS print, gọi hàm in, không đổi dữ liệu |
| E2E-20 | FR-03 | Phần thay thế khi ảnh URL lỗi |
| E2E-21 | FR-01 | Chặn ghi khi phiên hết hạn |
| E2E-22 | FR-11 | Giữ giá lịch sử sau sửa giá sản phẩm |
| E2E-23 | FR-08 | Hủy nháp không tăng tồn |
| E2E-24 | FR-11 | Khoảng ngày sai và xóa bộ lọc |
| E2E-25 | FR-03 | File ảnh quá lớn và nội dung giả |
| E2E-26 | NFR-02 | Lỗi quota giả lập, không ghi dở, thử lại |
| E2E-27 | NFR-02 | Xuất rồi nhập JSON, khôi phục dữ liệu và giữ tài khoản |
| E2E-28 | NFR-02 | File nhập lỗi không thay đổi dữ liệu |

Chưa có E2E cho mọi tình huống của từng yêu cầu. FR-12 đã có ca UI nhưng vẫn cần ca thủ công bổ sung theo ma trận. Kiểm tra chiều rộng không thay thế review trực quan hoặc kiểm tra khả năng tiếp cận. E2E-19 giả lập hàm window.print và dùng media print; không điều khiển hộp thoại in hệ điều hành. E2E-18 thiết lập dữ liệu qua localStorage trước test và giữ khóa để hai thao tác UI cùng xếp hàng, rồi thả khóa và đối chiếu dữ liệu.

## Nguồn cấu hình

Lệnh `npm run test:e2e -- qa.spec.js qa-load.spec.js qa-smoke.spec.js` chạy riêng 20 ca cho công cụ theo dõi. Chúng kiểm tra tải bộ 90 ca thủ công, hướng dẫn thực hành, lưu dữ liệu, nhập và xuất báo cáo, chạy bộ 24 ca tự động, lọc kết quả và đọc lịch sử cũ. Các bản ghi trong những bài kiểm tra này dùng dữ liệu mẫu.

Cấu hình dùng `webServer`, `baseURL`, screenshot khi lỗi và trace giữ lại khi lỗi theo [tài liệu cấu hình Playwright](https://playwright.dev/docs/test-configuration), [webServer](https://playwright.dev/docs/test-webserver) và [use options](https://playwright.dev/docs/test-use-options).
