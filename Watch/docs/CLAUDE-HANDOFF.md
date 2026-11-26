# Bàn giao Claude — AUREL (`aurel-watch-qa` 1.4.0)

**Ngày:** 26/11/2026 · **Thư mục:** `C:/Users/Modern 14/Downloads/Watch/Watch` · **Công nghệ:** HTML/CSS/JS thuần, `localStorage`/`sessionStorage`, không backend/MySQL.
Tiếp nhận sau Antigravity. Mọi kết luận dưới đây dựa trên việc đọc mã và **chạy thật** trên Chrome (Windows), không suy từ báo cáo cũ.

## 1. Antigravity đã làm và Claude đã xác minh

Đã đọc: `ANTIGRAVITY-HANDOFF.md`, `ANTIGRAVITY-TASK.md`, `PRODUCT.md`, `DESIGN.md`, `store.js`, `storefront.js`, `app.js` (phần đơn hàng), `test-server.cjs`, các test. Baseline trước khi sửa: `npm run check` đạt, Node 61/61, Playwright 79/79.

| Hạng mục | Kết quả xác minh |
|---|---|
| 13 trang khách dùng chung `storefront.js/css` | Có đủ, header/footer đồng nhất, không có liên kết chết (đã quét mọi `href` nội bộ) |
| Luồng trang chủ → chi tiết → giỏ → đặt hàng → thành công → lịch sử/chi tiết | Chạy đúng (CUS-E2E-04, 05) |
| Đăng ký/đăng nhập/đăng xuất/sửa hồ sơ; tách biệt admin/staff | Đúng; `admin/Admin@123` bị chặn ở trang khách |
| Giá/tồn lấy từ `chrono-watch-v1`, bỏ qua giá sửa trong giỏ | Đúng (CUS-E2E-03 + Node test mới) |
| Đơn khách là **Nháp**, chưa trừ kho, hiện trong quản lý | Đúng |
| Xác nhận kiểm tra đủ tồn **mọi dòng** trước khi trừ; hủy hoàn kho **một lần**; giữ giá lịch sử | Đúng (Node test mới) |
| Bấm đặt hàng nhiều lần / reload `order-success` | Chỉ một đơn (CUS-E2E-10) |
| Không xem được đơn tài khoản khác khi sửa `?id=` | Đúng (CUS-E2E-04, 05) |
| Số lượng thập phân/âm/0/chữ/quá lớn | Bị từ chối; không tạo đơn |
| Nội dung người dùng chứa HTML | Không chạy script ở trang khách và quản lý (CUS-E2E-11) |
| Giỏ/thanh toán/liên hệ ghi rõ là mô phỏng | Có, không thu thông tin thẻ |

## 2. Lỗi tìm thấy, nguyên nhân, cách sửa

Chi tiết và trạng thái trong [BUG-REPORTS.md](BUG-REPORTS.md) (mục BUG-R01…R06).

| ID | Nguyên nhân | Cách sửa |
|---|---|---|
| R01 Dữ liệu hỏng làm kẹt giỏ/đặt hàng/đơn | `getResolvedCart`/`getVisibleOrdersForCurrentUser` ném lỗi, trang không bắt | Thêm `renderStoreError()` trong `storefront.js`, bọc trong `cart/checkout/orders/account`; không ghi đè dữ liệu hỏng |
| R02 Khách vãng lai ghi đè khách của quản lý | `checkoutOrder` cập nhật tên/địa chỉ khi trùng SĐT+email | `store.js`: chỉ tái sử dụng hồ sơ, không sửa; địa chỉ giao nằm ở `order.shipping` |
| R03 Chi tiết đơn tràn ngang 390px | Lưới 1 cột có min-content, bảng đẩy rộng cột | `storefront.css`: `minmax(0,1fr)` và `min-width:0` cho phần tử con |
| R04 Nút “Xem chi tiết” bị che, `DH0001` giống `DHooo1` | Bảng cuộn ngang; font dùng số cổ điển | Mã đơn thành liên kết; `lining-nums` cho tiêu đề |
| R05 Focus ô tìm yếu; `/favicon.ico` 404 | Chỉ đổi màu viền; server không có favicon | Thêm vòng focus; `test-server.cjs` trả 204 |
| R06 Trang không có thẻ h1 ở trạng thái rỗng (chưa đăng nhập, đơn không hợp lệ, sản phẩm không tồn tại) | Tiêu đề trạng thái dùng `h2` | Đổi sang `h1`; thêm `.empty-state h1` vào CSS. Phát hiện bởi ca UI-013 |

## 3. File đã thay đổi bởi Claude

