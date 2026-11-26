const {test,expect}=require('@playwright/test');

test('AUTO-01 Chạy toàn bộ 24 ca trên web và xuất kết quả',async({page})=>{
  await page.goto('/qa.html');
  await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  expect(await page.evaluate(()=>localStorage.getItem('chrono-watch-v1'))).toBeNull();
  await page.getByRole('button',{name:'Chạy 24 ca'}).click();
  await expect(page.locator('#smoke-summary')).toContainText('24 Pass, 0 Fail');
  await expect(page.locator('#smoke-list tr')).toHaveCount(24);
  expect(await page.evaluate(()=>localStorage.getItem('chrono-watch-v1'))).toBeNull();
  const pending=page.waitForEvent('download');await page.locator('#export-smoke').click();
  const file=await pending,report=JSON.parse(require('node:fs').readFileSync(await file.path(),'utf8'));
  expect(report.format).toBe('chrono-functional-smoke-v1');expect(report.group).toBe('all');expect(report.results).toHaveLength(24);
  expect(report.results.every(r=>r.status==='Pass')).toBe(true);
  await page.reload();await expect(page.locator('#smoke-summary')).toContainText('24 Pass, 0 Fail');
  await expect(page.locator('#metrics')).toContainText('Not Run');
});

test('AUTO-02 Hiển thị ca Fail khi quy tắc nghiệp vụ lỗi',async({page})=>{
  await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  await page.evaluate(()=>{WatchStore.product=()=>{throw Error('Lỗi mô phỏng nghiệp vụ');};});
  await page.getByRole('button',{name:'Chạy 24 ca'}).click();
  await expect(page.locator('#smoke-summary')).toContainText('Fail');
  await expect(page.locator('#smoke-list')).toContainText('Lỗi mô phỏng nghiệp vụ');
  await page.getByLabel('Lọc kết quả').selectOption('Fail');
  await expect(page.locator('#smoke-list .smoke-pass')).toHaveCount(0);
  await expect(page.locator('#smoke-list .smoke-fail')).toHaveCount(5);
  await expect(page.locator('#metrics')).toContainText('Not Run');
});

test('AUTO-03 Lưu lịch sử chạy và so sánh ca hồi quy',async({page})=>{
  await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  await page.getByLabel('Nhóm kiểm thử').selectOption('basic');
  await page.getByRole('button',{name:'Chạy 12 ca'}).click();
  await expect(page.locator('#smoke-summary')).toContainText('12 Pass, 0 Fail');
  await page.evaluate(()=>{WatchStore.product=()=>{throw Error('Lỗi giả lập sau sửa mã');};});
  await page.getByRole('button',{name:'Chạy 12 ca'}).click();
  await expect(page.locator('#smoke-run-picker option')).toHaveCount(2);
  await expect(page.locator('#smoke-diff')).toContainText('3 ca Pass → Fail (AT-001, AT-002, AT-009)');
  await page.getByRole('combobox',{name:'Lần chạy đã lưu'}).selectOption('1');
  await expect(page.locator('#smoke-summary')).toContainText('12 Pass, 0 Fail');
  const pending=page.waitForEvent('download');await page.locator('#export-smoke').click();
  const file=await pending,report=JSON.parse(require('node:fs').readFileSync(await file.path(),'utf8'));
  expect(report.results.every(r=>r.status==='Pass')).toBe(true);
  await page.reload();
  await expect(page.locator('#smoke-run-picker option')).toHaveCount(2);
  await expect(page.locator('#smoke-diff')).toContainText('3 ca Pass → Fail');
  await page.getByLabel('Nhóm kiểm thử').selectOption('basic');
  await page.getByRole('button',{name:'Chạy 12 ca'}).click();
  await expect(page.locator('#smoke-run-picker option')).toHaveCount(3);
  await expect(page.locator('#smoke-diff')).toContainText('3 ca Fail → Pass (AT-001, AT-002, AT-009)');
});

test('AUTO-04 Demo Fail mô phỏng rồi chạy lại Pass',async({page})=>{
  await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');
  await page.getByRole('button',{name:'Demo Fail mô phỏng'}).click();
  await expect(page.locator('#smoke-summary')).toContainText('DEMO FAIL MÔ PHỎNG');
  await expect(page.locator('#smoke-summary')).toContainText('11 Pass, 1 Fail');
  await expect(page.locator('#smoke-list tr').filter({hasText:'AT-001'})).toContainText('Fail');
  const pending=page.waitForEvent('download');await page.locator('#export-smoke').click();
  const file=await pending,report=JSON.parse(require('node:fs').readFileSync(await file.path(),'utf8'));
  expect(report.demoFault).toBe(true);
  expect(await page.evaluate(()=>localStorage.getItem('chrono-watch-v1'))).toBeNull();
  await page.getByRole('button',{name:'Chạy 12 ca'}).click();
  await expect(page.locator('#smoke-summary')).toContainText('12 Pass, 0 Fail');
  await expect(page.locator('#smoke-diff')).toContainText('1 ca Fail → Pass (AT-001)');
});

test('AUTO-05 Chạy theo nhóm và đọc lại kết quả 12 ca đã lưu trước đây',async({page})=>{
  await page.goto('/qa.html');
  await page.evaluate(()=>{
    const legacy=ChronoSmoke.run('basic');
    delete legacy.group;
    localStorage.setItem('chrono-smoke-history-v1',JSON.stringify([legacy]));
  });
  await page.reload();
  await expect(page.locator('#smoke-summary')).toContainText('12 Pass, 0 Fail');
  await page.getByLabel('Nhóm kiểm thử').selectOption('customers');
  await page.getByRole('button',{name:'Chạy 3 ca',exact:true}).click();
  await expect(page.locator('#smoke-summary')).toContainText('Khách hàng · 3 Pass, 0 Fail');
  await expect(page.locator('#smoke-list tr')).toHaveCount(3);
  await expect(page.locator('#smoke-list')).toContainText('AT-016');
  await expect(page.locator('#smoke-diff')).toBeHidden();
  await page.getByLabel('Lọc kết quả').selectOption('Fail');
  await expect(page.locator('#smoke-list')).toContainText('Không có ca Fail');

  await page.getByLabel('Nhóm kiểm thử').selectOption('basic');
  await page.getByRole('button',{name:'Chạy 12 ca',exact:true}).click();
  await expect(page.locator('#smoke-diff')).toContainText('cùng nhóm');
  await expect(page.locator('#smoke-run-picker option')).toHaveCount(3);
});
