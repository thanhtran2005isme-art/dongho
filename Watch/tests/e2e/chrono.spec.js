const {test,expect}=require('@playwright/test');

// Mỗi test có context mới: localStorage và sessionStorage độc lập.
test.beforeEach(async({page})=>{
  // Tách kiểm thử nghiệp vụ khỏi tính sẵn sàng của CDN. Kiểm tra icon riêng bằng tay.
  await page.route('https://cdn-uicons.flaticon.com/**',route=>route.abort());
  await page.goto('/');
});
async function login(page,username='admin',password='Admin@123'){
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill(username);
  await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
}
async function nav(page,name){await page.locator('nav').getByRole('button',{name,exact:true}).click();}
async function draft(page,quantity=1){
  await page.getByRole('button',{name:'Tạo đơn hàng',exact:true}).click();
  await page.getByRole('combobox',{name:'Khách hàng *',exact:true}).selectOption('c1');
  await page.getByRole('combobox',{name:'Sản phẩm',exact:true}).selectOption('p1');
  await page.getByLabel('Số lượng',{exact:true}).fill(String(quantity));
  await page.getByRole('button',{name:'Lưu đơn nháp',exact:true}).click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await nav(page,'Đơn hàng');
  await page.getByRole('button',{name:'Chi tiết',exact:true}).click();
}
async function stored(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('chrono-watch-v1')));}

