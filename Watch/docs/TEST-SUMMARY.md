# Kết quả bản 1.4 (bàn giao Claude) — 26/11/2026

Rà soát và chạy thật sau khi Antigravity hoàn thiện các trang khách. Phạm vi: HTML/CSS/JS thuần, localStorage, không backend/MySQL.

| Bộ kiểm tra | Kết quả thực tế | Bằng chứng |
|---|---|---|
| Kiểm tra cú pháp JavaScript | Đạt | `npm run check` |
| Node: nghiệp vụ + khách hàng | **67/67 Pass** (61 trước đó + 6 ca mới) | `npm test` |
| Playwright với Chrome | **84/84 Pass**, ~1,1 phút (79 trước đó + 5 ca CUS-E2E-08…12) | [HTML report](evidence/claude-verify-2026-11-26/playwright-report/index.html) |
| Giao diện 390/768/1440px | Không tràn ngang ở 13 trang khách; đã xem ảnh | [Ảnh](evidence/claude-verify-2026-11-26/) |
| 24 ca khách hàng (CUS-001…024) thực thi trên Chrome thật | **R03: 24 Pass / 0 Fail** (R01: 21 Pass / 3 Fail do lỗi bộ chạy; R02: 24/0) | [Lịch sử](evidence/manual-claude-2026-11-26/LICH-SU-KIEM-THU.md), [CSV](evidence/manual-claude-2026-11-26/ket-qua-thuc-thi.csv), [ảnh](evidence/manual-claude-2026-11-26/anh/). Người thực thi là Claude (AI) điều khiển Chrome theo các bước của ca, **không phải sinh viên thao tác tay** |
| 27 ca giao diện, responsive, truy cập, tương thích, bảo mật cơ bản, khả năng sử dụng (UI-001…027) | **R04: 27 Pass / 0 Fail** (R01 23/4 gồm 1 lỗi thật BUG-R06 và 3 lỗi của bài test; R02 26/1; R03 27/0) | [Lịch sử](evidence/ui-claude-2026-11-26/LICH-SU-KIEM-THU-GIAO-DIEN.md), [CSV ca](TEST-CASES-UI.csv), [ảnh](evidence/ui-claude-2026-11-26/anh/). UI-020 chạy trên Chrome và Edge. Người thực thi là Claude (AI) |
| Katalon `KT-017…022` (giao diện, truy cập, bảo mật, khả năng sử dụng) | **Not Run** bằng Katalon | `testing/katalon/` |
| 90 ca thủ công cũ (TC-001…090) | **Not Run** (không tự chuyển Pass) | [CSV](TEST-CASES.csv) |
| JMeter plan theo mẫu MilkShop (`aurel-performance.jmx`) | Plan hợp lệ XML; 36/36 request kiểm tra bằng Node đạt; **chưa chạy JMeter** | [JMETER.md](JMETER.md) |
| Katalon Studio (KT-001…016) | **Not Run** | Playwright không thay thế Katalon |
| Apache JMeter | **Not Run** | Chỉ đo HTTP tài nguyên tĩnh |

**Fail thật đã tìm thấy và sửa:** 6 lỗi BUG-R01…R06 trong [BUG-REPORTS](BUG-REPORTS.md) (dữ liệu hỏng làm kẹt giỏ/đặt hàng, khách vãng lai ghi đè hồ sơ khách quản lý, tràn ngang trang chi tiết đơn ở 390px, nút bị che, focus/favicon, thiếu thẻ h1 ở trạng thái rỗng). Retest bằng test tự động đạt; chưa retest thủ công.

Chi tiết xem [CLAUDE-HANDOFF](CLAUDE-HANDOFF.md). Các bản bên dưới là lịch sử.

---

# Kết quả bản 1.3 — 26/11/2026

Phạm vi được chốt: giao diện và kiểm thử localStorage, không có backend/MySQL. Kết quả mới ở đầu tài liệu; các đợt bên dưới là lịch sử.

