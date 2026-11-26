# Nhận diện AUREL

Theo lựa chọn người dùng: trắng và xanh ngọc. Trang khách ở chế độ Persuade/Explore; trang quản lý và QA ở chế độ Operate. Hình ảnh sáng, vật liệu thép, mặt số xanh ngọc, lụa trắng; không dùng đồng hồ vẽ CSS thay ảnh.

- Nền trắng `#ffffff`, nền phụ `#f3f9f7`, mint `#e5f3ed`.
- Xanh hành động `#087b6a`, xanh hover `#075e52`, chữ `#153e36`, phụ `#567168`, đường kẻ `#dbe9e3`.
- Cormorant Garamond cho tiêu đề/trademark trang khách; Be Vietnam Pro cho nội dung. Font và giấy phép self-host trong `assets/fonts`.
- Đồng bộ header, utility bar (tách rõ lối vào **Quản lý cửa hàng** với **Tài khoản khách**), badge giỏ hàng/yêu thích và footer 4 cột trên toàn bộ 13 trang khách hàng thông qua `storefront.css` và `storefront.js`.
- Ảnh có kích thước khai báo, bản minh họa AI mặc định chọn theo loại và có chú thích nguồn rõ ràng; ảnh người dùng đã chọn vẫn được ưu tiên và rơi về ảnh minh họa khi URL lỗi. Không cần reset dữ liệu để nhận giao diện mới.
- Responsive: kiểm tra đầy đủ ở `390px`, `768px` và `1440px`, không tràn ngang toàn trang, form có `<label>`, focus bàn phím và lỗi hiển thị ngay tại trường liên quan.
- Giữ trạng thái Pass/xác nhận xanh, cảnh báo/nháp vàng nâu và Fail/lỗi đỏ; không đồng nhất màu lỗi với màu thương hiệu.
