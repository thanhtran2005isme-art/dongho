/* Sinh testing/jmeter/aurel-performance.jmx theo cấu trúc mẫu "MilkShop - Kiểm thử hiệu năng":
 * mỗi chức năng một Thread Group đánh số, request đặt tên PT_<MÃ>_NN, kèm
 * "Phản hồi không quá 3 giây", "HTTP 200", "Báo cáo tổng hợp", "Thống kê hiệu năng", "Kết quả chi tiết".
 * AUREL không có backend/JWT nên chỉ đo HTTP tài nguyên tĩnh (không chạy JavaScript/localStorage).
 * Dùng:  node scripts/build-jmeter-performance.cjs            (tạo file .jmx)
 *        node scripts/build-jmeter-performance.cjs --verify   (kèm kiểm tra thật từng request trên máy chủ local) */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const dir = path.resolve(__dirname, '../testing/jmeter');
fs.mkdirSync(dir, { recursive: true });
const xml = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));

/* [mã, tên nhóm, [[tên request, đường dẫn, chuỗi nội dung mong đợi | null]]] */
const GROUPS = [
  ['DC', 'Tài nguyên dùng chung', [
    ['Stylesheet trang khách', '/storefront.css', '--jade'],
    ['Module giao diện khách', '/storefront.js', 'AurelStorefront'],
    ['Lớp nghiệp vụ cửa hàng', '/store.js', 'checkoutOrder'],
    ['Bộ icon SVG', '/icons.js', null]
  ]],
  ['TC', 'Trang chủ và tìm kiếm', [
    ['Tải trang chủ', '/home.html', 'san-pham'],
    ['Stylesheet trang chủ', '/home.css', null],
    ['Script trang chủ', '/home.js', 'category-list'],
    ['Tìm kiếm theo từ khóa (HTML)', '/home.html?q=seiko', 'san-pham']
  ]],
  ['SP', 'Chi tiết sản phẩm', [
    ['Tải trang chi tiết SE001', '/product.html?id=p1', 'product-root'],
    ['Tải trang chi tiết CA002', '/product.html?id=p6', 'product-root']
  ]],
  ['GH', 'Giỏ hàng', [['Tải trang giỏ hàng', '/cart.html', 'cart-root']]],
  ['DH', 'Đặt hàng', [
    ['Tải trang đặt hàng', '/checkout.html', 'checkout-root'],
    ['Tải trang đặt hàng thành công', '/order-success.html', 'success-root']
  ]],
  ['TK', 'Tài khoản khách', [
    ['Tải trang đăng nhập khách', '/login.html', 'login-form'],
    ['Tải trang đăng ký khách', '/register.html', null],
    ['Tải trang hồ sơ khách', '/account.html', 'account-root']
  ]],
  ['LS', 'Lịch sử đơn hàng', [
    ['Tải trang danh sách đơn', '/orders.html', 'orders-root'],
    ['Tải trang chi tiết đơn', '/order-detail.html', 'detail-root']
  ]],
  ['YT', 'Yêu thích', [['Tải trang yêu thích', '/wishlist.html', null]]],
  ['GT', 'Giới thiệu và liên hệ', [
    ['Tải trang giới thiệu', '/about.html', 'AUREL'],
    ['Tải trang liên hệ', '/contact.html', null]
  ]],
  ['QL', 'Quản lý cửa hàng', [
    ['Tải trang quản lý', '/index.html', 'AUREL'],
    ['Script quản lý', '/app.js', 'demoDataForm'],
    ['Stylesheet quản lý', '/styles.css', '--accent'],
    ['Dữ liệu demo', '/demo-data.js', null]
  ]],
  ['QA', 'Theo dõi kiểm thử QA', [
    ['Tải trang QA', '/qa.html', 'case-list'],
    ['Script QA', '/qa.js', null],
    ['Bộ chạy 24 ca nghiệp vụ', '/qa-runner.js', null],
    ['Danh sách test case JS', '/qa-cases.js', null],
    ['CSV 90 test case', '/docs/TEST-CASES.csv', 'TC-090'],
    ['CSV 24 test case khách hàng', '/docs/TEST-CASES-CUSTOMER.csv', 'CUS-024']
  ]],
  ['TH', 'Phòng thực hành và hồ sơ', [
    ['Tải phòng thực hành', '/lab.html', 'panel-katalon'],
    ['Tải hồ sơ 8 câu hỏi', '/qa-portfolio.html', null]
  ]],
  ['AN', 'Ảnh sản phẩm', [
    ['Ảnh đồng hồ thép', '/assets/images/aurel-steel.png', null],
    ['Ảnh đồng hồ dây da', '/assets/images/aurel-leather.png', null],
    ['Ảnh đồng hồ điện tử', '/assets/images/aurel-digital.png', null]
  ]]
];

