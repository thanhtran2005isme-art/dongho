// KT-011 — Fail mô phỏng và retest
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
    WebUI.navigateToUrl(base+'/qa.html')
    WebUI.waitForElementClickable(obj('#demo-smoke-fail'),10)
    click('#demo-smoke-fail')
    assert WebUI.getText(obj('#smoke-summary')).contains('11 Pass, 1 Fail')
    click('#run-smoke')
    assert WebUI.getText(obj('#smoke-summary')).contains('12 Pass, 0 Fail')
    assert WebUI.getText(obj('#smoke-diff')).contains('Fail → Pass')
    // Ca test này đạt khi phát hiện đúng lỗi mô phỏng và chạy lại thành công.
} finally {
    WebUI.closeBrowser()
}
