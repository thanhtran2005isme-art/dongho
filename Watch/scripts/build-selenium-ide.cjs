/* Sinh testing/selenium-ide/aurel-ui.side (dự án Selenium IDE, không cần tài khoản) và kiểm tra các bước.
 *   node scripts/build-selenium-ide.cjs            tạo file .side
 *   node scripts/build-selenium-ide.cjs --verify   tạo file rồi chạy thử từng bước trong Chrome bằng Playwright
 * Phần --verify chỉ chứng minh các bước/selector/giá trị mong đợi đúng với website; không thay cho việc chạy trong Selenium IDE. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'http://127.0.0.1:5517';
const uid = () => crypto.randomUUID();

const q = id => `css=[data-testid="${id}"]`;
/* Xóa riêng các khóa giỏ/phiên khách/yêu thích để mỗi test độc lập; KHÔNG xóa dữ liệu cửa hàng, sổ QA hay tài khoản. */
const RESET = "['chrono-cart-v1','chrono-customer-session-v1','chrono-wishlist-v1','chrono-guest-orders-v1','chrono-last-order-v1'].forEach(function(k){localStorage.removeItem(k)}); sessionStorage.clear();";
const reset = [['open', '/about.html'], ['executeScript', RESET, 'daXoa']];
const addToCart = (id, qty) => [['open', `/product.html?id=${id}`], ['type', q('qty-input'), String(qty)], ['click', q('add-to-cart-btn')], ['waitForElementVisible', q('product-feedback'), '5000']];

const TESTS = [
  ['AUREL-01 Thêm SE001 vào giỏ, badge giỏ hàng hiện 2', [
    ...reset, ...addToCart('p1', 2),
    ['assertText', q('header-cart-count'), '2'],
    ['open', '/cart.html'],
    ['waitForElementVisible', q('cart-item-p1'), '5000']
  ]],
  ['AUREL-02 Số lượng 0 và -1 bị từ chối, giỏ vẫn rỗng', [
    ...reset,
    ['open', '/product.html?id=p1'],
    ['type', q('qty-input'), '0'], ['click', q('add-to-cart-btn')],
    ['assertText', q('product-feedback'), 'Số lượng không hợp lệ. Vui lòng nhập số nguyên từ 1 trở lên.'],
    ['type', q('qty-input'), '-1'], ['click', q('add-to-cart-btn')],
    ['assertText', q('product-feedback'), 'Số lượng không hợp lệ. Vui lòng nhập số nguyên từ 1 trở lên.'],
    ['assertText', q('header-cart-count'), '0']
  ]],
  ['AUREL-03 Thanh toán sai dữ liệu: lỗi hiện dưới từng trường', [
    ...reset, ...addToCart('p6', 1),
    ['open', '/checkout.html'], ['waitForElementVisible', q('place-order-btn'), '5000'],
    ['type', 'css=#co-phone', '123'], ['type', 'css=#co-email', 'sai'], ['type', 'css=#co-address', 'ab'],
    ['click', q('place-order-btn')],
    ['assertText', 'css=#err-name', 'Họ tên phải có từ 1 đến 100 ký tự.'],
    ['assertText', 'css=#err-phone', 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.'],
    ['assertText', 'css=#err-email', 'Email không đúng định dạng.'],
    ['assertText', 'css=#err-address', 'Địa chỉ nhận hàng phải có từ 5 đến 300 ký tự.']
  ]],
  ['AUREL-04 Khách vãng lai đặt hàng thành công, đơn ở trạng thái Nháp', [
    ...reset, ...addToCart('p6', 1),
    ['open', '/checkout.html'], ['waitForElementVisible', q('place-order-btn'), '5000'],
    ['type', 'css=#co-name', 'Khách Selenium'], ['type', 'css=#co-phone', '0901112233'], ['type', 'css=#co-email', 'selenium@example.com'],
    ['type', 'css=#co-address', '12 Đường Kiểm Thử, TP. Hồ Chí Minh'],
    ['click', q('place-order-btn')],
    ['waitForElementVisible', q('order-success-card'), '8000'],
    ['assertText', q('success-order-status'), 'Nháp · Chờ xác nhận'],
    ['assertText', q('success-customer-name'), 'Khách Selenium']
  ]],
  ['AUREL-05 Trang khách từ chối tài khoản admin/staff', [
    ...reset,
    ['open', '/login.html'],
    ['type', 'css=#login-email', 'admin'], ['type', 'css=#login-password', 'Admin@123'],
    ['click', q('login-submit-btn')],
    ['assertText', 'css=#err-email', 'Tài khoản admin/staff dành cho trang Quản lý cửa hàng (index.html), không dùng để đăng nhập khách hàng.']
  ]],
  ['AUREL-06 Menu đổi theo kích thước màn hình', [
    ['setWindowSize', '800x900'], ['open', '/home.html'],
    ['waitForElementVisible', 'css=.mobile-subnav', '5000'],
    ['setWindowSize', '1440x900'], ['open', '/home.html'],
    ['waitForElementVisible', 'css=.desktop-nav', '5000']
  ]],
  ['AUREL-07 Trang quản lý chưa đăng nhập chỉ hiện form đăng nhập', [
    ['setWindowSize', '1440x900'], ['open', '/index.html'],
    ['waitForElementVisible', 'css=input[name="username"]', '5000'],
    ['assertElementPresent', 'css=input[name="password"]']
  ]]
];

const project = {
  id: uid(), version: '2.0', name: 'AUREL - kiểm thử giao diện', url: BASE_URL,
  tests: TESTS.map(([name, cmds]) => ({ id: uid(), name, commands: cmds.map(([command, target, value]) => ({ id: uid(), comment: '', command, target: target || '', targets: [], value: value || '' })) })),
  suites: [], urls: [BASE_URL + '/'], plugins: []
};
project.suites.push({ id: uid(), name: 'Tất cả ca AUREL', persistSession: false, parallel: false, timeout: 300, tests: project.tests.map(t => t.id) });

const out = path.join(ROOT, 'testing/selenium-ide/aurel-ui.side');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(project, null, 2));
console.log(`Đã tạo ${path.relative(process.cwd(), out)}: ${project.tests.length} test, ${project.tests.reduce((n, t) => n + t.commands.length, 0)} lệnh.`);

