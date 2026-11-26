/* Sinh script thực hành từ mẫu được quản lý cùng mã nguồn. Không chạy Katalon. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'testing','katalon');fs.mkdirSync(dir,{recursive:true});
const setup=`import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.testobject.SelectorMethod

// Chạy trong cửa sổ kiểm thử riêng. Chỉ reset các khóa AUREL của browser test.
String base = System.getProperty('chrono.baseUrl', 'http://127.0.0.1:5517')
def obj = { String selector ->
    TestObject target = new TestObject(selector)
    target.setSelectorMethod(SelectorMethod.CSS)
    target.setSelectorValue(SelectorMethod.CSS, selector)
    return target
}
def click = { String selector ->
    WebUI.waitForElementVisible(obj(selector), 10)
    WebUI.click(obj(selector))
}
def fill = { String selector, String value -> WebUI.setText(obj(selector), value) }
def stored = { -> WebUI.executeJavaScript("return JSON.parse(localStorage.getItem('chrono-watch-v1'))", []) }
def login = { String username, String password ->
    fill('input[name=username]', username)
    fill('input[name=password]', password)
    click('#login-form button[type=submit]')
}
WebUI.openBrowser('')
try {
    WebUI.navigateToUrl(base + '/index.html')
    WebUI.executeJavaScript("['chrono-watch-v1','chrono-session','chrono-remembered-username','chrono-qa-runs-v2','chrono-qa-results-v1','chrono-smoke-history-v1','chrono-smoke-latest-v1'].forEach(k=>localStorage.removeItem(k));sessionStorage.removeItem('chrono-session');sessionStorage.removeItem('chrono-qa-selected-run');", [])
    WebUI.refresh()
`;
const cases=[
['Đăng nhập admin',`login('admin','Admin@123')
WebUI.verifyElementText(obj('#content h1'), 'Tổng quan cửa hàng')
WebUI.verifyElementVisible(obj('button[data-view=users]'))
click('button[data-action=logout]')
WebUI.verifyElementVisible(obj('#login-form'))`],
['Đăng nhập staff',`login('staff','Staff@123')
WebUI.verifyElementNotPresent(obj('button[data-view=users]'), 2)
click('button[data-view=products]')
WebUI.verifyElementNotPresent(obj('button[data-action=product-new]'), 2)`],
['Sai mật khẩu',`login('admin','wrong')
WebUI.verifyElementVisible(obj('#login-form'))
assert WebUI.getText(obj('#login-error')).contains('không đúng')
assert WebUI.executeJavaScript("return localStorage.getItem('chrono-session')", []) == null`],
['Mã sản phẩm trùng',`login('admin','Admin@123')
click('button[data-view=products]')
click('button[data-action=product-new]')
fill('input[name=code]',' se001 ')
fill('input[name=name]','Sản phẩm trùng mã')
fill('input[name=price]','1000000')
click('#edit-form button[type=submit]')
assert WebUI.getText(obj('#form-error')).contains('đã tồn tại')
assert stored().products.size() == 7`],
['Giá bằng 0',`login('admin','Admin@123')
click('button[data-view=products]')
click('button[data-action=product-new]')
fill('input[name=code]','KTZERO')
fill('input[name=name]','Kiểm thử giá bằng không')
fill('input[name=price]','0')
click('#edit-form button[type=submit]')
assert WebUI.executeJavaScript("return document.querySelector('input[name=price]').validity.rangeUnderflow", []) == true
assert !stored().products.any { it.code == 'KTZERO' }`],
['Tạo khách hàng',`login('admin','Admin@123')
click('button[data-view=customers]')
click('button[data-action=customer-new]')
fill('input[name=name]','Khách mẫu Katalon')
fill('input[name=phone]','0900000099')
fill('input[name=email]','katalon@example.com')
click('#edit-form button[type=submit]')
WebUI.verifyTextPresent('Khách mẫu Katalon', false)
assert stored().customers.any { it.phone == '0900000099' }`],
['Tạo, xác nhận và hủy đơn',`login('admin','Admin@123')
click('button[data-view=orders]')
click('button[data-action=order-new]')
WebUI.selectOptionByValue(obj('select[name=customerId]'),'c1',false)
WebUI.selectOptionByValue(obj('.order-line select'),'p1',false)
fill('.order-line input','2')
click('#edit-form button[type=submit]')
def draft=stored().orders[0]
assert draft.status == 'draft'
assert stored().products.find { it.id == 'p1' }.stock == 8
click('button[data-action=order-detail][data-id="'+draft.id+'"]')
click('button[data-action=order-confirm]')
WebUI.waitForElementNotVisible(obj('#modal'),10)
assert stored().products.find { it.id == 'p1' }.stock == 6
click('button[data-action=order-detail][data-id="'+draft.id+'"]')
click('button[data-action=order-cancel]')
WebUI.waitForAlert(5)
WebUI.acceptAlert()
WebUI.waitForElementNotVisible(obj('#modal'),10)
assert stored().products.find { it.id == 'p1' }.stock == 8
assert stored().orders[0].status == 'cancelled'`],
['Bán vượt tồn kho',`login('admin','Admin@123')
click('button[data-view=orders]')
click('button[data-action=order-new]')
WebUI.selectOptionByValue(obj('select[name=customerId]'),'c1',false)
WebUI.selectOptionByValue(obj('.order-line select'),'p1',false)
fill('.order-line input','9')
click('#edit-form button[type=submit]')
def draft=stored().orders[0]
click('button[data-action=order-detail][data-id="'+draft.id+'"]')
click('button[data-action=order-confirm]')
WebUI.waitForElementVisible(obj('#toast'),10)
assert WebUI.getText(obj('#toast')).contains('Không đủ tồn kho')
assert stored().orders[0].status == 'draft'
assert stored().products.find { it.id == 'p1' }.stock == 8`],
['Tìm kiếm trang chủ',`WebUI.navigateToUrl(base+'/home.html')
fill('#search-products','Seiko')
WebUI.verifyTextPresent('Seiko Presage Cocktail Time',false)
assert WebUI.executeJavaScript("return document.querySelectorAll('.product-card').length",[]) == 1
fill('#search-products','không tồn tại')
WebUI.verifyTextPresent('Không tìm thấy sản phẩm phù hợp',false)`],
['Chạy 24 ca nghiệp vụ',`WebUI.navigateToUrl(base+'/qa.html')
WebUI.waitForElementClickable(obj('#run-smoke'),10)
click('#run-smoke')
assert WebUI.getText(obj('#smoke-summary')).contains('24 Pass, 0 Fail')
assert WebUI.executeJavaScript("return localStorage.getItem('chrono-watch-v1')",[]) != null
// Dữ liệu cửa hàng được tạo khi mở trang index ở setup và không bị bộ QA đổi.
assert stored().products.size() == 7`],
['Fail mô phỏng và retest',`WebUI.navigateToUrl(base+'/qa.html')
WebUI.waitForElementClickable(obj('#demo-smoke-fail'),10)
click('#demo-smoke-fail')
assert WebUI.getText(obj('#smoke-summary')).contains('11 Pass, 1 Fail')
click('#run-smoke')
assert WebUI.getText(obj('#smoke-summary')).contains('12 Pass, 0 Fail')
assert WebUI.getText(obj('#smoke-diff')).contains('Fail → Pass')
// Ca test này đạt khi phát hiện đúng lỗi mô phỏng và chạy lại thành công.`],
['Giao diện mobile',`WebUI.setViewPortSize(390,844)
WebUI.navigateToUrl(base+'/qa.html')
WebUI.waitForElementClickable(obj('#run-smoke'),10)
assert WebUI.executeJavaScript('return document.documentElement.scrollWidth <= innerWidth',[]) == true
WebUI.navigateToUrl(base+'/lab.html')
click('#tab-jmeter')
WebUI.verifyElementVisible(obj('#panel-jmeter'))
assert WebUI.executeJavaScript('return document.documentElement.scrollWidth <= innerWidth',[]) == true`]
];
cases.forEach(([name,body],i)=>{const id='KT-'+String(i+1).padStart(3,'0');fs.writeFileSync(path.join(dir,id+'.groovy'),'// '+id+' — '+name+'\n'+setup+body.split('\n').map(line=>'    '+line).join('\n')+'\n} finally {\n    WebUI.closeBrowser()\n}\n');});
console.log(`Đã tạo ${cases.length} script Katalon; trạng thái thực thi: Not Run.`);