- Mã: `storefront.js`, `storefront.css`, `store.js`, `cart.html`, `checkout.html`, `orders.html`, `account.html`, `scripts/test-server.cjs`.
- Test: `tests/storefront.test.js` (+6 ca), `tests/e2e/customer-flow.spec.js` (+5 ca: CUS-E2E-08…12).
- Tài liệu: `docs/CLAUDE-HANDOFF.md` (mới), `docs/HUONG-DAN-SU-DUNG.md` (mới), `docs/BUG-REPORTS.md`, `docs/TEST-SUMMARY.md`, `docs/AUTOMATION.md`, `docs/AI-PROVENANCE.md`, `README.md`.
- Bằng chứng mới: `docs/evidence/claude-verify-2026-11-26/` (39 ảnh 13 trang × 390/768/1440px + `playwright-report/`).
- Lịch sử thực thi ca thủ công: `docs/evidence/manual-claude-2026-11-26/` (`run-manual-cases.cjs`, `history.json`, `LICH-SU-KIEM-THU.md`, `ket-qua-thuc-thi.csv`, 24 ảnh).
- Bộ ca giao diện/truy cập/tương thích/bảo mật/khả năng sử dụng: `docs/TEST-CASES-UI.csv`, `docs/evidence/ui-claude-2026-11-26/` (`run-ui-cases.cjs`, `history.json`, `LICH-SU-KIEM-THU-GIAO-DIEN.md`, `ket-qua-thuc-thi.csv`, 27 ảnh); `docs/LOAI-KIEM-THU.md` (bản đồ loại kiểm thử); script Katalon `testing/katalon/KT-017…022.groovy`.
- Selenium IDE (dự phòng khi không đăng nhập được Katalon): `testing/selenium-ide/aurel-ui.side` (7 test), `scripts/build-selenium-ide.cjs`, `docs/SELENIUM-IDE.md`. Các bước đã kiểm tra bằng Playwright (7/7), **chưa chạy trong Selenium IDE**.
- Sửa mã do ca UI-013: `product.html`, `order-detail.html`, `order-success.html`, `account.html` (tiêu đề trạng thái `h2` → `h1`), `storefront.css` (`.empty-state h1`).
- JMeter theo mẫu MilkShop: `scripts/build-jmeter-performance.cjs`, `testing/jmeter/aurel-performance.jmx`; `package.json` thêm script `build:jmeter` và kiểm tra cú pháp.
- Không đổi: `app.js`, `qa*`, `lab*`, `home.*`, `demo-data.js`, ảnh, font, 90 ca thủ công, script Katalon/JMeter.

## 4. Cách chạy, URL, tài khoản

```powershell
npm start
```

- Khách: `http://127.0.0.1:5517/home.html` · Quản lý: `/index.html` · QA: `/qa.html` · Phòng thực hành: `/lab.html`.
- Quản lý: `admin / Admin@123`, `staff / Staff@123`.
- Khách: không có tài khoản dựng sẵn; đăng ký tại `/register.html` (mật khẩu ≥ 8 ký tự, khác mật khẩu admin/staff) hoặc đặt hàng vãng lai.
- Hướng dẫn ngắn: [HUONG-DAN-SU-DUNG.md](HUONG-DAN-SU-DUNG.md).

## 5. Dữ liệu / migration

Không đổi `version: 1` và không tự reset. Các khóa: `chrono-watch-v1`, `chrono-customer-accounts-v1`, `chrono-customer-session-v1`, `chrono-cart-v1`, `chrono-wishlist-v1`, `chrono-contact-messages-v1` (localStorage); `chrono-guest-orders-v1`, `chrono-last-order-v1` (sessionStorage). Đơn khách thêm trường tùy chọn `customerAccountId`, `source:'storefront'`, `note`, `shipping`, `idempotencyKey`; khách có thể có `accountId`. Dữ liệu cũ đọc được không cần migration; xuất/nhập JSON vẫn hoạt động (Node test). Dữ liệu hỏng chỉ hiện thông báo, không bị xóa.

## 6. Kết quả kiểm thử thật

| Bộ | Kết quả | Ghi chú |
|---|---|---|
| `npm run check` | Đạt | |
| `npm test` | **67/67 Pass** | 61 cũ + 6 mới |
| `npm run test:e2e` | **84/84 Pass** | 79 cũ + 5 mới; report: `docs/evidence/claude-verify-2026-11-26/playwright-report/index.html` |
| Thăm dò bằng script | Phát hiện R01–R05 trước khi sửa | Script nằm ngoài dự án, không phải test chính thức |
| Giao diện 390/768/1440 | Không tràn ngang sau sửa | Đã xem ảnh giỏ, đơn, chi tiết đơn; các ảnh còn lại chỉ đo tràn ngang |
| 24 ca khách CUS-001…024 trên Chrome thật | **R03: 24 Pass / 0 Fail** | R01 21/3 (3 Fail do lỗi bộ chạy, không phải lỗi sản phẩm), R02 24/0. Lịch sử cộng dồn: `docs/evidence/manual-claude-2026-11-26/LICH-SU-KIEM-THU.md`. Người thực thi là Claude (AI) điều khiển Chrome, **không phải sinh viên thao tác tay** — sinh viên nên tự chạy lại khi cần ghi vào sổ `qa.html` |
| 27 ca UI-001…027 (giao diện, responsive, truy cập, tương thích Chrome+Edge, bảo mật cơ bản, khả năng sử dụng) | **R04: 27 Pass / 0 Fail** | R01 23/4: 1 **lỗi thật** (BUG-R06, thiếu h1) + 3 lỗi của bài test; R02 26/1 (lỗi bài test); R03 27/0. Lịch sử: `docs/evidence/ui-claude-2026-11-26/LICH-SU-KIEM-THU-GIAO-DIEN.md`. Người thực thi là Claude (AI) |
| Katalon KT-017…022 | **Not Run** | Script viết sẵn, chưa chạy trong Katalon Studio; chưa kiểm tra cú pháp Groovy bằng Katalon |
| 90 ca thủ công cũ TC-001…090 | **Not Run** | Không tự chuyển Pass |
| JMeter plan theo mẫu MilkShop `aurel-performance.jmx` | XML hợp lệ; 36/36 request kiểm bằng Node đạt | **Chưa chạy trong JMeter**; xem `docs/JMETER.md` |
| Katalon (KT-001…016) | **Not Run** | Chưa mở Katalon; không lấy Playwright thay |
| JMeter | **Not Run** | Chỉ đo HTTP tài nguyên tĩnh, không chạy JS/localStorage |

