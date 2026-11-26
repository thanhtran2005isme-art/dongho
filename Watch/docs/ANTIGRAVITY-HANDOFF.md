# Bàn giao hoàn thiện website AUREL (`aurel-watch-qa`)

**Trạng thái:** DONE  
**Ngày hoàn tất:** 26/11/2026  
**Thư mục nguồn:** `C:/Users/Modern 14/Downloads/Watch/Watch`  
**Công nghệ:** HTML, CSS, JavaScript thuần, lưu trữ `localStorage`/`sessionStorage`, không backend/MySQL.

---

## 1. Danh sách trang và chức năng đã hoàn thành

### Trang khách hàng (13 trang đồng bộ nhận diện AUREL trắng & xanh ngọc `#087b6a`)
1. **`home.html`** (`home.css`, `home.js`): giữ thiết kế AUREL, bộ lọc danh mục và tìm kiếm theo tên/mã/thương hiệu (hỗ trợ cả `?q=`); mỗi thẻ đồng hồ dẫn sang `product.html?id=...` và có nút yêu thích nhanh; header đồng bộ hiển thị số lượng giỏ hàng (`data-testid="header-cart-count"`), số yêu thích (`data-testid="header-wishlist-count"`), tài khoản khách (`login.html` / `account.html`) tách biệt rõ với lối vào **Quản lý cửa hàng** (`index.html`).
2. **`product.html?id=...`**: hiển thị ảnh (có fallback về ảnh AI minh họa khi URL lỗi và chú thích nguồn AI), tên, mã, thương hiệu, loại, giá, mô tả, tồn kho; chọn số lượng (chặn số lượng không hợp lệ/vượt tồn), thêm vào giỏ, bật/tắt yêu thích, sản phẩm liên quan; xử lý đầy đủ ID không tồn tại, ngừng kinh doanh (`p7`), hết hàng.
3. **`cart.html`**: hiển thị dòng hàng, đơn giá, số lượng, thành tiền và tạm tính; sửa số lượng, xóa dòng, xóa toàn bộ giỏ, tiếp tục mua và chuyển sang đặt hàng; trạng thái giỏ rỗng; **luôn đối chiếu giá và tồn kho trực tiếp từ `chrono-watch-v1`**, không tin giá bị sửa trong `chrono-cart-v1`; cảnh báo khi cửa hàng đổi giá và chặn đặt hàng khi sản phẩm hết hàng/ngừng bán/vượt tồn.
4. **`checkout.html`**: hỗ trợ cả khách vãng lai và tài khoản khách (tự điền thông tin hồ sơ); form họ tên, điện thoại (`0xxxxxxxxx`), email, địa chỉ và ghi chú tùy chọn có validate rõ ràng tại từng trường; kiểm tra lại giá/tồn/trạng thái lúc gửi (nếu giá vừa đổi sẽ cập nhật tóm tắt và yêu cầu xác nhận lại); chống gửi lặp bằng khóa nút gửi + `idempotencyKey`; không thu thập thẻ, không thanh toán thật, không tự cộng ship/thuế/giảm giá.
5. **`order-success.html?id=...`**: hiển thị mã đơn, khách hàng, dòng hàng, tổng tiền, trạng thái Nháp; tải lại trang không tạo thêm đơn; truy cập trực tiếp không có mã đơn hợp lệ hoặc không thuộc phiên/tài khoản sẽ không hiển thị thành công.
6. **`register.html` & `login.html`**: tài khoản khách tách biệt hoàn toàn với tài khoản admin/staff (`app.js`); validate họ tên, email, SĐT, mật khẩu (>= 8 ký tự), xác nhận mật khẩu, chặn email trùng (không phân biệt hoa/thường), chặn dùng `admin / Admin@123` làm tài khoản khách; có đăng xuất và thông báo rõ xác thực mô phỏng local không phải bảo mật production.
7. **`account.html`**: xem và cập nhật họ tên, SĐT, địa chỉ mặc định; giữ dữ liệu qua reload; lối tắt tới lịch sử đơn, yêu thích, giỏ hàng; xử lý trạng thái chưa đăng nhập.
8. **`orders.html` & `order-detail.html?id=...`**: tài khoản khách chỉ thấy các đơn có `customerAccountId` trùng tài khoản hiện tại; khách vãng lai không thấy danh sách đơn toàn cửa hàng, chỉ xem đơn vừa đặt trong phiên hoặc tra cứu bằng **Mã đơn + SĐT/Email đối chiếu**; sửa `?id=` trên URL sang đơn của khách khác bị từ chối hiển thị; nêu rõ giới hạn kiểm soát quyền bằng `localStorage`.
9. **`wishlist.html`**: thêm/xóa yêu thích, lưu qua tải lại; xem chi tiết hoặc thêm vào giỏ đối với sản phẩm còn bán và còn tồn; trạng thái rỗng.
10. **`about.html` & `contact.html`**: thống nhất thương hiệu AUREL và bối cảnh đồ án, không bịa địa chỉ, hotline, bảo hành hay đối tác; biểu mẫu liên hệ validate, lưu mô phỏng cục bộ (`chrono-contact-messages-v1`) và thông báo rõ chưa gửi tới doanh nghiệp thật.

