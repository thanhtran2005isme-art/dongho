/* Thực thi 27 ca giao diện / responsive / khả năng truy cập / tương thích / bảo mật cơ bản / khả năng sử dụng.
 * Người thực thi: Claude (AI) điều khiển trình duyệt tự động — KHÔNG phải thao tác tay của sinh viên.
 * Mỗi lần chạy được CỘNG DỒN vào history.json; sinh lại LICH-SU-KIEM-THU-GIAO-DIEN.md, ket-qua-thuc-thi.csv và docs/TEST-CASES-UI.csv.
 * Chạy (từ thư mục dự án): node docs/evidence/ui-claude-2026-11-26/run-ui-cases.cjs */
const { chromium } = require('../../../node_modules/@playwright/test');
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const PORT = 5533;
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = path.join(OUT, 'anh');
fs.mkdirSync(SHOTS, { recursive: true });

/* ---- danh mục ca ---- */
const C = (id, type, func, goal, steps, expected, priority) => ({ id, type, func, goal, steps, expected, priority });
const CASES = [
  C('UI-001', 'Giao diện', 'Header/footer', 'Header, thanh tiện ích và footer 4 cột nhất quán trên 13 trang khách', '1. Mở lần lượt 13 trang khách; 2. So sánh thương hiệu, điều hướng, footer', 'Mọi trang có thương hiệu AUREL, ≥3 liên kết điều hướng, footer 4 cột và nội dung footer giống nhau', 'High'),
  C('UI-002', 'Giao diện', 'Nhận diện', 'Màu xanh ngọc #087b6a, nền trắng, font Cormorant/Be Vietnam Pro đúng nhận diện', '1. Mở giỏ hàng và trang chủ; 2. Đọc màu nút chính, nền, font', 'Nút chính nền rgb(8,123,106); nền trang trắng; tiêu đề dùng Cormorant Garamond, nội dung Be Vietnam Pro và font đã tải', 'Medium'),
  C('UI-003', 'Giao diện', 'Tài nguyên', 'Không phụ thuộc tài nguyên ngoài, không request lỗi, không lỗi console', '1. Mở 13 trang; 2. Ghi mọi request và lỗi console', 'Mọi request tới 127.0.0.1, không mã ≥400 (trừ ảnh cố ý lỗi), không lỗi JavaScript', 'High'),
  C('UI-004', 'Giao diện', 'Trạng thái', 'Trạng thái rỗng, không tìm thấy, lỗi và thành công hiển thị rõ', '1. Mở giỏ rỗng, yêu thích rỗng, đơn rỗng, ID sai, thanh toán rỗng', 'Mỗi trạng thái có tiêu đề và hướng dẫn tiếp theo', 'High'),
  C('UI-005', 'Giao diện', 'Trạng thái', 'Nút bị vô hiệu hóa trông khác nút bình thường', '1. So sánh nút Thêm vào giỏ của sản phẩm ngừng bán và sản phẩm còn bán', 'Nút disabled có thuộc tính disabled và kiểu hiển thị khác (độ mờ hoặc màu)', 'Medium'),
  C('UI-006', 'Giao diện', 'Ảnh', 'Ảnh sản phẩm có alt, kích thước khai báo và tải được', '1. Mở trang chủ; 2. Kiểm tra từng ảnh', 'Mọi ảnh có alt không rỗng, width/height và naturalWidth > 0', 'Medium'),
  C('UI-007', 'Giao diện', 'Ảnh', 'Ảnh minh họa AI được ghi nguồn rõ', '1. Mở chi tiết sản phẩm; 2. Đọc chú thích ảnh và footer', 'Có nhãn ảnh minh họa AI, không giả là ảnh chính thức của hãng', 'Medium'),
  C('UI-008', 'Giao diện', 'Liên kết', 'Không có liên kết chết hoặc liên kết giả (href="#")', '1. Thu thập mọi liên kết trên 13 trang; 2. Gọi từng liên kết nội bộ', 'Không href rỗng/#; mọi liên kết nội bộ trả 200', 'High'),
  C('UI-009', 'Giao diện', 'Đồng bộ', 'Badge giỏ hàng cập nhật ở tab khác khi thêm sản phẩm', '1. Mở hai tab; 2. Thêm sản phẩm ở tab 1', 'Tab 2 tự cập nhật badge giỏ không cần tải lại', 'Medium'),
  C('UI-010', 'Responsive', 'Điều hướng', 'Menu đổi theo kích thước màn hình', '1. Mở trang chủ ở 390px; 2. Mở ở 1440px', '390px: ẩn menu desktop, hiện menu nhanh; 1440px: ngược lại', 'High'),
  C('UI-011', 'Responsive', 'Mục tiêu chạm', 'Nút và ô nhập đủ lớn trên 390px', '1. Đo nút/ô nhập ở 7 trang chính ở 390px', 'Mọi nút/ô nhập ≥ 24×24px (WCAG 2.5.8); nút hành động chính cao ≥ 40px', 'Medium'),
  C('UI-012', 'Responsive', 'Phóng to/reflow', 'Không tràn ngang khi phóng to tương đương 200% (720px) và 400% (320px)', '1. Mở giỏ, thanh toán, chi tiết, đơn hàng ở 720px và 320px', 'scrollWidth ≤ innerWidth', 'Medium'),
  C('UI-013', 'Khả năng truy cập', 'Cấu trúc', 'Mỗi trang có lang=vi, title riêng và đúng một h1', '1. Mở 13 trang; 2. Đọc lang, title, h1', 'lang="vi"; title không rỗng và không trùng; đúng 1 h1', 'High'),
  C('UI-014', 'Khả năng truy cập', 'Biểu mẫu', 'Mọi ô nhập có nhãn liên kết', '1. Mở đăng nhập, đăng ký, thanh toán, liên hệ, hồ sơ, tra cứu đơn', 'Mọi input/select/textarea có label hoặc aria-label', 'High'),
  C('UI-015', 'Khả năng truy cập', 'Tương phản', 'Chữ đạt tỷ lệ tương phản tối thiểu 4,5:1 (3:1 với chữ lớn)', '1. Đo tương phản chữ/nền trên 7 trang chính', 'Không phần tử chữ nào thấp hơn ngưỡng', 'High'),
  C('UI-016', 'Khả năng truy cập', 'Bàn phím', 'Điều hướng bằng Tab đến được nút đặt hàng và mọi điểm dừng có dấu hiệu focus', '1. Mở thanh toán; 2. Nhấn Tab liên tiếp', 'Đến được nút Xác nhận; mọi điểm dừng có viền hoặc bóng focus', 'High'),
  C('UI-017', 'Khả năng truy cập', 'Lỗi biểu mẫu', 'Lỗi biểu mẫu được gắn aria-invalid, aria-describedby và role=alert', '1. Gửi form thanh toán sai dữ liệu', 'Ô lỗi có aria-invalid=true, aria-describedby trỏ tới thông báo có role=alert', 'Medium'),
  C('UI-018', 'Khả năng truy cập', 'Ảnh', 'Mọi ảnh trên 13 trang có thuộc tính alt', '1. Quét mọi <img>', 'Không ảnh nào thiếu alt', 'Medium'),
  C('UI-019', 'Khả năng truy cập', 'Landmark', 'Trang có vùng main, header, footer và nav có nhãn', '1. Quét 13 trang', 'Mỗi trang có main, header, footer; mỗi nav có aria-label', 'Medium'),
  C('UI-020', 'Tương thích', 'Trình duyệt', 'Luồng khách đặt hàng → quản lý thấy đơn chạy trên Chrome và Edge', '1. Thêm giỏ; 2. Đặt hàng; 3. Admin xem đơn — trên từng trình duyệt', 'Cả hai trình duyệt cho cùng kết quả: đơn Nháp xuất hiện trong quản lý', 'High'),
  C('UI-021', 'Bảo mật cơ bản', 'Phân quyền', 'Chưa đăng nhập không xem được dữ liệu quản lý', '1. Mở index.html khi chưa đăng nhập', 'Chỉ hiện form đăng nhập, không hiện menu hay danh sách đơn', 'High'),
  C('UI-022', 'Bảo mật cơ bản', 'Mật khẩu', 'Mật khẩu khách không lưu dạng rõ', '1. Đăng ký tài khoản; 2. Đọc chrono-customer-accounts-v1', 'Chỉ có passwordHash, không chứa mật khẩu gốc', 'High'),
  C('UI-023', 'Bảo mật cơ bản', 'Máy chủ', 'Máy chủ không phục vụ file ngoài danh sách (path traversal)', '1. Gọi package.json, tests, scripts, node_modules, ../ và %2e%2e', 'Mọi đường dẫn trả 404 hoặc 400, không trả 200', 'High'),
  C('UI-024', 'Bảo mật cơ bản', 'Phiên', 'Phiên khách hết hạn thì bị đăng xuất', '1. Đăng nhập; 2. Đặt thời hạn phiên về quá khứ; 3. Tải lại hồ sơ', 'Hiện trạng thái chưa đăng nhập', 'Medium'),
  C('UI-025', 'Khả năng sử dụng', 'Thông báo', 'Thông báo lỗi bằng tiếng Việt, dễ hiểu, không lộ lỗi kỹ thuật', '1. Gây lỗi ở số lượng, đăng nhập, đăng ký, tra cứu, liên hệ', 'Mỗi thông báo có tiếng Việt, không chứa undefined/NaN/[object/Error', 'Medium'),
  C('UI-026', 'Khả năng sử dụng', 'Định dạng', 'Số tiền VND hiển thị nhất quán (dấu chấm nghìn + ₫)', '1. Mở trang chủ, chi tiết, giỏ, thanh toán', 'Mọi số tiền khớp mẫu 12.500.000 ₫', 'Medium'),
  C('UI-027', 'Khả năng sử dụng', 'Điều hướng', 'Từ mọi trang đến giỏ/trang chủ/tài khoản chỉ 1 lần bấm và trang trong có breadcrumb', '1. Quét 13 trang', 'Header có liên kết giỏ, trang chủ, tài khoản; trang trong có breadcrumb', 'Medium')
];

