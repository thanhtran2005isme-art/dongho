# Kiểm thử giao diện bằng Selenium IDE (không cần tài khoản)

Dùng khi không đăng nhập được Katalon Studio. Selenium IDE là tiện ích miễn phí của Chrome/Edge, ghi và chạy lại thao tác trên trình duyệt, hiển thị Pass/Fail từng bước.

Trạng thái: file `testing/selenium-ide/aurel-ui.side` đã được kiểm tra các bước bằng Playwright (7/7 test đạt). **Chưa chạy trong chính Selenium IDE**; kết quả Playwright không thay cho kết quả Selenium IDE.

## Cài đặt
1. Mở Chrome (hoặc Edge) → Chrome Web Store → tìm **Selenium IDE** → **Add to Chrome**.
2. Ghim biểu tượng tiện ích lên thanh công cụ cho dễ mở.

## Chạy
1. Bật website: trong thư mục `Watch\Watch` chạy `npm start`. Phải mở được `http://127.0.0.1:5517/home.html`.
2. Bấm biểu tượng Selenium IDE → **Open an existing project** → chọn `testing\selenium-ide\aurel-ui.side`.
3. Nếu hỏi Base URL, nhập `http://127.0.0.1:5517`.
4. Ở cột bên trái chọn **Test suites** → bộ **Tất cả ca AUREL** → bấm nút **Run all tests** (tam giác có vạch). Hoặc chạy từng test ở mục **Tests** bằng nút tam giác.
5. Xem kết quả: dòng đầu hiện số **Runs** và **Failures**; test xanh là đạt, đỏ là lỗi. Bấm vào test để xem từng lệnh và dòng lỗi trong khung **Log**.

## 7 test trong file
| Test | Kiểm tra |
|---|---|
| AUREL-01 | Thêm SE001 vào giỏ, badge giỏ hàng hiện 2 |
| AUREL-02 | Số lượng 0 và -1 bị từ chối, giỏ vẫn rỗng |
| AUREL-03 | Thanh toán sai dữ liệu: lỗi hiện dưới từng trường |
| AUREL-04 | Khách vãng lai đặt hàng thành công, trạng thái Nháp |
| AUREL-05 | Trang khách từ chối tài khoản admin/staff |
| AUREL-06 | Menu đổi theo kích thước màn hình |
| AUREL-07 | Trang quản lý chưa đăng nhập chỉ hiện form đăng nhập |

## Lưu ý
- Mỗi test tự xóa giỏ, phiên khách, yêu thích. **Không** xóa dữ liệu cửa hàng, sổ QA hay tài khoản.
- `AUREL-04` tạo thật một đơn nháp trong dữ liệu cửa hàng của trình duyệt đang dùng. Mỗi lần chạy thêm một đơn; xem ở trang quản lý.
- Chạy trên trình duyệt có website đang mở sẵn: đóng các tab AUREL khác để tránh nhầm giỏ hàng.
- Sinh lại file và kiểm tra các bước: `node scripts/build-selenium-ide.cjs --verify`.
- Khi báo cáo, ghi rõ công cụ là **Selenium IDE**, không phải Katalon.
