const {defineConfig}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const installedChrome=process.platform==='win32'&&fs.existsSync(path.join(process.env.ProgramFiles||'C:/Program Files','Google/Chrome/Application/chrome.exe'));
const channel=process.env.CHRONO_BROWSER_CHANNEL||(installedChrome?'chrome':undefined);
module.exports=defineConfig({
  testDir:'./tests/e2e',fullyParallel:true,workers:2,forbidOnly:!!process.env.CI,
  retries:0,timeout:30000,globalTimeout:180000,
  expect:{timeout:5000},
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:5517',browserName:'chromium',channel,locale:'vi-VN',timezoneId:'Asia/Ho_Chi_Minh',viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'node scripts/test-server.cjs',url:'http://127.0.0.1:5517',reuseExistingServer:false,timeout:20000}
});
