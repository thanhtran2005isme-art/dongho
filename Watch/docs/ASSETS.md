# AUREL — ảnh và nhận diện

Người dùng chọn tên **AUREL** và tông **trắng & xanh ngọc** ngày 26/11/2026. Tên trước đây là CHRONO; dữ liệu localStorage và báo cáo lịch sử giữ namespace/tên phiên bản cũ để tương thích.

## Ảnh

Tạo bằng công cụ image_gen tích hợp theo skill imagegen, không dùng API/CLI fallback. Ảnh là minh họa cho website thực hành, không phải ảnh chính thức hoặc bảo chứng của Seiko, Citizen, Casio, Orient, Tissot.

| Tệp | Nội dung và prompt chính |
|---|---|
| assets/images/aurel-hero.png | Ảnh editorial sáng: đồng hồ thép mặt xanh ngọc, bệ đá mint và lụa trắng, không logo/chữ |
| assets/images/aurel-steel.png | Ảnh studio đồng hồ thép mặt xanh ngọc trên nền trắng, không logo |
| assets/images/aurel-leather.png | Ảnh studio đồng hồ mặt ivory, vỏ vàng, dây da nâu, không logo |
| assets/images/aurel-digital.png | Ảnh studio đồng hồ điện tử đen, không logo |

Prompt đầy đủ được lưu trong [assets/image-prompts.json](../assets/image-prompts.json). Ảnh được lưu trong dự án, không phụ thuộc URL ngoài hoặc xóa dữ liệu trình duyệt để hiển thị. Ảnh người dùng tự chọn vẫn được ưu tiên; ảnh AI là mặc định minh họa cho sản phẩm chưa có ảnh.

## Font và biểu tượng

- Cormorant Garamond và Be Vietnam Pro được self-host trong assets/fonts, nguồn Google Fonts trên GitHub (google/fonts). Giấy phép SIL Open Font License được lưu cùng font: cormorant-OFL.txt và be-vietnam-OFL.txt.
- Monogram A và các biểu tượng giao diện là SVG hình học nội bộ, không tải CDN.

Không có ảnh hội thoại AI được tạo giả. Minh chứng chat yêu cầu tạo website vẫn cần dùng ảnh cuộc hội thoại gốc.
