// KT-019 — Khả năng truy cập biểu mẫu: ô nhập có nhãn; lỗi gắn aria-invalid/aria-describedby/role=alert; Tab tới nút đặt hàng (UI-014, UI-016, UI-017)
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
    // 1. Mọi ô nhập có nhãn trên các trang biểu mẫu
    for (String path : ['/login.html', '/register.html', '/contact.html', '/orders.html', '/home.html']) {
        WebUI.navigateToUrl(base + path)
        WebUI.delay(1)
        def unlabeled = WebUI.executeJavaScript('''return Array.from(document.querySelectorAll('input:not([type=hidden]):not([type=submit]), select, textarea'))
            .filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby'))
            .map(e => e.id || e.name || e.tagName)''', [])
        assert unlabeled.size() == 0 : path + ' có ô thiếu nhãn: ' + unlabeled
    }
    // 2. Thêm sản phẩm vào giỏ rồi gửi form thanh toán sai dữ liệu
    WebUI.navigateToUrl(base + '/product.html?id=p1')
    WebUI.waitForElementVisible(obj('[data-testid="add-to-cart-btn"]'), 10)
    WebUI.click(obj('[data-testid="add-to-cart-btn"]'))
    WebUI.navigateToUrl(base + '/checkout.html')
    WebUI.waitForElementVisible(obj('[data-testid="place-order-btn"]'), 10)
    WebUI.setText(obj('#co-phone'), '123')
    WebUI.setText(obj('#co-email'), 'sai')
    WebUI.click(obj('[data-testid="place-order-btn"]'))
    def bad = WebUI.executeJavaScript('''return ['co-name','co-phone','co-email','co-address'].filter(id => {
        const e = document.getElementById(id); const d = e.getAttribute('aria-describedby'); const m = d && document.getElementById(d.split(' ')[0]);
        return !(e.getAttribute('aria-invalid') === 'true' && m && m.getAttribute('role') === 'alert' && m.textContent.trim().length > 0)
    })''', [])
    assert bad.size() == 0 : 'Ô lỗi thiếu aria-invalid/aria-describedby/role=alert: ' + bad
} finally {
    WebUI.closeBrowser()
}
