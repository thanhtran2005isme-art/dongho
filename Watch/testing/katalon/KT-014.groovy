// KT-014 — Luồng khách đặt hàng → Admin xác nhận → Khách xem trạng thái
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.testobject.SelectorMethod

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

WebUI.openBrowser('')
try {
    WebUI.navigateToUrl(base + '/register.html')
    WebUI.executeJavaScript("['chrono-watch-v1','chrono-session','chrono-customer-accounts-v1','chrono-customer-session-v1','chrono-cart-v1','chrono-wishlist-v1'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();", [])
    WebUI.refresh()

    fill('#reg-name', 'Khách Đặt Hàng')
    fill('#reg-email', 'buyer@example.com')
    fill('#reg-phone', '0902222222')
    fill('#reg-password', 'Buyer@1234')
    fill('#reg-confirm', 'Buyer@1234')
    click('[data-testid="register-submit-btn"]')
    WebUI.waitForElementVisible(obj('[data-testid="account-email"]'), 10)

    WebUI.navigateToUrl(base + '/product.html?id=p1')
    fill('[data-testid="qty-input"]', '2')
    click('[data-testid="add-to-cart-btn"]')
    assert WebUI.getText(obj('[data-testid="header-cart-count"]')) == '2'

    WebUI.navigateToUrl(base + '/checkout.html')
    fill('#co-address', '10 Đường Mẫu, TP.HCM')
    click('[data-testid="place-order-btn"]')
    WebUI.waitForElementVisible(obj('[data-testid="success-order-code"]'), 10)
    assert WebUI.getText(obj('[data-testid="success-order-code"]')).contains('DH0001')
    assert stored().products.find { it.id == 'p1' }.stock == 8

    // Admin xác nhận đơn
    WebUI.navigateToUrl(base + '/index.html')
    fill('input[name=username]', 'admin')
    fill('input[name=password]', 'Admin@123')
    click('#login-form button[type=submit]')
    click('button[data-view=orders]')
    def draft = stored().orders[0]
    click('button[data-action=order-detail][data-id="' + draft.id + '"]')
    click('button[data-action=order-confirm]')
    WebUI.waitForElementNotVisible(obj('#modal'), 10)
    assert stored().products.find { it.id == 'p1' }.stock == 6

    // Khách kiểm tra trạng thái mới
    WebUI.navigateToUrl(base + '/order-detail.html?id=' + draft.id)
    WebUI.waitForElementVisible(obj('[data-testid="detail-order-status"]'), 10)
    assert WebUI.getText(obj('[data-testid="detail-order-status"]')).contains('Đã xác nhận')
} finally {
    WebUI.closeBrowser()
}