| Bộ kiểm tra | Kết quả thực tế | Bằng chứng |
|---|---|---|
| Kiểm tra cú pháp JavaScript | Đạt | npm run check |
| Node: nghiệp vụ + bộ demo | **56/56 Pass** | npm test; 53 ca cũ + 3 ca dữ liệu demo |
| Playwright với Chrome | **69/69 Pass**, 45.8 giây | [HTML report](evidence/local-2026-11-26/playwright-report/index.html) |
| 24 ca nghiệp vụ trên QA | Được xác minh qua AUTO-01; 24 Pass/0 Fail | Report AUTO-01, dữ liệu riêng |
| 90 ca thủ công | Đã thiết kế, không tự chuyển Pass | CSV và sổ QA của người thực thi |
| Katalon Studio | **Not Run** | 12 script và hướng dẫn đã chuẩn bị |
| Apache JMeter | **Not Run** | Plan XML: 8 sampler, 16 assertion; chưa đo tải |

Môi trường: Windows, Node.js 24.13.0, Playwright 1.65.1, Chrome cài sẵn. Không có Git repository định danh commit; lưu bản mã nguồn cùng report khi nộp. Thời gian suite là thời gian thực thi test, không phải hiệu năng hệ thống.

Đã kiểm tra mới: tab/điều hướng bàn phím, giá trị biên không chèn HTML, prompt tải đúng chức năng, 12 script Katalon và JMX tải được, checklist lưu riêng, đóng modal demo không đổi dữ liệu, nạp demo giữ tài khoản và sổ QA, staff không có nút nạp, không tràn toàn trang ở 390px/1440px. Đã xem ảnh lab desktop/mobile, QA desktop/mobile và dashboard demo. [Các ảnh và giới hạn](evidence/local-2026-11-26/README.md).

Lượt đầu không khởi chạy được vì thiếu Chromium bundle; chuyển sang Chrome đã có. Lượt kế tiếp phát hiện tên nút trong test mới sai (Hủy thay vì Đóng) và CDN icon không truy cập được. Đã sửa locator, thay icon bằng SVG nội bộ và kiểm tra với mạng ngoài bị chặn. Lượt đầy đủ cuối chạy ngoài môi trường hạn chế Windows đã kết thúc thành công, 69/69; không tính lượt kẹt khi đóng tiến trình là một lượt hoàn chỉnh.

Giới hạn: chưa chạy Katalon/JMeter thực tế, chưa chạy đủ 90 ca thủ công, chưa có ảnh hội thoại AI được xác minh. Dữ liệu demo dùng để trình diễn; không phải dữ liệu kinh doanh thật. Quyền/đăng nhập client không chứng minh an toàn production. Không kiểm tra MySQL/API vì kiến trúc hiện tại không có.

---

# Test Summary Report — CHRONO 1.2

## Kiểm thử tự động theo nhóm — 25/11/2026

Trang QA chạy 24 ca nghiệp vụ trên dữ liệu mẫu. Có thể chọn cả bộ, 12 ca cơ bản hoặc nhóm sản phẩm, khách hàng, đơn hàng và kho, tài khoản, sao lưu. Kết quả hiển thị Pass/Fail từng ca, lọc theo trạng thái, lưu lịch sử, so sánh cùng nhóm và xuất JSON. Lịch sử 12 ca cũ vẫn đọc được.

Kiểm tra cú pháp đạt. Bộ nghiệp vụ trên trang đạt **24/24**, bộ Node đạt **53/53** và bộ Playwright đạt **62/62** trong 25,7 giây. Mở trực tiếp file QA trên màn hình rộng 390 px cũng chạy được 24 ca. [Báo cáo Playwright](evidence/auto-24-2026-11-25/playwright-report/index.html).

Các kịch bản Playwright mới kiểm tra tìm kiếm không có kết quả, ghi nhớ tên đăng nhập và cập nhật thông tin nhân viên. E2E-17 xác minh tab nhân viên thoát phiên khi nhận cập nhật khóa từ tab khác. E2E-18 xác minh hai tab dùng chung phiên chỉ xác nhận được một đơn khi còn một sản phẩm. Các tab cùng địa chỉ dùng chung phiên. Trạng thái 90 ca thủ công do người thực thi ghi.

