const {test,expect}=require('@playwright/test');

test('QA-09 Lỗi tải test case hiện ở đầu trang và có thể thử lại',async({page})=>{
  let failOnce=true;
  await page.route('**/docs/TEST-CASES.csv',route=>{
    if(failOnce){failOnce=false;return route.abort();}
    return route.continue();
  });
  await page.goto('/qa.html');
  await expect(page.locator('.qa-load-status')).toHaveAttribute('data-state','error');
  await expect(page.locator('#qa-message')).toContainText('Không thể mở sổ kiểm thử');
  await page.locator('#run-settings > summary').click();
  await expect(page.getByRole('button',{name:'Xuất kết quả JSON'})).toBeDisabled();
  await page.getByRole('button',{name:'Thử tải lại'}).click();
  await expect(page.locator('.qa-load-status')).toHaveAttribute('data-state','ready');
  await expect(page.locator('#qa-message')).toContainText('Đã tải 90 test case');
  await expect(page.locator('#case-list tr')).toHaveCount(90);
  await expect(page.getByRole('button',{name:'Xuất kết quả JSON'})).toBeEnabled();
  await expect(page.getByRole('link',{name:'Xem test case'})).toHaveAttribute('href','#cases-section');
  await expect(page.getByRole('link',{name:'Xem test case'})).toBeVisible();
});
