# Apache JMeter — HTTP tài nguyên web CHRONO

Trạng thái: **đã tạo plan, chưa chạy JMeter**. Đây không phải bằng chứng tải đạt.

## Plan theo mẫu MilkShop: `aurel-performance.jmx` (khuyên dùng)

Cấu trúc theo mẫu "MilkShop - Kiểm thử hiệu năng": mỗi chức năng một Thread Group đánh số, request đặt tên `PT_<MÃ>_NN`, mỗi nhóm có **Phản hồi không quá 3 giây**, **HTTP 200**, **Báo cáo tổng hợp**, **Thống kê hiệu năng**, **Kết quả chi tiết**. AUREL không có backend nên không có nhóm đăng nhập/JWT; mọi request chỉ lấy tài nguyên tĩnh.

| Nhóm | Mã | Request |
|---|---|---|
| 01 Tài nguyên dùng chung | DC | 4 |
| 02 Trang chủ và tìm kiếm | TC | 4 |
| 03 Chi tiết sản phẩm | SP | 2 |
| 04 Giỏ hàng | GH | 1 |
| 05 Đặt hàng | DH | 2 |
| 06 Tài khoản khách | TK | 3 |
| 07 Lịch sử đơn hàng | LS | 2 |
| 08 Yêu thích | YT | 1 |
| 09 Giới thiệu và liên hệ | GT | 2 |
| 10 Quản lý cửa hàng | QL | 4 |
| 11 Theo dõi kiểm thử QA | QA | 6 |
| 12 Phòng thực hành và hồ sơ | TH | 2 |
| 13 Ảnh sản phẩm | AN | 3 |

Tổng 36 request; các nhóm chạy **lần lượt** (Run Thread Groups consecutively) nên tải không nhân lên 13 lần. Số mẫu = users × loops × 36 (10 × 5 × 36 = 1800). Muốn chạy riêng một nhóm: tắt các nhóm khác (chuột phải → Disable) giống file mẫu.

```powershell
jmeter -n -t testing\jmeter\aurel-performance.jmx -Jhost=127.0.0.1 -Jport=5517 -Jusers=5 -Jloops=5 -Jramp=10 -l kq-5.jtl -e -o jmeter-report-5
```

Sinh lại plan và kiểm tra nhanh bằng Node (`npm run build:jmeter` chỉ tạo file; thêm `-- --verify` để gọi thử từng request):

```powershell
node scripts/build-jmeter-performance.cjs --verify
```

Kết quả kiểm tra ngày 26/11/2026: file XML hợp lệ (13 Thread Group, 36 sampler, 13 Duration Assertion, 39 listener) và **36/36 request** trả HTTP 200, đúng nội dung, dưới 3 giây khi gọi bằng Node. Đây **không phải kết quả JMeter** — plan chưa được mở hay chạy trong JMeter; hãy mở bằng GUI một lần để chắc chắn trước khi chạy tải. Ba ảnh PNG chỉ kiểm tra HTTP 200 và thời gian.

Plan cũ `chrono-static.jmx` (8 request) vẫn được giữ cho phòng thực hành `lab.html`; phần bên dưới mô tả plan cũ.

## Phạm vi đúng với kiến trúc local

AUREL (trước đây CHRONO) dùng HTML/CSS/JS thuần và `localStorage`/`sessionStorage`, không có backend hoặc MySQL. JMeter chỉ gửi HTTP tới máy chủ tệp tĩnh và **không chạy JavaScript**. Plan đo khả năng trả HTML, CSS, JS và CSV (tương tự nếu bổ sung các trang khách mới như `product.html`, `cart.html`, `checkout.html`, `storefront.js`, `storefront.css` thì JMeter cũng chỉ đo HTTP tài nguyên tĩnh); không thực hiện đăng nhập, giỏ hàng, checkout, trừ kho, Web Locks hay truy vấn cơ sở dữ liệu. Katalon/Playwright dùng để kiểm tra các hành vi tương tác trong trình duyệt.

