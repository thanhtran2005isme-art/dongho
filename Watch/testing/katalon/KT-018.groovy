// KT-018 — Khả năng truy cập: lang=vi, title riêng, đúng một h1, landmark và alt ảnh trên 13 trang (UI-013, UI-018, UI-019)
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

String base = System.getProperty('chrono.baseUrl', 'http://127.0.0.1:5517')

WebUI.openBrowser('')
try {
    Set titles = new HashSet()
    for (String path : ['/home.html', '/product.html?id=p1', '/cart.html', '/checkout.html', '/order-success.html', '/login.html', '/register.html', '/account.html', '/orders.html', '/order-detail.html', '/wishlist.html', '/about.html', '/contact.html']) {
        WebUI.navigateToUrl(base + path)
        WebUI.delay(1)
        def r = WebUI.executeJavaScript('''return {
            lang: document.documentElement.lang,
            title: document.title.trim(),
            h1: document.querySelectorAll('h1').length,
            main: document.querySelectorAll('main').length,
            header: document.querySelectorAll('header').length,
            footer: document.querySelectorAll('footer').length,
            navNoLabel: Array.from(document.querySelectorAll('nav')).filter(n => !n.getAttribute('aria-label')).length,
            imgNoAlt: Array.from(document.images).filter(i => !i.hasAttribute('alt')).length
        }''', [])
        assert r.lang == 'vi' : path + ' lang không phải vi'
        assert r.title.length() > 0 : path + ' title rỗng'
        assert titles.add(r.title) : path + ' title trùng trang khác: ' + r.title
        assert r.h1 == 1 : path + ' có ' + r.h1 + ' thẻ h1'
        assert r.main == 1 && r.header >= 1 && r.footer >= 1 : path + ' thiếu landmark main/header/footer'
        assert r.navNoLabel == 0 : path + ' có nav thiếu aria-label'
        assert r.imgNoAlt == 0 : path + ' có ảnh thiếu alt'
    }
} finally {
    WebUI.closeBrowser()
}
