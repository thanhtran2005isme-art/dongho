const { test, expect } = require('@playwright/test');

async function blockExternal(page) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
}

async function stored(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('chrono-watch-v1')));
}

test('CUS-E2E-01 Đăng ký, đăng nhập, sửa hồ sơ khách và chặn tài khoản admin/trùng email', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/register.html');
  await expect(page.getByTestId('local-auth-notice')).toContainText('không phải bảo mật production');

  // Chặn dữ liệu sai và mật khẩu không khớp
  await page.getByLabel('Họ và tên *', { exact: true }).fill('Khách Kiểm Thử');
  await page.getByLabel('Email *', { exact: true }).fill('sai-email');
  await page.getByLabel('Số điện thoại *', { exact: true }).fill('123');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('TestPass@1');
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('KhacPass@1');
  await page.getByTestId('register-submit-btn').click();
  await expect(page.locator('#err-email')).toContainText('Email');
  await expect(page.locator('#err-phone')).toContainText('10 chữ số');
  await expect(page.locator('#err-confirm')).toContainText('không khớp');

  // Đăng ký hợp lệ
  await page.getByLabel('Email *', { exact: true }).fill('khang@example.com');
  await page.getByLabel('Số điện thoại *', { exact: true }).fill('0901234567');
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('TestPass@1');
  await page.getByTestId('register-submit-btn').click();
  await expect(page).toHaveURL(/account\.html$/);
  await expect(page.getByTestId('account-email')).toHaveText('khang@example.com');

  // Sửa hồ sơ và giữ sau reload
  await page.getByLabel('Họ và tên *', { exact: true }).fill('Lê Minh Khang');
  await page.getByLabel('Địa chỉ nhận hàng mặc định', { exact: true }).fill('15 Đường Mẫu, Quận 3, TP.HCM');
  await page.getByTestId('profile-save-btn').click();
  await expect(page.getByTestId('profile-feedback')).toContainText('Đã cập nhật');
  await page.reload();
  await expect(page.getByLabel('Họ và tên *', { exact: true })).toHaveValue('Lê Minh Khang');
  await expect(page.getByLabel('Địa chỉ nhận hàng mặc định', { exact: true })).toHaveValue('15 Đường Mẫu, Quận 3, TP.HCM');

  // Đăng xuất -> thử đăng ký trùng email -> thử login admin bị chặn -> login đúng
  await page.getByTestId('logout-btn').click();
  await expect(page.getByTestId('account-guest-state')).toBeVisible();

  await page.goto('/register.html');
  await page.getByLabel('Họ và tên *', { exact: true }).fill('Trùng Email');
  await page.getByLabel('Email *', { exact: true }).fill('KHANG@example.com');
  await page.getByLabel('Số điện thoại *', { exact: true }).fill('0901234568');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('Another@123');
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('Another@123');
  await page.getByTestId('register-submit-btn').click();
  await expect(page.locator('#err-email')).toContainText('đã được đăng ký');

  await page.goto('/login.html');
  await page.getByLabel('Email *', { exact: true }).fill('admin');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('Admin@123');
  await page.getByTestId('login-submit-btn').click();
  await expect(page.locator('#err-email')).toContainText('Quản lý cửa hàng');

  await page.getByLabel('Email *', { exact: true }).fill('khang@example.com');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('WrongPass@1');
  await page.getByTestId('login-submit-btn').click();
  await expect(page.getByTestId('login-error')).toContainText('không đúng');

  await page.getByLabel('Mật khẩu *', { exact: true }).fill('TestPass@1');
  await page.getByTestId('login-submit-btn').click();
  await expect(page).toHaveURL(/account\.html$/);
});

