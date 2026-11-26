// KT-020 — Responsive: menu đổi theo màn hình và không tràn ngang ở 320/390/768/1440px (UI-010, UI-012)
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

String base = System.getProperty('chrono.baseUrl', 'http://127.0.0.1:5517')

WebUI.openBrowser('')
try {
    // Menu: 390px ẩn menu desktop, hiện menu nhanh; 1440px ngược lại
    WebUI.setViewPortSize(390, 844)
    WebUI.navigateToUrl(base + '/home.html')
    WebUI.delay(1)
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('.desktop-nav')).display", []) == 'none'
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('.mobile-subnav')).display", []) != 'none'
    WebUI.setViewPortSize(1440, 900)
    WebUI.navigateToUrl(base + '/home.html')
    WebUI.delay(1)
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('.desktop-nav')).display", []) != 'none'
    assert WebUI.executeJavaScript("return getComputedStyle(document.querySelector('.mobile-subnav')).display", []) == 'none'

    // Không tràn ngang trên mọi trang khách ở 4 độ rộng (320 và 720 tương đương phóng to 400% và 200%)
    for (int width : [320, 390, 768, 1440]) {
        WebUI.setViewPortSize(width, 900)
        for (String path : ['/home.html', '/product.html?id=p1', '/cart.html', '/checkout.html', '/login.html', '/register.html', '/account.html', '/orders.html', '/wishlist.html', '/about.html', '/contact.html']) {
            WebUI.navigateToUrl(base + path)
            WebUI.delay(1)
            assert WebUI.executeJavaScript('return document.documentElement.scrollWidth <= window.innerWidth', []) == true : path + ' tràn ngang ở ' + width + 'px'
        }
    }
} finally {
    WebUI.closeBrowser()
}