### Liên thông với trang quản lý (`index.html`, `app.js`, `store.js`)
- `checkout.html` gọi `WatchStore.checkoutOrder` (qua khóa `navigator.locks('chrono-write')`) tạo đơn ở trạng thái **`draft` (Nháp)**, **chưa trừ tồn kho**, xuất hiện ngay trong mục **Đơn hàng** và **Tổng quan** của `index.html`.
- `orderDetail` trong `app.js` hiển thị thêm nguồn đơn (`Website khách (mô phỏng)`), liên hệ/địa chỉ giao, ghi chú khách và mã tài khoản khách liên kết (`customerAccountId`).
- Giữ nguyên toàn bộ quy tắc cũ: admin xác nhận kiểm tra đủ tồn tất cả dòng rồi mới trừ kho; hủy đơn đã xác nhận hoàn kho đúng một lần; đổi giá sản phẩm không đổi giá lịch sử đơn cũ; tương thích 100% với xuất/nhập JSON (`restoreBusiness`), tài khoản staff và không gian QA (`qa.html`, `lab.html`, `qa-portfolio.html`).

---

## 2. Danh sách tệp đã tạo và đã sửa

### Tệp mới tạo
- Module dùng chung: `storefront.js`, `storefront.css`
- Các trang khách hàng: `product.html`, `cart.html`, `checkout.html`, `order-success.html`, `register.html`, `login.html`, `account.html`, `orders.html`, `order-detail.html`, `wishlist.html`, `about.html`, `contact.html`
- Kiểm thử & QA: `tests/storefront.test.js`, `tests/e2e/customer-flow.spec.js`, `docs/TEST-CASES-CUSTOMER.csv`
- Kịch bản Katalon luồng khách (Not Run bằng Katalon): `testing/katalon/KT-013.groovy`, `testing/katalon/KT-014.groovy`, `testing/katalon/KT-015.groovy`, `testing/katalon/KT-016.groovy`
- Bằng chứng & bàn giao: `docs/evidence/customer-full-2026-11-26/` (ảnh chụp & báo cáo Playwright), `docs/ANTIGRAVITY-HANDOFF.md`

### Tệp đã cập nhật
- Lõi & quản lý: `store.js`, `app.js`, `scripts/test-server.cjs`, `package.json`
- Trang chủ: `home.html`, `home.css`, `home.js`
- Kiểm thử hiện có: `tests/e2e/home-account.spec.js` (chỉ cập nhật kỳ vọng điều hướng ở `HOME-02` vì đã tách nút Tài khoản khách sang `login.html` và Quản lý cửa hàng sang `index.html`)
- Tài liệu: `PRODUCT.md`, `DESIGN.md`, `docs/KATALON.md`, `docs/JMETER.md`

*(Không xóa hay ghi đè bất kỳ tệp, dữ liệu, bằng chứng cũ hay 90 ca thủ công trong `docs/TEST-CASES.csv`.)*

---

## 3. Cấu trúc dữ liệu (`chrono-*`) & bảo toàn dữ liệu cũ

