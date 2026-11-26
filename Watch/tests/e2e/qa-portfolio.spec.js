const {test,expect}=require('@playwright/test');

test('PORT-01 Hồ sơ trình bày nguồn, 8 câu hỏi và dẫn vào trang QA',async({page},info)=>{
  await page.goto('/qa-portfolio.html');
  await expect(page.getByRole('heading',{name:/Kiểm thử & đảm bảo/})).toBeVisible();
  await expect(page.locator('.question')).toHaveCount(8);
  await expect(page.locator('#source')).toContainText('AI hỗ trợ tạo');
  await expect(page.locator('#results')).toContainText('Not Run');
  const provenance=await page.request.get('/docs/AI-PROVENANCE.md');expect(provenance.ok()).toBe(true);
  const skill=await page.request.get('/skills/watch-qa/SKILL.md');expect(skill.ok()).toBe(true);
  await info.attach('desktop-portfolio',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  await page.getByRole('link',{name:'Mở trang thực thi kiểm thử'}).click();
  await expect(page).toHaveURL(/\/qa\.html$/);
  await expect(page.getByRole('button',{name:'Chạy 24 ca'})).toBeVisible();
});

test('PORT-02 Hồ sơ đọc được trên màn hình điện thoại',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/qa-portfolio.html');
  await expect(page.getByRole('navigation',{name:'Điều hướng hồ sơ'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('#demo')).toContainText('Demo 10 phút');
  await info.attach('mobile-portfolio',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