/* ---- tiện ích ---- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
class Check extends Error {}
function ok(cond, passMsg, failMsg, obs) { if (cond) { obs.push('✔ ' + passMsg); return; } obs.push('✘ ' + (failMsg || passMsg)); throw new Check(failMsg || passMsg); }
const text = async (page, sel = 'main') => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim();
const PAGES = ['home.html', 'product.html?id=p1', 'cart.html', 'checkout.html', 'order-success.html', 'login.html', 'register.html', 'account.html', 'orders.html', 'order-detail.html', 'wishlist.html', 'about.html', 'contact.html'];
const CTX_OPTS = { viewport: { width: 1440, height: 900 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' };

async function addToCart(page, id, qty = 1) {
  await page.goto(`${BASE}/product.html?id=${id}`);
  await page.getByTestId('qty-input').fill(String(qty));
  await page.getByTestId('add-to-cart-btn').click();
  await page.getByTestId('product-feedback').waitFor();
}
async function guestOrder(page, vals) {
  await addToCart(page, 'p1', 1);
  await page.goto(`${BASE}/checkout.html`);
  await page.getByLabel('Họ và tên *').fill(vals.name); await page.getByLabel('Số điện thoại *').fill(vals.phone);
  await page.getByLabel('Email *').fill(vals.email); await page.getByLabel('Địa chỉ nhận hàng *').fill(vals.address);
  await page.getByTestId('place-order-btn').click();
  await page.waitForURL(/order-success\.html\?id=/);
  return new URL(page.url()).searchParams.get('id');
}
async function adminSeesOrder(page) {
  await page.goto(`${BASE}/index.html`);
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('admin'); await page.getByLabel('Mật khẩu', { exact: true }).fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).click();
  return text(page, 'tbody');
}
/* Bối cảnh có sẵn một đơn thật và giỏ có hàng để mở đủ 13 trang với dữ liệu */
async function seeded(browser) {
  const ctx = await browser.newContext(CTX_OPTS); const page = await ctx.newPage();
  const orderId = await guestOrder(page, { name: 'Khách Giao Diện', phone: '0902222222', email: 'ui@example.com', address: '10 Đường Giao Diện, TP. Hồ Chí Minh' });
  await addToCart(page, 'p6', 1);
  const urls = PAGES.map(p => p === 'order-success.html' ? `order-success.html?id=${orderId}` : p === 'order-detail.html' ? `order-detail.html?id=${orderId}` : p);
  return { ctx, page, urls, orderId };
}