test('CUS-E2E-02 Chi tiết sản phẩm, số lượng không hợp lệ, ngừng bán, không tồn tại và lỗi ảnh', async ({ page }) => {
  await page.route('https://images.example.test/**', route => route.abort());
  await page.goto('/home.html');
  await page.evaluate(() => {
    const db = WatchStore.seed();
    db.products[0].image = 'https://images.example.test/broken-watch.png';
    localStorage.setItem(WatchStore.KEY, JSON.stringify(db));
  });

  // Mở chi tiết p1 từ trang chủ
  await page.reload();
  await page.getByTestId('product-detail-link-p1').click();
  await expect(page).toHaveURL(/product\.html\?id=p1$/);
  await expect(page.getByTestId('product-code')).toHaveText('SE001');
  // Ảnh lỗi phải rơi về ảnh minh họa thay thế
  await expect(page.locator('#detail-img')).toHaveAttribute('src', 'assets/images/aurel-steel.png');

  // Số lượng 0 và vượt tồn bị chặn
  await page.getByTestId('qty-input').fill('0');
  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('product-feedback')).toContainText('không hợp lệ');

  await page.getByTestId('qty-input').fill('99');
  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('product-feedback')).toContainText('Không đủ tồn kho');

  // Thêm hợp lệ + cập nhật badge giỏ + lưu yêu thích qua reload
  await page.getByTestId('qty-input').fill('2');
  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('2');

  await page.getByTestId('wishlist-toggle-btn').click();
  await expect(page.getByTestId('header-wishlist-count')).toHaveText('1');
  await page.reload();
  await expect(page.getByTestId('header-cart-count')).toHaveText('2');
  await expect(page.getByTestId('wishlist-toggle-btn')).toHaveAttribute('aria-pressed', 'true');

  // Sản phẩm ngừng kinh doanh p7
  await page.goto('/product.html?id=p7');
  await expect(page.getByTestId('product-inactive-notice')).toBeVisible();
  await expect(page.getByTestId('add-to-cart-btn')).toBeDisabled();

  // Sản phẩm không tồn tại
  await page.goto('/product.html?id=khong-ton-tai');
  await expect(page.getByTestId('product-not-found')).toBeVisible();
});

