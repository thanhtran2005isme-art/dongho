/* Thực thi 24 ca khách hàng (docs/TEST-CASES-CUSTOMER.csv) trên Chrome thật theo đúng các bước của ca.
 * Người thực thi: Claude (AI) điều khiển trình duyệt — KHÔNG phải thao tác tay của sinh viên.
 * Mỗi lần chạy được CỘNG DỒN vào history.json và sinh lại LICH-SU-KIEM-THU.md.
 * Chạy: node docs/evidence/manual-claude-2026-11-26/run-manual-cases.cjs   (từ thư mục dự án) */
const { chromium } = require('../../../node_modules/@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const PORT = 5531;
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = path.join(OUT, 'anh');
fs.mkdirSync(SHOTS, { recursive: true });

/* ---- đọc 24 ca từ CSV ---- */
function parseCsv(s) {
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
const csv = parseCsv(fs.readFileSync(path.join(ROOT, 'docs/TEST-CASES-CUSTOMER.csv'), 'utf8')).slice(1).filter(r => r[0]);
const CASES = Object.fromEntries(csv.map(r => [r[0], { id: r[0], func: r[2], goal: r[3], expected: r[7], priority: r[8], type: r[9] }]));

/* ---- tiện ích ---- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
class Check extends Error {}
function ok(cond, passMsg, failMsg, obs) {
  if (cond) { obs.push('✔ ' + passMsg); return; }
  obs.push('✘ ' + (failMsg || passMsg));
  throw new Check(failMsg || passMsg);
}
const store = page => page.evaluate(() => JSON.parse(localStorage.getItem('chrono-watch-v1')));
const text = async (page, sel = 'main') => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim();

async function addToCart(page, id, qty = 1) {
  await page.goto(`${BASE}/product.html?id=${id}`);
  await page.getByTestId('qty-input').fill(String(qty));
  await page.getByTestId('add-to-cart-btn').click();
  await page.getByTestId('product-feedback').waitFor();
}
async function fillCheckout(page, v) {
  await page.getByLabel('Họ và tên *').fill(v.name);
  await page.getByLabel('Số điện thoại *').fill(v.phone);
  await page.getByLabel('Email *').fill(v.email);
  await page.getByLabel('Địa chỉ nhận hàng *').fill(v.address);
  if (v.note) await page.getByLabel('Ghi chú đơn hàng (tùy chọn)').fill(v.note);
}
async function register(page, v) {
  await page.goto(`${BASE}/register.html`);
  await page.getByLabel('Họ và tên *', { exact: true }).fill(v.name);
  await page.getByLabel('Email *', { exact: true }).fill(v.email);
  await page.getByLabel('Số điện thoại *', { exact: true }).fill(v.phone);
  await page.getByLabel('Mật khẩu *', { exact: true }).fill(v.password);
  await page.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill(v.confirm ?? v.password);
  await page.getByTestId('register-submit-btn').click();
}
async function placeOrder(page, ctxVals) {
  await page.goto(`${BASE}/checkout.html`);
  await fillCheckout(page, ctxVals);
  await page.getByTestId('place-order-btn').click();
  await page.waitForURL(/order-success\.html\?id=/);
  return new URL(page.url()).searchParams.get('id');
}
async function adminLogin(page) {
  await page.goto(`${BASE}/index.html`);
  const loginField = page.getByLabel('Tên đăng nhập', { exact: true });
  await Promise.race([loginField.waitFor(), page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).waitFor()]).catch(() => {});
  if (await loginField.isVisible().catch(() => false)) {
    await loginField.fill('admin');
    await page.getByLabel('Mật khẩu', { exact: true }).fill('Admin@123');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  }
  await page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).waitFor();
}
const adminTab = (page, name) => page.locator('nav').getByRole('button', { name, exact: true }).click();
const stockOf = async (page, pid) => (await store(page)).products.find(p => p.id === pid).stock;

/* ---- các ca ---- */
const impl = {};

impl['CUS-001'] = async (p, o) => {
  await p.goto(`${BASE}/home.html`);
  const admin = await p.getByTestId('admin-portal-link').getAttribute('href');
  const acc = await p.getByTestId('header-account-link').getAttribute('href');
  ok(admin === 'index.html', `Liên kết "Quản lý cửa hàng" trỏ tới ${admin}`, `Liên kết quản lý trỏ tới ${admin}`, o);
  ok(acc === 'login.html', `Nút tài khoản khách (chưa đăng nhập) trỏ tới ${acc}`, `Nút tài khoản trỏ tới ${acc}`, o);
  await p.getByTestId('header-account-link').click();
  ok(/login\.html$/.test(p.url()), 'Bấm tài khoản khách mở login.html', `Mở ${p.url()}`, o);
  await p.goBack(); await p.getByTestId('admin-portal-link').click();
  ok(/index\.html$/.test(p.url()), 'Bấm Quản lý cửa hàng mở index.html', `Mở ${p.url()}`, o);
};

impl['CUS-002'] = async (p, o) => {
  await p.goto(`${BASE}/home.html`);
  await p.getByTestId('product-detail-link-p1').click();
  ok(/product\.html\?id=p1$/.test(p.url()), 'Mở đúng product.html?id=p1', `Mở ${p.url()}`, o);
  await p.getByTestId('qty-input').fill('2'); await p.getByTestId('add-to-cart-btn').click();
  ok((await p.getByTestId('header-cart-count').innerText()) === '2', 'Badge giỏ hiển thị 2 sau khi thêm 2 chiếc', 'Badge giỏ không phải 2', o);
  await p.goto(`${BASE}/home.html`);
  ok((await p.getByTestId('header-cart-count').innerText()) === '2', 'Quay lại home.html badge vẫn là 2', 'Badge mất sau khi quay lại', o);
  await p.reload();
  ok((await p.getByTestId('header-cart-count').innerText()) === '2', 'Tải lại trang badge vẫn là 2', 'Badge mất sau reload', o);
};

impl['CUS-003'] = async (p, o) => {
  await p.goto(`${BASE}/product.html?id=p1`);
  const stock = (await text(p, '[data-testid="product-stock"]'));
  o.push(`Tồn kho hiển thị: ${stock}`);
  for (const [v, expect] of [['0', 'không hợp lệ'], ['99', 'Không đủ tồn kho']]) {
    await p.getByTestId('qty-input').fill(v); await p.getByTestId('add-to-cart-btn').click();
    const fb = await text(p, '[data-testid="product-feedback"]');
    ok(fb.includes(expect), `Số lượng ${v} bị chặn: "${fb}"`, `Số lượng ${v} không báo lỗi như mong đợi: "${fb}"`, o);
  }
  ok((await p.getByTestId('header-cart-count').innerText()) === '0', 'Giỏ vẫn 0 sau hai lần nhập sai', 'Giỏ bị thêm dữ liệu sai', o);
};

impl['CUS-004'] = async (p, o) => {
  await p.goto(`${BASE}/product.html?id=p7`);
  ok(await p.getByTestId('product-inactive-notice').isVisible(), 'p7 hiển thị cảnh báo Ngừng kinh doanh', 'p7 không có cảnh báo', o);
  ok(await p.getByTestId('add-to-cart-btn').isDisabled(), 'Nút Thêm vào giỏ của p7 bị vô hiệu hóa', 'Nút vẫn bấm được', o);
  await p.goto(`${BASE}/product.html?id=missing`);
  ok(await p.getByTestId('product-not-found').isVisible(), 'ID "missing" hiển thị trạng thái Không tìm thấy sản phẩm', 'Không có trạng thái không tìm thấy', o);
};

impl['CUS-005'] = async (p, o) => {
  await p.route('https://images.example.test/**', r => r.abort());
  await p.goto(`${BASE}/about.html`);
  await p.evaluate(() => { const db = WatchStore.seed(); db.products[0].image = 'https://images.example.test/404.png'; localStorage.setItem(WatchStore.KEY, JSON.stringify(db)); });
  await p.goto(`${BASE}/product.html?id=p1`);
  await p.waitForFunction(() => /aurel-steel\.png$/.test(document.getElementById('detail-img').getAttribute('src')), null, { timeout: 5000 }).catch(() => {});
  const src = await p.locator('#detail-img').getAttribute('src');
  ok(src === 'assets/images/aurel-steel.png', `Ảnh lỗi tự chuyển sang ${src}`, `Ảnh vẫn là ${src}`, o);
  const w = await p.locator('#detail-img').evaluate(i => i.naturalWidth);
  ok(w > 0, `Ảnh thay thế tải được (naturalWidth=${w}), khung không vỡ`, 'Ảnh thay thế không tải được', o);
};

impl['CUS-006'] = async (p, o) => {
  await addToCart(p, 'p1', 2); await addToCart(p, 'p6', 1);
  await p.goto(`${BASE}/cart.html`);
  o.push('Giỏ ban đầu: ' + await text(p, '[data-testid="cart-subtotal"]'));
  await p.getByTestId('remove-item-p6').click();
  ok(await p.getByTestId('cart-item-p6').count() === 0, 'Đã xóa dòng p6', 'p6 vẫn còn', o);
  await p.locator('[data-qty-dec="p1"]').click();
  const sub = await text(p, '[data-testid="cart-subtotal"]');
  ok(sub.includes('12.500.000'), `Giảm p1 xuống 1: tạm tính ${sub}`, `Tạm tính sai: ${sub}`, o);
  await p.reload();
  const sub2 = await text(p, '[data-testid="cart-subtotal"]');
  ok(sub2.includes('12.500.000') && await p.getByTestId('cart-item-p6').count() === 0, `Sau tải lại giỏ giữ nguyên (${sub2})`, `Sau tải lại giỏ sai: ${sub2}`, o);
};

impl['CUS-007'] = async (p, o) => {
  await addToCart(p, 'p1', 1);
  await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('chrono-cart-v1')); c.items[0].price = 100; localStorage.setItem('chrono-cart-v1', JSON.stringify(c)); });
  await p.goto(`${BASE}/cart.html`);
  const unit = await text(p, '[data-testid="line-unit-price-p1"]'); const sub = await text(p, '[data-testid="cart-subtotal"]');
  ok(unit.includes('12.500.000') && sub.includes('12.500.000'), `Đã sửa price=100 nhưng đơn giá hiển thị ${unit}, tạm tính ${sub}`, `Giá giả mạo ảnh hưởng: ${unit} / ${sub}`, o);
};

