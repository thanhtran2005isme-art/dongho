const {test,expect}=require('@playwright/test');
test('BRAND-01 AUREL tải ảnh và font offline, tìm kiếm vẫn hoạt động',async({page})=>{
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await page.goto('/home.html');await expect(page).toHaveTitle(/AUREL/);await expect(page.getByRole('link',{name:'AUREL — Trang chủ'})).toBeVisible();
  await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images){img.loading='eager';await img.decode();}});
  expect(await page.locator('.product-image img').count()).toBe(6);expect(await page.locator('.hero-photo img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(1000);
  expect(await page.evaluate(()=>document.fonts.check('16px "Be Vietnam Pro"'))).toBe(true);
  await page.getByLabel('Tìm đồng hồ').fill('Casio');await expect(page.locator('.product-card')).toHaveCount(2);
});
test('BRAND-02 Đổi nhận diện giữ dữ liệu chrono cũ và ưu tiên ảnh người dùng',async({page})=>{
  await page.goto('/home.html');await page.evaluate(()=>{const data=WatchStore.seed();data.products[0].name='Đồng hồ của tôi';data.products[0].image='https://photo.example.test/user.png';localStorage.setItem(WatchStore.KEY,JSON.stringify(data));});
  await page.route('https://photo.example.test/**',r=>r.abort());await page.reload();
  await expect(page.locator('.product-card').first()).toContainText('Đồng hồ của tôi');
  await expect(page.locator('.product-card img').first()).toHaveAttribute('src','assets/images/aurel-steel.png');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('chrono-watch-v1')).products[0].image)).toBe('https://photo.example.test/user.png');
});
test('BRAND-03 Trắng xanh ngọc không tràn trên mobile, tablet, desktop',async({page},info)=>{
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:960});await page.goto('/home.html');await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await info.attach('aurel-'+width,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});}
});
