// KT-004 — Mã sản phẩm trùng
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
    login('admin','Admin@123')
    click('button[data-view=products]')
    click('button[data-action=product-new]')
    fill('input[name=code]',' se001 ')
    fill('input[name=name]','Sản phẩm trùng mã')
    fill('input[name=price]','1000000')
    click('#edit-form button[type=submit]')
    assert WebUI.getText(obj('#form-error')).contains('đã tồn tại')
    assert stored().products.size() == 7
} finally {
    WebUI.closeBrowser()
}