test('CUS-E2E-03 Giỏ hàng đối chiếu giá thật từ cửa hàng, sửa/xóa và chặn sản phẩm hết hàng/ngừng bán', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/product.html?id=p1');
  await page.getByTestId('qty-input').fill('2');
  await page.getByTestId('add-to-cart-btn').click();

  await page.goto('/product.html?id=p6');
  await page.getByTestId('add-to-cart-btn').click();

  // Giả lập sửa giá trong localStorage giỏ hàng và đổi giá p1 trong cửa hàng
  await page.evaluate(() => {
    const cart = JSON.parse(localStorage.getItem('chrono-cart-v1'));
    cart.items[0].price = 100; // bị sửa giả mạo
    localStorage.setItem('chrono-cart-v1', JSON.stringify(cart));

    const db = JSON.parse(localStorage.getItem('chrono-watch-v1')) || WatchStore.seed();
    db.products[0].price = 13000000; // cửa hàng tăng giá p1 từ 12.5tr -> 13tr
    localStorage.setItem('chrono-watch-v1', JSON.stringify(db));
  });

  await page.goto('/cart.html');
  await expect(page.getByTestId('cart-price-change-notice')).toBeVisible();
  await expect(page.getByTestId('line-unit-price-p1')).toContainText('13.000.000');
  await expect(page.getByTestId('cart-subtotal')).toContainText('27.250.000'); // 2*13tr + 1.25tr

  // Xóa p6 và giảm p1 xuống 1
  await page.getByTestId('remove-item-p6').click();
  await expect(page.getByTestId('cart-item-p6')).toHaveCount(0);
  await page.locator('[data-qty-dec="p1"]').click();
  await expect(page.getByTestId('cart-subtotal')).toContainText('13.000.000');

  // Cho p1 hết hàng -> nút đặt hàng bị khóa
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('chrono-watch-v1'));
    db.products[0].stock = 0;
    localStorage.setItem('chrono-watch-v1', JSON.stringify(db));
  });
  await page.reload();
  await expect(page.getByTestId('cart-blocking-notice')).toBeVisible();
  await expect(page.getByTestId('proceed-checkout-btn')).toBeDisabled();

  // Xóa hết -> trạng thái giỏ rỗng
  await page.getByTestId('remove-item-p1').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('CUS-E2E-04 Toàn trình: Khách đặt hàng → Đơn nháp trong quản lý → Admin xác nhận/đổi giá/hủy → Khách xem trạng thái và giá lịch sử', async ({ page }) => {
  await blockExternal(page);

  // 1. Đăng ký tài khoản khách A
  await page.goto('/register.html');
  await page.getByLabel('Họ và tên *', { exact: true }).fill('Nguyễn Thảo Vy');
  await page.getByLabel('Email *', { exact: true }).fill('vy@example.com');
  await page.getByLabel('Số điện thoại *', { exact: true }).fill('0903333333');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('VyCustomer@1');
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('VyCustomer@1');
  await page.getByTestId('register-submit-btn').click();
  await expect(page).toHaveURL(/account\.html$/);

  // 2. Thêm 2 chiếc SE001 (p1, giá 12.5tr, tồn 8) vào giỏ và sang checkout
  await page.goto('/product.html?id=p1');
  await page.getByTestId('qty-input').fill('2');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/checkout.html');
  await expect(page.getByTestId('checkout-customer-mode')).toContainText('vy@example.com');

  // Validate thiếu địa chỉ
  await page.getByTestId('place-order-btn').click();
  await expect(page.locator('#err-address')).toContainText('5 đến 300');

  // Nhập địa chỉ & ghi chú và gửi (bấm liên tiếp để kiểm tra chống trùng)
  await page.getByLabel('Địa chỉ nhận hàng *').fill('22 Đường Mẫu, TP. Hồ Chí Minh');
  await page.getByLabel('Ghi chú đơn hàng (tùy chọn)').fill('Gọi trước khi giao');
  await page.getByTestId('place-order-btn').click();
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  await expect(page.getByTestId('success-order-code')).toContainText('DH0001');
  await expect(page.getByTestId('success-order-status')).toContainText('Nháp');
  await expect(page.getByTestId('success-order-total')).toContainText('25.000.000');

  // Reload order-success KHÔNG tạo thêm đơn; tồn kho p1 vẫn là 8
  await page.reload();
  await expect(page.getByTestId('success-order-code')).toContainText('DH0001');
  let db = await stored(page);
  expect(db.orders).toHaveLength(1);
  expect(db.orders[0].status).toBe('draft');
  expect(db.products[0].stock).toBe(8);
  const orderId = db.orders[0].id;

  // Truy cập trực tiếp order-success.html không có id -> không hiển thị thành công
  await page.goto('/order-success.html');
  await expect(page.getByTestId('order-success-invalid')).toBeVisible();

  // 3. Admin đăng nhập index.html, thấy đơn nháp DH0001, xác nhận bán -> tồn p1 còn 6
  await page.goto('/index.html');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('admin');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).click();
  await expect(page.locator('tbody')).toContainText('DH0001');
  await page.getByRole('button', { name: 'Chi tiết', exact: true }).click();
  await expect(page.locator('#modal')).toContainText('Website khách');
  await expect(page.locator('#modal')).toContainText('Gọi trước khi giao');
  await page.getByRole('button', { name: 'Xác nhận bán', exact: true }).click();
  await expect(page.locator('#modal')).not.toBeVisible();

  db = await stored(page);
  expect(db.products[0].stock).toBe(6);
  expect(db.orders[0].status).toBe('confirmed');

  // Admin đổi giá p1 lên 15.000.000 -> giá lịch sử trong đơn DH0001 phải giữ nguyên 12.500.000
  await page.locator('nav').getByRole('button', { name: 'Sản phẩm', exact: true }).click();
  await page.getByRole('row').filter({ hasText: 'SE001' }).getByRole('button', { name: 'Chỉnh sửa' }).click();
  await page.getByLabel('Giá bán (VND) *', { exact: true }).fill('15000000');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.locator('#modal')).not.toBeVisible();

  // 4. Khách A xem lịch sử & chi tiết đơn: thấy Đã xác nhận & giữ giá lịch sử 12.5tr / tổng 25tr
  await page.goto('/orders.html');
  await expect(page.getByTestId('order-status-DH0001')).toContainText('Đã xác nhận');
  await page.getByTestId('order-detail-link-DH0001').click();
  await expect(page).toHaveURL(new RegExp(`order-detail\\.html\\?id=${orderId}$`));
  await expect(page.getByTestId('detail-order-status')).toContainText('Đã xác nhận');
  await expect(page.getByTestId('detail-item-price-p1')).toContainText('12.500.000');
  await expect(page.getByTestId('detail-order-total')).toContainText('25.000.000');

  // 5. Admin hủy đơn đã xác nhận -> hoàn kho p1 về 8 đúng một lần; khách thấy Đã hủy
  await page.goto('/index.html');
  await page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).click();
  await page.getByRole('button', { name: 'Chi tiết', exact: true }).click();
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Hủy đơn', exact: true }).click();
  await expect(page.locator('#modal')).not.toBeVisible();
  db = await stored(page);
  expect(db.products[0].stock).toBe(8);
  expect(db.orders[0].status).toBe('cancelled');

  await page.goto(`/order-detail.html?id=${orderId}`);
  await expect(page.getByTestId('detail-order-status')).toContainText('Đã hủy');

  // 6. Đăng xuất sang tài khoản B: sửa URL order-detail?id=orderId KHÔNG được xem đơn của A
  await page.goto('/account.html');
  await page.getByTestId('logout-btn').click();
  await page.goto('/register.html');
  await page.getByLabel('Họ và tên *', { exact: true }).fill('Khách B');
  await page.getByLabel('Email *', { exact: true }).fill('khachb@example.com');
  await page.getByLabel('Số điện thoại *', { exact: true }).fill('0904444444');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('KhachB@123');
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('KhachB@123');
  await page.getByTestId('register-submit-btn').click();
  await expect(page).toHaveURL(/account\.html$/);

  await page.goto('/orders.html');
  await expect(page.getByTestId('orders-empty')).toBeVisible();
  await page.goto(`/order-detail.html?id=${orderId}`);
  await expect(page.getByTestId('order-detail-denied')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Nguyễn Thảo Vy');
});