## Hồi quy và mở rộng 90 test case — 24/11/2026

Thiết kế thêm TC-061–090 cho trang chủ, tìm kiếm, danh mục, phiên đăng nhập, sửa/xóa tài khoản và trang QA. Tổng cộng 90 ca thủ công có trạng thái ban đầu Not Run; các kết quả thủ công trước đó vẫn lưu trong trình duyệt, không tự chuyển Pass. Kết quả từ đợt cũ 60 ca có thể nhập lại; 30 ca bổ sung mặc định Not Run.

Lượt tự động: kiểm tra cú pháp đạt, Node **53/53** đạt. Playwright **53/55** đạt, **2 ca thất bại do hết thời gian tại bước chuẩn bị**: E2E-17 và E2E-18 cần đăng nhập admin và staff đồng thời trong hai tab, nhưng phiên hiện chia sẻ giữa các tab nên tab thứ hai tự vào bằng tài khoản trước. Hai ca chưa đến bước xác minh khóa tài khoản hoặc tranh chấp kho, vì vậy chưa thể kết luận hai chức năng đó đạt hay lỗi từ lượt này. Các ca trang chủ, sửa/xóa nhân viên, xuất/nhập kết quả và 12 ca QA chạy thành công. [Báo cáo Playwright và trace](evidence/full-qa-90-2026-11-24/playwright-report/index.html).

Phạm vi này bao gồm các chức năng đã triển khai; không chứng minh mọi tình huống, trình duyệt, bảo mật máy chủ hay khả năng chịu tải. Chưa thực thi đủ 90 ca thủ công và chưa có bằng chứng thủ công cho từng ca.

## Hồ sơ bảo vệ và demo Fail mô phỏng — 24/11/2026

Đã thêm trang `qa-portfolio.html` để trả lời tám câu hỏi về nguồn web, cách tạo, hình thức kiểm thử, công cụ, phạm vi, số ca và demo; liên kết tới thiết kế test, bài tập test AI và kỹ năng kiểm thử mẫu. Trên `qa.html`, nút **Demo Fail mô phỏng** tạo lỗi chỉ trong dữ liệu giả lập của bộ 12 ca, gắn nhãn demo và cho chạy lại bình thường để thấy Fail → Pass. Kết quả mô phỏng không được tính là bug thật của cửa hàng. AUTO-04 và PORT-01/02 kiểm tra các luồng mới. Cú pháp đạt, Node **51/51**, Playwright **50/50** đạt trong 22,1 giây. [Báo cáo và ảnh desktop/mobile](evidence/qa-portfolio-2026-11-24/playwright-report/index.html). 60 ca thủ công vẫn Not Run.

## Giao diện QA gọn hơn — 24/11/2026

Đã khôi phục thẻ `main` để nội dung được căn giữa và giới hạn chiều rộng. Đầu trang chỉ giữ nút quay lại; ba nút xuất đặt cạnh thông tin đợt thủ công. Khi chưa chạy bộ 12 ca, bảng kết quả và bộ chọn lịch sử được ẩn; sau khi chạy chúng xuất hiện như trước. Đã xem ảnh desktop/mobile sau thay đổi; các khối đầu trang bớt trống và nút không chèn vào tiêu đề. VIS-04 xác minh vùng `main` được căn giữa, bảng tự động ẩn khi chưa chạy và khung 60 ca cuộn riêng. Cú pháp, Node **51/51**, Playwright **47/47** đạt; lượt Playwright mất 20,5 giây. [Báo cáo và ảnh giao diện gọn](evidence/qa-compact-2026-11-24/playwright-report/index.html).

## Cải thiện giao diện trang QA — 24/11/2026

