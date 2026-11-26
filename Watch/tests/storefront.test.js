const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../store.js');

function makeStorage() {
  const map = new Map();
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(String(k)); },
    clear() { map.clear(); }
  };
}

globalThis.localStorage = makeStorage();
globalThis.sessionStorage = makeStorage();
const SF = require('../storefront.js');

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
  globalThis.localStorage.setItem(S.KEY, JSON.stringify(S.seed()));
});

test('WatchStore.checkoutOrder tạo đơn nháp chưa trừ tồn kho và chống gửi lặp bằng idempotencyKey', () => {
  const db = S.seed();
  const payload = {
    customerAccountId: 'ca_1',
    name: 'Nguyễn Minh Khang',
    phone: '0901234567',
    email: 'khang@example.com',
    address: '12 Đường Mẫu, Quận 1, TP.HCM',
    note: 'Giao giờ hành chính',
    lines: [{ productId: 'p1', quantity: 2 }],
    idempotencyKey: 'idem-001'
  };
  const first = S.checkoutOrder(db, payload);
  assert.equal(first.duplicate, false);
  assert.equal(first.order.status, 'draft');
  assert.equal(first.order.total, 25000000);
  assert.equal(first.order.customerAccountId, 'ca_1');
  assert.equal(db.products[0].stock, 8);

  const second = S.checkoutOrder(db, payload);
  assert.equal(second.duplicate, true);
  assert.equal(second.order.id, first.order.id);
  assert.equal(db.orders.length, 1);

  // Tương thích hoàn toàn với restoreBusiness (xuất/nhập JSON)
  const { users, ...backup } = S.clone(db);
  const restored = S.restoreBusiness(S.seed(), 'u1', backup);
  assert.equal(restored.orders.length, 1);
  assert.equal(restored.orders[0].customerAccountId, 'ca_1');
});

test('WatchStore.checkoutOrder phát hiện thay đổi giá và chặn sản phẩm hết hàng/ngừng bán', () => {
  const db = S.seed();
  assert.throws(
    () => S.checkoutOrder(db, {
      name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
      lines: [{ productId: 'p1', quantity: 1 }],
      expectedPrices: { p1: 1000 }
    }),
    err => err.code === 'PRICE_CHANGED'
  );
  assert.throws(
    () => S.checkoutOrder(db, {
      name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
      lines: [{ productId: 'p7', quantity: 1 }]
    }),
    /không còn kinh doanh/
  );
  assert.throws(
    () => S.checkoutOrder(db, {
      name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
      lines: [{ productId: 'p1', quantity: 99 }]
    }),
    /chỉ còn 8 chiếc/
  );
});

test('Giỏ hàng không tin giá bị sửa trong localStorage và cảnh báo khi giá cửa hàng đổi', () => {
  SF.addToCart('p1', 2);
  // Giả lập người dùng sửa tay localStorage để hạ giá còn 1 VND
  const rawCart = JSON.parse(globalThis.localStorage.getItem(SF.KEYS.cart));
  rawCart.items[0].price = 1;
  globalThis.localStorage.setItem(SF.KEYS.cart, JSON.stringify(rawCart));

  const resolved1 = SF.getResolvedCart();
  assert.equal(resolved1.lines[0].livePrice, 12500000);
  assert.equal(resolved1.validTotal, 25000000);

  // Admin đổi giá p1 trong chrono-watch-v1
  const db = JSON.parse(globalThis.localStorage.getItem(S.KEY));
  db.products[0].price = 13500000;
  globalThis.localStorage.setItem(S.KEY, JSON.stringify(db));

  const resolved2 = SF.getResolvedCart();
  assert.equal(resolved2.hasPriceChanges, true);
  assert.equal(resolved2.lines[0].livePrice, 13500000);
  assert.equal(resolved2.validTotal, 27000000);
});

test('Đăng ký, đăng nhập khách tách biệt với admin/staff và cô lập đơn giữa hai tài khoản', async () => {
  assert.throws(
    () => SF.loginCustomer({ email: 'admin', password: 'Admin@123' }),
    /Quản lý cửa hàng/
  );
  assert.throws(
    () => SF.registerCustomer({ name: 'A', email: 'a@example.com', phone: '0901234567', password: 'Admin@123', confirmPassword: 'Admin@123' }),
    /mật khẩu mặc định/
  );

  const accA = SF.registerCustomer({
    name: 'Khách A', email: 'a@example.com', phone: '0901111111',
    password: 'CustomerA@123', confirmPassword: 'CustomerA@123'
  });
  assert.equal(SF.getCurrentCustomer().id, accA.id);

  SF.addToCart('p1', 1);
  const { order: orderA } = await SF.placeOrder({
    name: 'Khách A', phone: '0901111111', email: 'a@example.com', address: 'Địa chỉ mẫu A'
  }, { p1: 12500000 }, 'idem-a');
  assert.equal(SF.canViewOrder(orderA), true);

  // Đăng ký tài khoản B: không được thấy đơn của A
  SF.logoutCustomer();
  SF.registerCustomer({
    name: 'Khách B', email: 'b@example.com', phone: '0902222222',
    password: 'CustomerB@123', confirmPassword: 'CustomerB@123'
  });
  assert.equal(SF.canViewOrder(orderA), false);
  assert.equal(SF.getVisibleOrdersForCurrentUser().length, 0);

  // Đăng xuất sang vãng lai: cũng không được thấy đơn của A
  SF.logoutCustomer();
  assert.equal(SF.canViewOrder(orderA), false);
  assert.throws(() => SF.lookupGuestOrder(orderA.code, '0901111111'), /tài khoản khách đã đăng ký/);
});

