const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{await page.goto('/qa.html');await expect(page.locator('#qa-message')).toContainText('Đã tải 90');});

async function openRunSettings(page) {
  await page.locator('#run-settings > summary').click();
}
test('QA-01 Tải đủ 90 ca và lọc trạng thái/ưu tiên',async({page})=>{
  await expect(page.locator('#case-list tr')).toHaveCount(90);await expect(page.locator('#metrics')).toContainText('N/A');
  await page.getByRole('combobox',{name:'Trạng thái',exact:true}).selectOption('Fail');await expect(page.locator('#case-list')).toContainText('Không có ca phù hợp');
  await page.getByRole('combobox',{name:'Trạng thái',exact:true}).selectOption('');await page.getByLabel('Tìm test case',{exact:true}).fill('TC-001');await expect(page.locator('#case-list tr')).toHaveCount(1);await expect(page.locator('#case-list')).toContainText('Đăng nhập admin');
  expect(await page.evaluate(()=>localStorage.getItem('chrono-watch-v1'))).toBeNull();
});
test('QA-02 Pass cần bằng chứng, lưu và tải lại giữ kết quả',async({page})=>{
  await page.getByRole('button',{name:'Ghi kết quả TC-001',exact:true}).click();await page.getByRole('combobox',{name:'Kết quả thực thi',exact:true}).selectOption('Pass');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-error')).toContainText('kết quả thực tế');
  await page.getByLabel('Kết quả thực tế / Lý do bị chặn',{exact:true}).fill('Dữ liệu kiểm thử sổ QA, không phải bằng chứng thực thi TC-001.');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-error')).toContainText('bằng chứng');
  await page.getByLabel('Bằng chứng',{exact:true}).fill('test-only-reference.png');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-dialog')).not.toBeVisible();await page.reload();
  await expect(page.locator('#case-list tr').filter({hasText:'TC-001'})).toContainText('Pass');await expect(page.locator('#metrics')).toContainText('100.0%');
});
test('QA-03 Fail cần Bug ID và Blocked không tính vào tỷ lệ đạt',async({page})=>{
  await page.getByRole('button',{name:'Ghi kết quả TC-001',exact:true}).click();await page.getByRole('combobox',{name:'Kết quả thực thi',exact:true}).selectOption('Fail');await page.getByLabel('Kết quả thực tế / Lý do bị chặn',{exact:true}).fill('Giả lập nhập liệu QA');await page.getByLabel('Bằng chứng',{exact:true}).fill('reference.png');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-error')).toContainText('Bug ID');
  await page.getByLabel('Bug ID',{exact:true}).fill('TEST-ONLY');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-dialog')).not.toBeVisible();
  await page.getByRole('button',{name:'Ghi kết quả TC-002',exact:true}).click();await page.getByRole('combobox',{name:'Kết quả thực thi',exact:true}).selectOption('Blocked');await page.getByLabel('Kết quả thực tế / Lý do bị chặn',{exact:true}).fill('Giả lập môi trường chưa sẵn sàng');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-dialog')).not.toBeVisible();await expect(page.locator('#result-count')).toContainText('Đã thực thi 1/90');
});
test('QA-04 Xuất JSON/Markdown và nội dung người dùng không chạy HTML',async({page})=>{
  await openRunSettings(page);
  const payload='<img src=x onerror=alert(1)>';
  await page.getByLabel('Người thực thi',{exact:true}).fill(payload);await page.getByRole('button',{name:'Lưu thông tin đợt',exact:true}).click();
  const jsonDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất kết quả JSON',exact:true}).click();const jsonFile=await jsonDownload;const fs=require('node:fs');const exported=JSON.parse(fs.readFileSync(await jsonFile.path(),'utf8'));
  expect(exported.cases).toHaveLength(90);expect(exported.summary['Not Run']).toBe(90);expect(exported.meta.tester).toBe(payload);await expect(page.locator('img')).toHaveCount(0);
  const mdDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất báo cáo Markdown',exact:true}).click();const mdFile=await mdDownload;const md=fs.readFileSync(await mdFile.path(),'utf8');expect(md).toContain('Tỷ lệ đạt trong ca đã thực thi: N/A');expect(md).toContain('TC-060');
});

