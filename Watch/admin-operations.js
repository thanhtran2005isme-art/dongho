/* Giao diện 6 phân hệ mở rộng; dùng chung layout và helpers của app.js. */
function installOperationsUI(){
  const O=window.WatchOperations;
  const labels={active:"Hoạt động",inactive:"Ngừng hợp tác",draft:"Nháp",received:"Đã nhập kho",cancelled:"Đã hủy",pending:"Chờ xử lý",paid:"Đã thanh toán",refunded:"Đã hoàn tiền",shipping:"Đang giao",delivered:"Đã giao",failed:"Giao thất bại",processing:"Đang bảo hành",completed:"Hoàn tất",expired:"Hết hạn",approved:"Đã duyệt",rejected:"Từ chối"};
  const method={cash:"Tiền mặt",transfer:"Chuyển khoản",cod:"COD"};
  const config={
    suppliers:{title:"Nhà cung cấp",desc:"Quản lý đối tác cung ứng đồng hồ và thông tin liên hệ.",add:"Thêm nhà cung cấp",icon:"truck",cols:[["name","Nhà cung cấp"],["phone","Điện thoại"],["email","Email"],["address","Địa chỉ"]],hint:"Ngừng hợp tác thay cho xóa để giữ lịch sử nhập kho."},
    receipts:{title:"Phiếu nhập kho",desc:"Lập phiếu, theo dõi giá nhập và xác nhận tăng tồn kho.",add:"Tạo phiếu nhập",icon:"clipboard",cols:[["supplier","Nhà cung cấp"],["product","Sản phẩm"],["quantity","Số lượng"],["unitCost","Giá nhập"],["amount","Tổng tiền"]],hint:"Mỗi phiếu quản lý một dòng sản phẩm. Chỉ khi xác nhận nhập, hệ thống mới cộng tồn kho một lần."},
    payments:{title:"Thanh toán",desc:"Theo dõi phương thức và trạng thái thu tiền của đơn đã xác nhận.",add:"Ghi nhận thanh toán",icon:"wallet",cols:[["orderCode","Đơn hàng"],["customer","Khách hàng"],["method","Phương thức"],["amount","Số tiền"]],hint:"Ghi nhận trạng thái thủ công, không tích hợp ngân hàng hoặc cổng thanh toán."},
    deliveries:{title:"Giao hàng",desc:"Theo dõi đơn vị vận chuyển, mã vận đơn và tiến độ giao nhận.",add:"Tạo phiếu giao hàng",icon:"truck",cols:[["orderCode","Đơn hàng"],["customer","Người nhận"],["carrier","Đơn vị vận chuyển"],["tracking","Mã vận đơn"],["address","Địa chỉ giao"]],hint:"Cập nhật trạng thái thủ công, không kết nối hãng vận chuyển."},
    warranties:{title:"Bảo hành",desc:"Theo dõi serial, thời hạn và tình trạng bảo hành từng chiếc đồng hồ.",add:"Tạo phiếu bảo hành",icon:"shield",cols:[["orderCode","Đơn hàng"],["product","Sản phẩm"],["serial","Serial"],["customer","Khách hàng"],["expiry","Hết hạn"]],hint:"Mỗi phiếu tương ứng một chiếc đã bán; thời hạn được tính từ ngày xác nhận đơn."},
    returns:{title:"Đổi trả",desc:"Tiếp nhận yêu cầu đổi trả, duyệt và theo dõi kết quả xử lý.",add:"Tạo yêu cầu đổi trả",icon:"return-arrow",cols:[["orderCode","Đơn hàng"],["product","Sản phẩm"],["quantity","Số lượng"],["amount","Giá trị tham chiếu"],["reason","Lý do"]],hint:"Theo dõi hồ sơ đổi trả; không tự hoàn tiền hoặc cộng kho để tránh trùng với nghiệp vụ hủy đơn hiện tại."}
  };
  const display=(key,value)=>value==null||value===""?"—":key==="amount"||key==="unitCost"?money(value):key==="expiry"?date(value):key==="method"?method[value]||value:String(value);
  const label=(k,s)=>k==="payments"&&s==="pending"?"Chờ thanh toán":k==="deliveries"&&s==="pending"?"Chờ giao":k==="warranties"&&s==="active"?"Còn bảo hành":labels[s]||s;
  const badgeFor=(k,s)=>`<span class="badge ${["inactive","cancelled","failed","rejected","expired"].includes(s)?"off":["draft","pending","shipping","processing","approved"].includes(s)?"warn":""}">${esc(label(k,s))}</span>`;
  const button=(action,caption,id="")=>`<button type="button" class="small" data-action="${action}" data-id="${esc(id)}">${esc(caption)}</button>`;
  const statusOf=(k,row)=>k==="warranties"&&row.status==="active"&&Date.parse(row.expiry)<Date.now()?"expired":row.status;
  function renderPage(k){
    const c=config[k],all=O.rows(db,k),options=O.states[k];
    const found=all.filter(x=>matches([x.code,...c.cols.map(([key])=>display(key,x[key]))].join(" "))&&(!filter||statusOf(k,x)===filter));
    const pg=paginate(found);
    const summary=[["Tổng hồ sơ",all.length],...options.slice(0,3).map(s=>[label(k,s),all.filter(x=>statusOf(k,x)===s).length])];
    return heading(c.title,c.desc,isAdmin()?btn("ops-new",c.add):"")+`<div class="stats ops-stats">${summary.map(([l,n])=>`<div class="stat"><div class="stat-top">${esc(l)}${icon(c.icon)}</div><strong>${n}</strong><small>Hồ sơ trong phân hệ</small></div>`).join("")}</div><p class="note ops-note">${esc(c.hint)}</p><section class="card"><div class="card-header"><div><h2>Danh sách ${esc(c.title.toLowerCase())}</h2><p>Quản lý và theo dõi toàn bộ hồ sơ</p></div><span class="badge">${all.length} hồ sơ</span></div>${toolbar("Mã, tên hoặc thông tin",options.map(s=>option(s,label(k,s))).join(""))}${table(["Mã hồ sơ",...c.cols.map(x=>x[1]),"Trạng thái","Thao tác"],pg.rows.map(row=>`<tr><td><strong>${esc(row.code)}</strong><small class="ops-sub">${esc(date(row.createdAt))}</small></td>${c.cols.map(([key])=>`<td>${esc(display(key,row[key]))}</td>`).join("")}<td>${badgeFor(k,statusOf(k,row))}</td><td>${button("ops-detail","Chi tiết",row.id)}${isAdmin()&&k==="suppliers"?button("ops-edit","Sửa",row.id):""}</td></tr>`))}${pg.footer}</section>`;
  }
  const choices=(items,placeholder)=>[["",placeholder],...items];
  function edit(k,id){
    if(!isAdmin())return;
    const c=config[k],row=id?O.find(db,k,id):{},f=(l,n,t="text",extra="required maxlength=\"150\"")=>field(l,n,row?.[n]??"",t,extra);
    const orders=()=>selectField("Đơn hàng đã xác nhận *","orderId",choices(db.orders.filter(o=>o.status==="confirmed").map(o=>[o.id,o.code+" · "+money(o.total)]),"Chọn đơn hàng"),"");
    const products=()=>selectField("Sản phẩm *","productId",choices(db.products.map(p=>[p.id,p.code+" · "+p.name]),"Chọn sản phẩm"),"");
    let body="";
    if(k==="suppliers")body=f("Tên nhà cung cấp *","name")+f("Số điện thoại *","phone","tel",'required maxlength="20"')+f("Email","email","email",'maxlength="150"')+f("Địa chỉ","address","text",'maxlength="300"');
    else if(k==="receipts")body=selectField("Nhà cung cấp *","supplierId",choices(O.rows(db,"suppliers").filter(x=>x.status==="active").map(x=>[x.id,x.name]),"Chọn nhà cung cấp"),"")+products()+f("Số lượng *","quantity","number",'required min="1" step="1"')+f("Giá nhập (VND) *","unitCost","number",'required min="1" step="1"');
    else if(k==="payments")body=orders()+selectField("Phương thức *","method",[["cash","Tiền mặt"],["transfer","Chuyển khoản"],["cod","COD"]],"cash");
    else if(k==="deliveries")body=orders()+f("Đơn vị vận chuyển *","carrier")+f("Mã vận đơn *","tracking")+f("Địa chỉ giao (để trống dùng địa chỉ đơn)","address","text",'maxlength="300"');
    else if(k==="warranties")body=orders()+products()+f("Serial *","serial")+f("Thời hạn (tháng) *","months","number",'required min="1" max="60" step="1"');
    else body=orders()+products()+f("Số lượng *","quantity","number",'required min="1" step="1"')+f("Lý do đổi trả *","reason","text",'required maxlength="300"');
    modal(id?"Sửa nhà cung cấp":c.add,`<p class="note ops-note">${esc(c.hint)}</p><div class="form-grid">${body}<label class="field full">Ghi chú<textarea name="note" rows="3" maxlength="300">${esc(row?.note||"")}</textarea></label></div>${formActions(id?"Lưu thay đổi":"Tạo hồ sơ")}`,data=>mutate((d,u)=>O.save(d,u,k,data,id)));
    document.querySelectorAll("#edit-form select").forEach(x=>x.required=true);
    if(["warranties","returns"].includes(k)){
      const form=document.querySelector("#edit-form"),os=form.elements.orderId,ps=form.elements.productId;
      const refresh=()=>{const o=db.orders.find(x=>x.id===os.value);ps.innerHTML='<option value="">Chọn sản phẩm</option>'+((o?.items||[]).map(x=>`<option value="${esc(x.productId)}">${esc(x.code+" · "+x.name)}</option>`).join(""));};os.addEventListener("change",refresh);refresh();
    }
  }
  function detail(k,id){
    const c=config[k],row=O.find(db,k,id);if(!row)return;
    const actions=k==="suppliers"?[row.status==="active"?"inactive":"active"]:O.transitions[k]?.[row.status]||[];
    modal("Chi tiết "+row.code,`<div class="detail-list">${badgeFor(k,statusOf(k,row))}<p>Ngày tạo: ${esc(date(row.createdAt))}</p></div>${table(["Thông tin","Giá trị"],[...c.cols.map(([key,l])=>`<tr><td>${esc(l)}</td><td>${esc(display(key,row[key]))}</td></tr>`),`<tr><td>Ghi chú</td><td>${esc(row.note||"—")}</td></tr>`])}<div class="form-actions"><button type="button" data-action="close">Đóng</button>${isAdmin()?actions.map(s=>`<button type="button" class="primary" data-action="ops-status" data-id="${esc(id)}" data-status="${esc(s)}">${esc(label(k,s))}</button>`).join(""):""}</div>`);
  }
  return {config,renderPage,handle(k,a,id,b){
    if(a==="ops-new"||a==="ops-edit")return edit(k,a==="ops-edit"?id:null);
    if(a==="ops-detail")return detail(k,id);
    if(a==="ops-status"&&isAdmin()&&confirm("Xác nhận chuyển trạng thái hồ sơ?"))return mutate((d,u)=>O.change(d,u,k,id,b.dataset.status));
  }};
}
const AdminOperations=installOperationsUI();
