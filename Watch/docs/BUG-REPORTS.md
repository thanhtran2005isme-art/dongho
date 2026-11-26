# Báo cáo lỗi

## Mẫu dùng cho lỗi thực tế

- Bug ID / Test Case ID / Requirement ID:
- Tiêu đề: [Hành động + sai lệch + điều kiện]
- Môi trường: OS, trình duyệt/version, URL, phiên bản nguồn.
- Tiền điều kiện và dữ liệu:
- Bước tái hiện: 1… 2… 3…
- Kết quả mong đợi:
- Kết quả thực tế:
- Severity / Priority và lý do:
- Bằng chứng: đường dẫn ảnh/video/log; thời điểm.
- Người báo / người xử lý / ngày:
- Trạng thái: New / Confirmed / In Progress / Fixed / Retest / Closed / Reopened.
- Phiên bản sửa và kết quả retest:
- Phạm vi regression:

## Năm ví dụ GIẢ LẬP — không phải lỗi đã phát hiện

Môi trường của cả 5 ví dụ: CHRONO bản giả định, Chrome phiên bản [điền khi thực hành], local. Bằng chứng: không có, vì chưa thực thi. Người xử lý: chưa phân công. Trạng thái: Example, không đưa vào thống kê lỗi thật. Retest: Not Run.

### EX-01: Hủy lặp làm tăng tồn kho hai lần (giả lập)

FR-08. Tiền điều kiện: SE001 tồn 8, đơn bán 2 đã xác nhận nên tồn 6. Bước: mở đơn → hủy → thử gửi lại thao tác hủy. Mong đợi: tồn 8, lần lặp bị chặn. Thực tế giả định: tồn 10. Severity Critical, Priority High vì làm sai số hàng. Regression: hủy nháp, hủy xác nhận, báo cáo, hai tab. Bằng chứng cần thu nếu có lỗi thật: tồn trước/sau và trạng thái đơn.

### EX-02: Nhân viên sửa giá sản phẩm (giả lập)

FR-02. Tiền điều kiện: staff hoạt động. Bước: đăng nhập staff → mở sản phẩm → sửa giá → lưu. Mong đợi: không có thao tác sửa trên UI, hàm nghiệp vụ chặn user staff. Thực tế giả định: sửa được giá qua luồng UI bình thường. Severity Major, Priority High vì vượt quyền mô phỏng. Không dùng việc tự sửa toàn bộ localStorage bằng DevTools để kết luận có lỗi trái phạm vi backend; khả năng đó là giới hạn đã công bố.

### EX-03: Tổng bán hàng vẫn tính đơn hủy (giả lập)

FR-11. Tiền điều kiện: chỉ một đơn xác nhận trị giá 12.500.000 VND. Bước: xem báo cáo → hủy đơn → quay lại báo cáo cùng bộ lọc. Mong đợi: tổng 0. Thực tế giả định: vẫn 12.500.000. Severity Major, Priority High vì sai số liệu kinh doanh. Regression: ngày xác nhận, nhiều đơn, bộ lọc và sản phẩm bán chạy.

### EX-04: Mã trùng khi có khoảng trắng (giả lập)

FR-03. Tiền điều kiện: SE001 đã tồn tại. Bước: thêm mã ` se001 `, tên/giá/tồn hợp lệ → lưu. Mong đợi: báo mã trùng. Thực tế giả định: thêm được sản phẩm thứ hai. Severity Major, Priority High vì mất tính duy nhất. Regression: trim, viết hoa, mã mới hợp lệ, sửa sản phẩm giữ nguyên mã.

### EX-05: Nút lưu bị khuất trên màn hình nhỏ (giả lập)

NFR-01. Tiền điều kiện: viewport 390×844. Bước: mở sửa sản phẩm → chọn ảnh → cuộn xuống cuối biểu mẫu. Mong đợi: truy cập được nút lưu bằng chạm và Tab. Thực tế giả định: nút bị cắt và không cuộn tới được. Severity Moderate, Priority Medium vì cản thao tác trên mobile nhưng desktop còn dùng được. Regression: modal tạo khách, đơn, zoom và bàn phím.

## Quan sát thực tế cần phân biệt

Người dùng đã cung cấp ảnh cho thấy tên admin mẫu không phù hợp và dấu tiếng Việt ở tiêu đề bị tách. Mã đã đổi tên demo thành Quản trị viên và đổi font sang Segoe UI/Arial. Đây là quan sát thật; chưa có bằng chứng retest giao diện sau sửa trong bộ hồ sơ này. Không tự ghi Closed/Pass cho quan sát đó.

---

## Lỗi THẬT phát hiện khi rà soát trang khách — 26/11/2026

