const {test,expect}=require('@playwright/test');
test('HOME-01 Tìm kiếm và lọc danh mục trang chủ',async({page})=>{await page.goto('/home.html');await expect(page.locator('.product-card')).toHaveCount(6);await page.getByLabel('Tìm đồng hồ').fill('Seiko');await expect(page.locator('.product-card')).toHaveCount(1);await page.getByRole('button',{name:'Xóa bộ lọc ×'}).click();await page.getByRole('button',{name:'Đồng hồ điện tử'}).click();await expect(page.locator('.product-card')).toHaveCount(2);await page.getByLabel('Tìm đồng hồ').fill('không tồn tại');await expect(page.locator('#products')).toContainText('Không tìm thấy');});
test('HOME-02 Điều hướng và màn hình nhỏ',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/home.html');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByTestId('header-account-link').click();await expect(page).toHaveURL(/login\.html/);await page.goto('/home.html');await page.getByTestId('admin-portal-link').click();await expect(page).toHaveURL(/index\.html/);await page.getByRole('link',{name:'Trang chủ cửa hàng'}).click();await page.getByRole('link',{name:'Theo dõi kiểm thử'}).click();await expect(page.locator('#qa-message')).toContainText('Đã tải 90');});
test('ACC-01 Sửa và xóa nhân viên chưa có lịch sử',async({page})=>{await page.goto('/index.html');await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('Admin@123');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('button',{name:'Tài khoản',exact:true}).click();const row=page.getByRole('row').filter({has:page.getByRole('cell',{name:'staff',exact:true})});await row.getByRole('button',{name:'Sửa'}).click();await page.getByLabel('Họ tên *').fill('Nhân viên QA');await page.getByRole('button',{name:'Lưu thay đổi'}).click();await expect(row).toContainText('Nhân viên QA');page.once('dialog',d=>d.accept());await row.getByRole('button',{name:'Xóa'}).click();await expect(row).toHaveCount(0);});

test('HOME-03 | TC-064 Tìm bằng Enter và phục hồi danh sách sau khi không có kết quả', async ({page})=>{
  await page.goto('/home.html');
  const search=page.getByLabel('Tìm đồng hồ');
  const productCount=page.locator('#product-count');
  await expect(productCount).toHaveText('6 sản phẩm');

  await search.fill('chrono-khong-ton-tai');
  await search.press('Enter');
  await expect(productCount).toHaveText('0 sản phẩm');
  await expect(page.getByText('Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác.')).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(0);

  await page.getByRole('button',{name:'Xóa bộ lọc ×'}).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(productCount).toHaveText('6 sản phẩm');
  await expect(page.locator('.product-card')).toHaveCount(6);
});

test('ACC-02 Ghi nhớ tên đăng nhập và xóa lựa chọn sau khi bỏ tích', async ({page})=>{
  await page.route('https://cdn-uicons.flaticon.com/**',route=>route.abort());
  await page.goto('/index.html');
  const username=page.getByLabel('Tên đăng nhập',{exact:true});
  const password=page.getByLabel('Mật khẩu',{exact:true});
  const remember=page.getByRole('checkbox',{name:'Ghi nhớ tên đăng nhập'});
  const login=page.getByRole('button',{name:'Đăng nhập',exact:true});
  const logout=page.getByRole('button',{name:'Đăng xuất',exact:true});

  await username.fill('admin');
  await password.fill('Admin@123');
  await remember.check();
  await login.click();
  await logout.click();
  await page.reload();
  await expect(username).toHaveValue('admin');
  await expect(password).toBeEmpty();
  await expect(remember).toBeChecked();

  await remember.uncheck();
  await password.fill('Admin@123');
  await login.click();
  await logout.click();
  await page.reload();
  await expect(username).toBeEmpty();
  await expect(remember).not.toBeChecked();
});

test('ACC-03 Chặn tên nhân viên trùng và dùng được thông tin đăng nhập mới', async ({page})=>{
  await page.route('https://cdn-uicons.flaticon.com/**',route=>route.abort());
  await page.goto('/index.html');
  const username=page.getByLabel('Tên đăng nhập',{exact:true});
  const password=page.getByLabel('Mật khẩu',{exact:true});
  const login=page.getByRole('button',{name:'Đăng nhập',exact:true});
  await username.fill('admin');
  await password.fill('Admin@123');
  await login.click();
  await page.getByRole('button',{name:'Tài khoản',exact:true}).click();

  const employee=page.getByRole('row').filter({has:page.getByRole('cell',{name:'staff',exact:true})});
  await employee.getByRole('button',{name:'Sửa',exact:true}).click();
  const dialog=page.getByRole('dialog');
  const editUsername=dialog.getByLabel('Tên đăng nhập *',{exact:true});
  const save=dialog.getByRole('button',{name:'Lưu thay đổi',exact:true});
  await editUsername.fill('ADMIN');
  await save.click();
  await expect(dialog.getByRole('alert')).toHaveText('Tên đăng nhập đã tồn tại.');

  await editUsername.fill('staff_qa');
  await dialog.getByLabel('Mật khẩu mới (để trống nếu giữ nguyên)',{exact:true}).fill('StaffQA@456');
  await save.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell',{name:'staff_qa',exact:true})).toBeVisible();
  await expect(employee).toHaveCount(0);

  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await username.fill('staff_qa');
  await password.fill('Staff@123');
  await login.click();
  await expect(page.locator('#login-error')).toContainText('không đúng');
  await password.fill('StaffQA@456');
  await login.click();
  await expect(page.getByRole('heading',{name:'Tổng quan cửa hàng'})).toBeVisible();
  await expect(page.getByText('Nhân viên bán hàng',{exact:true})).toBeVisible();
});
