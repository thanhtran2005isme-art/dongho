const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{await page.route('https://cdn-uicons.flaticon.com/**',r=>r.abort());});
test('LAB-01 Tab hỗ trợ bàn phím, hash và phân tích biên không ghi Pass giả',async({page})=>{
  await page.goto('/lab.html');await expect(page.locator('#boundary-result')).toContainText('Không hợp lệ');
  await page.getByRole('button',{name:'1',exact:true}).click();await expect(page.locator('#boundary-result')).toContainText('Hợp lệ: 1');
  await page.getByRole('button',{name:'abc',exact:true}).click();await expect(page.locator('#boundary-result')).toContainText('Không hợp lệ');
  await page.locator('#boundary-value').fill('<img src=x onerror=alert(1)>');await page.locator('#boundary-form button').click();await expect(page.locator('#boundary-result img')).toHaveCount(0);
  await page.locator('#tab-design').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#tab-ai')).toBeFocused();await expect(page.locator('#panel-ai')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('chrono-qa-runs-v2'))).toBeNull();
  await page.reload();await expect(page.locator('#panel-ai')).toBeVisible();
});
test('LAB-02 Prompt xuất theo chức năng đã chọn; không giả là AI đang gọi',async({page})=>{
  await page.goto('/lab.html#ai');await page.locator('#ai-feature').selectOption('products');await expect(page.locator('#ai-prompt')).toHaveValue(/FR-03/);
  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Tải prompt .txt'}).click();const download=await downloading;
  const body=require('node:fs').readFileSync(await download.path(),'utf8');expect(body).toContain('FR-03');expect(body).toContain('Không tự ghi Pass/Fail');
});
test('LAB-03 Katalon 12 script tải được; JMeter tính cấu hình, không báo Pass',async({page,request})=>{
  await page.goto('/lab.html#katalon');await expect(page.locator('#katalon-cases a')).toHaveCount(12);await expect(page.locator('#panel-katalon')).toContainText('Not Run');
  for(const url of await page.locator('#katalon-cases a').evaluateAll(links=>links.map(a=>a.getAttribute('href')))){const r=await request.get('/'+url);expect(r.status()).toBe(200);expect(await r.text()).toContain('WebUI.closeBrowser()');}
  await page.getByRole('tab',{name:/Apache JMeter/}).click();await page.locator('#load-users').selectOption('25');await expect(page.locator('#load-samples')).toHaveText('1000');await expect(page.locator('#jmeter-command')).toContainText('-Jusers=25');
  const plan=await request.get('/testing/jmeter/chrono-static.jmx');expect(plan.ok()).toBe(true);expect(await plan.text()).toContain('ResponseAssertion');
});
test('LAB-04 Checklist bảo vệ lưu riêng, không sửa kết quả QA',async({page})=>{
  await page.goto('/lab.html#defense');await page.locator('#rehearsal-list input').first().check();await page.reload();await expect(page.locator('#rehearsal-list input').first()).toBeChecked();await expect(page.locator('#rehearsal-status')).toContainText('1/8');
  expect(await page.evaluate(()=>localStorage.getItem('chrono-qa-runs-v2'))).toBeNull();
});
test('LAB-05 Demo chỉ thay dữ liệu sau xác nhận; giữ tài khoản và dữ liệu QA',async({page})=>{
  await page.goto('/index.html');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await page.evaluate(()=>localStorage.setItem('chrono-qa-results-v1','marker-keep'));
  await page.getByRole('button',{name:'Báo cáo',exact:true}).click();await page.getByRole('button',{name:'Nạp bộ dữ liệu demo'}).click();await page.locator('#edit-form').getByRole('button',{name:'Đóng',exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('chrono-watch-v1')).orders.length)).toBe(0);
  await page.getByRole('button',{name:'Nạp bộ dữ liệu demo'}).click();await page.getByRole('button',{name:'Nạp dữ liệu demo',exact:true}).click();await expect(page.locator('#content h1')).toHaveText('Tổng quan cửa hàng');
  const data=await page.evaluate(()=>({db:JSON.parse(localStorage.getItem('chrono-watch-v1')),qa:localStorage.getItem('chrono-qa-results-v1')}));expect(data.db.orders).toHaveLength(18);expect(data.db.products).toHaveLength(18);expect(data.db.users).toHaveLength(2);expect(data.qa).toBe('marker-keep');
  await page.goto('/home.html');await expect(page.locator('.product-card')).toHaveCount(17);
});
test('LAB-06 Staff không có tác vụ nạp demo',async({page})=>{
  await page.goto('/index.html');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('staff');await page.getByLabel('Mật khẩu',{exact:true}).fill('Staff@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('button',{name:'Báo cáo',exact:true}).click();await expect(page.getByRole('button',{name:'Nạp bộ dữ liệu demo'})).toHaveCount(0);
});
test('LAB-07 Giao diện lab và QA trên mobile/desktop',async({page},info)=>{
  for(const width of [390,1440]){await page.setViewportSize({width,height:960});await page.goto('/lab.html');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await info.attach('lab-'+width,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await info.attach('qa-'+width,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});}
});
