// KT-013 — Đăng ký và đăng nhập tài khoản khách tách biệt admin
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

WebUI.openBrowser('')
try {
    WebUI.navigateToUrl(base + '/register.html')
    WebUI.executeJavaScript("['chrono-watch-v1','chrono-session','chrono-customer-accounts-v1','chrono-customer-session-v1','chrono-cart-v1','chrono-wishlist-v1'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();", [])
    WebUI.refresh()

    fill('#reg-name', 'Khách Katalon')
    fill('#reg-email', 'katalon.customer@example.com')
    fill('#reg-phone', '0901234567')
    fill('#reg-password', 'Customer@123')
    fill('#reg-confirm', 'Customer@123')
    click('[data-testid="register-submit-btn"]')
    WebUI.waitForElementVisible(obj('[data-testid="account-email"]'), 10)
    assert WebUI.getText(obj('[data-testid="account-email"]')) == 'katalon.customer@example.com'

    click('[data-testid="logout-btn"]')
    WebUI.navigateToUrl(base + '/login.html')
    fill('#login-email', 'admin')
    fill('#login-password', 'Admin@123')
    click('[data-testid="login-submit-btn"]')
    assert WebUI.getText(obj('#err-email')).contains('Quản lý cửa hàng')

    fill('#login-email', 'katalon.customer@example.com')
    fill('#login-password', 'Customer@123')
    click('[data-testid="login-submit-btn"]')
    WebUI.waitForElementVisible(obj('[data-testid="account-email"]'), 10)
} finally {
    WebUI.closeBrowser()
}