test('CUS-E2E-05 Khách vãng lai đặt hàng, không liệt kê toàn bộ đơn cửa hàng, tra cứu đúng mới xem được', async ({ page, context }) => {
  await blockExternal(page);

  await page.goto('/product.html?id=p2');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/checkout.html');
  await expect(page.getByTestId('checkout-guest-mode')).toBeVisible();
  await page.getByLabel('Họ và tên *').fill('Khách Vãng Lai');
  await page.getByLabel('Số điện thoại *').fill('0905555555');
  await page.getByLabel('Email *').fill('guest@example.com');
  await page.getByLabel('Địa chỉ nhận hàng *').fill('99 Đường Giả Lập, Đà Nẵng');
  await page.getByTestId('place-order-btn').click();
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  const orderId = new URL(page.url()).searchParams.get('id');

  // Trong cùng tab phiên hiện tại, khách vãng lai xem được đơn vừa đặt
  await page.goto('/orders.html');
  await expect(page.getByTestId('order-row-DH0001')).toBeVisible();

  // Mở tab mới (sessionStorage mới): KHÔNG liệt kê đơn cũ và sửa URL trực tiếp bị chặn
  const tab2 = await context.newPage();
  await blockExternal(tab2);
  await tab2.goto('/orders.html');
  await expect(tab2.getByTestId('guest-no-session-orders')).toBeVisible();
  await expect(tab2.locator('main')).not.toContainText('Khách Vãng Lai');

  await tab2.goto(`/order-detail.html?id=${orderId}`);
  await expect(tab2.getByTestId('order-detail-denied')).toBeVisible();

  // Tra cứu sai SĐT bị chặn; tra cứu đúng mã đơn + SĐT thì xem được
  await tab2.goto('/orders.html');
  await tab2.getByLabel('Mã đơn hàng *').fill('DH0001');
  await tab2.getByLabel('Số điện thoại hoặc Email đặt hàng *').fill('0900000000');
  await tab2.getByTestId('guest-lookup-btn').click();
  await expect(tab2.getByTestId('guest-lookup-error')).toContainText('Không tìm thấy');

  await tab2.getByLabel('Số điện thoại hoặc Email đặt hàng *').fill('0905555555');
  await tab2.getByTestId('guest-lookup-btn').click();
  await expect(tab2).toHaveURL(new RegExp(`order-detail\\.html\\?id=${orderId}$`));
  await expect(tab2.getByTestId('detail-customer-name')).toHaveText('Khách Vãng Lai');
});