Không dùng thời gian tải một tệp để kết luận tốc độ xử lý nghiệp vụ. Không coi JMeter thread là người dùng trình duyệt tương tác thật.

## Chạy

Mở terminal ở thư mục dự án, chạy `npm start`. Trong terminal khác có Java/JMeter được cấu hình, chạy một dòng:

```powershell
jmeter -n -t testing/jmeter/chrono-static.jmx -Jhost=127.0.0.1 -Jport=5517 -Jusers=10 -Jloops=5 -Jramp=10 -l results.jtl -e -o jmeter-report
```

Trên Windows, dùng `jmeter.bat` nếu tên `jmeter` chưa được nhận diện; có thể gọi bằng đường dẫn đầy đủ đến `bin/jmeter.bat`. Chạy `java -version` và `jmeter -v` để ghi đúng phiên bản của máy. Không cài Java/JMeter tự động khi mở website.

Mỗi đợt dùng **tên `.jtl` mới và thư mục report mới hoặc rỗng**. Nếu tái dùng file kết quả cũ, report có thể trộn nhiều lượt hoặc JMeter báo lỗi. Mở `jmeter-report/index.html` sau khi hoàn tất. Để xem/chỉnh plan trong GUI: File → Open → `testing/jmeter/chrono-static.jmx`.

## Cấu hình

| Tham số | Mặc định | Ý nghĩa |
|---|---|---|
| host | 127.0.0.1 | Máy chủ local |
| port | 5517 | Cổng; đổi khi dùng Live Server |
| users | 10 | Số thread |
| loops | 5 | Số vòng mỗi thread |
| ramp | 10 | Thời gian tăng đủ thread, giây |

8 request mỗi vòng: index, home, QA, lab, store.js, app.js, styles.css và bộ CSV 90 ca. Mỗi request có assertion HTTP 200 và chuỗi nội dung đặc trưng. Constant Timer chờ 100 ms trước mỗi request. Redirect không tự được chấp nhận.

Chạy lần lượt 5, 10, 25 thread nếu máy đáp ứng, giữ các cấu hình khác và ghi môi trường. Tổng sample cấu hình = threads × loops × 8: 200 / 400 / 1000; đây không phải số test case độc lập. Dừng giữa chừng sẽ cho số mẫu thấp hơn.

## Đọc report và định nghĩa đạt

- Error %: kiểm tra lỗi kết nối, HTTP và assertion; mục tiêu thực hành là 0% lỗi.
- p95 response time: ghi từ report thật, kèm tải và cấu hình. Chưa có SLA thời gian được giảng viên duyệt nên không tự đặt một số ms rồi khẳng định sản phẩm đạt SLA.
- Throughput: ghi request/giây từ report, cùng số sample và thời gian chạy.
- Máy tạo tải và server cùng máy nên tranh tài nguyên. Ghi OS, CPU/RAM, phiên bản Node/Java/JMeter, URL, ngày giờ; không suy rộng thành hiệu năng production.

Mẫu báo cáo:

| Đợt | Threads / loops / ramp | Samples thực | Error % | p95 ms | Throughput | Bằng chứng |
|---|---|---|---|---|---|---|
| Lần 1 | 5 / 5 / 10 | Chưa chạy | — | — | — | — |
| Lần 2 | 10 / 5 / 10 | Chưa chạy | — | — | — | — |
| Lần 3 | 25 / 5 / 10 | Chưa chạy | — | — | — | — |

## Nguồn

[Apache JMeter: Component Reference](https://jmeter.apache.org/usermanual/component_reference) là tài liệu cho HTTP Request, Thread Group, Constant Timer và Response Assertion. Plan trong dự án do AI hỗ trợ tạo, cần chạy thật và lưu `.jtl`/HTML report trước khi báo Pass.