| Khóa lưu trữ | Bộ nhớ | Nội dung & Quy tắc |
|---|---|---|
| `chrono-watch-v1` | `localStorage` | Giữ nguyên `version: 1` (`users`, `brands`, `types`, `products`, `customers`, `orders`, `movements`). Đơn đặt từ website khách bổ sung trường tùy chọn `customerAccountId`, `source: 'storefront'`, `note`, `shipping`, `idempotencyKey`; khách hàng có thể gắn thêm `accountId`. Hàm `WatchStore.migrate()` đảm bảo giữ nguyên dữ liệu cũ, không tự reset khi mở trang. |
| `chrono-customer-accounts-v1` | `localStorage` | `{ version: 1, accounts: [{ id, name, email, phone, address, passwordHash, createdAt, updatedAt }] }` — tách biệt hoàn toàn với `users` của admin/staff. |
| `chrono-customer-session-v1` | `localStorage` | `{ accountId, email, expires }` (8 giờ) — tách biệt hoàn toàn với `chrono-session` của admin/staff. |
| `chrono-cart-v1` | `localStorage` | `{ version: 1, items: [{ productId, quantity, addedPrice, addedAt }] }`. Giá tính tiền luôn lấy từ `chrono-watch-v1`, bỏ qua mọi trường `price` bị sửa trong giỏ. |
| `chrono-wishlist-v1` | `localStorage` | `{ version: 1, productIds: [...] }`. |
| `chrono-contact-messages-v1` | `localStorage` | `{ version: 1, messages: [{ id, name, email, phone, subject, message, createdAt }] }`. |
| `chrono-guest-orders-v1` | `sessionStorage` | Mảng `orderId` mà khách vãng lai đã đặt hoặc đã đối chiếu hợp lệ trong phiên trình duyệt hiện tại. |
| `chrono-last-order-v1` | `sessionStorage` | `{ orderId, code, createdAt }` phục vụ hiển thị an toàn cho `order-success.html`. |

---

## 4. Hướng dẫn chạy local

Tại thư mục `C:/Users/Modern 14/Downloads/Watch/Watch`:

```powershell
# Khởi chạy máy chủ tĩnh local tại http://127.0.0.1:5517
npm start

# Kiểm tra cú pháp toàn bộ tệp JS
npm run check

# Chạy bộ unit test Node.js (61 ca)
npm test

# Chạy toàn bộ bộ kiểm thử E2E Playwright (79 ca)
npm run test:e2e

# Mở giao diện báo cáo HTML của Playwright
npm run report
```

Các URL chính khi chạy `npm start`:
- Trang khách: `http://127.0.0.1:5517/home.html`
- Quản lý cửa hàng: `http://127.0.0.1:5517/index.html` (`admin / Admin@123`, `staff / Staff@123`)
- Theo dõi QA: `http://127.0.0.1:5517/qa.html`
- Phòng thực hành QA: `http://127.0.0.1:5517/lab.html`

---

## 5. Kịch bản demo: Khách đặt hàng → Admin xử lý → Khách xem đơn

1. **Khách đăng ký & đặt hàng:**
   - Mở `home.html` → bấm **Đăng nhập** trên header → chọn **Đăng ký tài khoản mới** (`register.html`).
   - Tạo tài khoản khách (ví dụ `vy@example.com`, SĐT `0903333333`, mật khẩu tự chọn >= 8 ký tự, khác `Admin@123`).
   - Quay lại `home.html`, chọn **Seiko Presage Cocktail Time** (`SE001`, tồn kho `8`, giá `12.500.000 ₫`) → chọn số lượng `2` → **Thêm vào giỏ hàng** → kiểm tra badge giỏ hàng hiển thị `2`.
   - Mở `cart.html` kiểm tra tổng `25.000.000 ₫` → bấm **Tiến hành đặt hàng** (`checkout.html`) → điền địa chỉ nhận hàng & ghi chú → bấm **Xác nhận đặt hàng (Mô phỏng)**.
   - Tại `order-success.html`, thấy mã đơn `DH0001`, trạng thái **Nháp · Chờ xác nhận**, tổng `25.000.000 ₫`. Thử F5/reload: không sinh thêm đơn thứ hai.
2. **Admin kiểm tra & xác nhận / hủy đơn:**
   - Bấm **Quản lý cửa hàng** (`index.html`) → đăng nhập `admin / Admin@123`.
   - Mở mục **Đơn hàng** → thấy `DH0001` trạng thái **Nháp** (tồn `SE001` vẫn là `8`) → bấm **Chi tiết** (thấy nguồn `Website khách (mô phỏng)` và ghi chú) → bấm **Xác nhận bán**.
   - Kiểm tra mục **Kho hàng** / **Sản phẩm**: tồn `SE001` giảm từ `8` còn `6`.
   - Thử sửa giá `SE001` lên `15.000.000 ₫` để kiểm chứng giữ giá lịch sử.
3. **Khách xem trạng thái & kiểm chứng cô lập dữ liệu:**
   - Quay lại `orders.html` → thấy `DH0001` đã chuyển sang **Đã xác nhận** → bấm **Xem chi tiết** (`order-detail.html`) thấy đơn giá lịch sử vẫn giữ `12.500.000 ₫`, tổng `25.000.000 ₫`.
   - Quay lại `index.html` → hủy đơn `DH0001` → tồn `SE001` hoàn về `8` đúng một lần → khách tải lại `order-detail.html` thấy trạng thái **Đã hủy**.
   - Đăng xuất sang tài khoản khách khác (hoặc mở tab khách vãng lai) và dán URL `order-detail.html?id=...` của đơn trên → giao diện từ chối hiển thị và không lộ dữ liệu khách cũ.