## 7. Chưa chạy / giới hạn

- Katalon, JMeter và các ca thủ công chưa chạy; `KT-013…016` chưa được xác minh bằng Katalon.
- Bằng chứng nguồn AI mới là ghi chép văn bản; **cần chụp hội thoại gốc** với Antigravity/Claude để nộp.
- Bảo mật phía client chỉ là mô phỏng: DevTools xem/sửa được dữ liệu; hàm băm mật khẩu không phải mã hóa thật; tra cứu đơn vãng lai không giới hạn số lần thử.
- Đơn nháp không giữ chỗ tồn kho: nhiều đơn nháp có thể vượt tồn, bị chặn ở bước xác nhận.
- Khóa chống đặt trùng tạo mỗi lần tải trang checkout; không mô phỏng nhiều thiết bị.
- Chỉ kiểm tra trên Chrome, chưa Firefox/Safari.
- Ảnh đồng hồ mặc định là ảnh AI minh họa.

## 8. Đối chiếu 8 câu hỏi của đồ án

| Câu | Cần chuẩn bị | Hiện có |
|---|---|---|
| 1 Web đã có chưa | Chỉ rõ web được test | AUREL (`home.html` khách, `index.html` quản lý); `qa-portfolio.html` |
| 2 Tự làm hay lấy sẵn | Nói rõ dùng AI tạo web, chứng minh nguồn | `AI-PROVENANCE.md`; **cần ảnh hội thoại gốc** |
| 3 Tự động hay thủ công | Show cả hai | Playwright 84 ca, trang QA chạy 24 ca; 90 + 24 ca thủ công |
| 4 Loại kiểm thử | Show hết đã học | Chức năng, validation/biên, phân quyền, giao diện/responsive, hồi quy, bảo mật cơ bản (XSS), tải (JMeter, Not Run) |
| 5 Công cụ bắt buộc | Hỏi giảng viên; nêu đã chuẩn bị | Playwright (đã chạy), Katalon + JMeter (**Not Run** — nên chạy trước buổi bảo vệ) |
| 6 Toàn bộ hay một số chức năng | Nêu phạm vi | Cửa hàng + 13 trang khách + QA; không backend/API |
| 7 Số lượng test case | Show nhiều | 90 ca thủ công + 24 ca khách + 67 Node + 84 Playwright + 24 ca trên QA |
| 8 Demo trực tiếp | Chuẩn bị chạy live | Kịch bản mục 9; có Fail thật BUG-R01…R05 và Fail mô phỏng trên `qa.html` |

Phân biệt khi trình bày: **Pass thật** (test đã chạy), **Fail thật** (BUG-R01…R05, đã sửa), **Fail mô phỏng** (nút demo trong `qa.html`), **Blocked/Not Run** (Katalon, JMeter, ca thủ công).

## 9. Kịch bản demo: khách đặt hàng → quản lý xử lý → khách xem đơn

1. `npm start`, mở `home.html`. Đăng ký tài khoản khách ở `register.html`.
2. Mở **Seiko Presage Cocktail Time** (SE001, tồn 8, 12.500.000 ₫), số lượng 2, thêm vào giỏ (badge = 2). Giỏ: tổng 25.000.000 ₫.
3. Thử lỗi: số lượng 0 hoặc 99 → báo lỗi; checkout thiếu địa chỉ → báo lỗi tại trường.
4. Đặt hàng → trang thành công `DH0001`, trạng thái Nháp. Reload: không có đơn mới.
5. Mở `index.html`, đăng nhập `admin`. Mục **Đơn hàng**: thấy `DH0001` Nháp, tồn SE001 vẫn 8. **Chi tiết** thấy nguồn “Website khách”. **Xác nhận bán** → tồn 6.
6. Đổi giá SE001 → khách mở lại đơn: đơn giá vẫn 12.500.000 ₫.
7. Hủy đơn → tồn về 8 (một lần) → khách thấy **Đã hủy**.
8. Đăng nhập khách khác, dán `order-detail.html?id=…` của đơn trên → bị từ chối.
9. Mở `qa.html` chạy 24 ca; bấm **Demo Fail mô phỏng**; mở báo cáo Playwright và `BUG-REPORTS.md` (BUG-R01…R05).