impl['CUS-008'] = async (p, o) => {
  await addToCart(p, 'p1', 1);
  await p.evaluate(() => { const db = JSON.parse(localStorage.getItem('chrono-watch-v1')) || WatchStore.seed(); db.products[0].price = 13000000; localStorage.setItem('chrono-watch-v1', JSON.stringify(db)); });
  await p.goto(`${BASE}/cart.html`);
  ok(await p.getByTestId('cart-price-change-notice').isVisible(), 'Đổi giá → hiển thị thông báo giá đã cập nhật', 'Không có thông báo đổi giá', o);
  ok((await text(p, '[data-testid="cart-subtotal"]')).includes('13.000.000'), 'Tạm tính theo giá mới 13.000.000', 'Tạm tính không theo giá mới', o);
  await p.evaluate(() => { const db = JSON.parse(localStorage.getItem('chrono-watch-v1')) || WatchStore.seed(); db.products[0].stock = 0; localStorage.setItem('chrono-watch-v1', JSON.stringify(db)); });
  await p.reload();
  ok(await p.getByTestId('cart-blocking-notice').isVisible(), 'stock=0 → hiển thị lỗi cần xử lý', 'Không báo lỗi khi hết hàng', o);
  ok(await p.getByTestId('proceed-checkout-btn').isDisabled(), 'Nút Tiến hành đặt hàng bị vô hiệu hóa', 'Nút đặt hàng vẫn bấm được', o);
};