/* ---- kiểm tra các bước bằng Playwright (mô phỏng cách Selenium IDE thực hiện các lệnh) ---- */
if (process.argv.includes('--verify')) (async () => {
  const { chromium } = require(path.join(ROOT, 'node_modules/@playwright/test'));
  const { spawn } = require('node:child_process');
  const PORT = 5535, base = `http://127.0.0.1:${PORT}`;
  const server = spawn(process.execPath, [path.join(ROOT, 'scripts/test-server.cjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  for (let i = 0; i < 30; i++) { try { if ((await fetch(base + '/home.html')).ok) break; } catch { /* chờ */ } await new Promise(r => setTimeout(r, 200)); }
  const browser = await chromium.launch({ channel: fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe') ? 'chrome' : undefined });
  const sel = t => t.replace(/^css=/, '');
  let failed = 0;
  for (const t of project.tests) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' }); const page = await ctx.newPage();
    let step = 0, err = '';
    try {
      for (const c of t.commands) {
        step++;
        if (c.command === 'open') await page.goto(base + c.target);
        else if (c.command === 'setWindowSize') { const [w, h] = c.target.split('x').map(Number); await page.setViewportSize({ width: w, height: h }); }
        else if (c.command === 'executeScript') await page.evaluate(c.target);
        else if (c.command === 'type') await page.locator(sel(c.target)).fill(c.value);
        else if (c.command === 'click') await page.locator(sel(c.target)).click();
        else if (c.command === 'waitForElementVisible') await page.locator(sel(c.target)).first().waitFor({ state: 'visible', timeout: Number(c.value) || 5000 });
        else if (c.command === 'assertElementPresent') { if (!(await page.locator(sel(c.target)).count())) throw new Error('không thấy ' + c.target); }
        else if (c.command === 'assertText') {
          const el = page.locator(sel(c.target)).first(); await el.waitFor({ state: 'visible', timeout: 5000 });
          const got = (await el.innerText()).replace(/\s+/g, ' ').trim();
          if (got !== c.value) throw new Error(`${c.target}: "${got}" ≠ "${c.value}"`);
        } else throw new Error('lệnh chưa hỗ trợ trong bộ kiểm tra: ' + c.command);
      }
    } catch (e) { err = e.message.split('\n')[0]; }
    if (err) failed++;
    console.log(`${err ? 'LỖI' : 'ok  '} ${t.name}${err ? `\n       bước ${step} (${t.commands[step - 1].command}): ${err}` : ''}`);
    await ctx.close();
  }
  await browser.close(); server.kill();
  console.log(`\nKiểm tra: ${project.tests.length - failed}/${project.tests.length} test đạt trên Chrome bằng Playwright (không phải kết quả Selenium IDE).`);
  process.exit(failed ? 1 : 0);
})();