Phát hiện bằng chạy thử thăm dò trên Chrome (Windows, `http://127.0.0.1:5530`, bản nguồn `aurel-watch-qa` 1.4.0 sau bàn giao Antigravity). Người báo/xử lý: Claude (AI) theo yêu cầu của sinh viên. Retest bằng test tự động Node/Playwright, **chưa retest thủ công bằng người** và chưa chạy Katalon. Bằng chứng: `docs/evidence/claude-verify-2026-11-26/`.

| Bug ID | Chức năng | Lỗi thực tế | Severity | Trạng thái |
|---|---|---|---|---|
| BUG-R01 | Giỏ/Đặt hàng/Đơn hàng | Khi `chrono-watch-v1` hỏng hoặc sai dạng (`{bad json`, `null`, `{"version":2}`), `cart.html`, `checkout.html`, `orders.html` ném lỗi JavaScript chưa bắt, trang kẹt ở màn hình “Đang tải…” không có thông báo. Mong đợi: báo lỗi rõ, không xóa dữ liệu. | Major | Fixed → Retest tự động: CUS-E2E-08 Pass |
| BUG-R02 | Đặt hàng khách vãng lai | Khách vãng lai nhập SĐT+email trùng khách `c1` do quản lý nhập thì đơn mới **ghi đè tên và địa chỉ** hồ sơ `c1` (đã thấy “Kẻ Lạ Mặt” thay “Khách hàng mẫu An”). Mong đợi: hồ sơ quản lý không bị đổi; thông tin giao hàng nằm trong đơn. | Major (toàn vẹn dữ liệu) | Fixed → Node test + CUS-E2E-09 Pass |
| BUG-R03 | Chi tiết đơn (390px) | `order-detail.html` có đơn thật bị tràn ngang: rộng 523px trong khung 390px do cột lưới không có `min-width: 0`. Test responsive cũ chỉ mở `?id=none` nên bỏ sót. | Major (giao diện) | Fixed → CUS-E2E-12 Pass; đo lại 390/768/1440: không tràn |
| BUG-R04 | Lịch sử đơn (390px) | Nút “Xem chi tiết” nằm ngoài vùng nhìn thấy của bảng cuộn ngang; mã đơn kiểu số cổ điển `DH0001` đọc giống `DHooo1`. | Minor | Fixed (mã đơn thành liên kết, số cùng chiều cao) → xem ảnh `orders-390.png` |
| BUG-R05 | Truy cập bàn phím / console | Ô tìm kiếm chỉ đổi màu viền khi focus (không có vòng focus); trình duyệt yêu cầu `/favicon.ico` bị 404 gây lỗi console. | Minor | Fixed (vòng focus; máy chủ test trả 204 cho favicon) |

Phạm vi regression sau sửa: `npm test` 67/67, Playwright 84/84 (xem [TEST-SUMMARY](TEST-SUMMARY.md)). Các lỗi này khác 5 ví dụ giả lập EX-01…EX-05 ở trên; có thể dùng làm minh họa “Fail thật → Fixed → Retest” khi bảo vệ, nhưng cần nêu rõ chúng được tìm bằng thăm dò và sửa trong cùng đợt.

### BUG-R06 — Thiếu thẻ h1 ở các trạng thái không có dữ liệu (phát hiện 26/11/2026 bởi ca UI-013)

- **Tìm thấy bằng:** ca `UI-013` (bộ giao diện, lần R01), Chrome 158 trên Windows.
- **Lỗi thực tế:** `account.html` (chưa đăng nhập), `order-success.html` (không có đơn hợp lệ), `order-detail.html` (không xem được đơn) và `product.html` (sản phẩm không tồn tại) dùng thẻ `h2` cho tiêu đề trạng thái và **không có h1**. Trình đọc màn hình và công cụ kiểm tra cấu trúc không xác định được tiêu đề chính của trang.
- **Mong đợi:** mỗi trang có đúng một h1.
- **Severity:** Minor (khả năng truy cập). **Trạng thái:** Fixed — đổi tiêu đề các trạng thái đó sang `h1`, thêm `.empty-state h1` vào CSS để giữ nguyên kích thước.
- **Retest:** `UI-013` đạt ở R02, R03, R04; toàn bộ 84 ca Playwright và 24 ca khách vẫn đạt. Retest bằng test tự động, chưa retest thủ công.
- **Ghi chú trung thực:** trong cùng đợt, ba ca Fail khác ở R01 (`UI-002`, `UI-009`, `UI-016`) và một ca ở R02 (`UI-004`) là **lỗi của chính bài test**, không phải lỗi website; nguyên nhân được ghi trong `history.json`.