test('QA-05 Đợt mới độc lập và chuyển lại giữ kết quả cũ',async({page})=>{
  await page.getByRole('button',{name:'Ghi kết quả TC-001',exact:true}).click();await page.getByRole('combobox',{name:'Kết quả thực thi',exact:true}).selectOption('Blocked');await page.getByLabel('Kết quả thực tế / Lý do bị chặn',{exact:true}).fill('Dữ liệu giả lập cho test công cụ');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();await expect(page.locator('#case-dialog')).not.toBeVisible();
  const oldId=await page.locator('#run-picker').inputValue();await openRunSettings(page);await page.getByLabel('Tên đợt mới',{exact:true}).fill('Regression 2');await page.getByRole('button',{name:'Tạo đợt mới',exact:true}).click();
  await expect(page.locator('#case-list tr').filter({hasText:'TC-001'})).toContainText('Not Run');await expect(page.locator('#run-picker option')).toHaveCount(2);
  await page.getByRole('combobox',{name:'Đợt đang xem',exact:true}).selectOption(oldId);await expect(page.locator('#case-list tr').filter({hasText:'TC-001'})).toContainText('Blocked');await page.reload();await expect(page.locator('#run-picker')).toHaveValue(oldId);
});
test('QA-06 Xuất và nhập thành đợt mới, chặn file sai',async({page})=>{
  await openRunSettings(page);
  const fs=require('node:fs');await page.getByLabel('Tên đợt kiểm thử',{exact:true}).fill('Đợt xuất');await page.getByRole('button',{name:'Lưu thông tin đợt',exact:true}).click();
  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất kết quả JSON',exact:true}).click();const file=await downloading;const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));
  page.once('dialog',d=>d.accept());await page.locator('#import-run').setInputFiles({name:'results.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await expect(page.locator('#qa-message')).toContainText('Đã khôi phục');await expect(page.locator('#run-picker option')).toHaveCount(2);
  data.cases[0].result.status='Pass';await page.locator('#import-run').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await expect(page.locator('#qa-message')).toContainText('Thiếu kết quả');await expect(page.locator('#run-picker option')).toHaveCount(2);
  data.cases[0]=data.cases[1];await page.locator('#import-run').setInputFiles({name:'duplicate.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await expect(page.locator('#qa-message')).toContainText('sai hoặc trùng');await expect(page.locator('#run-picker option')).toHaveCount(2);
});
test('QA-07 Chuyển dữ liệu cũ sang nhiều đợt không xóa bản cũ',async({page})=>{
  const legacy={meta:{runName:'Đợt cũ'},results:{'TC-001':{status:'Blocked',actual:'Dữ liệu test migration',evidence:'',bugId:''}}};
  await page.evaluate(value=>{localStorage.removeItem('chrono-qa-runs-v2');localStorage.setItem('chrono-qa-results-v1',JSON.stringify(value));},legacy);await page.reload();
  await openRunSettings(page);
  await expect(page.getByLabel('Tên đợt kiểm thử',{exact:true})).toHaveValue('Đợt cũ');await expect(page.locator('#case-list tr').filter({hasText:'TC-001'})).toContainText('Blocked');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('chrono-qa-results-v1')))).toEqual(legacy);
});
test('QA-08 CSV giữ đủ 90 ca, tiếng Việt và vô hiệu công thức Excel',async({page})=>{
  const fs=require('node:fs');await page.getByRole('button',{name:'Ghi kết quả TC-001',exact:true}).click();
  await page.getByRole('combobox',{name:'Kết quả thực thi',exact:true}).selectOption('Blocked');await page.getByLabel('Kết quả thực tế / Lý do bị chặn',{exact:true}).fill('=HYPERLINK("https://example.test","Mở")');await page.getByRole('button',{name:'Lưu kết quả',exact:true}).click();
  await openRunSettings(page);
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất CSV cho Excel',exact:true}).click();const file=await pending;const csv=fs.readFileSync(await file.path(),'utf8');
  expect(csv.charCodeAt(0)).toBe(0xFEFF);expect(csv).toContain('"Kết quả thực tế"');expect(csv).toContain('"Đăng nhập admin"');expect(csv).toContain('"\'=HYPERLINK(');expect((csv.match(/"TC-\d{3}"/g)||[])).toHaveLength(90);
});

test('QA-10 Ca chưa chạy tiếp theo và sổ lỗi theo từng đợt',async({page})=>{
  await expect(page.locator('#fail-list')).toContainText('Chưa có ca Fail');
  await page.getByRole('button',{name:'Bắt đầu TC-001'}).click();
  await expect(page.locator('#case-title')).toContainText('TC-001');
  await page.getByRole('combobox',{name:'Kết quả thực thi'}).selectOption('Fail');
  await page.getByLabel('Bug ID',{exact:true}).fill('BUG-001');
  await page.getByLabel('Kết quả thực tế / Lý do bị chặn').fill('Đăng nhập bị từ chối dù dữ liệu đúng');
  await page.getByLabel('Bằng chứng',{exact:true}).fill('evidence/login-fail.png');
  await page.getByRole('button',{name:'Lưu kết quả'}).click();
  await expect(page.locator('#fail-count')).toHaveText('1 ca Fail');
  await expect(page.locator('#fail-list')).toContainText('BUG-001');
  await expect(page.getByRole('button',{name:'Bắt đầu TC-002'})).toBeVisible();
  await page.getByRole('button',{name:'Mở lỗi TC-001'}).click();
  await expect(page.getByLabel('Bug ID',{exact:true})).toHaveValue('BUG-001');
  await page.getByRole('button',{name:'Đóng chi tiết'}).click();
  await openRunSettings(page);
  await page.getByLabel('Tên đợt mới',{exact:true}).fill('Đợt mới');
  await page.getByRole('button',{name:'Tạo đợt mới'}).click();
  await expect(page.locator('#fail-list')).toContainText('Chưa có ca Fail');
  await expect(page.getByRole('button',{name:'Bắt đầu TC-001'})).toBeVisible();
});

test('QA-11 Xuất CSV lỗi chỉ gồm ca Fail của đợt hiện tại',async({page})=>{
  const fs=require('node:fs');
  await expect(page.getByRole('button',{name:'Xuất lỗi CSV'})).toBeDisabled();
  await openRunSettings(page);
  await page.getByLabel('Tên đợt kiểm thử',{exact:true}).fill('Hồi quy tháng 11');
  await page.getByRole('button',{name:'Lưu thông tin đợt'}).click();
  await page.getByRole('button',{name:'Ghi kết quả TC-001'}).click();
  await page.getByRole('combobox',{name:'Kết quả thực thi'}).selectOption('Fail');
  await page.getByLabel('Bug ID',{exact:true}).fill('BUG-007');
  await page.getByLabel('Kết quả thực tế / Lý do bị chặn').fill('=HYPERLINK("https://example.test","Mở")');
  await page.getByLabel('Bằng chứng',{exact:true}).fill('evidence/bug-007.png');
  await page.getByRole('button',{name:'Lưu kết quả'}).click();
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Xuất lỗi CSV'}).click();
  const file=await pending,csv=fs.readFileSync(await file.path(),'utf8');
  expect(csv.charCodeAt(0)).toBe(0xFEFF);
  expect(csv).toContain('"BUG-007"');expect(csv).toContain('"TC-001"');
  expect(csv).toContain('"Hồi quy tháng 11"');expect(csv).toContain('"Các bước tái hiện"');
  expect(csv).toContain('"\'=HYPERLINK(');
  expect(csv).not.toContain('"TC-002"');
  await page.getByLabel('Tên đợt mới',{exact:true}).fill('Đợt trắng');
  await page.getByRole('button',{name:'Tạo đợt mới'}).click();
  await expect(page.getByRole('button',{name:'Xuất lỗi CSV'})).toBeDisabled();
});
test('QA-12 Nhập báo cáo cũ 60 ca và giữ ca mới Not Run',async({page})=>{const fs=require('node:fs');await openRunSettings(page);const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất kết quả JSON',exact:true}).click();const file=await downloading;const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));data.cases=data.cases.slice(0,60);page.once('dialog',d=>d.accept());await page.locator('#import-run').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await expect(page.locator('#qa-message')).toContainText('Đã khôi phục');await page.getByLabel('Tìm test case',{exact:true}).fill('TC-090');await expect(page.locator('#case-list')).toContainText('Not Run');});
test('QA-13 Lọc theo chức năng kết hợp trạng thái và xóa bộ lọc',async({page})=>{await page.getByRole('combobox',{name:'Chức năng',exact:true}).selectOption({label:'Trang chủ'});await expect(page.locator('#result-count')).toContainText('10/90');await page.getByRole('combobox',{name:'Trạng thái',exact:true}).selectOption('Fail');await expect(page.locator('#case-list')).toContainText('Không có ca phù hợp');await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();await expect(page.locator('#case-list tr')).toHaveCount(90);await expect(page.getByRole('combobox',{name:'Chức năng',exact:true})).toHaveValue('');});
test('QA-14 Hướng dẫn thực hành mở ca ví dụ và liên kết cửa hàng',async({page})=>{await page.getByRole('button',{name:'Thử ca sai mật khẩu · TC-003 →'}).click();await expect(page.locator('#case-dialog')).toBeVisible();await expect(page.locator('#case-title')).toContainText('TC-003');await expect(page.getByRole('link',{name:'mở cửa hàng trong tab mới'})).toHaveAttribute('href','index.html');await expect(page.getByRole('combobox',{name:'Kết quả thực thi'})).toHaveValue('Not Run');});

test('QA-15 Thực hành tìm kiếm, lưu kết quả và mở ca tiếp theo',async({page})=>{
  const progress=page.locator('#manual-progress');
  await expect(page.getByRole('progressbar').and(progress)).toBeVisible();
  await expect(progress).toHaveJSProperty('value',0);
  await page.getByRole('button',{name:'Thực hành tìm kiếm · TC-064'}).click();
  const dialog=page.locator('#case-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading',{name:/TC-064/})).toBeVisible();

  const homeLink=dialog.getByRole('link',{name:'Mở trang chủ trong tab mới'});
  await expect(homeLink).toHaveAttribute('href','home.html');
  await expect(homeLink).toHaveAttribute('target','_blank');
  const openingHome=page.waitForEvent('popup');
  await homeLink.click();
  const home=await openingHome;
  await home.getByLabel('Tìm đồng hồ').fill('chrono-khong-ton-tai');
  await home.getByLabel('Tìm đồng hồ').press('Enter');
  await expect(home.locator('#products')).toContainText('Không tìm thấy');
  await home.close();
  await expect(dialog.getByRole('heading',{name:/TC-064/})).toBeVisible();

  const status=dialog.getByRole('combobox',{name:'Kết quả thực thi'});
  const bugId=dialog.getByLabel('Bug ID',{exact:true});
  await expect(status).toHaveValue('Not Run');
  await expect(bugId).toBeHidden();
  await status.selectOption('Fail');
  await expect(bugId).toBeVisible();
  await status.selectOption('Pass');
  await expect(bugId).toBeHidden();

  const saveNext=dialog.getByRole('button',{name:'Lưu và mở ca tiếp theo'});
  await saveNext.click();
  await expect(dialog.getByRole('heading',{name:/TC-064/})).toBeVisible();
  await expect(progress).toHaveJSProperty('value',0);
  await dialog.getByLabel('Kết quả thực tế / Lý do bị chặn').fill('Trang hiển thị thông báo không tìm thấy sản phẩm.');
  await dialog.getByLabel('Bằng chứng',{exact:true}).fill('evidence/tc-064.png');
  await saveNext.click();
  await expect(dialog.getByRole('heading',{name:/TC-065/})).toBeVisible();
  await expect(status).toHaveValue('Not Run');
  await dialog.getByRole('button',{name:'Đóng chi tiết'}).click();
  await expect(progress).toHaveJSProperty('value',1);
  await expect(page.locator('#case-list tr').filter({hasText:'TC-064'})).toContainText('Pass');
});