test('Liên hệ mô phỏng validate đầu vào và lưu cục bộ', () => {
  assert.throws(() => SF.submitContactMessage({ name: '', email: 'sai', subject: '', message: 'ngắn' }));
  const saved = SF.submitContactMessage({
    name: 'Khách thử', email: 'thu@example.com', phone: '0909999999',
    subject: 'Phản hồi kiểm thử / đồ án', message: 'Nội dung kiểm thử dài hơn 10 ký tự.'
  });
  assert.ok(saved.id.startsWith('msg'));
  assert.equal(SF.readContactMessages().length, 1);
});

test('Khách vãng lai trùng SĐT+email với khách của quản lý không ghi đè hồ sơ khách đó', () => {
  const db = S.seed();
  const before = S.clone(db.customers.find(c => c.id === 'c1'));
  const res = S.checkoutOrder(db, {
    name: 'Người Khác', phone: before.phone, email: before.email.toUpperCase(), address: 'Địa chỉ giao khác 99',
    lines: [{ productId: 'p2', quantity: 1 }]
  });
  assert.equal(res.order.customerId, 'c1');
  assert.deepEqual(db.customers.find(c => c.id === 'c1'), before);
  assert.equal(res.order.shipping.name, 'Người Khác');
  assert.equal(res.order.shipping.address, 'Địa chỉ giao khác 99');
  assert.equal(db.customers.length, 2);
});

test('Giá và tổng tiền đơn lấy từ dữ liệu cửa hàng, không từ giá do giỏ/form cung cấp', () => {
  const db = S.seed();
  const res = S.checkoutOrder(db, {
    name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
    lines: [{ productId: 'p1', quantity: 2, price: 1 }, { productId: 'p6', quantity: 1, price: 1 }]
  });
  assert.equal(res.order.items[0].price, 12500000);
  assert.equal(res.order.total, 2 * 12500000 + 1250000);
});

test('Số lượng đặt hàng sai (thập phân, âm, 0, chữ, quá lớn) bị từ chối và không tạo đơn', () => {
  const db = S.seed();
  for (const quantity of [1.5, 0, -1, 'abc', '', 9007199254740993, 1e21]) {
    assert.throws(() => S.checkoutOrder(db, {
      name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
      lines: [{ productId: 'p6', quantity }]
    }), undefined, `quantity=${String(quantity)}`);
  }
  assert.equal(db.orders.length, 0);
});

test('Hủy đơn nháp của khách không đổi tồn kho; xác nhận rồi hủy hoàn kho đúng một lần', () => {
  const db = S.seed();
  const mk = key => S.checkoutOrder(db, {
    name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
    lines: [{ productId: 'p3', quantity: 2 }], idempotencyKey: key
  }).order;
  const a = mk('k1');
  S.transition(db, 'u1', a.id, 'cancelled');
  assert.equal(db.products.find(p => p.id === 'p3').stock, 3);
  const b = mk('k2');
  S.transition(db, 'u1', b.id, 'confirmed');
  assert.equal(db.products.find(p => p.id === 'p3').stock, 1);
  S.transition(db, 'u1', b.id, 'cancelled');
  assert.equal(db.products.find(p => p.id === 'p3').stock, 3);
  assert.throws(() => S.transition(db, 'u1', b.id, 'cancelled'), /đã được xử lý/);
  assert.equal(db.products.find(p => p.id === 'p3').stock, 3);
});

test('Xác nhận đơn kiểm tra đủ tồn mọi dòng trước khi trừ (không trừ một phần)', () => {
  const db = S.seed();
  const o = S.checkoutOrder(db, {
    name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
    lines: [{ productId: 'p6', quantity: 5 }, { productId: 'p3', quantity: 3 }]
  }).order;
  db.products.find(p => p.id === 'p3').stock = 1; // quản lý xuất bớt kho sau khi khách đặt
  assert.throws(() => S.transition(db, 'u1', o.id, 'confirmed'), /Không đủ tồn kho/);
  assert.equal(db.products.find(p => p.id === 'p6').stock, 20);
  assert.equal(db.orders[0].status, 'draft');
});

test('Giữ giá lịch sử khi quản lý đổi giá sản phẩm', () => {
  const db = S.seed();
  const o = S.checkoutOrder(db, {
    name: 'An', phone: '0901234567', email: 'an@example.com', address: 'Địa chỉ mẫu 01',
    lines: [{ productId: 'p1', quantity: 1 }]
  }).order;
  S.product(db, 'u1', { ...db.products[0], price: 99000000 }, 'p1');
  assert.equal(db.orders.find(x => x.id === o.id).items[0].price, 12500000);
  assert.equal(db.orders.find(x => x.id === o.id).total, 12500000);
});