Trang QA có đầu trang đỏ burgundy, thanh điều hướng cố định theo khu vực, thẻ thống kê rõ trạng thái, bố cục biểu mẫu gọn hơn và khung cuộn riêng cho 60 test case. Trên mobile, test case hiển thị thành thẻ thay cho bảng ngang dài. Đã xem ảnh chụp desktop/mobile trong báo cáo; không thấy chữ tràn chiều rộng trang. VIS-04 xác minh điều hướng và khung cuộn trên desktop. Cú pháp, Node **51/51** và Playwright **47/47** đạt; lượt Playwright mất 20,1 giây. [Báo cáo và ảnh giao diện mới](evidence/qa-redesign-2026-11-24/playwright-report/index.html).

## Lịch sử và so sánh hồi quy tự động — 24/11/2026

Trang QA lưu tối đa 10 lần chạy bộ 12 ca tự động, cho chọn lại từng lần và xuất JSON của lần đang xem. Dòng so sánh chỉ ra mã ca chuyển Pass → Fail và Fail → Pass so với lần chạy trước. AUTO-03 gây lỗi có kiểm soát ở thao tác sản phẩm, xác minh ba ca bị ảnh hưởng (AT-001, AT-002, AT-009), sau đó chạy lại và xác minh cả ba trở lại Pass. Kiểm tra cú pháp, Node **51/51** và Playwright **46/46** đạt; lượt Playwright mất 19,5 giây. [Báo cáo hồi quy 46 ca](evidence/qa-history-2026-11-24/playwright-report/index.html).

## Chạy kiểm thử chức năng ngay trên web — 24/11/2026

Trang QA có nút **Chạy 12 ca** để kiểm tra các quy tắc nghiệp vụ trên dữ liệu giả lập độc lập; bảng hiện Pass/Fail, quan sát thực tế và thời gian từng ca, có xuất JSON và lưu lần chạy gần nhất. AUTO-01 xác minh 12/12 Pass, xuất file và không ghi dữ liệu cửa hàng; AUTO-02 gây lỗi có kiểm soát để xác minh trang hiển thị Fail. Bộ này không kiểm thử thao tác giao diện và không tự điền 60 ca thủ công. Cú pháp, Node **51/51** và Playwright **45/45** đạt; lượt Playwright mất 18,3 giây. [Báo cáo hồi quy 45 ca](evidence/qa-functional-2026-11-24/playwright-report/index.html).

## Xuất danh sách lỗi CSV — 24/11/2026

Khu vực **Lỗi cần theo dõi** có nút **Xuất lỗi CSV** khi đợt đang xem có ca Fail. File chỉ chứa ca Fail, gồm Bug ID, test case, bước tái hiện, kết quả mong đợi/thực tế, bằng chứng và thông tin đợt. Nội dung bắt đầu bằng công thức Excel được vô hiệu hóa. QA-11 kiểm tra nội dung file và việc nút bị khóa khi không có lỗi. Kiểm tra cú pháp, Node **51/51** và Playwright **43/43** đạt; lượt Playwright mất 17,7 giây. [Báo cáo hồi quy 43 ca](evidence/qa-bug-export-2026-11-24/playwright-report/index.html).

## Cập nhật luồng thao tác QA — 24/11/2026

Trang QA có nút mở ca **Not Run** tiếp theo và bảng **Lỗi cần theo dõi** lấy từ các ca Fail của đợt đang xem. Bảng có Bug ID, kết quả thực tế, bằng chứng và nút mở lại ca; đổi đợt sẽ tính lại bảng. Ca QA-10 xác minh ghi Fail, mở lại và tạo đợt mới. Kiểm tra cú pháp, Node **51/51** và Playwright **42/42** đều đạt; lượt Playwright mất 17,7 giây. [Báo cáo hồi quy 42 ca](evidence/qa-workflow-2026-11-24/playwright-report/index.html).

## Cập nhật trang theo dõi kiểm thử — 24/11/2026