/* hàm tính tương phản chạy trong trang */
const contrastScan = () => {
  const parse = c => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] === 1) break; } } let base = [255, 255, 255]; for (let i = layers.length - 1; i >= 0; i--) { const [r, g, b, a] = layers[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]; } return base; };
  const bad = []; let n = 0;
  document.querySelectorAll('h1,h2,h3,p,span,a,li,small,label,button,td,th,strong,div').forEach(el => {
    const own = [...el.childNodes].filter(x => x.nodeType === 3 && x.textContent.trim()).map(x => x.textContent.trim()).join(' ');
    if (!own) return;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
    const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return;
    const fg = parse(st.color); if (!fg) return;
    const bg = bgOf(el); const a = fg[3];
    const fgc = [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
    const L1 = lum(fgc), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(st.fontSize), bold = Number(st.fontWeight) >= 700; const large = size >= 24 || (size >= 18.66 && bold);
    n++;
    if (ratio < (large ? 3 : 4.5)) bad.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} "${own.slice(0, 24)}" ${ratio.toFixed(2)}:1 (${Math.round(size)}px)`);
  });
  return { n, bad };
};

const impl = {};

impl['UI-001'] = async (p, o, ctx, env) => {
  const sigs = []; const footers = [];
  for (const u of env.urls) {
    await p.goto(`${BASE}/${u}`);
    const r = await p.evaluate(() => ({
      announce: !!document.querySelector('.announcement'), brand: (document.querySelector('.site-header .brand') || {}).textContent || '',
      nav: document.querySelectorAll('.desktop-nav a').length, cols: document.querySelectorAll('footer .footer-grid-4 > div').length,
      footer: (document.querySelector('footer .footer-grid-4') || {}).innerText || ''
    }));
    sigs.push({ u, ...r }); footers.push(r.footer.replace(/\s+/g, ' '));
  }
  const bad = sigs.filter(s => !s.announce || !s.brand.includes('AUREL') || s.nav < 3 || s.cols !== 4).map(s => s.u);
  ok(bad.length === 0, `13 trang đều có thanh tiện ích, thương hiệu AUREL, ≥3 liên kết điều hướng, footer 4 cột`, `Trang thiếu thành phần: ${bad.join(', ')}`, o);
  ok(new Set(footers).size === 1, 'Nội dung footer giống nhau trên cả 13 trang', 'Footer khác nhau giữa các trang', o);
};

impl['UI-002'] = async (p, o) => {
  await p.goto(`${BASE}/home.html`);
  await p.evaluate(() => document.fonts.ready);
  /* Tiêu đề dùng tên font "Aurel Display" được @font-face trỏ tới cormorant-garamond.ttf */
  const s = await p.evaluate(() => {
    const faces = []; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.type === CSSRule.FONT_FACE_RULE) faces.push({ family: r.style.getPropertyValue('font-family').replace(/["']/g, '').trim(), src: r.style.getPropertyValue('src') }); } catch { /* bỏ qua */ } }
    return { bg: getComputedStyle(document.body).backgroundColor, bodyFont: getComputedStyle(document.body).fontFamily, h1Font: getComputedStyle(document.querySelector('h1')).fontFamily, faces, d: document.fonts.check('20px "Aurel Display"'), b: document.fonts.check('16px "Be Vietnam Pro"') };
  });
  const display = s.faces.find(f => f.family === 'Aurel Display'); const body = s.faces.find(f => f.family === 'Be Vietnam Pro');
  ok(s.bodyFont.includes('Be Vietnam Pro') && s.h1Font.includes('Aurel Display'), `Nội dung dùng "${s.bodyFont.split(',')[0]}", tiêu đề dùng "${s.h1Font.split(',')[0]}"`, `Font không đúng: ${s.bodyFont} / ${s.h1Font}`, o);
  ok(display && /cormorant-garamond/i.test(display.src) && body && /be-vietnam-pro/i.test(body.src), '@font-face: "Aurel Display" → cormorant-garamond.ttf, "Be Vietnam Pro" → be-vietnam-pro.ttf (tự lưu trên máy)', 'Khai báo @font-face không trỏ tới font Cormorant/Be Vietnam Pro tự lưu', o);
  ok(s.d && s.b, 'Hai font đã tải (document.fonts.check)', 'Font chưa tải', o);
  await p.goto(`${BASE}/product.html?id=p1`);
  const btn = await p.getByTestId('add-to-cart-btn').evaluate(e => getComputedStyle(e).backgroundColor);
  ok(btn === 'rgb(8, 123, 106)', `Nút chính có nền ${btn} = #087b6a`, `Nút chính có nền ${btn}`, o);
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok(['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'].includes(bg), `Nền trang ${bg} (trắng)`, `Nền trang ${bg}`, o);
};

impl['UI-003'] = async (p, o, ctx, env) => {
  const hosts = new Set(), bad = [], errs = [];
  p.on('request', r => hosts.add(new URL(r.url()).hostname));
  p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) bad.push(r.status() + ' ' + r.url().replace(BASE, '')); });
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text().slice(0, 80)); });
  for (const u of env.urls) { await p.goto(`${BASE}/${u}`); await p.waitForTimeout(150); }
  ok([...hosts].every(h => h === '127.0.0.1'), `Mọi request tới ${[...hosts].join(', ')} (không có tài nguyên ngoài)`, `Có request ra ngoài: ${[...hosts].join(', ')}`, o);
  ok(bad.length === 0, 'Không có request mã ≥ 400', `Request lỗi: ${bad.join('; ')}`, o);
  ok(errs.length === 0, 'Không có lỗi JavaScript/console', `Lỗi: ${errs.join('; ')}`, o);
};

impl['UI-004'] = async (p, o, ctx, env) => {
  const c2 = await env.browser.newContext(CTX_OPTS); const q = await c2.newPage();
  const checks = [['cart.html', 'cart-empty'], ['wishlist.html', 'wishlist-empty'], ['checkout.html', 'checkout-empty'], ['product.html?id=missing', 'product-not-found'], ['order-success.html?id=fake', 'order-success-invalid'], ['order-detail.html?id=fake', 'order-detail-denied']];
  for (const [u, tid] of checks) {
    await q.goto(`${BASE}/${u}`);
    const el = q.getByTestId(tid); const vis = await el.isVisible(); const h = vis ? (await el.locator('h1, h2').first().innerText()) : '';
    ok(vis && h.length > 0, `${u}: "${h}"`, `${u}: không thấy trạng thái ${tid}`, o);
  }
  await c2.close();
};