impl['CUS-009'] = async (p, o) => {
  await addToCart(p, 'p1', 1);
  await p.goto(`${BASE}/checkout.html`);
  await fillCheckout(p, { name: '', phone: '123', email: 'sai', address: 'ab' });
  await p.getByTestId('place-order-btn').click();
  for (const f of ['name', 'phone', 'email', 'address']) {
    const t = (await p.locator(`#err-${f}`).innerText()).trim();
    ok(t.length > 0, `Lỗi tại trường ${f}: "${t}"`, `Trường ${f} không có thông báo lỗi`, o);
  }
  const focused = await p.evaluate(() => document.activeElement && document.activeElement.id);
  ok(focused === 'co-name', `Focus vào trường lỗi đầu tiên (${focused})`, `Focus ở ${focused}, mong đợi co-name`, o);
  ok((await store(p).catch(() => null))?.orders?.length ? false : true, 'Không tạo đơn', 'Đã tạo đơn khi dữ liệu sai', o);
};

impl['CUS-010'] = async (p, o) => {
  await addToCart(p, 'p1', 1);
  await p.goto(`${BASE}/checkout.html`);
  await fillCheckout(p, { name: 'Khách Đổi Giá', phone: '0901010101', email: 'gia@example.com', address: '10 Đường Giá, Hà Nội' });
  await p.evaluate(() => { const db = JSON.parse(localStorage.getItem('chrono-watch-v1')) || WatchStore.seed(); db.products[0].price = 14000000; localStorage.setItem('chrono-watch-v1', JSON.stringify(db)); });
  await p.getByTestId('place-order-btn').click();
  await p.getByTestId('checkout-alert').waitFor();
  const alert = await text(p, '[data-testid="checkout-alert"]');
  ok(alert.includes('đã thay đổi'), `Hiển thị cảnh báo: "${alert}"`, `Cảnh báo không đúng: "${alert}"`, o);
  const db = await store(p);
  ok(!db.orders || db.orders.length === 0, 'Chưa tạo đơn theo giá cũ', 'Đã tạo đơn theo giá cũ', o);
  ok((await text(p, '[data-testid="checkout-total"]')).includes('14.000.000'), 'Tóm tắt cập nhật theo giá mới 14.000.000', 'Tóm tắt không cập nhật', o);
  await p.getByTestId('place-order-btn').click(); await p.waitForURL(/order-success/);
  ok((await store(p)).orders[0].total === 14000000, 'Xác nhận lại → đơn tạo theo giá mới 14.000.000', 'Đơn không theo giá mới', o);
};

