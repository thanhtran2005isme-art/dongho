const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const dir=path.resolve(__dirname,'../docs/evidence/aurel-2026-11-26');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'vi-VN'}),base=process.env.CHRONO_PREVIEW_URL||'http://127.0.0.1:5518';
  for(const width of [1440,390,768]){await page.setViewportSize({width,height:1000});await page.goto(base+'/home.html');await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images){img.loading='eager';await img.decode();}});await page.screenshot({path:path.join(dir,'home-'+width+'.png'),fullPage:true});if(width===1440)await page.screenshot({path:path.join(dir,'home-first-view.png'),fullPage:false});}
  await page.setViewportSize({width:1440,height:1000});for(const name of ['qa','lab']){await page.goto(base+'/'+name+'.html');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(dir,name+'.png'),fullPage:false});}
  await page.goto(base+'/index.html');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.screenshot({path:path.join(dir,'admin.png'),fullPage:false});
  console.log('Đã chụp 7 ảnh AUREL trong '+dir);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