impl['UI-005'] = async (p, o) => {
  await p.goto(`${BASE}/product.html?id=p1`);
  const en = await p.getByTestId('add-to-cart-btn').evaluate(e => { const s = getComputedStyle(e); return { dis: e.disabled, op: s.opacity, bg: s.backgroundColor, cur: s.cursor }; });
  await p.goto(`${BASE}/product.html?id=p7`);
  const dis = await p.getByTestId('add-to-cart-btn').evaluate(e => { const s = getComputedStyle(e); return { dis: e.disabled, op: s.opacity, bg: s.backgroundColor, cur: s.cursor }; });
  ok(dis.dis && !en.dis, 'Nút p7 có thuộc tính disabled, nút p1 thì không', 'Thuộc tính disabled không đúng', o);
  ok(dis.op !== en.op || dis.bg !== en.bg || dis.cur === 'not-allowed', `Kiểu hiển thị khác nút bình thường (độ mờ ${dis.op} so với ${en.op}, con trỏ ${dis.cur})`, 'Nút disabled trông giống nút bình thường', o);
};

impl['UI-006'] = async (p, o) => {
  await p.goto(`${BASE}/home.html`); await p.waitForFunction(() => [...document.images].every(i => i.complete));
  const r = await p.evaluate(() => [...document.querySelectorAll('#products img')].map(i => ({ alt: i.alt, w: i.getAttribute('width'), h: i.getAttribute('height'), nw: i.naturalWidth })));
  ok(r.length > 0, `Trang chủ có ${r.length} ảnh sản phẩm`, 'Không có ảnh', o);
  ok(r.every(i => i.alt.trim()), 'Mọi ảnh có alt không rỗng', 'Có ảnh thiếu alt', o);
  ok(r.every(i => i.w && i.h), 'Mọi ảnh khai báo width và height (tránh giật bố cục)', 'Có ảnh thiếu width/height', o);
  ok(r.every(i => i.nw > 0), 'Mọi ảnh tải được', 'Có ảnh không tải được', o);
};

impl['UI-007'] = async (p, o) => {
  await p.goto(`${BASE}/product.html?id=p1`);
  const badge = await text(p, '.ai-badge'); ok(/AI/.test(badge) && /không phải ảnh chính thức/.test(badge), `Nhãn ảnh: "${badge}"`, `Nhãn ảnh không rõ: "${badge}"`, o);
  ok((await text(p, 'footer')).includes('Ảnh đồng hồ do AI minh họa'), 'Footer ghi "Ảnh đồng hồ do AI minh họa"', 'Footer thiếu ghi chú ảnh AI', o);
};

