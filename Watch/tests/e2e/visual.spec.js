const {test,expect}=require('@playwright/test');
test('VIS-01 Desktop: tiêu đề tiếng Việt và bố cục tổng quan',async({page},info)=>{
  await page.route('https://cdn-uicons.flaticon.com/**',r=>r.abort());await page.goto('/');
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await expect(page.locator('.welcome h2')).toHaveText('Mỗi khoảnh khắc, một bước tiến.');
  const title=page.locator('.welcome h2');expect(await title.evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Segoe UI');
  expect(await title.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await info.attach('desktop-dashboard',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('VIS-02 Mobile: tổng quan và trang QA có thể đọc được',async({page},info)=>{
  await page.route('https://cdn-uicons.flaticon.com/**',r=>r.abort());await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await expect(page.locator('.welcome h2')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await info.attach('mobile-dashboard',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await info.attach('mobile-qa',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('VIS-03 Mở trang QA từ cửa hàng và quay lại trong cùng tab',async({page})=>{
  await page.route('https://cdn-uicons.flaticon.com/**',r=>r.abort());await page.goto('/');
  await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  const link=page.getByRole('link',{name:'Theo dõi kiểm thử',exact:true});await expect(link).toHaveAttribute('href','qa.html');
  await link.click();await expect(page).toHaveURL(/\/qa\.html$/);await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  await page.getByRole('link',{name:'Tổng quan'}).click();await expect(page).toHaveURL(/\/index\.html$/);await expect(page.getByRole('heading',{name:'Tổng quan cửa hàng'})).toBeVisible();
});

test('VIS-04 Trang QA desktop có hướng dẫn và danh sách cuộn riêng',async({page},info)=>{
  await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText('Thực hành kiểm thử từng bước')).toBeVisible();
  await expect(page.locator('#cases-section')).toBeVisible();
  await expect(page.locator('#auto-results')).toBeHidden();
  await expect(page.locator('#run-settings')).toHaveJSProperty('open',false);
  await expect(page.locator('.qa-manual-exports')).toBeHidden();
  const main=await page.locator('.qa-main').boundingBox();expect(main.x).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.qa-case-scroll').evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  await info.attach('desktop-qa',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