const CAP_MS = 3000;
const assertion = (name, field, value, type) => `<ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="${xml(name)}" enabled="true"><collectionProp name="Asserion.test_strings"><stringProp name="value">${xml(value)}</stringProp></collectionProp><stringProp name="Assertion.custom_message"></stringProp><stringProp name="Assertion.test_field">${field}</stringProp><boolProp name="Assertion.assume_success">false</boolProp><intProp name="Assertion.test_type">${type}</intProp></ResponseAssertion><hashTree/>`;
const duration = `<DurationAssertion guiclass="DurationAssertionGui" testclass="DurationAssertion" testname="Phản hồi không quá 3 giây" enabled="true"><stringProp name="DurationAssertion.duration">${CAP_MS}</stringProp></DurationAssertion><hashTree/>`;
const saveConfig = '<objProp><name>saveConfig</name><value class="SampleSaveConfiguration"><time>true</time><latency>true</latency><timestamp>true</timestamp><success>true</success><label>true</label><code>true</code><message>true</message><threadName>true</threadName><dataType>true</dataType><encoding>false</encoding><assertions>true</assertions><subresults>true</subresults><responseData>false</responseData><samplerData>false</samplerData><xml>false</xml><fieldNames>true</fieldNames><responseHeaders>false</responseHeaders><requestHeaders>false</requestHeaders><responseDataOnError>false</responseDataOnError><saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage><assertionsResultsToSave>0</assertionsResultsToSave><bytes>true</bytes><sentBytes>true</sentBytes><url>true</url><threadCounts>true</threadCounts><idleTime>true</idleTime><connectTime>true</connectTime></value></objProp>';
const listener = (guiclass, name) => `<ResultCollector guiclass="${guiclass}" testclass="ResultCollector" testname="${xml(name)}" enabled="true"><boolProp name="ResultCollector.error_logging">false</boolProp>${saveConfig}<stringProp name="filename"></stringProp></ResultCollector><hashTree/>`;

const sampler = (label, url, marker) => `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${xml(label)}" enabled="true">
<elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true"><collectionProp name="Arguments.arguments"/></elementProp>
<stringProp name="HTTPSampler.domain">\${__P(host,127.0.0.1)}</stringProp><stringProp name="HTTPSampler.port">\${__P(port,5517)}</stringProp><stringProp name="HTTPSampler.protocol">http</stringProp><stringProp name="HTTPSampler.path">${xml(url)}</stringProp><stringProp name="HTTPSampler.method">GET</stringProp><boolProp name="HTTPSampler.follow_redirects">false</boolProp><boolProp name="HTTPSampler.auto_redirects">false</boolProp><boolProp name="HTTPSampler.use_keepalive">true</boolProp><boolProp name="HTTPSampler.postBodyRaw">false</boolProp><stringProp name="HTTPSampler.connect_timeout">10000</stringProp><stringProp name="HTTPSampler.response_timeout">10000</stringProp></HTTPSamplerProxy>
<hashTree>${marker ? assertion('Nội dung đúng tài nguyên', 'Assertion.response_data', marker, 16) : ''}</hashTree>`;

