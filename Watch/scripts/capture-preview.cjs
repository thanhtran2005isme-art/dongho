const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const dir=path.resolve(__dirname,'../docs/evidence/local-2026-11-26');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:process.env.CHRONO_BROWSER_CHANNEL||'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'vi-VN',timezoneId:'Asia/Ho_Chi_Minh'});
  const base=process.env.CHRONO_PREVIEW_URL||'http://127.0.0.1:5518';
  for(const [file,name]of [['lab.html','lab'],['qa.html','qa']]){
   await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/'+file);if(name==='qa')await page.locator('#practice-search').waitFor({state:'visible'});
   await page.screenshot({path:path.join(dir,name+'-desktop.png'),fullPage:false});
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,name+'-mobile.png'),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/index.html');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await page.getByRole('button',{name:'Báo cáo',exact:true}).click();await page.getByRole('button',{name:'Nạp bộ dữ liệu demo'}).click();await page.getByRole('button',{name:'Nạp dữ liệu demo',exact:true}).click();await page.getByRole('heading',{name:'Tổng quan cửa hàng'}).waitFor();await page.screenshot({path:path.join(dir,'dashboard-demo.png'),fullPage:true});
  await page.goto(base+'/home.html');await page.screenshot({path:path.join(dir,'storefront-demo.png'),fullPage:false});
  console.log('Đã chụp 6 ảnh trong '+dir+'; browser context riêng, không thay dữ liệu người dùng.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
