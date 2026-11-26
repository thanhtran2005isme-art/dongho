// KT-015 — Giỏ hàng đối chiếu giá thật và không tin giá giả mạo trong localStorage
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

WebUI.openBrowser('')
try {
    WebUI.navigateToUrl(base + '/product.html?id=p1')
    WebUI.executeJavaScript("['chrono-watch-v1','chrono-cart-v1'].forEach(k=>localStorage.removeItem(k));", [])
    WebUI.refresh()

    click('[data-testid="add-to-cart-btn"]')
    WebUI.executeJavaScript("const c=JSON.parse(localStorage.getItem('chrono-cart-v1'));c.items[0].price=1;localStorage.setItem('chrono-cart-v1',JSON.stringify(c));", [])
    WebUI.navigateToUrl(base + '/cart.html')
    WebUI.waitForElementVisible(obj('[data-testid="cart-subtotal"]'), 10)
    assert WebUI.getText(obj('[data-testid="cart-subtotal"]')).contains('12.500.000')
} finally {
    WebUI.closeBrowser()
}