---

## 6. Kết quả kiểm thử thực tế & đường dẫn bằng chứng

Tất cả kiểm thử dưới đây đã được thực thi trực tiếp sau lần sửa cuối cùng:

| Bộ kiểm thử | Lệnh chạy | Kết quả thực tế | Ghi chú |
|---|---|---|---|
| Kiểm tra cú pháp JS | `npm run check` | **Pass** (0 lỗi) | Bao gồm toàn bộ file cũ + `storefront.js`, `tests/storefront.test.js`, `tests/e2e/customer-flow.spec.js` |
| Unit test Node.js | `npm test` | **61 / 61 Pass** | 56 ca cũ (`store.test.js`, `demo-data.test.js`) + 5 ca mới (`storefront.test.js`) |
| E2E Playwright | `npm run test:e2e` | **79 / 79 Pass** | 72 ca hồi quy cũ + 7 tổ hợp ca mới (`customer-flow.spec.js`) gồm responsive 390/768/1440px |
| 90 ca thủ công cũ | `docs/TEST-CASES.csv` | **Không tự đánh dấu Pass** | Giữ nguyên trạng thái theo yêu cầu trung thực QA |
| 24 ca thủ công khách | `docs/TEST-CASES-CUSTOMER.csv` | **Chưa ghi Pass thủ công** | Bộ đặc tả test case mới sẵn sàng để thực hành thủ công |
| Katalon Studio (`KT-001`–`KT-016`) | `testing/katalon/` | **Not Run bằng Katalon** | Đã bổ sung `KT-013`–`KT-016` cho luồng khách; không dùng kết quả Playwright thay thế Katalon |
| Apache JMeter | `testing/jmeter/chrono-static.jmx` | **Not Run bằng JMeter** | Chỉ đo HTTP tài nguyên tĩnh, không chạy JavaScript/localStorage |

### Bằng chứng lưu trữ
- Báo cáo HTML Playwright: `docs/evidence/customer-full-2026-11-26/playwright-report/index.html`
- Ảnh chụp trực quan đã kiểm tra:
  - `docs/evidence/customer-full-2026-11-26/home-1440.png`
  - `docs/evidence/customer-full-2026-11-26/home-768.png`
  - `docs/evidence/customer-full-2026-11-26/home-390.png`
  - `docs/evidence/customer-full-2026-11-26/product-1440.png`
  - `docs/evidence/customer-full-2026-11-26/product-390.png`
  - `docs/evidence/customer-full-2026-11-26/cart-1440.png`
  - `docs/evidence/customer-full-2026-11-26/checkout-1440.png`
  - `docs/evidence/customer-full-2026-11-26/order-success-1440.png`
  - `docs/evidence/customer-full-2026-11-26/orders-1440.png`
  - `docs/evidence/customer-full-2026-11-26/account-1440.png`
  - `docs/evidence/customer-full-2026-11-26/about-1440.png`
  - `docs/evidence/customer-full-2026-11-26/contact-1440.png`

---

## 7. Các giới hạn còn lại (nêu rõ khi bảo vệ)

1. **Không có backend/CSDL:** Toàn bộ xác thực tài khoản khách, ẩn/cô lập đơn hàng giữa các tài khoản và lưu yêu cầu liên hệ đều thực hiện cục bộ ở phía trình duyệt (`localStorage`/`sessionStorage`). Giao diện chặn truy cập chéo tài khoản và kiểm tra giá từ `chrono-watch-v1`, nhưng không thể thay thế kiểm soát quyền phía máy chủ trong hệ thống production.
2. **Đặt hàng mô phỏng:** Không tích hợp cổng thanh toán, không xử lý vận chuyển/thuế/khuyến mãi, không gửi email/SMS xác nhận thật.
3. **Katalon Studio & Apache JMeter:** Các kịch bản Groovy (`KT-001`–`KT-016`) và kế hoạch JMeter (`chrono-static.jmx`) đã sẵn sàng trong dự án nhưng cần chạy thực tế trên Katalon Studio và Apache JMeter cài trên máy để xuất báo cáo riêng; JMeter chỉ đo HTTP tài nguyên tĩnh.
4. **Ảnh đồng hồ:** Các ảnh mặc định trong `assets/images/` là ảnh AI minh họa, không phải ảnh chính thức của các hãng Seiko, Citizen, Casio, Orient, Tissot.