impl['UI-008'] = async (p, o, ctx, env) => {
  const hrefs = new Set(), fake = [];
  for (const u of env.urls) {
    await p.goto(`${BASE}/${u}`);
    for (const h of await p.$$eval('a', as => as.map(a => a.getAttribute('href')))) { if (h === null || h === '' || h === '#') fake.push(`${u}:${h}`); else hrefs.add(h); }
  }
  ok(fake.length === 0, 'Không có liên kết rỗng hoặc href="#"', `Liên kết giả: ${fake.join(', ')}`, o);
  const dead = [];
  for (const h of hrefs) { if (/^(https?:|mailto:|tel:|#)/.test(h)) continue; const r = await ctx.request.get(`${BASE}/${h.split('#')[0]}`); if (r.status() >= 400) dead.push(`${h} → ${r.status()}`); }
  ok(dead.length === 0, `${hrefs.size} liên kết khác nhau đều trả 200`, `Liên kết chết: ${dead.join(', ')}`, o);
};

impl['UI-009'] = async (p, o, ctx) => {
  const b = await ctx.newPage(); await b.goto(`${BASE}/home.html`);
  const before = await b.getByTestId('header-cart-count').innerText();
  await addToCart(p, 'p1', 1);
  await b.waitForFunction(() => document.querySelector('[data-testid="header-cart-count"]').textContent === '1', null, { timeout: 4000 }).catch(() => {});
  const after = await b.getByTestId('header-cart-count').innerText();
  ok(before === '0' && after === '1', `Tab 2: badge giỏ từ ${before} thành ${after} không cần tải lại`, `Tab 2 không cập nhật (${before} → ${after})`, o);
};

impl['UI-010'] = async (p, o) => {
  const probe = () => p.evaluate(() => ({ d: getComputedStyle(document.querySelector('.desktop-nav')).display, m: getComputedStyle(document.querySelector('.mobile-subnav')).display }));
  await p.setViewportSize({ width: 390, height: 900 }); await p.goto(`${BASE}/home.html`); const a = await probe();
  ok(a.d === 'none' && a.m !== 'none', `390px: menu desktop ${a.d}, menu nhanh ${a.m}`, `390px sai: ${JSON.stringify(a)}`, o);
  await p.setViewportSize({ width: 1440, height: 900 }); await p.goto(`${BASE}/home.html`); const b = await probe();
  ok(b.d !== 'none' && b.m === 'none', `1440px: menu desktop ${b.d}, menu nhanh ${b.m}`, `1440px sai: ${JSON.stringify(b)}`, o);
};

impl['UI-011'] = async (p, o) => {
  await p.setViewportSize({ width: 390, height: 900 });
  const small = [], primary = [];
  for (const u of ['home.html', 'product.html?id=p1', 'cart.html', 'checkout.html', 'login.html', 'register.html', 'contact.html']) {
    await p.goto(`${BASE}/${u}`);
    const r = await p.evaluate(() => {
      const out = { small: [], primary: [] };
      document.querySelectorAll('button, input:not([type=hidden]), select, textarea, a.button').forEach(e => {
        const b = e.getBoundingClientRect(); if (b.width === 0 || b.height === 0) return;
        const label = (e.id || e.name || e.textContent.trim().slice(0, 18) || e.tagName);
        if (b.width < 24 || b.height < 24) out.small.push(`${label} ${Math.round(b.width)}×${Math.round(b.height)}`);
        if (e.matches('.button:not(.small), [data-testid="place-order-btn"], [data-testid="add-to-cart-btn"], [type=submit]') && b.height < 40) out.primary.push(`${label} cao ${Math.round(b.height)}`);
      });
      return out;
    });
    small.push(...r.small.map(x => `${u}: ${x}`)); primary.push(...r.primary.map(x => `${u}: ${x}`));
  }
  ok(small.length === 0, 'Mọi nút/ô nhập ≥ 24×24px ở 390px', `Quá nhỏ: ${small.slice(0, 5).join('; ')}`, o);
  ok(primary.length === 0, 'Nút hành động chính cao ≥ 40px', `Nút chính thấp: ${primary.slice(0, 5).join('; ')}`, o);
};

impl['UI-012'] = async (p, o, ctx, env) => {
  const bad = [];
  for (const w of [720, 320]) {
    await p.setViewportSize({ width: w, height: 900 });
    for (const u of ['cart.html', 'checkout.html', 'product.html?id=p1', env.urls.find(x => x.startsWith('order-detail')), 'orders.html', 'home.html']) {
      await p.goto(`${BASE}/${u}`); await p.evaluate(() => document.fonts.ready);
      const r = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); if (r[0] > r[1]) bad.push(`${u.split('?')[0]}@${w}px rộng ${r[0]}`);
    }
  }
  ok(bad.length === 0, '6 trang × 2 độ rộng (720px, 320px) không tràn ngang', `Tràn ngang: ${bad.join('; ')}`, o);
};

impl['UI-013'] = async (p, o, ctx, env) => {
  const titles = new Map(), bad = [];
  for (const u of env.urls) {
    await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100);
    const r = await p.evaluate(() => ({ lang: document.documentElement.lang, title: document.title.trim(), h1: document.querySelectorAll('h1').length }));
    if (r.lang !== 'vi') bad.push(`${u}: lang="${r.lang}"`); if (!r.title) bad.push(`${u}: title rỗng`); if (r.h1 !== 1) bad.push(`${u}: ${r.h1} thẻ h1`);
    titles.set(u, r.title);
  }
  ok(bad.length === 0, '13 trang đều lang="vi", có title và đúng 1 h1', bad.join('; '), o);
  const dup = [...titles.values()].filter((t, i, a) => a.indexOf(t) !== i);
  ok(dup.length === 0, 'Title mỗi trang khác nhau', `Title trùng: ${[...new Set(dup)].join(', ')}`, o);
};

impl['UI-014'] = async (p, o, ctx, env) => {
  await p.goto(`${BASE}/register.html`);
  await p.getByLabel('Họ và tên *', { exact: true }).fill('Khách Nhãn'); await p.getByLabel('Email *', { exact: true }).fill('nhan@example.com');
  await p.getByLabel('Số điện thoại *', { exact: true }).fill('0912121212'); await p.getByLabel('Mật khẩu *', { exact: true }).fill('NhanLabel@12'); await p.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('NhanLabel@12');
  await p.getByTestId('register-submit-btn').click(); await p.waitForURL(/account/);
  await addToCart(p, 'p1', 1);
  const unl = [];
  for (const u of ['login.html', 'register.html', 'checkout.html', 'contact.html', 'account.html', 'orders.html', 'home.html']) {
    await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100);
    unl.push(...(await p.evaluate(() => [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]), select, textarea')].filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e => e.id || e.name || e.tagName))).map(x => `${u}:${x}`));
  }
  ok(unl.length === 0, 'Mọi ô nhập trên 7 trang có nhãn (label hoặc aria-label)', `Ô thiếu nhãn: ${unl.join(', ')}`, o);
};

impl['UI-015'] = async (p, o, ctx, env) => {
  const all = []; let n = 0;
  for (const u of ['home.html', 'product.html?id=p1', 'cart.html', 'checkout.html', 'login.html', 'contact.html', 'about.html', env.urls.find(x => x.startsWith('order-detail'))]) {
    await p.goto(`${BASE}/${u}`); await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(contrastScan); n += r.n; all.push(...r.bad.map(b => `${u.split('?')[0]}: ${b}`));
  }
  const uniq = [...new Set(all)];
  ok(uniq.length === 0, `Đã đo ${n} phần tử chữ trên 8 trang: tất cả đạt ngưỡng tương phản`, `${uniq.length} phần tử dưới ngưỡng, ví dụ: ${uniq.slice(0, 4).join(' | ')}`, o);
};

impl['UI-016'] = async (p, o) => {
  await addToCart(p, 'p1', 1); await p.goto(`${BASE}/checkout.html`);
  const stops = []; let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await p.keyboard.press('Tab');
    const r = await p.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const shows = el => { const s = getComputedStyle(el); return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'; };
      /* dấu hiệu focus có thể nằm ở chính phần tử hoặc ở khung bao đang :focus-within (ví dụ ô tìm kiếm) */
      let ring = shows(e); for (let a = e.parentElement, d = 0; a && !ring && d < 3; a = a.parentElement, d++) if (a.matches(':focus-within') && shows(a)) ring = true;
      return { t: (e.id || e.name || e.getAttribute('data-testid') || e.textContent.trim().slice(0, 15) || e.tagName), ring, place: e.getAttribute('data-testid') === 'place-order-btn' };
    });
    if (r) { stops.push(r); if (r.place) reached = true; }
  }
  ok(reached, `Tab đến được nút Xác nhận đặt hàng sau ${stops.length} lần nhấn`, 'Không Tab tới được nút đặt hàng', o);
  const noRing = stops.filter(s => !s.ring).map(s => s.t);
  ok(noRing.length === 0, `Cả ${stops.length} điểm dừng đều có dấu hiệu focus`, `Điểm dừng không có dấu hiệu focus: ${noRing.join(', ')}`, o);
};