Trang QA nay hiển thị trạng thái nạp 60 test case ở đầu trang, hiện lỗi rõ ràng và cho **Thử tải lại** khi file CSV chưa đọc được. Khi tải xong, có lối tắt **Xem test case** và thống kê được đưa lên trước biểu mẫu thông tin đợt. Ca QA-09 mô phỏng một lượt tải thất bại rồi thử lại thành công. Kiểm tra cú pháp và Node **51/51** đạt; hồi quy Playwright mới nhất **41/41** đạt trong 15,5 giây. [Báo cáo 41 ca](evidence/qa-loading-2026-11-24/playwright-report/index.html).

## Cập nhật điều hướng kiểm thử — 24/11/2026

Liên kết **Theo dõi kiểm thử** đã được đưa lên đầu menu cửa hàng và mở `qa.html` trong cùng tab. Trang QA có liên kết **Quay lại cửa hàng**. Kiểm tra cú pháp đạt; lượt hồi quy lúc cập nhật điều hướng đạt **40/40** trong 18,3 giây. [Báo cáo hồi quy điều hướng](evidence/qa-navigation-2026-11-24/playwright-report/index.html). Bộ nghiệp vụ Node 51/51 đạt ở lượt trước; thay đổi này chỉ liên quan điều hướng giao diện.

## Cập nhật chức năng khôi phục dữ liệu — 24/11/2026

Đã thêm nhập lại JSON từ mục Báo cáo. Kiểm tra cú pháp đạt; bộ Node đạt **51/51** và lượt hồi quy Playwright đầy đủ đạt **40/40** trong 20,1 giây: 28 ca cửa hàng, 8 ca QA, 3 ca giao diện/điều hướng và 1 ca tải icon Flaticon. Hai E2E mới xác minh xuất → thay đổi tồn → nhập lại → khôi phục tồn và từ chối file có giá âm mà dữ liệu không đổi. [Báo cáo hồi quy 40 ca](evidence/full-regression-40-2026-11-24/playwright-report/index.html). Các số 47/34 dưới đây là lịch sử trước thay đổi.

Giới hạn: nhập sẽ thay thế dữ liệu nghiệp vụ hiện tại sau khi người dùng xác nhận; file JSON cần được lưu để khôi phục nếu cần. Không nhập tài khoản. Chưa kiểm tra thủ công hộp thoại chọn file hoặc quota khi nhập trên trình duyệt người dùng.

Ngày: 24/11/2026 · Người thực thi: trợ lý lập trình, cần sinh viên review và bổ sung kiểm thử thủ công.

## Phạm vi và môi trường

Windows; Node.js v25.8.1; Playwright 1.65.1; Chromium 159.0.8154.6 chạy headless; localhost 127.0.0.1:5517. Desktop 1440×1000; một kịch bản mobile 390×844. Múi giờ Asia/Ho_Chi_Minh. Nguồn: CHRONO 1.2 trong thư mục Watch; chưa có commit Git định danh.

## Kết quả đã thực thi

| Bộ kiểm tra | Tổng | Đạt | Thất bại | Chưa chạy | Kết luận |
|---|---:|---:|---:|---:|---|
| Nghiệp vụ Node hiện tại | 53 | 53 | 0 | 0 | Đạt trong lượt mới nhất |
| Giao diện Playwright hiện tại | 62 | 62 | 0 | 0 | Đạt trong lượt 25/11/2026 |
| Quy tắc nghiệp vụ trên trang QA | 24 | 24 | 0 | 0 | Chạy bộ đầy đủ trên dữ liệu mẫu |
| Nghiệp vụ Node trước nhập JSON | 47 | 47 | 0 | 0 | Kết quả lịch sử |
| Giao diện Playwright trước nhập JSON | 26 | 26 | 0 | 0 | Kết quả lịch sử của ba đợt 15 + 5 + 6 ca |
| Công cụ theo dõi QA riêng trước nhập JSON | 8 | 8 | 0 | 0 | Kết quả lịch sử; hiện nằm trong bộ 47 ca |
| Test case thủ công CSV | 90 | 0 | 0 | 90 | Trạng thái gốc Not Run; kết quả trên máy tùy đợt thực hiện |

