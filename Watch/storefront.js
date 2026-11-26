/* Lớp dữ liệu và giao diện dùng chung cho toàn bộ trang khách AUREL.
 * Lưu trữ trong localStorage/sessionStorage với namespace chrono-*.
 * Xác thực khách hàng và kiểm soát hiển thị đơn hàng ở đây chỉ là mô phỏng cục bộ phục vụ đồ án. */
(function (root) {
  'use strict';

  const S = typeof module !== 'undefined' ? require('./store.js') : root.WatchStore;
  const KEYS = {
    store: S ? S.KEY : 'chrono-watch-v1',
    accounts: 'chrono-customer-accounts-v1',
    session: 'chrono-customer-session-v1',
    cart: 'chrono-cart-v1',
    wishlist: 'chrono-wishlist-v1',
    contacts: 'chrono-contact-messages-v1',
    guestOrders: 'chrono-guest-orders-v1',
    lastOrder: 'chrono-last-order-v1'
  };

  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
  const RESERVED_ADMIN_IDENTIFIERS = new Set(['admin', 'staff']);
  const RESERVED_ADMIN_PASSWORDS = new Set(['Admin@123', 'Staff@123']);

  function getLocal() { return root.localStorage; }
  function getSession() { return root.sessionStorage; }

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0);

  const formatDate = iso => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
  };

  function statusMeta(status) {
    const map = {
      draft: { label: 'Nháp · Chờ xác nhận', short: 'Chờ xác nhận', cls: 'status-draft' },
      confirmed: { label: 'Đã xác nhận', short: 'Đã xác nhận', cls: 'status-confirmed' },
      cancelled: { label: 'Đã hủy', short: 'Đã hủy', cls: 'status-cancelled' }
    };
    return map[status] || { label: String(status || 'Không rõ'), short: String(status || '—'), cls: 'status-draft' };
  }

  function makeId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function hashLocal(input) {
    // Hàm băm mô phỏng đồng bộ cho đồ án local; KHÔNG thay thế mã hóa mật khẩu phía server (bcrypt/Argon2).
    const str = 'aurel-local-v1:' + String(input || '');
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'localv1_' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  function productFallbackImage(p) {
    if (!p) return 'assets/images/aurel-steel.png';
    if (p.type === 'Đồng hồ điện tử') return 'assets/images/aurel-digital.png';
    if (p.brand === 'Orient' || p.brand === 'Citizen') return 'assets/images/aurel-leather.png';
    return 'assets/images/aurel-steel.png';
  }

  function resolveProductImage(p) {
    let source = '';
    try { source = S.imageSource(p?.image); } catch { source = ''; }
    const fallback = productFallbackImage(p);
    return {
      src: source || fallback,
      fallback,
      isAI: !source,
      alt: source ? (p?.name || 'Ảnh sản phẩm') : `Ảnh minh họa AI — ${p?.type || 'đồng hồ AUREL'}`
    };
  }

  function getParam(name) {
    if (typeof location === 'undefined') return '';
    return new URLSearchParams(location.search).get(name) || '';
  }

  function safeNextUrl(raw, fallback = 'account.html') {
    const val = String(raw || '').trim();
    if (!val) return fallback;
    if (/^[a-zA-Z0-9_-]+\.html(\?[a-zA-Z0-9_=&%-]*)?(#[a-zA-Z0-9_-]*)?$/.test(val)) return val;
    return fallback;
  }

  function readStore(persistIfMissing = false) {
    const ls = getLocal();
    const raw = ls.getItem(KEYS.store);
    if (!raw) {
      const seeded = S.seed();
      if (persistIfMissing) ls.setItem(KEYS.store, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return S.migrate(parsed);
  }

  async function writeStore(mutator) {
    const ls = getLocal();
    const run = () => {
      const fresh = readStore(true);
      const result = mutator(fresh);
      ls.setItem(KEYS.store, JSON.stringify(fresh));
      emitStateChange('store');
      return result;
    };
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return navigator.locks.request('chrono-write', run);
    }
    return run();
  }

  function emitStateChange(scope) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aurel:state-change', { detail: { scope } }));
    }
  }

  /* ==================== TÀI KHOẢN KHÁCH (MÔ PHỎNG LOCAL) ==================== */
  function readAccounts() {
    try {
      const raw = getLocal().getItem(KEYS.accounts);
      if (!raw) return { version: 1, accounts: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.accounts)) return { version: 1, accounts: [] };
      return { version: 1, accounts: parsed.accounts };
    } catch {
      return { version: 1, accounts: [] };
    }
  }

  function writeAccounts(data) {
    getLocal().setItem(KEYS.accounts, JSON.stringify({ version: 1, accounts: data.accounts }));
    emitStateChange('accounts');
  }

  function sanitizeAccount(acc) {
    if (!acc) return null;
    return {
      id: acc.id,
      name: acc.name,
      email: acc.email,
      phone: acc.phone,
      address: acc.address || '',
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt || acc.createdAt
    };
  }

  function getCustomerSession() {
    try {
      const raw = getLocal().getItem(KEYS.session);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.accountId || typeof s.expires !== 'number' || Date.now() >= s.expires) {
        getLocal().removeItem(KEYS.session);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  function getCurrentCustomer() {
    const sess = getCustomerSession();
    if (!sess) return null;
    const { accounts } = readAccounts();
    const found = accounts.find(a => a.id === sess.accountId);
    if (!found) {
      getLocal().removeItem(KEYS.session);
      return null;
    }
    return sanitizeAccount(found);
  }

  function setCustomerSession(account) {
    const sess = {
      accountId: account.id,
      email: account.email,
      expires: Date.now() + SESSION_TTL_MS
    };
    getLocal().setItem(KEYS.session, JSON.stringify(sess));
    emitStateChange('session');
    return sess;
  }

  function logoutCustomer() {
    getLocal().removeItem(KEYS.session);
    emitStateChange('session');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 150;
  }

  function validatePhone(phone) {
    return /^0\d{9}$/.test(phone);
  }

  function registerCustomer(input) {
    const errors = {};
    const name = String(input?.name || '').trim();
    const emailRaw = String(input?.email || '').trim();
    const email = emailRaw.toLowerCase();
    const phone = String(input?.phone || '').trim();
    const address = String(input?.address || '').trim().slice(0, 300);
    const password = String(input?.password || '');
    const confirmPassword = String(input?.confirmPassword ?? '');

    if (!name || name.length > 100) errors.name = 'Họ tên phải có từ 1 đến 100 ký tự.';
    if (RESERVED_ADMIN_IDENTIFIERS.has(email) || RESERVED_ADMIN_IDENTIFIERS.has(name.toLowerCase())) {
      errors.email = 'Tài khoản khách tách biệt với tài khoản quản trị/nhân viên (admin/staff). Vui lòng dùng email khách hàng.';
    } else if (!validateEmail(email)) {
      errors.email = 'Email không đúng định dạng (ví dụ: khach@example.com).';
    }
    if (!validatePhone(phone)) errors.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.';
    if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    } else if (RESERVED_ADMIN_PASSWORDS.has(password)) {
      errors.password = 'Không sử dụng mật khẩu mặc định của tài khoản quản lý cho tài khoản khách.';
    }
    if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';

    const data = readAccounts();
    if (!errors.email && data.accounts.some(a => a.email.toLowerCase() === email)) {
      errors.email = 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.';
    }

    if (Object.keys(errors).length) {
      const err = new Error(Object.values(errors)[0]);
      err.fields = errors;
      throw err;
    }

    const now = new Date().toISOString();
    const record = {
      id: makeId('ca'),
      name,
      email,
      phone,
      address,
      passwordHash: hashLocal(password),
      createdAt: now,
      updatedAt: now
    };
    data.accounts.push(record);
    writeAccounts(data);
    setCustomerSession(record);
    return sanitizeAccount(record);
  }

  function loginCustomer(input) {
    const errors = {};
    const rawEmail = String(input?.email || '').trim();
    const email = rawEmail.toLowerCase();
    const password = String(input?.password || '');

    if (RESERVED_ADMIN_IDENTIFIERS.has(email) || (email === 'admin' && password === 'Admin@123')) {
      const err = new Error('Tài khoản admin/staff dành cho trang Quản lý cửa hàng (index.html), không dùng để đăng nhập khách hàng.');
      err.fields = { email: err.message };
      throw err;
    }
    if (!email) errors.email = 'Vui lòng nhập email đã đăng ký.';
    else if (!validateEmail(email)) errors.email = 'Email không đúng định dạng.';
    if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
    if (Object.keys(errors).length) {
      const err = new Error(Object.values(errors)[0]);
      err.fields = errors;
      throw err;
    }

    const { accounts } = readAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === email);
    if (!found || found.passwordHash !== hashLocal(password)) {
      const err = new Error('Email hoặc mật khẩu không đúng.');
      err.fields = { form: err.message };
      throw err;
    }

    setCustomerSession(found);
    return sanitizeAccount(found);
  }

  async function updateCustomerProfile(input) {
    const current = getCurrentCustomer();
    if (!current) throw new Error('Bạn chưa đăng nhập tài khoản khách.');
    const errors = {};
    const name = String(input?.name || '').trim();
    const phone = String(input?.phone || '').trim();
    const address = String(input?.address || '').trim();

    if (!name || name.length > 100) errors.name = 'Họ tên phải có từ 1 đến 100 ký tự.';
    if (!validatePhone(phone)) errors.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.';
    if (address.length > 300) errors.address = 'Địa chỉ tối đa 300 ký tự.';

    if (Object.keys(errors).length) {
      const err = new Error(Object.values(errors)[0]);
      err.fields = errors;
      throw err;
    }

    const data = readAccounts();
    const target = data.accounts.find(a => a.id === current.id);
    if (!target) throw new Error('Không tìm thấy hồ sơ tài khoản.');
    target.name = name;
    target.phone = phone;
    target.address = address;
    target.updatedAt = new Date().toISOString();
    writeAccounts(data);

    // Đồng bộ hồ sơ khách hàng trong chrono-watch-v1 nếu tài khoản đã từng liên kết bản ghi customer.
    try {
      const rawStore = getLocal().getItem(KEYS.store);
      if (rawStore) {
        await writeStore(db => {
          const linked = db.customers.find(c => c.accountId === current.id);
          if (linked) {
            linked.name = name;
            linked.phone = phone;
            linked.address = address;
          }
        });
      }
    } catch { /* Không làm gián đoạn lưu hồ sơ nếu dữ liệu cửa hàng chưa khởi tạo */ }

    return sanitizeAccount(target);
  }

  /* ==================== GIỎ HÀNG (ĐỐI CHIẾU GIÁ/TỒN TỪ CỬA HÀNG) ==================== */
  function readCart() {
    try {
      const raw = getLocal().getItem(KEYS.cart);
      if (!raw) return { version: 1, items: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return { version: 1, items: [] };
      const clean = [];
      const seen = new Set();
      for (const item of parsed.items) {
        if (!item || typeof item.productId !== 'string' || !item.productId || seen.has(item.productId)) continue;
        const qty = Number(item.quantity);
        if (!Number.isSafeInteger(qty) || qty < 1) continue;
        seen.add(item.productId);
        // KHÔNG bao giờ tin trường price người dùng tự sửa trong localStorage giỏ hàng.
        // Chỉ giữ addedPrice (nếu là số nguyên dương) để hiển thị thông báo đổi giá tham khảo.
        const addedPrice = Number.isSafeInteger(Number(item.addedPrice)) && Number(item.addedPrice) > 0
          ? Number(item.addedPrice)
          : null;
        clean.push({ productId: item.productId, quantity: qty, addedPrice, addedAt: item.addedAt || '' });
      }
      return { version: 1, items: clean };
    } catch {
      return { version: 1, items: [] };
    }
  }

  function writeCart(cart) {
    getLocal().setItem(KEYS.cart, JSON.stringify({ version: 1, items: cart.items }));
    emitStateChange('cart');
  }

  function getCartCount() {
    return readCart().items.reduce((sum, item) => sum + item.quantity, 0);
  }

  function addToCart(productId, quantity = 1) {
    const qty = Number(quantity);
    if (String(quantity).trim() === '' || !Number.isSafeInteger(qty) || qty < 1) {
      throw new Error('Số lượng phải là số nguyên từ 1 trở lên.');
    }
    const db = readStore();
    const product = db.products.find(p => p.id === productId);
    if (!product) throw new Error('Không tìm thấy sản phẩm trong cửa hàng.');
    if (!product.active) throw new Error('Sản phẩm này hiện đã ngừng kinh doanh.');
    if (product.stock <= 0) throw new Error('Sản phẩm hiện đang hết hàng.');

    const cart = readCart();
    const existing = cart.items.find(i => i.productId === productId);
    const nextQty = (existing ? existing.quantity : 0) + qty;
    if (nextQty > product.stock) {
      throw new Error(`Không đủ tồn kho. Hiện chỉ còn ${product.stock} chiếc (giỏ đã có ${existing ? existing.quantity : 0}).`);
    }
    if (existing) {
      existing.quantity = nextQty;
      existing.addedPrice = product.price;
    } else {
      cart.items.push({ productId, quantity: qty, addedPrice: product.price, addedAt: new Date().toISOString() });
    }
    writeCart(cart);
    return { product, quantity: nextQty, totalCount: getCartCount() };
  }

  function updateCartItem(productId, quantity) {
    const qty = Number(quantity);
    if (String(quantity).trim() === '' || !Number.isSafeInteger(qty) || qty < 1) {
      throw new Error('Số lượng phải là số nguyên từ 1 trở lên.');
    }
    const db = readStore();
    const product = db.products.find(p => p.id === productId);
    if (!product || !product.active) {
      throw new Error('Sản phẩm không còn kinh doanh. Vui lòng xóa khỏi giỏ hàng.');
    }
    if (product.stock <= 0) {
      throw new Error('Sản phẩm hiện đã hết hàng. Vui lòng xóa khỏi giỏ hàng.');
    }
    if (qty > product.stock) {
      throw new Error(`Số lượng vượt tồn kho (tối đa ${product.stock} chiếc).`);
    }
    const cart = readCart();
    const item = cart.items.find(i => i.productId === productId);
    if (!item) throw new Error('Sản phẩm không có trong giỏ hàng.');
    item.quantity = qty;
    item.addedPrice = product.price;
    writeCart(cart);
    return item;
  }

  function removeFromCart(productId) {
    const cart = readCart();
    cart.items = cart.items.filter(i => i.productId !== productId);
    writeCart(cart);
  }

  function clearCart() {
    writeCart({ version: 1, items: [] });
  }

  function syncCartAddedPrices() {
    const db = readStore();
    const cart = readCart();
    cart.items.forEach(item => {
      const p = db.products.find(x => x.id === item.productId);
      if (p) item.addedPrice = p.price;
    });
    writeCart(cart);
  }

  function getResolvedCart() {
    const db = readStore();
    const cart = readCart();
    const lines = cart.items.map(item => {
      const product = db.products.find(p => p.id === item.productId) || null;
      if (!product) {
        return {
          productId: item.productId,
          quantity: item.quantity,
          product: null,
          livePrice: 0,
          addedPrice: item.addedPrice,
          priceChanged: false,
          exists: false,
          active: false,
          stock: 0,
          lineTotal: 0,
          status: 'missing',
          errorMessage: 'Sản phẩm không còn tồn tại trong dữ liệu cửa hàng. Vui lòng xóa khỏi giỏ.'
        };
      }
      const livePrice = product.price;
      const priceChanged = item.addedPrice !== null && item.addedPrice !== livePrice;
      let status = 'ok';
      let errorMessage = '';
      if (!product.active) {
        status = 'inactive';
        errorMessage = 'Sản phẩm đã ngừng kinh doanh. Vui lòng xóa khỏi giỏ hàng để tiếp tục đặt hàng.';
      } else if (product.stock <= 0) {
        status = 'out_of_stock';
        errorMessage = 'Sản phẩm hiện đã hết hàng. Vui lòng xóa khỏi giỏ hàng.';
      } else if (item.quantity > product.stock) {
        status = 'exceeds_stock';
        errorMessage = `Chỉ còn ${product.stock} chiếc trong kho. Vui lòng giảm số lượng.`;
      }
      const lineTotal = status === 'ok' ? livePrice * item.quantity : 0;
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        livePrice,
        addedPrice: item.addedPrice,
        priceChanged,
        exists: true,
        active: product.active,
        stock: product.stock,
        lineTotal,
        status,
        errorMessage
      };
    });

    const totalCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    const validTotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const hasBlockingIssues = lines.some(l => l.status !== 'ok');
    const hasPriceChanges = lines.some(l => l.priceChanged && l.status === 'ok');
    return { lines, totalCount, validTotal, hasBlockingIssues, hasPriceChanges };
  }

  /* ==================== YÊU THÍCH (WISHLIST) ==================== */
  function readWishlist() {
    try {
      const raw = getLocal().getItem(KEYS.wishlist);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.productIds) ? parsed.productIds : [];
      return [...new Set(list.filter(x => typeof x === 'string' && x))];
    } catch {
      return [];
    }
  }

  function writeWishlist(ids) {
    getLocal().setItem(KEYS.wishlist, JSON.stringify({ version: 1, productIds: [...new Set(ids)] }));
    emitStateChange('wishlist');
  }

  function isWishlisted(productId) {
    return readWishlist().includes(productId);
  }

  function toggleWishlist(productId) {
    const list = readWishlist();
    const exists = list.includes(productId);
    const next = exists ? list.filter(id => id !== productId) : [productId, ...list];
    writeWishlist(next);
    return !exists;
  }

  function removeFromWishlist(productId) {
    writeWishlist(readWishlist().filter(id => id !== productId));
  }

  function getWishlistCount() {
    return readWishlist().length;
  }

  /* ==================== ĐẶT HÀNG & KIỂM SOÁT HIỂN THỊ ĐƠN (LOCAL) ==================== */
  function getGuestOrderIds() {
    try {
      const raw = getSession().getItem(KEYS.guestOrders);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  function recordGuestOrder(orderId) {
    if (!orderId) return;
    const ids = getGuestOrderIds();
    if (!ids.includes(orderId)) {
      ids.unshift(orderId);
      getSession().setItem(KEYS.guestOrders, JSON.stringify(ids.slice(0, 30)));
    }
  }

  function setLastOrder(info) {
    try { getSession().setItem(KEYS.lastOrder, JSON.stringify(info)); } catch { /* ignore */ }
  }

  function getLastOrder() {
    try { return JSON.parse(getSession().getItem(KEYS.lastOrder) || 'null'); } catch { return null; }
  }

  async function placeOrder(formData, expectedPrices, idempotencyKey) {
    const current = getCurrentCustomer();
    const resolved = getResolvedCart();
    if (!resolved.lines.length) throw new Error('Giỏ hàng đang trống.');
    if (resolved.hasBlockingIssues) throw new Error('Giỏ hàng có sản phẩm hết hàng, ngừng bán hoặc vượt tồn kho. Vui lòng cập nhật lại.');

    const lines = resolved.lines.map(l => ({ productId: l.productId, quantity: l.quantity }));
    const res = await writeStore(db => S.checkoutOrder(db, {
      customerAccountId: current ? current.id : null,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      note: formData.note || '',
      lines,
      expectedPrices,
      idempotencyKey
    }));

    if (!current) {
      recordGuestOrder(res.order.id);
    }
    setLastOrder({ orderId: res.order.id, code: res.order.code, createdAt: res.order.createdAt });
    clearCart();
    return res;
  }

  function canViewOrder(order) {
    if (!order) return false;
    const current = getCurrentCustomer();
    if (current) {
      if (order.customerAccountId && order.customerAccountId === current.id) return true;
      if (!order.customerAccountId && getGuestOrderIds().includes(order.id)) return true;
      return false;
    }
    // Khách vãng lai: chỉ xem đơn thuộc phiên vừa đặt hoặc đã đối chiếu hợp lệ trong phiên này
    // và đơn đó không thuộc một tài khoản khách đã đăng ký khác.
    if (order.customerAccountId) return false;
    return getGuestOrderIds().includes(order.id);
  }

  function getVisibleOrdersForCurrentUser() {
    const db = readStore();
    const current = getCurrentCustomer();
    if (current) {
      return db.orders.filter(o => o.customerAccountId === current.id);
    }
    const guestIds = new Set(getGuestOrderIds());
    return db.orders.filter(o => !o.customerAccountId && guestIds.has(o.id));
  }

  function lookupGuestOrder(orderCode, contact) {
    const code = String(orderCode || '').trim().toUpperCase();
    const needle = String(contact || '').trim().toLowerCase();
    if (!code) throw new Error('Vui lòng nhập mã đơn hàng (ví dụ: DH0001).');
    if (!needle) throw new Error('Vui lòng nhập số điện thoại hoặc email đã dùng khi đặt hàng.');

    const db = readStore();
    const order = db.orders.find(o => String(o.code || '').toUpperCase() === code);
    if (!order) throw new Error('Không tìm thấy đơn hàng khớp với thông tin đối chiếu.');

    const customer = db.customers.find(c => c.id === order.customerId);
    const phones = [order.shipping?.phone, customer?.phone].filter(Boolean).map(v => String(v).trim().toLowerCase());
    const emails = [order.shipping?.email, customer?.email].filter(Boolean).map(v => String(v).trim().toLowerCase());
    if (!phones.includes(needle) && !emails.includes(needle)) {
      throw new Error('Không tìm thấy đơn hàng khớp với thông tin đối chiếu.');
    }

    if (order.customerAccountId) {
      const current = getCurrentCustomer();
      if (!current || current.id !== order.customerAccountId) {
        throw new Error('Đơn hàng này gắn với một tài khoản khách đã đăng ký. Vui lòng đăng nhập đúng tài khoản đó để xem.');
      }
      return order;
    }

    recordGuestOrder(order.id);
    return order;
  }

  /* ==================== LIÊN HỆ MÔ PHỎNG LOCAL ==================== */
  function readContactMessages() {
    try {
      const raw = getLocal().getItem(KEYS.contacts);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.messages) ? parsed.messages : [];
    } catch {
      return [];
    }
  }

  function submitContactMessage(input) {
    const errors = {};
    const name = String(input?.name || '').trim();
    const email = String(input?.email || '').trim().toLowerCase();
    const phone = String(input?.phone || '').trim();
    const subject = String(input?.subject || '').trim();
    const message = String(input?.message || '').trim();

    if (!name || name.length > 100) errors.name = 'Họ tên phải có từ 1 đến 100 ký tự.';
    if (!validateEmail(email)) errors.email = 'Email không đúng định dạng.';
    if (phone && !validatePhone(phone)) errors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';
    if (!subject || subject.length > 120) errors.subject = 'Vui lòng chọn hoặc nhập chủ đề liên hệ.';
    if (message.length < 10 || message.length > 1000) errors.message = 'Nội dung cần từ 10 đến 1000 ký tự.';

    if (Object.keys(errors).length) {
      const err = new Error(Object.values(errors)[0]);
      err.fields = errors;
      throw err;
    }

    const messages = readContactMessages();
    const record = {
      id: makeId('msg'),
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString()
    };
    messages.unshift(record);
    getLocal().setItem(KEYS.contacts, JSON.stringify({ version: 1, messages: messages.slice(0, 50) }));
    emitStateChange('contacts');
    return record;
  }

  /* ==================== HEADER / FOOTER ĐỒNG BỘ ==================== */
  function headerMarkup(options = {}) {
    const active = options.activeNav || '';
    const showSearch = options.showSearch !== false;
    const customer = getCurrentCustomer();
    const cartCount = getCartCount();
    const wishCount = getWishlistCount();
    const accountHref = customer ? 'account.html' : 'login.html';
    const accountLabel = customer ? customer.name.split(/\s+/).slice(-1)[0] : 'Đăng nhập';
    const navLink = (href, label, key) =>
      `<a href="${href}"${active === key ? ' aria-current="page" class="active"' : ''}>${label}</a>`;

    return `
      <div class="announcement">
        <div class="wrap announcement-inner">
          <span>AUREL · Dành thời gian cho những điều xứng đáng · Đồ án thực hành local</span>
          <span class="announcement-links">
            <a href="index.html" data-testid="admin-portal-link">Quản lý cửa hàng</a>
            <a href="qa.html">Không gian QA</a>
          </span>
        </div>
      </div>
      <header class="site-header">
        <div class="wrap header-inner">
          <a class="brand" href="home.html" aria-label="AUREL — Trang chủ">
            <svg class="brand-mark" viewBox="0 0 40 44" fill="none" aria-hidden="true">
              <path d="M5 39L20 5l15 34M11 26h18M8 33h24" stroke="currentColor" stroke-width="1.4"/>
              <circle cx="20" cy="22" r="20" stroke="currentColor" stroke-width=".7"/>
            </svg>
            <span>AUREL<small>THE WATCH EDIT</small></span>
          </a>
          <nav class="desktop-nav" aria-label="Điều hướng khách hàng">
            ${navLink('home.html#san-pham', 'Bộ sưu tập', 'collection')}
            ${navLink('about.html', 'Giới thiệu', 'about')}
            ${navLink('contact.html', 'Liên hệ', 'contact')}
          </nav>
          ${showSearch ? `
          <form class="search" id="search-form" role="search" action="home.html#san-pham">
            <label class="sr-only" for="search-products">Tìm đồng hồ</label>
            <input id="search-products" name="q" placeholder="Tìm chiếc đồng hồ của bạn…" autocomplete="off">
            <button type="submit" aria-label="Tìm kiếm">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/></svg>
            </button>
          </form>` : ''}
          <div class="header-actions">
            <a class="header-action${active === 'wishlist' ? ' active' : ''}" href="wishlist.html" data-testid="header-wishlist-link" aria-label="Yêu thích">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7.5-4.8-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.7 1.1 5 2.8 1.3-1.7 3-2.8 5-2.8 3.4 0 5.6 3.3 4.3 6.7-1.8 4.5-9.3 9.3-9.3 9.3z"/></svg>
              <span class="action-label">Yêu thích</span>
              <span class="count-pill" data-testid="header-wishlist-count"${wishCount ? '' : ' hidden'}>${wishCount}</span>
            </a>
            <a class="header-action${active === 'cart' ? ' active' : ''}" href="cart.html" data-testid="header-cart-link" aria-label="Giỏ hàng">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 7h12l-1.2 13H7.2L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
              <span class="action-label">Giỏ hàng</span>
              <span class="count-pill" data-testid="header-cart-count">${cartCount}</span>
            </a>
            <a class="header-action${active === 'account' ? ' active' : ''}" href="${accountHref}" data-testid="header-account-link" aria-label="Tài khoản khách">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="7.5" r="3.8"/><path d="M4.5 21v-2.2a7.5 7.5 0 0 1 15 0V21"/></svg>
              <span class="action-label" data-testid="header-account-label">${esc(accountLabel)}</span>
            </a>
          </div>
        </div>
        <nav class="mobile-subnav wrap" aria-label="Liên kết nhanh">
          ${navLink('home.html#san-pham', 'Bộ sưu tập', 'collection')}
          ${navLink('orders.html', 'Đơn hàng', 'orders')}
          ${navLink('about.html', 'Giới thiệu', 'about')}
          ${navLink('contact.html', 'Liên hệ', 'contact')}
        </nav>
      </header>
    `;
  }

  function footerMarkup() {
    return `
      <footer>
        <div class="wrap footer-inner footer-grid-4">
          <div>
            <a class="footer-brand" href="home.html">AUREL</a>
            <p>Đồng hành cùng từng khoảnh khắc. Website cửa hàng mô phỏng phục vụ đồ án kiểm thử phần mềm (HTML/CSS/JS thuần, dữ liệu localStorage).</p>
          </div>
          <div>
            <strong>Khám phá</strong>
            <a href="home.html">Trang chủ</a>
            <a href="home.html#san-pham">Bộ sưu tập đồng hồ</a>
            <a href="about.html">Giới thiệu AUREL</a>
            <a href="contact.html">Liên hệ mô phỏng</a>
          </div>
          <div>
            <strong>Khách hàng</strong>
            <a href="account.html">Tài khoản khách</a>
            <a href="orders.html">Đơn hàng của tôi</a>
            <a href="cart.html">Giỏ hàng</a>
            <a href="wishlist.html">Danh sách yêu thích</a>
          </div>
          <div>
            <strong>Quản trị &amp; QA</strong>
            <a href="index.html">Quản lý cửa hàng</a>
            <a href="qa.html">Theo dõi kiểm thử</a>
            <a href="lab.html">Phòng thực hành QA</a>
            <a href="docs/ASSETS.md">Nguồn ảnh &amp; nhận diện</a>
          </div>
        </div>
        <div class="wrap copyright">
          <span>© AUREL · Website đồ án thực hành kiểm thử · Ảnh đồng hồ do AI minh họa</span>
          <a href="about.html">Thông tin đồ án &amp; giới hạn local</a>
        </div>
      </footer>
    `;
  }

  function syncHeaderCounts() {
    if (typeof document === 'undefined') return;
    const cartCount = getCartCount();
    const wishCount = getWishlistCount();
    const customer = getCurrentCustomer();

    document.querySelectorAll('[data-testid="header-cart-count"]').forEach(el => {
      el.textContent = String(cartCount);
    });
    document.querySelectorAll('[data-testid="header-wishlist-count"]').forEach(el => {
      el.textContent = String(wishCount);
      el.hidden = wishCount === 0;
    });
    document.querySelectorAll('[data-testid="header-account-link"]').forEach(el => {
      el.setAttribute('href', customer ? 'account.html' : 'login.html');
    });
    document.querySelectorAll('[data-testid="header-account-label"]').forEach(el => {
      el.textContent = customer ? customer.name.split(/\s+/).slice(-1)[0] : 'Đăng nhập';
    });
  }

  function bindGlobalImageFallback() {
    if (typeof document === 'undefined' || document._aurelImgFallbackBound) return;
    document._aurelImgFallbackBound = true;
    document.addEventListener('error', e => {
      const img = e.target;
      if (img && img.tagName === 'IMG' && img.dataset && img.dataset.fallback) {
        const fb = img.dataset.fallback;
        delete img.dataset.fallback;
        img.src = fb;
        img.alt = 'Ảnh minh họa AI thay thế (ảnh gốc không tải được)';
      }
    }, true);
  }

  function initShell(options = {}) {
    if (typeof document === 'undefined') return;
    const headerHost = document.getElementById('site-header-root');
    if (headerHost) headerHost.innerHTML = headerMarkup(options);
    const footerHost = document.getElementById('site-footer-root');
    if (footerHost) footerHost.innerHTML = footerMarkup();

    if (options.showSearch !== false && !options.customSearch) {
      const form = document.getElementById('search-form');
      const input = document.getElementById('search-products');
      if (form && input) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          const q = input.value.trim();
          location.href = q ? `home.html?q=${encodeURIComponent(q)}#san-pham` : 'home.html#san-pham';
        });
      }
    }

    syncHeaderCounts();
    bindGlobalImageFallback();

    if (!window._aurelShellBound) {
      window._aurelShellBound = true;
      window.addEventListener('aurel:state-change', syncHeaderCounts);
      window.addEventListener('storage', e => {
        if ([KEYS.cart, KEYS.wishlist, KEYS.session, KEYS.accounts].includes(e.key)) {
          syncHeaderCounts();
        }
      });
    }
  }

  /* Hiển thị trạng thái lỗi khi dữ liệu cửa hàng trong trình duyệt bị hỏng; không xóa hay ghi đè dữ liệu. */
  function renderStoreError(host) {
    if (!host) return;
    host.innerHTML = `
      <div class="empty-state" data-testid="store-data-error" role="alert">
        <h2>Không thể đọc dữ liệu cửa hàng</h2>
        <p>Dữ liệu lưu trong trình duyệt có thể đang bị hỏng hoặc sai định dạng. Website không tự xóa hay ghi đè dữ liệu cũ.</p>
        <div class="actions">
          <a class="button" href="home.html">Về trang chủ</a>
          <a class="button secondary" href="index.html">Mở trang quản lý</a>
        </div>
      </div>`;
  }

  function setFieldErrors(form, fieldErrors = {}) {
    form.querySelectorAll('[data-error-for]').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    let firstInvalid = null;
    for (const [name, msg] of Object.entries(fieldErrors)) {
      const errEl = form.querySelector(`[data-error-for="${name}"]`);
      if (errEl) errEl.textContent = msg;
      const input = form.elements[name];
      if (input && typeof input.setAttribute === 'function') {
        input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = input;
      }
    }
    if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
  }

  const api = {
    KEYS,
    esc,
    money,
    formatDate,
    statusMeta,
    makeId,
    hashLocal,
    productFallbackImage,
    resolveProductImage,
    getParam,
    safeNextUrl,
    readStore,
    writeStore,
    readAccounts,
    getCustomerSession,
    getCurrentCustomer,
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    updateCustomerProfile,
    readCart,
    getCartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCartAddedPrices,
    getResolvedCart,
    readWishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    getWishlistCount,
    getGuestOrderIds,
    recordGuestOrder,
    setLastOrder,
    getLastOrder,
    placeOrder,
    canViewOrder,
    getVisibleOrdersForCurrentUser,
    lookupGuestOrder,
    readContactMessages,
    submitContactMessage,
    headerMarkup,
    footerMarkup,
    syncHeaderCounts,
    initShell,
    renderStoreError,
    setFieldErrors
  };

  if (typeof module !== 'undefined') module.exports = api;
  else root.AurelStorefront = api;
})(typeof window !== 'undefined' ? window : globalThis);