impl['UI-017'] = async (p, o) => {
  await addToCart(p, 'p1', 1); await p.goto(`${BASE}/checkout.html`);
  await p.getByLabel('Số điện thoại *').fill('123'); await p.getByLabel('Email *').fill('sai'); await p.getByTestId('place-order-btn').click();
  const r = await p.evaluate(() => ['co-name', 'co-phone', 'co-email', 'co-address'].map(id => { const e = document.getElementById(id); const d = e.getAttribute('aria-describedby'); const m = d && document.getElementById(d.split(' ')[0]); return { id, inv: e.getAttribute('aria-invalid'), desc: !!m, alert: !!(m && m.getAttribute('role') === 'alert'), txt: m ? m.textContent.trim().length : 0 }; }));
  const bad = r.filter(x => x.inv !== 'true' || !x.desc || !x.alert || !x.txt).map(x => x.id);
  ok(bad.length === 0, 'Cả 4 ô lỗi có aria-invalid="true", aria-describedby trỏ tới thông báo role="alert" có nội dung', `Ô thiếu thuộc tính: ${bad.join(', ')} → ${JSON.stringify(r.filter(x => bad.includes(x.id)))}`, o);
};

impl['UI-018'] = async (p, o, ctx, env) => {
  const bad = [];
  for (const u of env.urls) { await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100); bad.push(...(await p.evaluate(() => [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.src.split('/').pop()))).map(x => `${u}:${x}`)); }
  ok(bad.length === 0, 'Không ảnh nào thiếu thuộc tính alt trên 13 trang', `Ảnh thiếu alt: ${bad.join(', ')}`, o);
};

impl['UI-019'] = async (p, o, ctx, env) => {
  const bad = [];
  for (const u of env.urls) {
    await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100);
    const r = await p.evaluate(() => ({ main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length, navNoLabel: [...document.querySelectorAll('nav')].filter(n => !n.getAttribute('aria-label')).length }));
    if (r.main !== 1 || r.header < 1 || r.footer < 1 || r.navNoLabel) bad.push(`${u}: ${JSON.stringify(r)}`);
  }
  ok(bad.length === 0, '13 trang đều có 1 main, header, footer và nav có aria-label', bad.join('; '), o);
};

impl['UI-020'] = async (p, o, ctx, env) => {
  const names = [['Chrome', 'chrome'], ['Edge', 'msedge']]; const results = [];
  for (const [label, channel] of names) {
    let b;
    try { b = await chromium.launch({ channel }); } catch (e) { o.push(`⚠ ${label}: không khởi chạy được (${e.message.split('\n')[0]})`); results.push({ label, blocked: true }); continue; }
    try {
      const c = await b.newContext(CTX_OPTS); const q = await c.newPage();
      await guestOrder(q, { name: `Khách ${label}`, phone: '0903030303', email: `${label.toLowerCase()}@example.com`, address: `5 Đường ${label}, Huế` });
      const rows = await adminSeesOrder(q);
      const pass = rows.includes('DH0001') && rows.includes('Nháp') && rows.includes(`Khách ${label}`);
      o.push(`${pass ? '✔' : '✘'} ${label} ${b.version()}: đơn ${pass ? 'xuất hiện trong quản lý ở trạng thái Nháp' : 'KHÔNG xuất hiện đúng'}`);
      results.push({ label, pass });
    } finally { await b.close(); }
  }
  if (results.some(r => r.blocked)) { const e = new Check('Blocked: chỉ chạy được một phần trình duyệt'); e.blocked = true; throw e; }
  ok(results.every(r => r.pass), 'Cả Chrome và Edge cho cùng kết quả', 'Kết quả khác nhau giữa trình duyệt', o);
};

impl['UI-021'] = async (p, o) => {
  await p.goto(`${BASE}/index.html`); await p.waitForTimeout(300);
  const login = await p.getByLabel('Tên đăng nhập', { exact: true }).isVisible();
  const menu = await p.locator('nav').getByRole('button', { name: 'Đơn hàng', exact: true }).count();
  ok(login && menu === 0, 'Chỉ hiện form đăng nhập, không có menu Đơn hàng', `Login=${login}, menu=${menu}`, o);
  const t = await text(p, 'body'); ok(!/DH\d{4}|Tổng doanh thu|Tồn kho/.test(t), 'Không lộ mã đơn, doanh thu hay tồn kho', 'Lộ dữ liệu quản lý', o);
};

impl['UI-022'] = async (p, o) => {
  await p.goto(`${BASE}/register.html`);
  await p.getByLabel('Họ và tên *', { exact: true }).fill('Khách Băm'); await p.getByLabel('Email *', { exact: true }).fill('bam@example.com');
  await p.getByLabel('Số điện thoại *', { exact: true }).fill('0917171717'); await p.getByLabel('Mật khẩu *', { exact: true }).fill('MatKhauBiMat@77'); await p.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('MatKhauBiMat@77');
  await p.getByTestId('register-submit-btn').click(); await p.waitForURL(/account/);
  const raw = await p.evaluate(() => localStorage.getItem('chrono-customer-accounts-v1'));
  ok(!raw.includes('MatKhauBiMat@77'), 'Mật khẩu gốc không xuất hiện trong dữ liệu lưu', 'Mật khẩu lưu dạng rõ', o);
  ok(/"passwordHash":"localv1_/.test(raw), 'Có trường passwordHash (băm mô phỏng)', 'Không có passwordHash', o);
};

impl['UI-023'] = async (p, o) => {
  const paths = ['/package.json', '/package-lock.json', '/tests/store.test.js', '/scripts/test-server.cjs', '/node_modules/.bin/playwright', '/.gitignore', '/../package.json', '/%2e%2e/package.json', '/docs/../package.json', '/assets/../package.json', '/docs/%2e%2e/%2e%2e/Windows/win.ini'];
  const get = pth => new Promise(res => { http.get({ host: '127.0.0.1', port: PORT, path: pth }, r => { r.resume(); res(r.statusCode); }).on('error', () => res(0)); });
  const bad = [];
  for (const pth of paths) { const s = await get(pth); if (s === 200) bad.push(`${pth} → 200`); else o.push(`✔ ${pth} → ${s}`); }
  ok(bad.length === 0, `${paths.length} đường dẫn nhạy cảm/traversal đều không trả 200`, `Lộ file: ${bad.join(', ')}`, o);
};

impl['UI-024'] = async (p, o) => {
  await p.goto(`${BASE}/register.html`);
  await p.getByLabel('Họ và tên *', { exact: true }).fill('Khách Hết Hạn'); await p.getByLabel('Email *', { exact: true }).fill('hethan@example.com');
  await p.getByLabel('Số điện thoại *', { exact: true }).fill('0918181818'); await p.getByLabel('Mật khẩu *', { exact: true }).fill('HetHan@12345'); await p.getByLabel('Xác nhận mật khẩu *', { exact: true }).fill('HetHan@12345');
  await p.getByTestId('register-submit-btn').click(); await p.waitForURL(/account/);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('chrono-customer-session-v1')); s.expires = Date.now() - 1000; localStorage.setItem('chrono-customer-session-v1', JSON.stringify(s)); });
  await p.goto(`${BASE}/account.html`);
  ok(await p.getByTestId('account-guest-state').isVisible(), 'Phiên hết hạn → hiện trạng thái chưa đăng nhập', 'Vẫn đăng nhập sau khi hết hạn', o);
  ok((await p.evaluate(() => localStorage.getItem('chrono-customer-session-v1'))) === null, 'Phiên hết hạn bị xóa khỏi bộ nhớ', 'Phiên cũ vẫn còn trong bộ nhớ', o);
};

