const {test,expect}=require('@playwright/test');

const routes={
  dashboard:'Tổng quan',products:'Sản phẩm',orders:'Đơn hàng',
  customers:'Khách hàng',inventory:'Kho hàng',categories:'Danh mục',
  reports:'Báo cáo',suppliers:'Nhà cung cấp',receipts:'Phiếu nhập kho',
  payments:'Thanh toán',deliveries:'Giao hàng',warranties:'Bảo hành',
  returns:'Đổi trả',users:'Tài khoản'
};
async function login(page,user='admin',password='Admin@123'){
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill(user);
  await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
}
async function checkRoute(page,key){
  await expect(page).toHaveURL(new RegExp('#/'+key+'$'));
  await expect(page.locator('nav button[data-view="'+key+'"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#content h1')).toBeVisible();
}
test('ROUTE-01 | Mỗi phân hệ Admin có hash riêng',async({page})=>{
  await page.goto('/index.html');await login(page);
  for(const key of Object.keys(routes)){
    await page.locator('nav button[data-view="'+key+'"]').click();
    await checkRoute(page,key);
  }
});
test('ROUTE-02 | Giữ trang sau reload, Back và Forward',async({page})=>{
  await page.goto('/index.html');await login(page);
  await page.locator('nav button[data-view="products"]').click();
  await page.locator('nav button[data-view="suppliers"]').click();
  await page.reload();await checkRoute(page,'suppliers');
  await page.goBack();await checkRoute(page,'products');
  await page.goForward();await checkRoute(page,'suppliers');
});
test('ROUTE-03 | Deep link giữ đích sau đăng nhập',async({page})=>{
  await page.goto('/index.html#/warranties');
  await expect(page.locator('#login-form')).toBeVisible();
  await login(page);await checkRoute(page,'warranties');
});
test('ROUTE-04 | Route sai, staff và đăng xuất',async({page})=>{
  await page.goto('/index.html#/users');await login(page,'staff','Staff@123');
  await checkRoute(page,'dashboard');
  await expect(page.locator('nav button[data-view="users"]')).toHaveCount(0);
  await page.evaluate(()=>location.hash='#/invalid-route');await checkRoute(page,'dashboard');
  await page.locator('nav button[data-view="receipts"]').click();await checkRoute(page,'receipts');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await expect(page.locator('#login-form')).toBeVisible();
  await page.evaluate(()=>location.hash='#/users');
  await expect(page.locator('#login-form')).toBeVisible();
});