test('CUS-E2E-06 Yêu thích, Giới thiệu và Liên hệ mô phỏng lưu cục bộ', async ({ page }) => {
  await blockExternal(page);

  // Yêu thích rỗng -> thêm từ product -> thêm vào giỏ -> xóa
  await page.goto('/wishlist.html');
  await expect(page.getByTestId('wishlist-empty')).toBeVisible();

  await page.goto('/product.html?id=p3');
  await page.getByTestId('wishlist-toggle-btn').click();
  await page.goto('/wishlist.html');
  await expect(page.getByTestId('wishlist-item-p3')).toBeVisible();
  await page.getByTestId('wish-add-cart-p3').click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('1');
  await page.getByTestId('wish-remove-p3').click();
  await expect(page.getByTestId('wishlist-empty')).toBeVisible();

  // Giới thiệu trung thực đồ án
  await page.goto('/about.html');
  await expect(page.locator('main')).toContainText('AUREL');
  await expect(page.locator('main')).toContainText('localStorage');

  // Liên hệ validate + lưu cục bộ + giữ sau reload
  await page.goto('/contact.html');
  await expect(page.getByTestId('contact-simulation-notice')).toContainText('chưa được gửi đến bất kỳ doanh nghiệp thật nào');
  await page.getByTestId('contact-submit-btn').click();
  await expect(page.locator('#err-name')).not.toBeEmpty();

  await page.getByLabel('Họ và tên *').fill('Người Kiểm Thử');
  await page.getByLabel('Email *').fill('tester@example.com');
  await page.getByLabel('Số điện thoại (tùy chọn)').fill('0906666666');
  await page.getByLabel('Chủ đề *').selectOption('Phản hồi kiểm thử / đồ án');
  await page.getByLabel('Nội dung yêu cầu *').fill('Kiểm tra lưu yêu cầu liên hệ mô phỏng cục bộ.');
  await page.getByTestId('contact-submit-btn').click();
  await expect(page.getByTestId('contact-success-notice')).toContainText('chưa được gửi đến doanh nghiệp thật');
  await page.reload();
  await expect(page.getByTestId('saved-contact-messages')).toContainText('Người Kiểm Thử');
});

test('CUS-E2E-07 Responsive 390px, 768px, 1440px không tràn ngang trên mọi trang khách mới', async ({ page }) => {
  await blockExternal(page);
  const pages = [
    '/home.html',
    '/product.html?id=p1',
    '/cart.html',
    '/checkout.html',
    '/order-success.html',
    '/login.html',
    '/register.html',
    '/account.html',
    '/orders.html',
    '/order-detail.html?id=none',
    '/wishlist.html',
    '/about.html',
    '/contact.html'
  ];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const url of pages) {
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(fits, `${url} bị tràn ngang ở ${width}px`).toBe(true);
    }
  }
});

test('CUS-E2E-08 Dữ liệu cửa hàng bị hỏng: giỏ, đặt hàng, đơn hàng báo lỗi rõ và không xóa dữ liệu', async ({ page }) => {
  await blockExternal(page);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/about.html');
  await page.evaluate(() => localStorage.setItem('chrono-watch-v1', '{bad json'));
  for (const url of ['/cart.html', '/checkout.html', '/orders.html']) {
    await page.goto(url);
    await expect(page.getByTestId('store-data-error'), `${url} phải báo lỗi dữ liệu`).toBeVisible();
  }
  expect(errors, 'không có lỗi JavaScript chưa bắt').toEqual([]);
  // Không tự ghi đè dữ liệu hỏng
  expect(await page.evaluate(() => localStorage.getItem('chrono-watch-v1'))).toBe('{bad json');
});