impl['UI-025'] = async (p, o) => {
  const msgs = [];
  await p.goto(`${BASE}/product.html?id=p1`);
  for (const v of ['0', '99']) { await p.getByTestId('qty-input').fill(v); await p.getByTestId('add-to-cart-btn').click(); msgs.push(['số lượng ' + v, await text(p, '[data-testid="product-feedback"]')]); }
  await p.goto(`${BASE}/login.html`); await p.getByLabel('Email *', { exact: true }).fill('khong@example.com'); await p.getByLabel('Mật khẩu *', { exact: true }).fill('SaiMatKhau@1'); await p.getByTestId('login-submit-btn').click(); msgs.push(['đăng nhập sai', await text(p, '[data-testid="login-error"]')]);
  await p.goto(`${BASE}/register.html`); await p.getByTestId('register-submit-btn').click(); for (const f of ['name', 'email', 'phone', 'password']) msgs.push(['đăng ký ' + f, (await p.locator(`#err-${f}`).innerText()).trim()]);
  await p.goto(`${BASE}/orders.html`); await p.getByLabel('Mã đơn hàng *').fill('DH9999'); await p.getByLabel('Số điện thoại hoặc Email đặt hàng *').fill('0900000000'); await p.getByTestId('guest-lookup-btn').click(); msgs.push(['tra cứu đơn', await text(p, '[data-testid="guest-lookup-error"]')]);
  await p.goto(`${BASE}/contact.html`); await p.getByTestId('contact-submit-btn').click(); msgs.push(['liên hệ', (await p.locator('#err-name').innerText()).trim()]);
  const bad = msgs.filter(([, t]) => !t || !/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(t) || /undefined|NaN|\[object|Error:|TypeError/.test(t));
  ok(bad.length === 0, `${msgs.length} thông báo lỗi đều có tiếng Việt và không lộ lỗi kỹ thuật`, `Thông báo có vấn đề: ${bad.map(b => b.join(' → ')).join('; ')}`, o);
};

impl['UI-026'] = async (p, o, ctx, env) => {
  const bad = []; let n = 0;
  await addToCart(p, 'p1', 2);
  for (const u of ['home.html', 'product.html?id=p1', 'cart.html', 'checkout.html', env.urls.find(x => x.startsWith('order-detail'))]) {
    await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100);
    const t = await text(p, 'body');
    for (const m of t.match(/[\d.,]+\s?₫/g) || []) { n++; if (!/^\d{1,3}(\.\d{3})*\s?₫$/.test(m)) bad.push(`${u.split('?')[0]}: ${m}`); }
  }
  ok(n > 0 && bad.length === 0, `${n} số tiền trên 5 trang đều theo mẫu 12.500.000 ₫`, `Sai định dạng: ${bad.join('; ')}`, o);
};

impl['UI-027'] = async (p, o, ctx, env) => {
  const bad = [];
  for (const u of env.urls) {
    await p.goto(`${BASE}/${u}`); await p.waitForTimeout(100);
    const r = await p.evaluate(() => ({ cart: !!document.querySelector('.header-actions a[href="cart.html"]'), home: !!document.querySelector('.brand[href="home.html"]'), acc: !!document.querySelector('[data-testid="header-account-link"]'), crumb: !!document.querySelector('.breadcrumb') }));
    if (!r.cart || !r.home || !r.acc) bad.push(`${u}: thiếu liên kết header ${JSON.stringify(r)}`);
    if (!u.startsWith('home.html') && !r.crumb) bad.push(`${u}: thiếu breadcrumb`);
  }
  ok(bad.length === 0, '13 trang đều có liên kết giỏ, trang chủ, tài khoản; 12 trang trong có breadcrumb', bad.join('; '), o);
};