impl['CUS-011'] = async (p, o) => {
  await addToCart(p, 'p1', 2);
  await p.goto(`${BASE}/checkout.html`);
  await fillCheckout(p, { name: 'Khách Gửi Lặp', phone: '0902020202', email: 'lap@example.com', address: '20 Đường Lặp, Đà Nẵng' });
  await p.evaluate(() => { const b = document.getElementById('place-order-btn'); b.click(); b.click(); b.form.requestSubmit(); });
  await p.waitForURL(/order-success/);
  for (let i = 0; i < 3; i++) await p.reload();
  const db = await store(p);
  ok(db.orders.length === 1, `Nhấn 3 lần + tải lại 3 lần → ${db.orders.length} đơn`, `Có ${db.orders.length} đơn`, o);
  ok(db.orders[0].status === 'draft' && db.products[0].stock === 8, 'Đơn là Nháp, tồn p1 vẫn 8', 'Tồn kho bị thay đổi', o);
};

impl['CUS-012'] = async (p, o) => {
  await p.goto(`${BASE}/order-success.html`);
  ok(await p.getByTestId('order-success-invalid').isVisible(), `Không có ?id: "${(await text(p, '[data-testid="order-success-invalid"] h1, [data-testid="order-success-invalid"] h2'))}"`, 'Không có trạng thái không hợp lệ', o);
  await p.goto(`${BASE}/order-success.html?id=fake`);
  ok(await p.getByTestId('order-success-invalid').isVisible(), `?id=fake: "${(await text(p, '[data-testid="order-success-invalid"] h1, [data-testid="order-success-invalid"] h2'))}"`, 'id giả không bị từ chối', o);
  ok(!(await text(p)).includes('thành công!') && await p.getByTestId('order-success-card').count() === 0, 'Không hiển thị thông báo đặt hàng thành công', 'Hiển thị thành công với id giả', o);
};

impl['CUS-013'] = async (p, o) => {
  await register(p, { name: 'Khách Một', email: 'mot@example.com', phone: '0911111111', password: 'MatKhau@12', confirm: 'Lech@1234' });
  ok((await p.locator('#err-confirm').innerText()).includes('không khớp'), 'Mật khẩu xác nhận lệch → báo "không khớp"', 'Không báo lỗi mật khẩu lệch', o);
  await p.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('MatKhau@12'); await p.getByTestId('register-submit-btn').click();
  await p.waitForURL(/account\.html$/);
  ok(true, 'Đăng ký hợp lệ chuyển sang account.html', '', o);
  await p.getByTestId('logout-btn').click();
  await register(p, { name: 'Khách Trùng', email: 'MOT@Example.com', phone: '0911111112', password: 'Khac@12345' });
  const t = await p.locator('#err-email').innerText();
  ok(t.includes('đã được đăng ký'), `Email trùng (khác hoa/thường) bị chặn: "${t}"`, `Email trùng không bị chặn: "${t}"`, o);
};

impl['CUS-014'] = async (p, o) => {
  await p.goto(`${BASE}/login.html`);
  ok((await text(p)).includes('không phải bảo mật production'), 'Trang đăng nhập ghi rõ xác thực mô phỏng local', 'Thiếu ghi chú mô phỏng', o);
  await p.getByLabel('Email *', { exact: true }).fill('admin'); await p.getByLabel('Mật khẩu *', { exact: true }).fill('Admin@123');
  await p.getByTestId('login-submit-btn').click();
  const t = await p.locator('#err-email').innerText();
  ok(t.includes('Quản lý cửa hàng') && /login\.html/.test(p.url()), `Từ chối admin: "${t}"`, `Không từ chối đúng: "${t}"`, o);
};

impl['CUS-015'] = async (p, o) => {
  await register(p, { name: 'Khách Hồ Sơ', email: 'hoso@example.com', phone: '0913131313', password: 'HoSo@12345' });
  await p.waitForURL(/account\.html$/);
  await p.getByLabel('Họ và tên *', { exact: true }).fill('Lê Hồ Sơ Mới');
  await p.getByLabel('Địa chỉ nhận hàng mặc định', { exact: true }).fill('99 Đường Mới, Quận 1');
  await p.getByTestId('profile-save-btn').click();
  ok((await text(p, '[data-testid="profile-feedback"]')).includes('Đã cập nhật'), 'Hiển thị thông báo lưu thành công', 'Không có thông báo lưu', o);
  await p.reload();
  const name = await p.getByLabel('Họ và tên *', { exact: true }).inputValue(); const addr = await p.getByLabel('Địa chỉ nhận hàng mặc định', { exact: true }).inputValue();
  ok(name === 'Lê Hồ Sơ Mới' && addr === '99 Đường Mới, Quận 1', `Sau tải lại: "${name}" / "${addr}"`, `Dữ liệu sau tải lại sai: "${name}" / "${addr}"`, o);
};