Các ca thủ công bổ sung trong VERIFICATION.md cũng chưa được thực thi có hệ thống. Không tự chuyển trạng thái của chúng sang Pass chỉ vì có E2E gần giống.

Lệnh `npm run check` và kiểm tra cú pháp server/config đạt. Đợt đầu chạy đủ 15 ca báo `15 passed (7.9s)`. Đợt bổ sung E2E-16 đến E2E-20 báo `5 passed (4.9s)`. Đợt biên E2E-21 đến E2E-26 báo `6 passed (5.2s)` sau sửa mã test. Không thay đổi mã ứng dụng giữa các đợt. Tổng 26 ca đã đạt qua ba đợt, không phải một lần chạy 26 ca. Đây là thời gian chạy suite, không phải chỉ số hiệu năng website.

## Bằng chứng

- Hồi quy sau nhập JSON: [báo cáo 40 ca](evidence/full-regression-40-2026-11-24/playwright-report/index.html), 40/40 đạt trong một lượt; Node 51/51 đạt. Lần chạy đầu trong sandbox không tìm thấy Chromium nên không được tính là lỗi sản phẩm; lượt cuối chạy với Chromium đã cài và đạt.
- Bản lưu HTML report: [mở báo cáo](evidence/e2e-2026-11-24/playwright-report/index.html).
- Báo cáo 5 ca bổ sung: [mở báo cáo bổ sung](evidence/e2e-extra-2026-11-24/playwright-report/index.html), có ảnh giao diện chế độ in trong E2E-19.
- Báo cáo 6 ca biên: [mở báo cáo biên](evidence/e2e-boundary-2026-11-24/playwright-report/index.html).
- Báo cáo công cụ QA: [mở báo cáo QA](evidence/qa-tracker-2026-11-24/playwright-report/index.html), 4 ca đạt trong 3.3 giây.
- Báo cáo QA mới nhất: [mở báo cáo 7 ca](evidence/qa-runs-2026-11-24/playwright-report/index.html), 7 ca đạt trong 5.4 giây; thay thế kết quả 4 ca cho công cụ QA hiện tại.
- Hồi quy toàn bộ mới nhất: [mở báo cáo 34 ca](evidence/full-regression-2026-11-24/playwright-report/index.html), 34/34 đạt trong một lượt 19.5 giây. Bộ Node chạy cùng đợt đạt 47/47.
- Kiểm tra trực quan sau hồi quy: [báo cáo và ảnh desktop/mobile](evidence/visual-2026-11-24/playwright-report/index.html), 2/2 ca đạt. Đã xem ảnh: tiêu đề tiếng Việt ở trang tổng quan hiển thị đúng; khu vực chọn đợt QA trên mobile được chỉnh thành từng hàng. CDN icon bị chặn trong ca này nên ảnh bằng chứng không đánh giá icon.
- Lối tắt QA trước cập nhật điều hướng: [báo cáo 3 ca trực quan và điều hướng](evidence/qa-link-2026-11-24/playwright-report/index.html), 3/3 đạt với cách mở tab mới. Cách mở cùng tab hiện tại đã được xác minh trong báo cáo hồi quy mới ở đầu tài liệu.
- Icon Flaticon: [báo cáo và ảnh tải CDN thật](evidence/flaticon-2026-11-24/playwright-report/index.html), 1/1 đạt. CSS CDN trả HTTP 200; font Uicons được áp dụng và biểu tượng hiện trong ảnh desktop. Kết quả phụ thuộc kết nối mạng tại thời điểm chạy.
- Nguồn kiểm thử: `tests/store.test.js` và bốn file `tests/e2e/*.spec.js`.
- Phụ thuộc: `package-lock.json`; dùng `npm ci` để tái lập phiên bản.
- Mỗi E2E có context và dữ liệu riêng, không thay đổi dữ liệu người dùng trên Go Live.