/* ---- chạy ---- */
const SHARED_ENV = new Set(['UI-001', 'UI-003', 'UI-008', 'UI-013', 'UI-015', 'UI-018', 'UI-019', 'UI-026', 'UI-027']);
(async () => {
  const server = spawn(process.execPath, [path.join(ROOT, 'scripts/test-server.cjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  for (let i = 0; i < 30; i++) { try { if ((await fetch(`${BASE}/home.html`)).ok) break; } catch { /* chờ */ } await sleep(200); }
  const browser = await chromium.launch({ channel: fs.existsSync(path.join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe')) ? 'chrome' : undefined });
  const started = new Date(); const results = [];
  const env = await seeded(browser); env.browser = browser;

  for (const meta of CASES) {
    const id = meta.id; const obs = []; let status = 'Pass', note = '';
    /* Ca quét nhiều trang dùng bối cảnh có sẵn đơn thật để mở đúng trạng thái đã đặt hàng; ca còn lại dùng bối cảnh sạch */
    const shared = SHARED_ENV.has(id);
    const ctx = shared ? env.ctx : await browser.newContext(CTX_OPTS); const page = shared ? env.page : await ctx.newPage();
    const t0 = Date.now();
    try { await impl[id](page, obs, ctx, env); }
    catch (e) { status = e.blocked ? 'Blocked' : 'Fail'; note = e.message; if (!(e instanceof Check)) obs.push('✘ Lỗi thực thi: ' + e.message.split('\n')[0]); }
    try { await page.screenshot({ path: path.join(SHOTS, `${id}.png`), fullPage: true }); } catch { /* bỏ qua */ }
    results.push({ id, type: meta.type, func: meta.func, goal: meta.goal, expected: meta.expected, priority: meta.priority, status, actual: obs.join(' | '), failure: note, evidence: `anh/${id}.png`, ms: Date.now() - t0 });
    console.log(`${status === 'Pass' ? 'PASS   ' : status === 'Fail' ? 'FAIL   ' : 'BLOCKED'} ${id} ${meta.goal}${note ? '\n          -> ' + note : ''}`);
    if (!shared) await ctx.close();
  }
  await env.ctx.close();
  const envInfo = { browser: `Chrome ${browser.version()}`, os: `${process.platform} ${require('os').release()}`, node: process.version, url: BASE, source: 'aurel-watch-qa ' + require(path.join(ROOT, 'package.json')).version };
  await browser.close(); server.kill();

  /* ---- lịch sử cộng dồn ---- */
  const histFile = path.join(OUT, 'history.json');
  const history = fs.existsSync(histFile) ? JSON.parse(fs.readFileSync(histFile, 'utf8')) : { runs: [] };
  const runId = `R${String(history.runs.length + 1).padStart(2, '0')}`;
  history.runs.push({ runId, startedAt: started.toISOString(), env: envInfo, executor: 'Claude (AI) điều khiển trình duyệt tự động; không phải thao tác tay của sinh viên', results });
  fs.writeFileSync(histFile, JSON.stringify(history, null, 2));

  const cnt = (r, s) => r.results.filter(x => x.status === s).length;
  const fmt = iso => new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium' });
  const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  let md = `# Lịch sử kiểm thử giao diện, truy cập, tương thích, bảo mật cơ bản và khả năng sử dụng (UI-001…027)\n\n`;
  md += `**Người thực thi:** Claude (AI) điều khiển trình duyệt tự động. **Không phải thao tác tay của sinh viên.** Mô tả ca: [TEST-CASES-UI.csv](../../TEST-CASES-UI.csv). Mỗi lần chạy được cộng dồn; Fail thật được giữ nguyên trong lịch sử, không xóa khi đã sửa.\n\n## Các lần chạy\n\n| Lần | Thời điểm | Pass | Fail | Blocked | Trình duyệt |\n|---|---|---|---|---|---|\n`;
  for (const r of history.runs) md += `| ${r.runId} | ${fmt(r.startedAt)} | ${cnt(r, 'Pass')} | ${cnt(r, 'Fail')} | ${cnt(r, 'Blocked')} | ${r.env.browser} |\n`;
  const latest = history.runs[history.runs.length - 1];
  md += `\n## Chi tiết lần mới nhất (${latest.runId})\n\n| Ca | Loại | Mục tiêu | Trạng thái | Kết quả thực tế | Bằng chứng |\n|---|---|---|---|---|---|\n`;
  for (const r of latest.results) md += `| ${r.id} | ${esc(r.type)} | ${esc(r.goal)} | **${r.status}**${r.cause ? ' (' + esc(r.cause) + ')' : ''} | ${esc(r.actual)} | [ảnh](${r.evidence}) |\n`;
  md += `\n## Diễn biến từng ca qua các lần chạy\n\n| Ca | ${history.runs.map(r => r.runId).join(' | ')} |\n|---|${history.runs.map(() => '---').join('|')}|\n`;
  for (const m of CASES) md += `| ${m.id} | ${history.runs.map(r => { const x = r.results.find(y => y.id === m.id); return x ? (x.cause && /bài test/.test(x.cause) ? x.status + '*' : x.status) : '—'; }).join(' | ')} |\n`;
  md += `\n\\* Fail do lỗi của chính bài test, không phải lỗi website (nguyên nhân trong history.json). Riêng UI-013 ở R01 là **lỗi thật** của website (trang không có thẻ h1 ở trạng thái chưa đăng nhập / đơn không hợp lệ) và đã được sửa.\n`;
  md += `\nBằng chứng: [anh](anh/), [history.json](history.json), bộ chạy [run-ui-cases.cjs](run-ui-cases.cjs).\n`;
  fs.writeFileSync(path.join(OUT, 'LICH-SU-KIEM-THU-GIAO-DIEN.md'), md);

  const q = s => `"${String(s).replace(/"/g, '""')}"`;
  let out = 'Run,Test Case ID,Loại,Chức năng,Mục tiêu,Kết quả mong đợi,Kết quả thực tế,Trạng thái,Nguyên nhân,Bằng chứng,Người thực thi,Thời điểm\n';
  for (const r of history.runs) for (const x of r.results) out += [r.runId, x.id, x.type, x.func, x.goal, x.expected, x.actual, x.status, x.cause || '', x.evidence, 'Claude (AI) qua trình duyệt tự động', r.startedAt].map(q).join(',') + '\n';
  fs.writeFileSync(path.join(OUT, 'ket-qua-thuc-thi.csv'), '\uFEFF' + out);

  let spec = 'Test Case ID,Requirement ID,Chức năng,Mục tiêu,Tiền điều kiện,Dữ liệu,Các bước,Kết quả mong đợi,Ưu tiên,Loại\n';
  for (const m of CASES) spec += [m.id, ({ 'Giao diện': 'UI-VISUAL', 'Responsive': 'UI-RESP', 'Khả năng truy cập': 'UI-A11Y', 'Tương thích': 'UI-COMPAT', 'Bảo mật cơ bản': 'UI-SEC', 'Khả năng sử dụng': 'UI-USAB' })[m.type], m.func, m.goal, 'Chạy máy chủ local npm start', '13 trang khách; dữ liệu mặc định', m.steps, m.expected, m.priority, m.type].map(q).join(',') + '\n';
  fs.writeFileSync(path.join(ROOT, 'docs/TEST-CASES-UI.csv'), '\uFEFF' + spec);

  const lastRun = history.runs[history.runs.length - 1];
  console.log(`\n${runId}: ${cnt(lastRun, 'Pass')} Pass / ${cnt(lastRun, 'Fail')} Fail / ${cnt(lastRun, 'Blocked')} Blocked trên ${results.length} ca`);
  process.exit(cnt(lastRun, 'Fail') ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