test('E2E-01 | FR-01 Đăng nhập admin và đăng xuất',async({page})=>{
  await login(page);await expect(page.getByRole('heading',{name:'Tổng quan cửa hàng'})).toBeVisible();
  await expect(page.locator('.profile strong')).toHaveText('Quản trị viên');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.reload();
  await expect(page.getByRole('heading',{name:'Đăng nhập cửa hàng'})).toBeVisible();
});
test('FR-01 Giữ đăng nhập khi quay lại từ QA và mở tab mới',async({page,context})=>{
  await login(page);
  await page.getByRole('link',{name:'Theo dõi kiểm thử'}).click();
  await page.getByRole('link',{name:'Tổng quan'}).click();
  await expect(page.getByRole('heading',{name:'Tổng quan cửa hàng'})).toBeVisible();
  const other=await context.newPage();await other.goto('/index.html');
  await expect(other.getByRole('heading',{name:'Tổng quan cửa hàng'})).toBeVisible();
  await other.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await page.reload();await expect(page.getByRole('heading',{name:'Đăng nhập cửa hàng'})).toBeVisible();
});
test('E2E-02 | FR-01 Sai mật khẩu không được đăng nhập',async({page})=>{
  await login(page,'admin','wrong');await expect(page.locator('#login-error')).toContainText('không đúng');await expect(page.locator('nav')).toHaveCount(0);
});
test('E2E-03 | FR-02 Nhân viên không có nút quản trị',async({page})=>{
  await login(page,'staff','Staff@123');await expect(page.locator('nav').getByRole('button',{name:'Tài khoản',exact:true})).toHaveCount(0);
  await nav(page,'Sản phẩm');await expect(page.getByRole('button',{name:'Thêm sản phẩm',exact:true})).toHaveCount(0);
  await nav(page,'Kho hàng');await expect(page.getByRole('button',{name:'Nhập hàng',exact:true})).toHaveCount(0);
});
test('E2E-04 | FR-03 Thêm sản phẩm và giữ dữ liệu sau reload',async({page})=>{
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('button',{name:'Thêm sản phẩm',exact:true}).click();
  await page.getByLabel('Mã sản phẩm *',{exact:true}).fill(' test01 ');await page.getByLabel('Tên sản phẩm *',{exact:true}).fill('Đồng hồ QA');
  await page.getByLabel('Giá bán (VND) *',{exact:true}).fill('1500000');await page.getByLabel('Tồn kho ban đầu *',{exact:true}).fill('4');
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  await page.reload();await nav(page,'Sản phẩm');await page.getByLabel('Tìm kiếm',{exact:true}).fill('TEST01');
  await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.locator('tbody')).toContainText('Đồng hồ QA');
});
test('E2E-05 | FR-03 Chặn mã sản phẩm trùng sau chuẩn hóa',async({page})=>{
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('button',{name:'Thêm sản phẩm',exact:true}).click();
  await page.getByLabel('Mã sản phẩm *',{exact:true}).fill(' se001 ');await page.getByLabel('Tên sản phẩm *',{exact:true}).fill('Trùng mã');await page.getByLabel('Giá bán (VND) *',{exact:true}).fill('1000');
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#form-error')).toContainText('đã tồn tại');expect((await stored(page)).products).toHaveLength(7);
});
test('E2E-06 | FR-04 Bộ lọc kết hợp và xóa bộ lọc',async({page})=>{
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('combobox',{name:'Thương hiệu',exact:true}).selectOption('Seiko');await page.getByRole('combobox',{name:'Loại đồng hồ',exact:true}).selectOption('Đồng hồ cơ');await page.getByRole('combobox',{name:'Trạng thái',exact:true}).selectOption('inactive');
  await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.locator('tbody')).toContainText('SE002');
  await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();await expect(page.locator('.pagination')).toContainText('7 kết quả');
});
test('E2E-07 | FR-05 Khách hàng mới xuất hiện trong đơn',async({page})=>{
  await login(page);await nav(page,'Khách hàng');await page.getByRole('button',{name:'Thêm khách hàng',exact:true}).click();await page.getByLabel('Họ tên *',{exact:true}).fill('Khách QA');await page.getByLabel('Số điện thoại *',{exact:true}).fill('0900000009');await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
  await expect(page.locator('#modal')).not.toBeVisible();await nav(page,'Đơn hàng');await page.getByRole('button',{name:'Tạo đơn hàng',exact:true}).click();await expect(page.getByRole('combobox',{name:'Khách hàng *',exact:true})).toContainText('Khách QA');
});
test('E2E-08 | FR-06/07/08 Nháp, xác nhận, hủy và đối chiếu tồn',async({page})=>{
  await login(page);await draft(page,2);let d=await stored(page);expect(d.products[0].stock).toBe(8);expect(d.orders[0].total).toBe(25000000);
  await page.getByRole('button',{name:'Xác nhận bán',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();d=await stored(page);expect(d.products[0].stock).toBe(6);expect(d.orders[0].status).toBe('confirmed');
  await page.getByRole('button',{name:'Chi tiết',exact:true}).click();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Hủy đơn',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();d=await stored(page);expect(d.products[0].stock).toBe(8);expect(d.orders[0].status).toBe('cancelled');
  await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await expect(page.getByRole('button',{name:'Hủy đơn',exact:true})).toHaveCount(0);
});
test('E2E-09 | FR-07 Không xác nhận khi vượt tồn',async({page})=>{
  await login(page);await draft(page,9);await page.getByRole('button',{name:'Xác nhận bán',exact:true}).click();await expect(page.locator('#form-error')).toContainText('Không đủ tồn kho');const d=await stored(page);expect(d.products[0].stock).toBe(8);expect(d.orders[0].status).toBe('draft');
});
test('E2E-10 | FR-09 Nhập kho cập nhật số lượng và lịch sử',async({page})=>{
  await login(page);await nav(page,'Kho hàng');await page.getByRole('button',{name:'Nhập hàng',exact:true}).click();await page.getByRole('combobox',{name:'Sản phẩm',exact:true}).selectOption('p1');await page.getByLabel('Số lượng nhập *',{exact:true}).fill('3');await page.getByLabel('Lý do *',{exact:true}).fill('Nhập QA');await page.getByRole('button',{name:'Xác nhận nhập kho',exact:true}).click();
  await expect(page.locator('#modal')).not.toBeVisible();const d=await stored(page);expect(d.products[0].stock).toBe(11);await expect(page.getByText('Nhập QA',{exact:true})).toBeVisible();
});
test('E2E-11 | FR-10 Đổi danh mục cập nhật sản phẩm',async({page})=>{
  await login(page);await nav(page,'Danh mục');await page.getByRole('row').filter({has:page.getByRole('cell',{name:'Seiko',exact:true})}).getByRole('button',{name:'Sửa tên'}).click();await page.getByLabel('Tên danh mục *',{exact:true}).fill('Seiko Japan');await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  await nav(page,'Sản phẩm');await page.getByRole('combobox',{name:'Thương hiệu',exact:true}).selectOption('Seiko Japan');await expect(page.locator('.pagination')).toContainText('2 kết quả');
});
test('E2E-12 | FR-11 Báo cáo loại đơn đã hủy',async({page})=>{
  await login(page);await draft(page);await page.getByRole('button',{name:'Xác nhận bán',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();await nav(page,'Báo cáo');await expect(page.locator('.stat').first().locator('strong')).toContainText('12.500.000');
  await nav(page,'Đơn hàng');await page.getByRole('button',{name:'Chi tiết',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Hủy đơn',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();await nav(page,'Báo cáo');await expect(page.locator('.stat').first().locator('strong')).toHaveText(/0\s*₫/);
});
test('E2E-13 | NFR-03 Chuỗi XSS hiển thị như văn bản',async({page})=>{
  await login(page);await nav(page,'Khách hàng');await page.getByRole('button',{name:'Thêm khách hàng',exact:true}).click();const payload='<img src=x onerror=alert(1)>';let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss();});
  await page.getByLabel('Họ tên *',{exact:true}).fill(payload);await page.getByLabel('Số điện thoại *',{exact:true}).fill('0900000009');await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.getByText(payload,{exact:true})).toBeVisible();await expect(page.locator('tbody img')).toHaveCount(0);expect(dialogs).toBe(0);
});
test('E2E-14 | FR-03 Ảnh file được lưu và gỡ',async({page})=>{
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('row').filter({hasText:'SE001'}).getByRole('button',{name:'Chỉnh sửa'}).click();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=','base64');
  await page.locator('#product-image-file').setInputFiles({name:'test.png',mimeType:'image/png',buffer:png});await expect(page.locator('#product-image-preview img')).toBeVisible();await expect(page.getByRole('button',{name:'Lưu thay đổi',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();expect((await stored(page)).products[0].image).toMatch(/^data:image\/png;base64,/);
  await page.getByRole('row').filter({hasText:'SE001'}).getByRole('button',{name:'Chỉnh sửa'}).click();await page.getByRole('button',{name:'Gỡ ảnh',exact:true}).click();await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();expect((await stored(page)).products[0].image).toBe('');
});
test('E2E-15 | NFR-01 Màn hình nhỏ không tràn toàn trang',async({page})=>{
  await page.setViewportSize({width:390,height:844});await login(page);await nav(page,'Sản phẩm');await expect(page.getByLabel('Tìm kiếm',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('E2E-16 | FR-12 Tạo nhân viên, khóa và mở khóa',async({page})=>{
  await login(page);await nav(page,'Tài khoản');await page.getByRole('button',{name:'Thêm nhân viên',exact:true}).click();
  await page.getByLabel('Họ tên *',{exact:true}).fill('Nhân viên QA');await page.getByLabel('Tên đăng nhập *',{exact:true}).fill('tester');await page.getByLabel('Mật khẩu demo *',{exact:true}).fill('Test@123');
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  const row=page.getByRole('row').filter({has:page.getByRole('cell',{name:'tester',exact:true})});
  page.once('dialog',d=>d.accept());await row.getByRole('button',{name:'Khóa',exact:true}).click();await expect(row).toContainText('Đã khóa');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await login(page,'tester','Test@123');await expect(page.locator('#login-error')).toContainText('bị khóa');
  await login(page);await nav(page,'Tài khoản');page.once('dialog',d=>d.accept());await row.getByRole('button',{name:'Mở khóa',exact:true}).click();await expect(row).toContainText('Hoạt động');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await login(page,'tester','Test@123');await expect(page.locator('.profile strong')).toHaveText('Nhân viên QA');
});

test('E2E-17 | FR-01/12 Phiên nhân viên kết thúc khi nhận thay đổi khóa từ tab khác',async({page,context})=>{
  await login(page,'staff','Staff@123');
  await expect(page.locator('.profile small')).toHaveText('Nhân viên bán hàng');

  // Các tab dùng chung phiên. E2E-16 kiểm tra thao tác khóa của quản trị trên giao diện.
  // Ca này tạo thay đổi qua nghiệp vụ trong dữ liệu test để kiểm tra tab nhân viên nhận cập nhật.
  const updateTab=await context.newPage();
  await updateTab.route('https://cdn-uicons.flaticon.com/**',route=>route.abort());
  await updateTab.goto('/');
  await expect(updateTab.locator('.profile small')).toHaveText('Nhân viên bán hàng');
  await updateTab.evaluate(()=>{
    const store=window.WatchStore;
    const data=JSON.parse(localStorage.getItem(store.KEY));
    store.toggleAccount(data,'u1','u2');
    localStorage.setItem(store.KEY,JSON.stringify(data));
  });

  await expect(page.getByRole('heading',{name:'Đăng nhập cửa hàng'})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Menu quản lý'})).toHaveCount(0);
});

test('E2E-18 | FR-07 Hai tab xác nhận cạnh tranh chiếc cuối',async({page,context})=>{
  // Thiết lập dữ liệu riêng; thao tác xác nhận vẫn đi qua nút UI của ứng dụng.
  const S=require('../../store.js'),data=S.seed();data.products[0].stock=1;
  const first=S.order(data,'u1','c1',[{productId:'p1',quantity:1}]);const second=S.order(data,'u2','c1',[{productId:'p1',quantity:1}]);
  await page.evaluate(d=>localStorage.setItem('chrono-watch-v1',JSON.stringify(d)),data);await page.reload();await login(page);await nav(page,'Đơn hàng');
  const other=await context.newPage();
  await other.route('https://cdn-uicons.flaticon.com/**',route=>route.abort());
  await other.goto('/');
  await expect(page.locator('.profile small')).toHaveText('Quản trị viên');
  await expect(other.locator('.profile small')).toHaveText('Quản trị viên');
  await nav(other,'Đơn hàng');
  await page.locator(`[data-action="order-detail"][data-id="${first.id}"]`).click();await other.locator(`[data-action="order-detail"][data-id="${second.id}"]`).click();
  // Giữ khóa để bảo đảm cả hai thao tác cùng chờ, không chỉ chạy nối tiếp tình cờ.
  await page.evaluate(()=>new Promise(resolve=>{navigator.locks.request('chrono-write',()=>new Promise(release=>{window.releaseTestLock=release;resolve();}));}));
  try{
    await Promise.all([page.getByRole('button',{name:'Xác nhận bán',exact:true}).click(),other.getByRole('button',{name:'Xác nhận bán',exact:true}).click()]);
    await expect.poll(()=>page.evaluate(async()=>{const locks=await navigator.locks.query();return locks.pending.filter(l=>l.name==='chrono-write').length;})).toBe(2);
  }finally{await page.evaluate(()=>window.releaseTestLock());}
  await expect.poll(async()=>{const d=await stored(page);return d.orders.filter(o=>o.status==='confirmed').length;}).toBe(1);
  await expect.poll(()=>page.evaluate(async()=>(await navigator.locks.query()).pending.length)).toBe(0);
  const result=await stored(page);expect(result.products[0].stock).toBe(0);expect(result.orders.filter(o=>o.status==='draft')).toHaveLength(1);expect(result.movements.filter(m=>m.quantity<0)).toHaveLength(1);
});

test('E2E-19 | In phiếu giữ dữ liệu và ẩn thành phần điều khiển',async({page},testInfo)=>{
  await login(page);await draft(page,2);const before=await stored(page);
  await page.evaluate(()=>{window.printCalls=0;window.print=()=>{window.printCalls++;};});
  await page.getByRole('button',{name:'In phiếu',exact:true}).click();expect(await page.evaluate(()=>window.printCalls)).toBe(1);
  await page.emulateMedia({media:'print'});await expect(page.locator('#app')).toBeHidden();await expect(page.locator('#modal')).toBeVisible();await expect(page.locator('.form-actions')).toBeHidden();
  await expect(page.locator('#modal')).toContainText('DH0001');await expect(page.locator('#modal')).toContainText('25.000.000');expect(await stored(page)).toEqual(before);
  await testInfo.attach('print-layout',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});

test('E2E-20 | Ảnh URL lỗi có nội dung thay thế',async({page})=>{
  await page.route('https://images.example.test/missing.png',r=>r.fulfill({status:404,body:'Not found'}));
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('row').filter({hasText:'SE001'}).getByRole('button',{name:'Chỉnh sửa'}).click();
  await page.locator('#product-image-url').fill('https://images.example.test/missing.png');await page.locator('#product-image-url').press('Tab');
  await expect(page.locator('#product-image-preview .image-fallback')).toBeVisible();await expect(page.locator('#product-image-preview img')).toBeHidden();
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();await expect(page.getByRole('row').filter({hasText:'SE001'}).locator('.image-fallback')).toBeVisible();
});

test('E2E-21 | FR-01 Phiên hết hạn không được lưu biểu mẫu đang mở',async({page})=>{
  await login(page);await nav(page,'Khách hàng');await page.getByRole('button',{name:'Thêm khách hàng',exact:true}).click();
  await page.getByLabel('Họ tên *',{exact:true}).fill('Khách hết phiên');await page.getByLabel('Số điện thoại *',{exact:true}).fill('0900000009');const before=await stored(page);
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('chrono-session'));s.expires=Date.now()-1;localStorage.setItem('chrono-session',JSON.stringify(s));});
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#form-error')).toContainText('hết hạn');expect(await stored(page)).toEqual(before);
  await page.reload();await expect(page.getByRole('heading',{name:'Đăng nhập cửa hàng'})).toBeVisible();
});

test('E2E-22 | FR-11 Sửa giá sản phẩm không làm đổi đơn nháp cũ',async({page})=>{
  await login(page);await draft(page);await page.locator('#edit-form').getByRole('button',{name:'Đóng',exact:true}).click();await nav(page,'Sản phẩm');
  await page.getByRole('row').filter({hasText:'SE001'}).getByRole('button',{name:'Chỉnh sửa'}).click();await page.getByLabel('Giá bán (VND) *',{exact:true}).fill('13000000');await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  await nav(page,'Đơn hàng');await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await page.getByRole('button',{name:'Sửa đơn',exact:true}).click();await page.getByLabel('Số lượng',{exact:true}).fill('2');await expect(page.locator('#order-total')).toContainText('25.000.000');
  await page.getByRole('button',{name:'Lưu đơn nháp',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await page.getByRole('button',{name:'Xác nhận bán',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  const d=await stored(page);expect(d.products[0].price).toBe(13000000);expect(d.orders[0].items[0].price).toBe(12500000);expect(d.orders[0].total).toBe(25000000);
});

test('E2E-23 | FR-08 Hủy đơn nháp không cộng thêm tồn kho',async({page})=>{
  await login(page);await draft(page,2);page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Hủy đơn',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();
  const d=await stored(page);expect(d.orders[0].status).toBe('cancelled');expect(d.products[0].stock).toBe(8);
  await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await expect(page.getByRole('button',{name:'Sửa đơn',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Xác nhận bán',exact:true})).toHaveCount(0);
});

test('E2E-24 | FR-11 Ngày báo cáo ngược bị chặn, bộ lọc cũ giữ nguyên',async({page})=>{
  await login(page);await draft(page);await page.getByRole('button',{name:'Xác nhận bán',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();await nav(page,'Báo cáo');
  const before=await page.locator('.stat').first().innerText();await page.getByLabel('Từ ngày',{exact:true}).fill('2026-11-24');await page.getByLabel('Đến ngày',{exact:true}).fill('2026-11-01');await page.getByRole('button',{name:'Áp dụng',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('Ngày bắt đầu phải trước');await expect(page.locator('.stat').first()).toHaveText(before,{useInnerText:true});
  await page.getByLabel('Từ ngày',{exact:true}).fill('2000-01-01');await page.getByLabel('Đến ngày',{exact:true}).fill('2000-01-02');await page.getByRole('button',{name:'Áp dụng',exact:true}).click();await expect(page.locator('.stat').first().locator('strong')).toHaveText(/0\s*₫/);
  await page.getByRole('button',{name:'Toàn bộ',exact:true}).click();await expect(page.locator('.stat').first().locator('strong')).toContainText('12.500.000');
});

test('E2E-25 | FR-03 Ảnh quá lớn và ảnh giả không được lưu',async({page})=>{
  await login(page);await nav(page,'Sản phẩm');await page.getByRole('row').filter({hasText:'SE001'}).getByRole('button',{name:'Chỉnh sửa'}).click();const before=await stored(page);
  await page.locator('#product-image-file').setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(300*1024+1)});await expect(page.locator('#form-error')).toContainText('tối đa 300 KB');
  await page.locator('#product-image-file').setInputFiles({name:'fake.png',mimeType:'image/png',buffer:Buffer.from('not an image')});await expect(page.locator('#form-error')).not.toHaveText('');await expect(page.getByRole('button',{name:'Lưu thay đổi',exact:true})).toBeEnabled();await expect(page.locator('#product-image-preview img')).toHaveCount(0);expect(await stored(page)).toEqual(before);
});

test('E2E-26 | NFR-02 Lỗi quota không ghi dở dữ liệu và cho thử lại',async({page})=>{
  await login(page);await nav(page,'Khách hàng');await page.getByRole('button',{name:'Thêm khách hàng',exact:true}).click();await page.getByLabel('Họ tên *',{exact:true}).fill('Khách quota');await page.getByLabel('Số điện thoại *',{exact:true}).fill('0900000009');const before=await stored(page);
  // Mô phỏng lỗi ghi của Storage API, không lấp đầy bộ nhớ trình duyệt thật.
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='chrono-watch-v1')throw new DOMException('Test quota','QuotaExceededError');return window.originalSetItem.call(this,key,value);};});
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#form-error')).toContainText('Bộ nhớ trình duyệt đã đầy');expect(await stored(page)).toEqual(before);await expect(page.getByLabel('Họ tên *',{exact:true})).toHaveValue('Khách quota');
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();expect((await stored(page)).customers).toHaveLength(3);
});
test('E2E-27 | NFR-02 Xuất rồi nhập lại dữ liệu, giữ tài khoản',async({page})=>{
  const fs=require('node:fs');await login(page);await nav(page,'Báo cáo');const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất dữ liệu JSON',exact:true}).click();const file=await pending;const backup=JSON.parse(fs.readFileSync(await file.path(),'utf8'));expect(backup.users).toBeUndefined();
  await nav(page,'Kho hàng');await page.getByRole('button',{name:'Nhập hàng',exact:true}).click();await page.getByRole('combobox',{name:'Sản phẩm',exact:true}).selectOption('p1');await page.getByLabel('Số lượng nhập *',{exact:true}).fill('2');await page.getByLabel('Lý do *',{exact:true}).fill('Test khôi phục');await page.getByRole('button',{name:'Xác nhận nhập kho',exact:true}).click();await expect(page.locator('#modal')).not.toBeVisible();expect((await stored(page)).products[0].stock).toBe(10);
  await nav(page,'Báo cáo');page.once('dialog',d=>d.accept());await page.locator('#import-business-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(page.locator('#toast')).toContainText('Đã khôi phục');const restored=await stored(page);expect(restored.products[0].stock).toBe(8);expect(restored.users[0].username).toBe('admin');
});
test('E2E-28 | NFR-02 File nhập lỗi không thay đổi dữ liệu',async({page})=>{
  await login(page);await nav(page,'Báo cáo');const before=await stored(page);const bad=structuredClone(before);delete bad.users;bad.products[0].price=-1;await page.locator('#import-business-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await expect(page.locator('#toast')).toContainText('Không nhập được dữ liệu');expect(await stored(page)).toEqual(before);
});
