const {test,expect}=require('@playwright/test');
test('ICON-01 Biểu tượng SVG nội bộ hiển thị khi chặn toàn bộ mạng ngoài',async({page},info)=>{
 await page.route('**/*',route=>{const url=new URL(route.request().url());return url.hostname==='127.0.0.1'?route.continue():route.abort();});
 await page.goto('/');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
 const icon=page.locator('.sidebar .brand-icon svg');await expect(icon).toBeVisible();await expect(icon.locator('circle')).toHaveCount(1);await expect(page.locator('link[href*="cdn-uicons"]')).toHaveCount(0);
 const size=await icon.boundingBox();expect(size.width).toBeGreaterThan(10);expect(size.height).toBeGreaterThan(10);
 await info.attach('icons-offline',{body:await page.screenshot({fullPage:false}),contentType:'image/png'});
});
