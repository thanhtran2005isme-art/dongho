// KT-022 — Khả năng sử dụng: thông báo lỗi tiếng Việt dễ hiểu và số tiền VND nhất quán (UI-025, UI-026)
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
def okMessage = { String msg ->
    return msg != null && msg.trim().length() > 0 && !(msg ==~ /(?s).*(undefined|NaN|\[object|Error:|TypeError).*/) && (msg ==~ /(?s).*[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ].*/)
}

WebUI.openBrowser('')
try {
    WebUI.setViewPortSize(1440, 900)
    // 1. Số lượng không hợp lệ và vượt tồn
    WebUI.navigateToUrl(base + '/product.html?id=p1')
    WebUI.waitForElementVisible(obj('[data-testid="qty-input"]'), 10)
    for (String qty : ['0', '99']) {
        WebUI.setText(obj('[data-testid="qty-input"]'), qty)
        WebUI.click(obj('[data-testid="add-to-cart-btn"]'))
        WebUI.waitForElementVisible(obj('[data-testid="product-feedback"]'), 10)
        String msg = WebUI.getText(obj('[data-testid="product-feedback"]'))
        assert okMessage(msg) : 'Thông báo số lượng ' + qty + ' không đạt: ' + msg
    }
    // 2. Đăng nhập khách sai
    WebUI.navigateToUrl(base + '/login.html')
    WebUI.waitForElementVisible(obj('[data-testid="login-submit-btn"]'), 10)
    WebUI.setText(obj('input[name=email]'), 'khong.co@example.com')
    WebUI.setText(obj('input[name=password]'), 'SaiMatKhau@1')
    WebUI.click(obj('[data-testid="login-submit-btn"]'))
    WebUI.waitForElementVisible(obj('[data-testid="login-error"]'), 10)
    assert okMessage(WebUI.getText(obj('[data-testid="login-error"]'))) : 'Thông báo đăng nhập sai không đạt'
    // 3. Tra cứu đơn không tồn tại
    WebUI.navigateToUrl(base + '/orders.html')
    WebUI.waitForElementVisible(obj('[data-testid="guest-lookup-btn"]'), 10)
    WebUI.setText(obj('input[name=orderCode]'), 'DH9999')
    WebUI.setText(obj('input[name=contact]'), '0900000000')
    WebUI.click(obj('[data-testid="guest-lookup-btn"]'))
    WebUI.waitForElementVisible(obj('[data-testid="guest-lookup-error"]'), 10)
    assert okMessage(WebUI.getText(obj('[data-testid="guest-lookup-error"]'))) : 'Thông báo tra cứu không đạt'

    // 4. Định dạng tiền VND nhất quán (12.500.000 ₫) trên các trang có giá
    for (String path : ['/home.html', '/product.html?id=p1']) {
        WebUI.navigateToUrl(base + path)
        WebUI.delay(1)
        def bad = WebUI.executeJavaScript('''const t = document.body.innerText; const all = t.match(/[\\d.,]+\\s?₫/g) || [];
            return { n: all.length, bad: all.filter(m => !/^\\d{1,3}(\\.\\d{3})*\\s?₫$/.test(m)) }''', [])
        assert bad.n > 0 : path + ' không có số tiền để kiểm tra'
        assert bad.bad.size() == 0 : path + ' sai định dạng tiền: ' + bad.bad
    }
} finally {
    WebUI.closeBrowser()
}
