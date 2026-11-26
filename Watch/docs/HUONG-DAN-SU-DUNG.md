# Hướng dẫn sử dụng AUREL

Website đồ án kiểm thử, chạy hoàn toàn trên trình duyệt (HTML/CSS/JS thuần, dữ liệu lưu `localStorage`). Không cần backend hay MySQL. Đặt hàng, tài khoản khách và form liên hệ chỉ là **mô phỏng**, không thanh toán và không gửi đi đâu.

## 1. Chạy website

Cần cài sẵn Node.js. Mở terminal tại thư mục dự án:

```powershell
npm start
```

Mở trình duyệt: `http://127.0.0.1:5517/home.html`

## 2. Các trang chính

| Trang | Địa chỉ | Dùng để |
|---|---|---|
| Trang khách | `/home.html` | Xem, tìm và lọc đồng hồ |
| Quản lý cửa hàng | `/index.html` | Xử lý đơn, kho, sản phẩm |
| Theo dõi QA | `/qa.html` | Sổ test case, nhập/xuất kết quả |
| Phòng thực hành | `/lab.html` | Nạp dữ liệu demo |

Tài khoản quản lý: `admin / Admin@123` hoặc `staff / Staff@123`. Tài khoản này **không** dùng để đăng nhập khách.

## 3. Cách mua hàng (khách)

1. Mở `home.html`, bấm vào đồng hồ để xem chi tiết.
2. Chọn số lượng, bấm **Thêm vào giỏ hàng**.
3. Vào **Giỏ hàng**, kiểm tra số lượng và tổng tiền, bấm **Tiến hành đặt hàng**.
4. Điền họ tên, số điện thoại (10 số, bắt đầu bằng 0), email, địa chỉ, bấm **Xác nhận đặt hàng**.
5. Trang thành công hiện mã đơn (ví dụ `DH0001`) ở trạng thái **Nháp**.

Có thể đặt hàng không cần đăng nhập (khách vãng lai) hoặc đăng ký tại `register.html` để lưu lịch sử đơn.

## 4. Xem đơn hàng

- **Có tài khoản:** đăng nhập, vào `orders.html` để xem các đơn của mình.
- **Vãng lai:** đơn vừa đặt hiện trong phiên hiện tại. Mở lại sau đó thì tra cứu bằng **mã đơn + số điện thoại hoặc email** đã đặt.

## 5. Quản lý xử lý đơn

1. Vào `index.html`, đăng nhập `admin / Admin@123`.
2. Mục **Đơn hàng** → đơn khách mới ở trạng thái **Nháp** (chưa trừ kho).
3. **Chi tiết** → **Xác nhận bán**: hệ thống kiểm tra đủ tồn mọi dòng rồi mới trừ kho.
4. **Hủy đơn** với đơn đã xác nhận: hoàn kho đúng một lần.
5. Đổi giá sản phẩm không làm đổi giá trong đơn cũ.

Khách tải lại `orders.html` sẽ thấy trạng thái mới (Đã xác nhận / Đã hủy).

## 6. Kịch bản demo nhanh (khoảng 3 phút)

1. Khách: thêm 2 chiếc `SE001` vào giỏ → đặt hàng → ghi lại mã đơn.
2. Quản lý: mở đơn → **Xác nhận bán** → tồn `SE001` giảm từ 8 còn 6.
3. Quản lý: đổi giá `SE001`, rồi khách xem lại đơn: đơn giá vẫn là giá lúc đặt.
4. Quản lý: **Hủy đơn** → tồn về 8.
5. Khách: mở lại đơn, thấy **Đã hủy**.

## 7. Chạy kiểm thử

```powershell
npm run check
```

```powershell
npm test
```

```powershell
npm run test:e2e
```

- `check`: kiểm tra cú pháp JS.
- `test`: test nghiệp vụ bằng Node.js.
- `test:e2e`: test giao diện bằng Playwright.

Lịch sử thực thi 24 ca khách hàng nằm ở `docs/evidence/manual-claude-2026-11-26/LICH-SU-KIEM-THU.md`; chạy lại bằng `node docs/evidence/manual-claude-2026-11-26/run-manual-cases.cjs` (mỗi lần chạy được cộng dồn vào lịch sử).

Bộ 27 ca giao diện, truy cập, tương thích, bảo mật cơ bản và khả năng sử dụng: chạy `node docs/evidence/ui-claude-2026-11-26/run-ui-cases.cjs` (lịch sử ở `docs/evidence/ui-claude-2026-11-26/LICH-SU-KIEM-THU-GIAO-DIEN.md`). Tổng hợp các loại kiểm thử: `docs/LOAI-KIEM-THU.md`.

Plan JMeter theo mẫu MilkShop: `testing/jmeter/aurel-performance.jmx` (cách chạy trong `docs/JMETER.md`).

Katalon và JMeter cần chạy riêng bằng phần mềm tương ứng (xem `docs/KATALON.md`, `docs/JMETER.md`). Kết quả Playwright **không** thay cho kết quả Katalon/JMeter.

## 8. Lưu ý

- Dữ liệu nằm trong trình duyệt đang dùng; đổi trình duyệt hoặc xóa dữ liệu trang sẽ mất. Quản lý có chức năng xuất/nhập JSON để sao lưu.
- Ảnh đồng hồ mặc định do AI minh họa, không phải ảnh chính thức của hãng.
- Việc ẩn đơn giữa các tài khoản chỉ làm ở phía giao diện, không thay thế phân quyền máy chủ thật.