/* Chuỗi 016 → 017 → 018 dùng chung một phiên (cùng một đơn DH0001). */
const chain = {};
impl['CUS-016'] = async (p, o) => {
  await register(p, { name: 'Nguyễn Thảo Vy', email: 'vy@example.com', phone: '0903333333', password: 'ThaoVy@1234' });
  await p.waitForURL(/account\.html$/);
  await addToCart(p, 'p1', 2);
  chain.orderId = await placeOrder(p, { name: 'Nguyễn Thảo Vy', phone: '0903333333', email: 'vy@example.com', address: '22 Đường Mẫu, TP. Hồ Chí Minh', note: 'Gọi trước khi giao' });
  ok((await text(p, '[data-testid="success-order-code"]')).includes('DH0001'), 'Khách đặt xong, mã đơn DH0001', 'Mã đơn không phải DH0001', o);
  await adminLogin(p); await adminTab(p, 'Đơn hàng');
  const row = await text(p, 'tbody');
  ok(row.includes('DH0001') && row.includes('Nháp'), 'Quản lý thấy DH0001 trạng thái Nháp', `Hàng đơn: ${row}`, o);
  await p.getByRole('button', { name: 'Chi tiết', exact: true }).click();
  ok((await text(p, '#modal')).includes('Website khách'), 'Chi tiết đơn ghi nguồn "Website khách"', 'Không thấy nguồn Website khách', o);
  await p.keyboard.press('Escape');
  ok(await stockOf(p, 'p1') === 8, 'Tồn p1 vẫn là 8 (đơn nháp chưa trừ kho)', 'Tồn p1 đã thay đổi', o);
};

impl['CUS-017'] = async (p, o) => {
  await adminLogin(p); await adminTab(p, 'Đơn hàng');
  await p.getByRole('button', { name: 'Chi tiết', exact: true }).click();
  await p.getByRole('button', { name: 'Xác nhận bán', exact: true }).click();
  await p.locator('#modal').waitFor({ state: 'hidden' });
  ok(await stockOf(p, 'p1') === 6, 'Admin xác nhận → tồn p1 giảm từ 8 còn 6', `Tồn p1 = ${await stockOf(p, 'p1')}`, o);
  await adminTab(p, 'Sản phẩm');
  await p.getByRole('row').filter({ hasText: 'SE001' }).getByRole('button', { name: 'Chỉnh sửa' }).click();
  await p.getByLabel('Giá bán (VND) *', { exact: true }).fill('15000000');
  await p.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await p.locator('#modal').waitFor({ state: 'hidden' });
  await p.goto(`${BASE}/order-detail.html?id=${chain.orderId}`);
  ok((await text(p, '[data-testid="detail-order-status"]')).includes('Đã xác nhận'), 'Khách thấy trạng thái Đã xác nhận', 'Khách không thấy Đã xác nhận', o);
  const price = await text(p, '[data-testid="detail-item-price-p1"]');
  ok(price.includes('12.500.000'), `Giá lịch sử vẫn ${price} dù admin đổi giá lên 15.000.000`, `Giá lịch sử bị đổi: ${price}`, o);
};

impl['CUS-018'] = async (p, o) => {
  await adminLogin(p); await adminTab(p, 'Đơn hàng');
  await p.getByRole('button', { name: 'Chi tiết', exact: true }).click();
  p.once('dialog', d => d.accept());
  await p.getByRole('button', { name: 'Hủy đơn', exact: true }).click();
  await p.locator('#modal').waitFor({ state: 'hidden' });
  ok(await stockOf(p, 'p1') === 8, 'Hủy đơn đã xác nhận → tồn p1 hoàn về 8 (đúng một lần)', `Tồn p1 = ${await stockOf(p, 'p1')}`, o);
  await p.goto(`${BASE}/order-detail.html?id=${chain.orderId}`);
  ok((await text(p, '[data-testid="detail-order-status"]')).includes('Đã hủy'), 'Khách tải lại thấy trạng thái Đã hủy', 'Khách không thấy Đã hủy', o);
  await p.reload();
  ok(await stockOf(p, 'p1') === 8, 'Tải lại, tồn p1 vẫn 8 (không hoàn thêm)', 'Tồn đổi sau reload', o);
};

impl['CUS-019'] = async (p, o) => {
  await register(p, { name: 'Khách A Riêng Tư', email: 'a@example.com', phone: '0914141414', password: 'KhachA@1234' });
  await p.waitForURL(/account\.html$/);
  await addToCart(p, 'p6', 1);
  const idA = await placeOrder(p, { name: 'Khách A Riêng Tư', phone: '0914141414', email: 'a@example.com', address: '1 Đường A, Hà Nội' });
  await p.goto(`${BASE}/account.html`); await p.getByTestId('logout-btn').click();
  await register(p, { name: 'Khách B', email: 'b@example.com', phone: '0915151515', password: 'KhachB@1234' });
  await p.waitForURL(/account\.html$/);
  await p.goto(`${BASE}/orders.html`);
  ok(await p.getByTestId('orders-empty').isVisible(), 'Khách B: orders.html chỉ hiện trạng thái rỗng', 'Khách B thấy đơn không phải của mình', o);
  await p.goto(`${BASE}/order-detail.html?id=${idA}`);
  ok(await p.getByTestId('order-detail-denied').isVisible(), 'Sửa URL sang đơn của A → bị từ chối hiển thị', 'Khách B xem được đơn của A', o);
  ok(!(await text(p)).includes('Khách A Riêng Tư'), 'Không lộ tên Khách A trên trang', 'Lộ thông tin Khách A', o);
};