const threadGroup = (no, code, name, requests) => {
  const title = `${String(no).padStart(2, '0')} - ${name}`;
  const body = requests.map(([label, url, marker], i) => sampler(`PT_${code}_${String(i + 1).padStart(2, '0')} - ${label}`, url, marker)).join('\n');
  return `<ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="${xml(title)}" enabled="true"><stringProp name="ThreadGroup.on_sample_error">continue</stringProp><elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true"><boolProp name="LoopController.continue_forever">false</boolProp><stringProp name="LoopController.loops">\${__P(loops,5)}</stringProp></elementProp><stringProp name="ThreadGroup.num_threads">\${__P(users,10)}</stringProp><stringProp name="ThreadGroup.ramp_time">\${__P(ramp,10)}</stringProp><boolProp name="ThreadGroup.scheduler">false</boolProp><boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp></ThreadGroup><hashTree>
<ConstantTimer guiclass="ConstantTimerGui" testclass="ConstantTimer" testname="100 ms giữa request" enabled="true"><stringProp name="ConstantTimer.delay">100</stringProp></ConstantTimer><hashTree/>
${body}
${duration}
${assertion('HTTP 200', 'Assertion.response_code', '200', 8)}
${listener('SummaryReport', 'Báo cáo tổng hợp')}
${listener('StatVisualizer', 'Thống kê hiệu năng')}
${listener('ViewResultsFullVisualizer', 'Kết quả chi tiết')}
</hashTree>`;
};

const total = GROUPS.reduce((n, g) => n + g[2].length, 0);
const plan = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3"><hashTree>
<TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="AUREL - Kiểm thử hiệu năng" enabled="true"><stringProp name="TestPlan.comments">AUREL không có backend/JWT: chỉ đo HTTP tài nguyên tĩnh (HTML, CSS, JS, CSV, ảnh). Không chạy JavaScript, giỏ hàng, đặt hàng hay localStorage. Các nhóm chạy lần lượt (Run Thread Groups consecutively). Tham số: -Jhost -Jport -Jusers -Jloops -Jramp.</stringProp><boolProp name="TestPlan.functional_mode">false</boolProp><boolProp name="TestPlan.serialize_threadgroups">true</boolProp><elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="Variables" enabled="true"><collectionProp name="Arguments.arguments"/></elementProp><stringProp name="TestPlan.user_define_classpath"></stringProp></TestPlan><hashTree>
${GROUPS.map(([code, name, reqs], i) => threadGroup(i + 1, code, name, reqs)).join('\n')}
</hashTree></hashTree></jmeterTestPlan>\n`;

const out = path.join(dir, 'aurel-performance.jmx');
fs.writeFileSync(out, plan);
console.log(`Đã tạo ${path.relative(process.cwd(), out)}: ${GROUPS.length} nhóm, ${total} request, mỗi nhóm có assertion HTTP 200 + dưới 3 giây + 3 báo cáo.`);
console.log(`Số mẫu cấu hình = users × loops × ${total} (ví dụ 10 × 5 × ${total} = ${10 * 5 * total}). Chưa thực thi JMeter.`);

/* ---- kiểm tra thật từng request trên máy chủ local (không thay JMeter) ---- */
if (process.argv.includes('--verify')) {
  (async () => {
    const root = path.resolve(__dirname, '..');
    const port = 5532;
    const base = `http://127.0.0.1:${port}`;
    const server = spawn(process.execPath, [path.join(root, 'scripts/test-server.cjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
    for (let i = 0; i < 30; i++) { try { if ((await fetch(base + '/home.html')).ok) break; } catch { /* chờ máy chủ */ } await new Promise(r => setTimeout(r, 200)); }
    let bad = 0, n = 0;
    for (const [code, , reqs] of GROUPS) for (let i = 0; i < reqs.length; i++) {
      const [label, url, marker] = reqs[i];
      const t0 = Date.now();
      let status = 0, body = '';
      try { const r = await fetch(base + url); status = r.status; body = await r.text(); } catch (e) { body = String(e); }
      const ms = Date.now() - t0;
      const problems = [];
      if (status !== 200) problems.push(`HTTP ${status}`);
      if (marker && !body.includes(marker)) problems.push(`thiếu "${marker}"`);
      if (ms > CAP_MS) problems.push(`${ms}ms > ${CAP_MS}ms`);
      n++; if (problems.length) bad++;
      console.log(`${problems.length ? 'LỖI' : 'ok  '} PT_${code}_${String(i + 1).padStart(2, '0')} ${url} ${status} ${ms}ms${problems.length ? ' -> ' + problems.join('; ') : ''}`);
    }
    server.kill();
    console.log(`\nKiểm tra HTTP: ${n - bad}/${n} request đạt (200 + nội dung + dưới 3 giây). Đây là kiểm tra một lần bằng Node, không phải kết quả JMeter.`);
    process.exit(bad ? 1 : 0);
  })();
}