Lần chạy đầu có lỗi locator tìm ô chọn trong mã test và bị dừng để sửa. Sau khi chuyển sang locator combobox theo tên truy cập, chạy lại đầy đủ đạt 15/15. Đây là sửa test harness, không ghi thành lỗi nghiệp vụ của sản phẩm. Report lưu ở trên là lần chạy cuối; không có ảnh lỗi/trace của ca đạt vì cấu hình chỉ giữ khi thất bại.

## Giới hạn và rủi ro còn lại

- `qa.html` là công cụ nhập kết quả do người thực thi khai báo, không tự xác minh file bằng chứng hoặc chạy các test case thủ công. 8 ca kiểm tra công cụ QA dùng dữ liệu giả lập và không được tính là kết quả thực thi TC-001/TC-002. Đã kiểm tra nhiều đợt, nhập JSON và xuất CSV. Chưa kiểm tra đồng thời ghi cùng đợt hoặc quota của trang QA; chưa có giao dịch server để bảo đảm ghi đồng thời.

- E2E-21 đến 26 xác minh phiên hết hạn, giá đơn lịch sử, hủy nháp, ngày báo cáo ngược, ảnh quá lớn/giả và lỗi ghi quota. Hết phiên được thiết lập bằng sửa thời hạn trong sessionStorage, không chờ thực 8 giờ. Quota được mô phỏng bằng lỗi Storage API, không phải lấp đầy đĩa/bộ nhớ thật.
- Đợt biên đầu có hai lỗi của mã test (nút Đóng bị chọn trùng và khác biệt innerText/textContent); đã sửa và chạy lại cả 6 ca đạt. Không tính thành lỗi sản phẩm.

- Đã kiểm tra tạo/khóa/mở khóa nhân viên và thu hồi phiên tab đang đăng nhập qua UI; hai tab cạnh tranh tồn kho bằng Web Locks; ảnh URL trả 404; CSS chế độ in và việc nút in gọi hàm in mà không đổi dữ liệu.
- Đã xem ảnh giao diện chế độ in của một đơn nháp một dòng: mã đơn, khách, trạng thái, dòng hàng và tổng tiền rõ ràng; sidebar và nút bị ẩn. Chưa xác minh hộp thoại in hệ điều hành, giấy/PDF nhiều trang hoặc máy in thật. Test thay window.print bằng hàm ghi nhận để tránh mở hộp thoại hệ thống.
- Chưa chạy đầy đủ 60 ca thủ công. Icon CDN đã được kiểm tra trong ICON-01 nhưng vẫn phụ thuộc mạng khi dùng Go Live. Bài hai tab chỉ xác minh một tình huống tranh chấp cùng origin trên Chromium có Web Locks, không chứng minh mọi trường hợp đồng thời.
- Các E2E nghiệp vụ chặn CDN Flaticon để ổn định; chỉ ICON-01 xác minh icon khi tải CDN thật.
- Kiểm tra chiều rộng mobile không chứng minh tất cả bố cục, cỡ chữ và thao tác bàn phím đều đạt.
- Chưa đo hiệu năng, chưa thử Firefox/WebKit. Không có API/backend để kiểm thử Postman hoặc bảo mật server.
- Mật khẩu và quyền vẫn là mô phỏng frontend; localStorage không bảo vệ dữ liệu trước người dùng có DevTools.

## Đánh giá bàn giao

Có thể dùng làm bản thực hành đồ án và demo các luồng đã kiểm thử. Chưa khẳng định đạt toàn bộ điều kiện kết thúc kiểm thử: cần thực thi ca thủ công ưu tiên cao, lưu bằng chứng cho các giới hạn trên và hoàn thiện sổ lỗi thật. Không đủ cơ sở triển khai bán hàng thực tế.

## Mẫu cập nhật cho đợt sau

Phiên bản nguồn/commit: … · OS/trình duyệt: … · Ngày/người chạy: …

Phạm vi thay đổi: … · Bộ test/Pass/Fail/Blocked/Not Run: …

Lỗi còn mở theo severity: … · Bug ID đã retest: … · Regression: …

Bằng chứng: … · Rủi ro còn lại: … · Đề xuất bàn giao: …
