'use strict';
(() => {
  const SF = window.AurelStorefront;
  const root = document.getElementById('products');
  const input = document.getElementById('search-products');
  const list = document.getElementById('category-list');
  const count = document.getElementById('product-count');
  const clear = document.getElementById('clear-filters');
  const escape = SF.esc;

  // Đồng bộ badge giỏ hàng, yêu thích, trạng thái đăng nhập khách và footer chuẩn.
  SF.initShell({ activeNav: 'collection', showSearch: true, customSearch: true });

  let products = [];
  let category = '';
  try {
    const db = SF.readStore(false);
    if (!Array.isArray(db.products)) throw Error();
    products = db.products.filter(p => p.active);
  } catch {
    root.innerHTML = '<p class="empty-products">Không thể tải sản phẩm. Hãy kiểm tra dữ liệu cửa hàng.</p>';
    return;
  }

  const initialQuery = SF.getParam('q');
  if (initialQuery) input.value = initialQuery;

  const types = [...new Set(products.map(p => p.type).filter(Boolean))];
  types.forEach(type => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.category = type;
    button.textContent = type;
    list.append(button);
  });

  function render() {
    const query = input.value.trim().toLocaleLowerCase('vi');
    const result = products.filter(p =>
      (!category || p.type === category) &&
      [p.name, p.code, p.brand].some(v => String(v || '').toLocaleLowerCase('vi').includes(query))
    );
    list.querySelectorAll('button').forEach(b => {
      const selected = b.dataset.category === category;
      b.classList.toggle('selected', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    count.textContent = `${result.length} sản phẩm${category ? ' · ' + category : ''}`;
    clear.hidden = !category && !query;
    if (!result.length) {
      root.innerHTML = '<p class="empty-products">Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác.</p>';
      return;
    }

    const wishlistSet = new Set(SF.readWishlist());
    root.innerHTML = result.map(p => {
      const img = SF.resolveProductImage(p);
      const wished = wishlistSet.has(p.id);
      const detailUrl = `product.html?id=${encodeURIComponent(p.id)}`;
      return `
        <article class="product-card" data-product-id="${escape(p.id)}">
          <a class="product-link" href="${detailUrl}" aria-label="Xem chi tiết ${escape(p.name)}">
            <div class="product-image">
              <span class="product-tag">${escape(p.brand)}</span>
              <img src="${escape(img.src)}" data-fallback="${escape(img.fallback)}" alt="${escape(img.alt)}" width="640" height="640" loading="lazy" decoding="async">
            </div>
          </a>
          <div class="product-info">
            <small>${escape(p.type)}</small>
            <h3><a href="${detailUrl}">${escape(p.name)}</a></h3>
            <div class="product-bottom">
              <strong>${SF.money(p.price)}</strong>
              <span class="${p.stock > 0 ? 'in-stock' : 'sold-out'}">${p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
            </div>
            <div class="product-card-footer">
              <a class="product-detail-link" href="${detailUrl}" data-testid="product-detail-link-${escape(p.id)}">Xem chi tiết →</a>
              <button type="button" class="wish-icon-btn" data-wish-toggle="${escape(p.id)}" aria-pressed="${wished}" aria-label="${wished ? 'Bỏ yêu thích ' : 'Thêm yêu thích '}${escape(p.name)}">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7.5-4.8-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.7 1.1 5 2.8 1.3-1.7 3-2.8 5-2.8 3.4 0 5.6 3.3 4.3 6.7-1.8 4.5-9.3 9.3-9.3 9.3z"/></svg>
              </button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  list.addEventListener('click', e => {
    const b = e.target.closest('button[data-category]');
    if (!b) return;
    category = b.dataset.category;
    render();
    document.getElementById('san-pham').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    render();
    document.getElementById('san-pham').scrollIntoView({ behavior: 'smooth' });
  });

  input.addEventListener('input', render);

  clear.addEventListener('click', () => {
    category = '';
    input.value = '';
    render();
    input.focus();
  });

  root.addEventListener('click', e => {
    const btn = e.target.closest('[data-wish-toggle]');
    if (!btn) return;
    const pid = btn.dataset.wishToggle;
    const nowWished = SF.toggleWishlist(pid);
    btn.setAttribute('aria-pressed', String(nowWished));
  });

  window.addEventListener('storage', e => {
    if (e.key === SF.KEYS.store || e.key === SF.KEYS.wishlist) {
      try {
        const db = SF.readStore(false);
        if (Array.isArray(db.products)) products = db.products.filter(p => p.active);
        render();
      } catch { /* ignore */ }
    }
  });

  render();
})();