impl['CUS-020'] = async (p, o, ctx) => {
  await addToCart(p, 'p2', 1);
  const id = await placeOrder(p, { name: 'Khách Vãng Lai', phone: '0905555555', email: 'vanglai@example.com', address: '99 Đường Giả Lập, Đà Nẵng' });
  const t2 = await ctx.newPage(); // cùng localStorage, sessionStorage mới = phiên mới
  await t2.goto(`${BASE}/orders.html`);
  ok(await t2.getByTestId('guest-no-session-orders').isVisible(), 'Tab mới: không liệt kê đơn sẵn', 'Tab mới liệt kê đơn', o);
  await t2.getByLabel('Mã đơn hàng *').fill('DH0001'); await t2.getByLabel('Số điện thoại hoặc Email đặt hàng *').fill('0900000000');
  await t2.getByTestId('guest-lookup-btn').click();
  const err = await text(t2, '[data-testid="guest-lookup-error"]');
  ok(err.includes('Không tìm thấy'), `SĐT sai: "${err}"`, `SĐT sai không bị chặn: "${err}"`, o);
  await t2.getByLabel('Số điện thoại hoặc Email đặt hàng *').fill('0905555555'); await t2.getByTestId('guest-lookup-btn').click();
  await t2.waitForURL(/order-detail\.html\?id=/);
  ok(new URL(t2.url()).searchParams.get('id') === id && (await text(t2, '[data-testid="detail-customer-name"]')) === 'Khách Vãng Lai', 'SĐT đúng → mở đúng chi tiết DH0001', 'Tra cứu đúng nhưng không mở đúng đơn', o);
  await t2.screenshot({ path: path.join(SHOTS, 'CUS-020.png'), fullPage: true }); o.shotTaken = true;
};

impl['CUS-021'] = async (p, o) => {
  await p.goto(`${BASE}/product.html?id=p3`); await p.getByTestId('wishlist-toggle-btn').click();
  await p.goto(`${BASE}/wishlist.html`); await p.reload();
  ok(await p.getByTestId('wishlist-item-p3').isVisible(), 'Yêu thích p3 vẫn còn sau tải lại', 'p3 mất sau tải lại', o);
  await p.getByTestId('wish-add-cart-p3').click();
  ok((await p.getByTestId('header-cart-count').innerText()) === '1', 'Thêm giỏ từ trang yêu thích: badge = 1', 'Không thêm được vào giỏ', o);
  await p.getByTestId('wish-remove-p3').click();
  ok(await p.getByTestId('wishlist-empty').isVisible(), 'Bỏ thích → hiển thị trạng thái rỗng', 'Không hiện trạng thái rỗng', o);
};

impl['CUS-022'] = async (p, o) => {
  await p.goto(`${BASE}/contact.html`);
  await p.getByTestId('contact-submit-btn').click();
  ok((await p.locator('#err-name').innerText()).trim().length > 0, 'Gửi khi rỗng → báo lỗi tại trường', 'Không báo lỗi khi rỗng', o);
  await p.getByLabel('Họ và tên *').fill('Người Kiểm Thử'); await p.getByLabel('Email *').fill('tester@example.com');
  await p.getByLabel('Số điện thoại (tùy chọn)').fill('0906666666'); await p.getByLabel('Chủ đề *').selectOption('Phản hồi kiểm thử / đồ án');
  await p.getByLabel('Nội dung yêu cầu *').fill('Kiểm tra lưu yêu cầu liên hệ mô phỏng cục bộ.');
  await p.getByTestId('contact-submit-btn').click();
  ok((await text(p, '[data-testid="contact-success-notice"]')).includes('chưa được gửi đến doanh nghiệp thật'), 'Thông báo nêu rõ chưa gửi đến doanh nghiệp thật', 'Thiếu thông báo mô phỏng', o);
  await p.reload();
  ok((await text(p, '[data-testid="saved-contact-messages"]')).includes('Người Kiểm Thử'), 'Sau tải lại vẫn thấy yêu cầu đã lưu', 'Yêu cầu mất sau tải lại', o);
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem('chrono-contact-messages-v1')).messages.length);
  ok(n === 1, `chrono-contact-messages-v1 có ${n} bản ghi`, `Có ${n} bản ghi`, o);
};

