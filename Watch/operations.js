/* Nghiệp vụ mở rộng AUREL - dữ liệu mô phỏng, không có API. */
function createOperations(S){
  const kinds=["suppliers","receipts","payments","deliveries","warranties","returns"];
  const states={suppliers:["active","inactive"],receipts:["draft","received","cancelled"],payments:["pending","paid","refunded"],deliveries:["pending","shipping","delivered","failed"],warranties:["active","processing","completed","expired"],returns:["pending","approved","rejected","completed"]};
  const transitions={receipts:{draft:["received","cancelled"]},payments:{pending:["paid"],paid:["refunded"]},deliveries:{pending:["shipping","failed"],shipping:["delivered","failed"],failed:["shipping"]},warranties:{active:["processing","expired"],processing:["completed"],completed:["processing","expired"]},returns:{pending:["approved","rejected"],approved:["completed"]}};
  const assert=(v,m)=>{if(!v)throw Error(m);};
  const rows=(d,k)=>Array.isArray(d.operations?.[k])?d.operations[k]:[];
  const find=(d,k,id)=>rows(d,k).find(x=>x.id===id);
  const str=(v,label,max=150,required=true)=>{const t=String(v??"").trim();assert((!required||t.length>0)&&t.length<=max,label+" không hợp lệ.");return t;};
  const num=(v,label,min=1)=>{const n=Number(v);assert(String(v??"").trim()&&Number.isSafeInteger(n)&&n>=min,label+" phải là số nguyên từ "+min+".");return n;};
  const nextId=k=>k+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9);
  const prefix={suppliers:"NCC",receipts:"PN",payments:"TT",deliveries:"GH",warranties:"BH",returns:"DT"};
  const order=(d,id)=>{const o=d.orders.find(x=>x.id===id&&x.status==="confirmed");assert(o,"Chọn đơn hàng đã xác nhận.");return o;};
  const product=(d,id)=>{const p=d.products.find(x=>x.id===id);assert(p,"Không tìm thấy sản phẩm.");return p;};
  function save(d,u,k,input,id){
    assert(kinds.includes(k),"Phân hệ không hợp lệ.");S.user(d,u,true);
    const existing=id?find(d,k,id):null;
    assert(!id||existing,"Không tìm thấy bản ghi.");
    assert(!existing||k==="suppliers","Chỉ sửa trực tiếp thông tin nhà cung cấp.");
    const rec={id:existing?.id||nextId(k),code:existing?.code||prefix[k]+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,5).toUpperCase(),createdAt:existing?.createdAt||new Date().toISOString(),status:states[k][0],note:str(input.note,"Ghi chú",300,false)};
    if(k==="suppliers"){
      rec.name=str(input.name,"Tên nhà cung cấp",100);rec.phone=str(input.phone,"Số điện thoại",20);assert(/^[0-9+(). -]{8,20}$/.test(rec.phone),"Số điện thoại không hợp lệ.");
      rec.email=str(input.email,"Email",150,false);assert(!rec.email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email),"Email không hợp lệ.");rec.address=str(input.address,"Địa chỉ",300,false);
      assert(!rows(d,k).some(x=>x.id!==id&&x.name.toLocaleLowerCase("vi")===rec.name.toLocaleLowerCase("vi")),"Tên nhà cung cấp đã tồn tại.");
      rec.status=existing?.status||"active";
    }else if(k==="receipts"){
      const s=find(d,"suppliers",input.supplierId);assert(s?.status==="active","Chọn nhà cung cấp đang hoạt động.");
      const p=product(d,input.productId);rec.supplierId=s.id;rec.supplier=s.name;rec.productId=p.id;rec.product=p.name;rec.quantity=num(input.quantity,"Số lượng");rec.unitCost=num(input.unitCost,"Giá nhập");rec.amount=rec.quantity*rec.unitCost;assert(Number.isSafeInteger(rec.amount),"Tổng tiền vượt giới hạn.");
    }else{
      const o=order(d,input.orderId);rec.orderId=o.id;rec.orderCode=o.code;rec.customer=d.customers.find(c=>c.id===o.customerId)?.name||o.shipping?.name||"—";
      if(k==="payments"){
        assert(!rows(d,k).some(x=>x.orderId===o.id&&x.status!=="refunded"),"Đơn đã có bản ghi thanh toán chưa hoàn tiền.");
        rec.method=str(input.method,"Phương thức");assert(["cash","transfer","cod"].includes(rec.method),"Phương thức không hợp lệ.");rec.amount=o.total;
      }else if(k==="deliveries"){
        assert(!rows(d,k).some(x=>x.orderId===o.id),"Đơn đã có phiếu giao hàng.");
        rec.address=str(input.address||o.shipping?.address||d.customers.find(c=>c.id===o.customerId)?.address,"Địa chỉ giao hàng",300);
        rec.carrier=str(input.carrier,"Đơn vị vận chuyển",100);rec.tracking=str(input.tracking,"Mã vận đơn",80);
        assert(!rows(d,k).some(x=>x.tracking===rec.tracking),"Mã vận đơn đã tồn tại.");
      }else{
        const p=product(d,input.productId),item=o.items.find(x=>x.productId===p.id);assert(item,"Sản phẩm không thuộc đơn hàng.");
        rec.productId=p.id;rec.product=item.name;
        if(k==="warranties"){
          rec.serial=str(input.serial,"Số serial",80).toUpperCase();assert(!rows(d,k).some(x=>x.serial===rec.serial),"Số serial đã có phiếu bảo hành.");
          assert(rows(d,k).filter(x=>x.orderId===o.id&&x.productId===p.id).length<item.quantity,"Đã lập đủ phiếu cho số lượng đã bán.");
          rec.months=num(input.months,"Thời hạn bảo hành");assert(rec.months<=60,"Thời hạn tối đa 60 tháng.");
          rec.start=o.confirmedAt||o.createdAt;const expiry=new Date(rec.start);const day=expiry.getUTCDate();expiry.setUTCDate(1);expiry.setUTCMonth(expiry.getUTCMonth()+rec.months);const end=new Date(expiry);end.setUTCMonth(end.getUTCMonth()+1,0);expiry.setUTCDate(Math.min(day,end.getUTCDate()));rec.expiry=expiry.toISOString();
        }else{
          rec.quantity=num(input.quantity,"Số lượng đổi trả");const used=rows(d,k).filter(x=>x.orderId===o.id&&x.productId===p.id&&x.status!=="rejected").reduce((n,x)=>n+x.quantity,0);assert(used+rec.quantity<=item.quantity,"Số lượng đổi trả vượt số đã mua.");
          rec.reason=str(input.reason,"Lý do đổi trả",300);rec.amount=rec.quantity*item.price;
        }
      }
    }
    d.operations??={};d.operations[k]??=[];
    if(existing)d.operations[k][d.operations[k].findIndex(x=>x.id===id)]=rec;else d.operations[k].unshift(rec);
    return rec;
  }
  function change(d,u,k,id,next){
    S.user(d,u,true);const rec=find(d,k,id);assert(rec,"Không tìm thấy bản ghi.");
    assert(k==="suppliers"?states[k].includes(next)&&rec.status!==next:(transitions[k]?.[rec.status]||[]).includes(next),"Không thể chuyển trạng thái.");
    if(k==="receipts"&&next==="received")S.stock(d,u,rec.productId,rec.quantity,"Nhập theo phiếu "+rec.code);
    if(["payments","deliveries","warranties","returns"].includes(k)&&!(k==="payments"&&next==="refunded"))order(d,rec.orderId);
    rec.status=next;rec.updatedAt=new Date().toISOString();return rec;
  }
  return {kinds,states,transitions,rows,find,save,change};
}
if(typeof module!=='undefined')module.exports=createOperations;else window.WatchOperations=createOperations(window.WatchStore);
