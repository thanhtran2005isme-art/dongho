// KT-021 — Bảo mật cơ bản phía giao diện: quản lý chưa đăng nhập, mật khẩu khách không lưu dạng rõ, phiên hết hạn (UI-021, UI-022, UI-024)
// Giới hạn: đây là mô phỏng phía trình duyệt, không chứng minh an toàn production.
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

WebUI.openBrowser('')
try {
    WebUI.setViewPortSize(1440, 900)
    // 1. Chưa đăng nhập: trang quản lý chỉ hiện form đăng nhập
    WebUI.navigateToUrl(base + '/index.html')
    WebUI.delay(1)
    assert WebUI.executeJavaScript("return !!document.querySelector('input[name=username]')", []) == true
    String bodyText = WebUI.executeJavaScript('return document.body.innerText', [])
    assert !(bodyText ==~ /(?s).*DH\d{4}.*/) : 'Lộ mã đơn khi chưa đăng nhập'

    // 2. Đăng ký tài khoản khách, mật khẩu không được lưu dạng rõ
    String secret = 'MatKhauBiMat@77'
    WebUI.navigateToUrl(base + '/register.html')
    WebUI.waitForElementVisible(obj('[data-testid="register-submit-btn"]'), 10)
    WebUI.setText(obj('input[name=name]'), 'Khách Băm Katalon')
    WebUI.setText(obj('input[name=email]'), 'bam.katalon@example.com')
    WebUI.setText(obj('input[name=phone]'), '0917171717')
    WebUI.setText(obj('input[name=password]'), secret)
    WebUI.setText(obj('input[name=confirmPassword]'), secret)
    WebUI.click(obj('[data-testid="register-submit-btn"]'))
    WebUI.waitForElementVisible(obj('[data-testid="account-email"]'), 10)
    String raw = WebUI.executeJavaScript("return localStorage.getItem('chrono-customer-accounts-v1')", [])
    assert !raw.contains(secret) : 'Mật khẩu gốc bị lưu dạng rõ'
    assert raw.contains('"passwordHash":"localv1_') : 'Không có passwordHash'

    // 3. Phiên hết hạn: đặt expires về quá khứ rồi tải lại hồ sơ
    WebUI.executeJavaScript("const s = JSON.parse(localStorage.getItem('chrono-customer-session-v1')); s.expires = Date.now() - 1000; localStorage.setItem('chrono-customer-session-v1', JSON.stringify(s))", [])
    WebUI.navigateToUrl(base + '/account.html')
    WebUI.waitForElementVisible(obj('[data-testid="account-guest-state"]'), 10)
    assert WebUI.executeJavaScript("return localStorage.getItem('chrono-customer-session-v1')", []) == null
} finally {
    WebUI.closeBrowser()
}
