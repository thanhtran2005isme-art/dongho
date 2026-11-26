// KT-016 — Cô lập đơn hàng giữa các tài khoản và kiểm tra responsive 390px trang khách
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
    WebUI.setViewPortSize(390, 844)
    for (String path : ['/home.html', '/product.html?id=p1', '/cart.html', '/checkout.html', '/login.html', '/orders.html', '/contact.html']) {
        WebUI.navigateToUrl(base + path)
        assert WebUI.executeJavaScript('return document.documentElement.scrollWidth <= innerWidth', []) == true
    }
    WebUI.navigateToUrl(base + '/order-detail.html?id=khong-hop-le')
    WebUI.waitForElementVisible(obj('[data-testid="order-detail-denied"]'), 10)
} finally {
    WebUI.closeBrowser()
}