test('CUS-E2E-09 Khách vãng lai trùng SĐT+email với khách của quản lý không ghi đè hồ sơ khách đó', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/product.html?id=p2');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/checkout.html');
  await page.getByLabel('Họ và tên *').fill('Người Giao Khác');
  await page.getByLabel('Số điện thoại *').fill('0900000001');
  await page.getByLabel('Email *').fill('an@example.com');
  await page.getByLabel('Địa chỉ nhận hàng *').fill('77 Đường Giao Khác, Cần Thơ');
  await page.getByTestId('place-order-btn').click();
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  await expect(page.getByTestId('success-customer-name')).toHaveText('Người Giao Khác');
  const db = await stored(page);
  const c1 = db.customers.find(c => c.id === 'c1');
  expect(c1.name).toBe('Khách hàng mẫu An');
  expect(c1.address).toContain('Địa chỉ giả lập 01');
  expect(db.orders[0].customerId).toBe('c1');
  expect(db.orders[0].shipping.address).toBe('77 Đường Giao Khác, Cần Thơ');
});

test('CUS-E2E-10 Nhấn đặt hàng nhiều lần liên tiếp chỉ tạo một đơn và không trừ kho khi còn là nháp', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/product.html?id=p6');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/checkout.html');
  await page.getByLabel('Họ và tên *').fill('Nhấn Nhiều Lần');
  await page.getByLabel('Số điện thoại *').fill('0907777777');
  await page.getByLabel('Email *').fill('nhieu@example.com');
  await page.getByLabel('Địa chỉ nhận hàng *').fill('1 Đường Thử Nhiều Lần, Hà Nội');
  await page.evaluate(() => { const b = document.getElementById('place-order-btn'); b.click(); b.click(); b.form.requestSubmit(); });
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  const db = await stored(page);
  expect(db.orders).toHaveLength(1);
  expect(db.products.find(p => p.id === 'p6').stock).toBe(20);
});

test('CUS-E2E-11 Nội dung người dùng chứa HTML không được thực thi ở trang khách và trang quản lý', async ({ page }) => {
  await blockExternal(page);
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  await page.goto('/product.html?id=p6');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/checkout.html');
  await page.getByLabel('Họ và tên *').fill('<img src=x onerror=alert("n")>');
  await page.getByLabel('Số điện thoại *').fill('0909999999');
  await page.getByLabel('Email *').fill('xss@example.com');
  await page.getByLabel('Địa chỉ nhận hàng *').fill('<img src=x onerror=alert("a")>');
  await page.getByLabel('Ghi chú đơn hàng (tùy chọn)').fill('<img src=x onerror=alert("g")>');
  await page.getByTestId('place-order-btn').click();
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  await expect(page.getByTestId('success-customer-name')).toContainText('<img');
  await page.goto('/index.html');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('admin');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).click();
  await page.getByRole('button', { name: 'Chi tiết', exact: true }).first().click();
  await expect(page.locator('#modal')).toContainText('<img');
  expect(dialogs).toEqual([]);
});

test('CUS-E2E-12 Trang đơn có dữ liệu thật (thành công, lịch sử, chi tiết, giỏ nhiều dòng) không tràn ngang ở 390/768/1440px', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/product.html?id=p1');
  await page.getByTestId('qty-input').fill('2');
  await page.getByTestId('add-to-cart-btn').click();
  await page.goto('/product.html?id=p6');
  await page.getByTestId('add-to-cart-btn').click();
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const url of ['/cart.html', '/checkout.html']) {
      await page.goto(url);
      expect(await fits(), `${url} tràn ngang ở ${width}px`).toBe(true);
    }
  }
  await page.getByLabel('Họ và tên *').fill('Khách Responsive');
  await page.getByLabel('Số điện thoại *').fill('0902222222');
  await page.getByLabel('Email *').fill('resp@example.com');
  await page.getByLabel('Địa chỉ nhận hàng *').fill('10 Đường Responsive, TP. Hồ Chí Minh');
  await page.getByTestId('place-order-btn').click();
  await expect(page).toHaveURL(/order-success\.html\?id=/);
  const orderId = new URL(page.url()).searchParams.get('id');
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const url of [`/order-success.html?id=${orderId}`, '/orders.html', `/order-detail.html?id=${orderId}`]) {
      await page.goto(url);
      expect(await fits(), `${url.split('?')[0]} tràn ngang ở ${width}px`).toBe(true);
    }
  }
});
