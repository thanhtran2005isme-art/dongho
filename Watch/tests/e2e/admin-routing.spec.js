const {test,expect}=require('@playwright/test');
const routes={
  "dashboard": "index.html",
  "products": "sanpham.html",
  "orders": "donhang.html",
  "customers": "khachhang.html",
  "inventory": "khohang.html",
  "categories": "danhmuc.html",
  "reports": "baocao.html",
  "suppliers": "nhacungcap.html",
  "receipts": "phieunhapkho.html",
  "payments": "thanhtoan.html",
  "deliveries": "giaohang.html",
  "warranties": "baohanh.html",
  "returns": "doitra.html",
  "users": "taikhoan.html"
};
async function login(page,user='admin',password='Admin@123'){
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill(user);
  await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
}
async function checkRoute(page,key){
  await expect(page).toHaveURL(url=>url.pathname.endsWith('/'+routes[key])&&!url.hash);
  await expect(page.locator('nav button[data-view="'+key+'"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#content h1')).toBeVisible();
}
test('ROUTE-01 | 14 phân hệ có file HTML riêng',async({page})=>{
  await page.goto('/index.html');await login(page);
  for(const key of Object.keys(routes)){
    await page.locator('nav button[data-view="'+key+'"]').click();
    await checkRoute(page,key);
  }
});
test('ROUTE-02 | Reload, Back và Forward',async({page})=>{
  await page.goto('/index.html');await login(page);
  await page.locator('nav button[data-view="products"]').click();
  await page.locator('nav button[data-view="suppliers"]').click();
  await page.reload();await checkRoute(page,'suppliers');
  await page.goBack();await checkRoute(page,'products');
  await page.goForward();await checkRoute(page,'suppliers');
});
test('ROUTE-03 | Mở trực tiếp trang và đăng nhập',async({page})=>{
  await page.goto('/baohanh.html');await expect(page.locator('#login-form')).toBeVisible();
  await login(page);await checkRoute(page,'warranties');
});
test('ROUTE-04 | Staff bị chặn trang tài khoản; đăng xuất',async({page})=>{
  await page.goto('/taikhoan.html');await login(page,'staff','Staff@123');
  await checkRoute(page,'dashboard');
  await expect(page.locator('nav button[data-view="users"]')).toHaveCount(0);
  await page.locator('nav button[data-view="receipts"]').click();await checkRoute(page,'receipts');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await expect(page.locator('#login-form')).toBeVisible();
  await page.goto('/taikhoan.html');await expect(page.locator('#login-form')).toBeVisible();
});
test('ROUTE-05 | Link hash cũ chuyển sang file HTML',async({page})=>{
  await page.goto('/index.html#/orders');await expect(page.locator('#login-form')).toBeVisible();
  await login(page);await checkRoute(page,'orders');
});
test('ROUTE-06 | Dữ liệu dùng chung giữa các trang admin',async({page})=>{
  await page.goto('/index.html');await login(page);
  await page.locator('nav button[data-view="suppliers"]').click();
  await page.getByRole('button',{name:'Thêm nhà cung cấp'}).click();
  await page.locator('#edit-form [name=name]').fill('NCC ROUTE QA');
  await page.locator('#edit-form [name=phone]').fill('0912345678');
  await page.getByRole('button',{name:'Tạo hồ sơ'}).click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('nav button[data-view="receipts"]').click();
  await page.getByRole('button',{name:'Tạo phiếu nhập'}).click();
  await expect(page.locator('#edit-form [name=supplierId]')).toContainText('NCC ROUTE QA');
});