impl['CUS-023'] = async (p, o) => {
  await addToCart(p, 'p1', 1);
  const id = await placeOrder(p, { name: 'Khách Responsive', phone: '0902222222', email: 'resp@example.com', address: '10 Đường Responsive, TP. Hồ Chí Minh' });
  await addToCart(p, 'p6', 1);
  const pages = ['home.html', 'product.html?id=p1', 'cart.html', 'checkout.html', `order-success.html?id=${id}`, 'login.html', 'register.html', 'account.html', 'orders.html', `order-detail.html?id=${id}`, 'wishlist.html', 'about.html', 'contact.html'];
  const bad = [];
  for (const w of [390, 768, 1440]) {
    await p.setViewportSize({ width: w, height: 900 });
    for (const u of pages) {
      await p.goto(`${BASE}/${u}`); await p.evaluate(() => document.fonts.ready);
      const r = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      if (r[0] > r[1]) bad.push(`${u}@${w}px scrollWidth=${r[0]}`);
    }
  }
  ok(bad.length === 0, `13 trang × 3 độ rộng = 39 lần đo, không có trang nào tràn ngang`, `Tràn ngang: ${bad.join('; ')}`, o);
  await p.setViewportSize({ width: 390, height: 900 }); await p.goto(`${BASE}/cart.html`);
  const box = await p.getByTestId('proceed-checkout-btn').boundingBox();
  ok(box && box.x >= 0 && box.x + box.width <= 390, `Nút "Tiến hành đặt hàng" nằm trọn trong màn hình 390px (x=${Math.round(box.x)}, rộng ${Math.round(box.width)})`, 'Nút đặt hàng bị tràn/che ở 390px', o);
};

impl['CUS-024'] = async (p, o, ctx) => {
  const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  const payload = '<img src=x onerror=alert(1)>';
  await addToCart(p, 'p6', 1);
  const id = await placeOrder(p, { name: 'Khách XSS', phone: '0909999999', email: 'xss@example.com', address: '5 Đường Thử, Hà Nội', note: payload });
  await p.goto(`${BASE}/order-detail.html?id=${id}`);
  ok((await text(p)).includes('<img src=x'), 'Order-detail hiển thị payload như văn bản thuần', 'Payload không hiển thị dạng văn bản', o);
  ok(await p.locator('main img[src="x"]').count() === 0, 'Không có thẻ <img src="x"> được chèn vào order-detail', 'Thẻ img bị chèn', o);
  await p.goto(`${BASE}/contact.html`);
  await p.getByLabel('Họ và tên *').fill('Người Thử'); await p.getByLabel('Email *').fill('t@example.com');
  await p.getByLabel('Chủ đề *').selectOption({ index: 1 }); await p.getByLabel('Nội dung yêu cầu *').fill(payload + ' nội dung đủ dài');
  await p.getByTestId('contact-submit-btn').click(); await p.reload();
  ok(await p.locator('main img[src="x"]').count() === 0, 'Liên hệ: payload không chèn thẻ img sau khi lưu và tải lại', 'Liên hệ bị chèn img', o);
  await adminLogin(p); await adminTab(p, 'Đơn hàng');
  await p.getByRole('button', { name: 'Chi tiết', exact: true }).first().click();
  ok((await text(p, '#modal')).includes('<img src=x') && await p.locator('#modal img[src="x"]').count() === 0, 'Trang quản lý hiển thị payload dạng văn bản, không chèn img', 'Trang quản lý bị chèn img', o);
  ok(dialogs.length === 0, 'Không có hộp thoại alert nào được kích hoạt', `Có alert: ${dialogs.join(',')}`, o);
};

/* ---- chạy ---- */
const ORDER = Object.keys(impl);
const SHARED = new Set(['CUS-016', 'CUS-017', 'CUS-018']); // chung một phiên trình duyệt

