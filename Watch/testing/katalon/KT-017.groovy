// KT-017 — Giao diện: header/footer nhất quán và nhận diện AUREL trên 13 trang khách (UI-001, UI-002)
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

String base = System.getProperty('chrono.baseUrl', 'http://127.0.0.1:5517')

WebUI.openBrowser('')
try {
    WebUI.setViewPortSize(1440, 900)
    String footerRef = null
    for (String path : ['/home.html', '/product.html?id=p1', '/cart.html', '/checkout.html', '/order-success.html', '/login.html', '/register.html', '/account.html', '/orders.html', '/order-detail.html', '/wishlist.html', '/about.html', '/contact.html']) {
        WebUI.navigateToUrl(base + path)
        WebUI.delay(1)
        def info = WebUI.executeJavaScript('''return {
            announce: !!document.querySelector('.announcement'),
            brand: (document.querySelector('.site-header .brand') || {}).textContent || '',
            nav: document.querySelectorAll('.desktop-nav a').length,
            cols: document.querySelectorAll('footer .footer-grid-4 > div').length,
            footer: ((document.querySelector('footer .footer-grid-4') || {}).innerText || '').replace(/\\s+/g, ' ')
        }''', [])
        assert info.announce : path + ' thiếu thanh tiện ích'
        assert info.brand.contains('AUREL') : path + ' thiếu thương hiệu AUREL'
        assert info.nav >= 3 : path + ' thiếu liên kết điều hướng'
        assert info.cols == 4 : path + ' footer không đủ 4 cột'
        if (footerRef == null) { footerRef = info.footer }
        assert info.footer == footerRef : path + ' footer khác các trang khác'
    }
    // Nhận diện: màu nút chính #087b6a = rgb(8, 123, 106); font tiêu đề Aurel Display (Cormorant)
    WebUI.navigateToUrl(base + '/product.html?id=p1')
    WebUI.delay(1)
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('[data-testid=add-to-cart-btn]')).backgroundColor", []) == 'rgb(8, 123, 106)'
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('h1')).fontFamily", []).contains('Aurel Display')
} finally {
    WebUI.closeBrowser()
}