(async () => {
  const server = spawn(process.execPath, [path.join(ROOT, 'scripts/test-server.cjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  for (let i = 0; i < 30; i++) { try { const r = await fetch(`${BASE}/home.html`); if (r.ok) break; } catch { /* chờ */ } await sleep(200); }
  const channel = fs.existsSync(path.join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe')) ? 'chrome' : undefined;
  const browser = await chromium.launch({ channel });
  const started = new Date();
  const results = [];
  let sharedCtx = null, sharedPage = null;

  for (const id of ORDER) {
    const meta = CASES[id];
    if (!meta) { console.log('Thiếu ca trong CSV:', id); continue; }
    let ctx, page;
    if (SHARED.has(id)) {
      if (!sharedCtx) { sharedCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' }); sharedPage = await sharedCtx.newPage(); }
      ctx = sharedCtx; page = sharedPage;
    } else {
      ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' }); page = await ctx.newPage();
    }
    const obs = [];
    let status = 'Pass', note = '';
    const t0 = Date.now();
    try { await impl[id](page, obs, ctx); }
    catch (e) { status = 'Fail'; note = e.message; if (!(e instanceof Check)) obs.push('✘ Lỗi thực thi: ' + e.message.split('\n')[0]); }
    const shotFile = `${id}.png`;
    if (!obs.shotTaken) { try { await page.screenshot({ path: path.join(SHOTS, shotFile), fullPage: true }); } catch { /* bỏ qua */ } }
    results.push({ id, func: meta.func, goal: meta.goal, expected: meta.expected, priority: meta.priority, type: meta.type, status, actual: obs.join(' | '), failure: note, evidence: `anh/${shotFile}`, ms: Date.now() - t0 });
    console.log(`${status === 'Pass' ? 'PASS' : 'FAIL'} ${id} ${meta.goal}${note ? '\n     -> ' + note : ''}`);
    if (!SHARED.has(id)) await ctx.close();
  }
  if (sharedCtx) await sharedCtx.close();

  const env = { browser: `Chrome ${browser.version()}`, os: `${process.platform} ${require('os').release()}`, node: process.version, url: BASE, source: 'aurel-watch-qa ' + require(path.join(ROOT, 'package.json')).version };
  await browser.close(); server.kill();

  /* ---- ghi lịch sử cộng dồn ---- */
  const histFile = path.join(OUT, 'history.json');
  const history = fs.existsSync(histFile) ? JSON.parse(fs.readFileSync(histFile, 'utf8')) : { runs: [] };
  const runId = `R${String(history.runs.length + 1).padStart(2, '0')}`;
  const run = { runId, startedAt: started.toISOString(), env, executor: 'Claude (AI) điều khiển Chrome tự động theo các bước của ca; không phải thao tác tay của sinh viên', results };
  history.runs.push(run);
  fs.writeFileSync(histFile, JSON.stringify(history, null, 2));

  const pass = results.filter(r => r.status === 'Pass').length, fail = results.length - pass;
  const fmt = iso => new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium' });
  const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  let md = `# Lịch sử thực thi ca kiểm thử khách hàng (CUS-001…024)\n\n`;
  md += `**Người thực thi:** Claude (AI) điều khiển Chrome tự động, thao tác theo đúng các bước trong [TEST-CASES-CUSTOMER.csv](../../TEST-CASES-CUSTOMER.csv). **Không phải thao tác tay của sinh viên** — sinh viên nên tự chạy lại các ca khi cần ghi vào sổ QA của mình (\`qa.html\`).\n\n`;
  md += `## Các lần chạy\n\n| Lần | Thời điểm | Pass | Fail | Trình duyệt | Máy |\n|---|---|---|---|---|---|\n`;
  for (const r of history.runs) { const p2 = r.results.filter(x => x.status === 'Pass').length; md += `| ${r.runId} | ${fmt(r.startedAt)} | ${p2} | ${r.results.length - p2} | ${r.env.browser} | ${r.env.os} |\n`; }
  const latest = history.runs[history.runs.length - 1];
  md += `\n## Chi tiết lần mới nhất (${latest.runId})\n\n| Ca | Chức năng | Mục tiêu | Trạng thái | Kết quả thực tế | Bằng chứng |\n|---|---|---|---|---|---|\n`;
  for (const r of latest.results) md += `| ${r.id} | ${esc(r.func)} | ${esc(r.goal)} | **${r.status}**${r.cause ? ' (' + r.cause + ')' : ''} | ${esc(r.actual)} | [ảnh](${r.evidence}) |\n`;
  md += `\n## Diễn biến theo từng ca qua các lần chạy\n\n| Ca | ${history.runs.map(r => r.runId).join(' | ')} |\n|---|${history.runs.map(() => '---').join('|')}|\n`;
  for (const id of ORDER) md += `| ${id} | ${history.runs.map(r => (() => { const x = r.results.find(x => x.id === id); return x ? (x.cause ? x.status + '*' : x.status) : '—'; })()).join(' | ')} |\n`;
  md += `\n\\* Fail do lỗi bộ chạy (script), không phải lỗi sản phẩm: ở R01, ba ca CUS-008/017/018 hỏng vì bộ chạy đọc dữ liệu cửa hàng khi chưa được ghi và đăng nhập admin lặp. Đã sửa bộ chạy rồi chạy lại.\n`;
  md += `\nBằng chứng: thư mục [anh](anh/) (ảnh chụp trang sau khi chạy ca), [history.json](history.json) (dữ liệu đầy đủ), bộ chạy [run-manual-cases.cjs](run-manual-cases.cjs).\n`;
  fs.writeFileSync(path.join(OUT, 'LICH-SU-KIEM-THU.md'), md);

  const csvEsc = s => `"${String(s).replace(/"/g, '""')}"`;
  let out = 'Run,Test Case ID,Chức năng,Mục tiêu,Kết quả mong đợi,Kết quả thực tế,Trạng thái,Nguyên nhân Fail,Bằng chứng,Người thực thi,Thời điểm\n';
  for (const r of history.runs) for (const x of r.results) out += [r.runId, x.id, x.func, x.goal, x.expected, x.actual, x.status, x.cause || '', x.evidence, 'Claude (AI) qua Chrome tự động', r.startedAt].map(csvEsc).join(',') + '\n';
  fs.writeFileSync(path.join(OUT, 'ket-qua-thuc-thi.csv'), '\uFEFF' + out);

  console.log(`\n${runId}: ${pass} Pass / ${fail} Fail trên ${results.length} ca`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
