/* Lớp nghiệp vụ dùng chung cho giao diện và kiểm thử Node.js. */
(function (root) {
  const KEY = 'chrono-watch-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
  const integer = (value, minimum, label) => { const n = Number(value); requireThat(String(value).trim() !== '' && Number.isSafeInteger(n) && n >= minimum, `${label} phải là số nguyên từ ${minimum}.`); return n; };
  const seed = () => ({
    version: 1,
    users: [{id:'u1',name:'Quản trị viên',username:'admin',password:'Admin@123',role:'admin',active:true},{id:'u2',name:'Trần Hoàng Nam',username:'staff',password:'Staff@123',role:'staff',active:true}],
    brands:['Seiko','Citizen','Casio','Orient','Tissot'], types:['Đồng hồ cơ','Đồng hồ quartz','Đồng hồ điện tử'],
    products:[
      {id:'p1',code:'SE001',name:'Seiko Presage Cocktail Time',brand:'Seiko',type:'Đồng hồ cơ',price:12500000,stock:8,active:true,description:'Mặt xanh, dây thép không gỉ.'},
      {id:'p2',code:'CI001',name:'Citizen Eco-Drive Classic',brand:'Citizen',type:'Đồng hồ quartz',price:6800000,stock:12,active:true,description:'Thiết kế thanh lịch, năng lượng ánh sáng.'},
      {id:'p3',code:'CA001',name:'Casio G-Shock GA-2100',brand:'Casio',type:'Đồng hồ điện tử',price:3250000,stock:3,active:true,description:'Phong cách thể thao.'},
      {id:'p4',code:'OR001',name:'Orient Bambino Open Heart',brand:'Orient',type:'Đồng hồ cơ',price:7900000,stock:5,active:true,description:'Mặt số lộ cơ, dây da.'},
      {id:'p5',code:'TI001',name:'Tissot PRX Powermatic 80',brand:'Tissot',type:'Đồng hồ cơ',price:21800000,stock:2,active:true,description:'Bộ máy tự động.'},
      {id:'p6',code:'CA002',name:'Casio Vintage A168',brand:'Casio',type:'Đồng hồ điện tử',price:1250000,stock:20,active:true,description:'Dòng đồng hồ điện tử cổ điển.'},
      {id:'p7',code:'SE002',name:'Seiko 5 Sports',brand:'Seiko',type:'Đồng hồ cơ',price:8900000,stock:0,active:false,description:'Tạm ngừng kinh doanh.'}
    ],
    customers:[{id:'c1',name:'Khách hàng mẫu An',phone:'0900000001',email:'an@example.com',address:'Địa chỉ giả lập 01, TP. Hồ Chí Minh'},{id:'c2',name:'Khách hàng mẫu Bình',phone:'0900000002',email:'binh@example.com',address:'Địa chỉ giả lập 02, Hà Nội'}],
    orders:[], movements:[]
  });
  const id = prefix => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  function nextOrderCode(db){
    let max=db.orders.length;
    for(const o of db.orders){const m=/^DH(\d+)$/.exec(String(o.code||''));if(m)max=Math.max(max,Number(m[1]));}
    const existing=new Set(db.orders.map(o=>o.code));
    let n=max+1,code=`DH${String(n).padStart(4,'0')}`;
    while(existing.has(code)){n++;code=`DH${String(n).padStart(4,'0')}`;}
    return code;
  }
  function migrate(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Dữ liệu cửa hàng không hợp lệ.');
    requireThat(raw.version===1&&Array.isArray(raw.products)&&Array.isArray(raw.users),'Dữ liệu không hợp lệ. Hãy kiểm tra dữ liệu lưu trữ.');
    if(!Array.isArray(raw.brands))raw.brands=[];
    if(!Array.isArray(raw.types))raw.types=[];
    if(!Array.isArray(raw.customers))raw.customers=[];
    if(!Array.isArray(raw.orders))raw.orders=[];
    if(!Array.isArray(raw.movements))raw.movements=[];
    return raw;
  }
  function user(db, userId, admin = false) { const u=db.users.find(x=>x.id===userId && x.active); requireThat(u && (!admin || u.role==='admin'),'Bạn không có quyền thực hiện thao tác này.'); return u; }
  function imageSource(value) {
    const source=String(value||'').trim();
    if(!source)return '';
    if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(source)){
      requireThat(source.length<=410000,'Ảnh quá lớn. Chọn ảnh tối đa 300 KB.');return source;
    }
    requireThat(source.length<=2048,'Đường dẫn ảnh quá dài.');
    let url;try{url=new URL(source);}catch{throw new Error('Đường dẫn ảnh phải là URL HTTPS hợp lệ.');}
    requireThat(url.protocol==='https:'&&!url.username&&!url.password,'Đường dẫn ảnh phải dùng HTTPS và không chứa tài khoản.');
    return url.href;
  }
  function filterProducts(products,{query='',brand='',type='',status='',sort=''}={}){
    const keyword=String(query).trim().toLocaleLowerCase('vi');
    const rows=products.filter(p=>(p.name+' '+p.code).toLocaleLowerCase('vi').includes(keyword)&&(!brand||p.brand===brand)&&(!type||p.type===type)&&(!status||(status==='active'&&p.active)||(status==='inactive'&&!p.active)));
    if(sort==='price-asc')rows.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc')rows.sort((a,b)=>b.price-a.price);
    if(sort==='stock-asc')rows.sort((a,b)=>a.stock-b.stock);
    if(sort==='name')rows.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
    return rows;
  }
  function product(db,userId,data,editId) {
    user(db,userId,true);
    const code=String(data.code||'').trim().toUpperCase(),name=String(data.name||'').trim();
    requireThat(/^[A-Z0-9_-]{1,30}$/.test(code),'Mã sản phẩm gồm 1–30 chữ cái, số, dấu - hoặc _.');
    requireThat(name.length>0 && name.length<=100,'Tên sản phẩm phải có từ 1 đến 100 ký tự.');
    requireThat(!db.products.some(p=>p.code===code && p.id!==editId),'Mã sản phẩm đã tồn tại.');
    requireThat(db.brands.includes(data.brand)&&db.types.includes(data.type),'Danh mục không hợp lệ.');
    const old=db.products.find(p=>p.id===editId);
    requireThat(!editId||old,'Không tìm thấy sản phẩm.');
    const record={id:editId||id('p'),code,name,brand:data.brand,type:data.type,price:integer(data.price,1,'Giá bán'),stock:old?old.stock:integer(data.stock,0,'Tồn kho'),description:String(data.description||'').trim().slice(0,1000),active:data.active!==false};
    record.image=imageSource(data.image===undefined?old?.image:data.image);
    if(old) Object.assign(old,record); else db.products.push(record);
    return record;
  }
  function customer(db,userId,data,editId) {
    user(db,userId); const name=String(data.name||'').trim(),phone=String(data.phone||'').trim(),email=String(data.email||'').trim();
    requireThat(name.length>0&&name.length<=100,'Họ tên phải có từ 1 đến 100 ký tự.');
    requireThat(/^0\d{9}$/.test(phone),'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.');
    requireThat(!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Email không đúng định dạng.');
    const old=db.customers.find(c=>c.id===editId); requireThat(!editId||old,'Không tìm thấy khách hàng.');
    const record={id:editId||id('c'),name,phone,email,address:String(data.address||'').trim().slice(0,300)};
    if(old)Object.assign(old,record);else db.customers.push(record); return record;
  }
  function order(db,userId,customerId,lines,editId) {
    user(db,userId); requireThat(db.customers.some(c=>c.id===customerId),'Hãy chọn khách hàng.');
    requireThat(lines.length>0,'Đơn hàng cần ít nhất một sản phẩm.');
    const old=db.orders.find(o=>o.id===editId); requireThat(!editId||(old&&old.status==='draft'),'Chỉ được sửa đơn nháp.');
    const seen=new Set();
    const items=lines.map(line=>{const p=db.products.find(x=>x.id===line.productId&&x.active);requireThat(p,'Sản phẩm không còn kinh doanh.');requireThat(!seen.has(p.id),'Sản phẩm bị trùng. Hãy gộp số lượng vào một dòng.');seen.add(p.id);const quantity=integer(line.quantity,1,'Số lượng');const previous=old?.items.find(x=>x.productId===p.id);return {productId:p.id,name:p.name,code:p.code,price:previous?previous.price:p.price,quantity};});
    const total=items.reduce((s,i)=>s+i.price*i.quantity,0);requireThat(Number.isSafeInteger(total),'Tổng tiền vượt giới hạn cho phép.');
    const record={id:editId||id('o'),code:old?.code||nextOrderCode(db),customerId,items,total,status:'draft',createdAt:old?.createdAt||new Date().toISOString(),createdBy:old?.createdBy||userId};
    if(old)Object.assign(old,record);else db.orders.unshift(record);return record;
  }
  function checkoutOrder(db,payload){
    requireThat(payload&&typeof payload==='object','Dữ liệu đặt hàng không hợp lệ.');
    const idem=String(payload.idempotencyKey||'').trim().slice(0,120);
    if(idem){
      const existing=db.orders.find(o=>o.idempotencyKey&&o.idempotencyKey===idem);
      if(existing)return {order:existing,duplicate:true};
    }
    const name=String(payload.name||'').trim();
    const phone=String(payload.phone||'').trim();
    const email=String(payload.email||'').trim().toLowerCase();
    const address=String(payload.address||'').trim();
    const note=String(payload.note||'').trim().slice(0,500);
    const customerAccountId=payload.customerAccountId?String(payload.customerAccountId).trim():null;
    requireThat(name.length>0&&name.length<=100,'Họ tên phải có từ 1 đến 100 ký tự.');
    requireThat(/^0\d{9}$/.test(phone),'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.');
    requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=150,'Email không đúng định dạng.');
    requireThat(address.length>=5&&address.length<=300,'Địa chỉ nhận hàng phải có từ 5 đến 300 ký tự.');
    const lines=Array.isArray(payload.lines)?payload.lines:[];
    requireThat(lines.length>0,'Giỏ hàng đang trống. Vui lòng chọn ít nhất một sản phẩm.');
    const expectedPrices=payload.expectedPrices&&typeof payload.expectedPrices==='object'?payload.expectedPrices:null;
    const seen=new Set();
    const items=lines.map(line=>{
      const p=db.products.find(x=>x.id===line.productId);
      requireThat(p&&p.active,`Sản phẩm ${p?p.name:'đã chọn'} không còn kinh doanh.`);
      requireThat(!seen.has(p.id),'Sản phẩm bị trùng trong giỏ hàng.');
      seen.add(p.id);
      const quantity=integer(line.quantity,1,'Số lượng');
      requireThat(p.stock>=quantity,`Sản phẩm ${p.name} chỉ còn ${p.stock} chiếc trong kho.`);
      if(expectedPrices&&Object.hasOwn(expectedPrices,p.id)&&Number(expectedPrices[p.id])!==p.price){
        const err=new Error(`Giá sản phẩm ${p.name} đã thay đổi theo dữ liệu cửa hàng. Vui lòng kiểm tra lại tổng tiền.`);
        err.code='PRICE_CHANGED';
        throw err;
      }
      return {productId:p.id,name:p.name,code:p.code,price:p.price,quantity};
    });
    const total=items.reduce((s,i)=>s+i.price*i.quantity,0);
    requireThat(Number.isSafeInteger(total)&&total>0,'Tổng tiền vượt giới hạn cho phép.');
    let customerRecord=null;
    if(customerAccountId){
      customerRecord=db.customers.find(c=>c.accountId===customerAccountId);
      if(customerRecord){
        customerRecord.name=name;customerRecord.phone=phone;customerRecord.email=email;customerRecord.address=address;
      }else{
        customerRecord={id:id('c'),accountId:customerAccountId,name,phone,email,address};
        db.customers.push(customerRecord);
      }
    }else{
      // Khách vãng lai không được sửa hồ sơ khách hàng đã có do quản lý nhập; thông tin giao hàng nằm trong order.shipping.
      customerRecord=db.customers.find(c=>!c.accountId&&c.phone===phone&&String(c.email||'').toLowerCase()===email);
      if(!customerRecord){
        customerRecord={id:id('c'),name,phone,email,address};
        db.customers.push(customerRecord);
      }
    }
    const record={
      id:id('o'),
      code:nextOrderCode(db),
      customerId:customerRecord.id,
      customerAccountId,
      source:'storefront',
      items,
      total,
      status:'draft',
      createdAt:new Date().toISOString(),
      createdBy:'storefront',
      note,
      shipping:{name,phone,email,address},
      idempotencyKey:idem
    };
    db.orders.unshift(record);
    return {order:record,duplicate:false};
  }
  function transition(db,userId,orderId,next) {
    user(db,userId);const o=db.orders.find(x=>x.id===orderId);requireThat(o,'Không tìm thấy đơn hàng.');
    requireThat(next==='confirmed'||next==='cancelled','Trạng thái không hợp lệ.');
    requireThat(o.status!==next && o.status!=='cancelled','Đơn hàng đã được xử lý.');
    if(next==='confirmed'){
      requireThat(o.status==='draft','Chỉ xác nhận được đơn nháp.');
      o.items.forEach(i=>{const p=db.products.find(x=>x.id===i.productId);requireThat(p&&p.active&&p.stock>=i.quantity,`Không đủ tồn kho hoặc sản phẩm đã ngừng bán: ${i.name}.`);});
      o.items.forEach(i=>{db.products.find(x=>x.id===i.productId).stock-=i.quantity;});o.confirmedAt=new Date().toISOString();
    }else if(o.status==='confirmed')o.items.forEach(i=>{db.products.find(x=>x.id===i.productId).stock+=i.quantity;});
    db.movements.unshift(...o.items.map(i=>({id:id('m'),productId:i.productId,quantity:next==='confirmed'?-i.quantity:o.status==='confirmed'?i.quantity:0,reason:`${next==='confirmed'?'Bán hàng':'Hủy đơn'} ${o.code}`,createdAt:new Date().toISOString(),userId})));
    o.status=next;return o;
  }
  function stock(db,userId,productId,quantity,reason) {user(db,userId,true);const p=db.products.find(x=>x.id===productId);requireThat(p,'Không tìm thấy sản phẩm.');const n=integer(quantity,1,'Số lượng nhập');requireThat(Number.isSafeInteger(p.stock+n),'Tồn kho vượt giới hạn.');requireThat(String(reason||'').trim(),'Hãy nhập lý do nhập kho.');p.stock+=n;db.movements.unshift({id:id('m'),productId,quantity:n,reason:String(reason).trim().slice(0,300),createdAt:new Date().toISOString(),userId});}
  function category(db,userId,kind,name,remove=false){user(db,userId,true);requireThat(['brands','types'].includes(kind),'Danh mục không hợp lệ.');name=String(name||'').trim();requireThat(name.length>0&&name.length<=50,'Tên danh mục phải có 1–50 ký tự.');if(remove){requireThat(!db.products.some(p=>p[kind==='brands'?'brand':'type']===name),'Danh mục đang được sản phẩm sử dụng.');db[kind]=db[kind].filter(x=>x!==name);}else{requireThat(!db[kind].some(x=>x.toLowerCase()===name.toLowerCase()),'Danh mục đã tồn tại.');db[kind].push(name);}}
  function account(db,userId,data){user(db,userId,true);const username=String(data.username||'').trim();requireThat(/^[a-zA-Z0-9_]{3,30}$/.test(username),'Tên đăng nhập gồm 3–30 chữ, số hoặc _.');requireThat(!db.users.some(u=>u.username.toLowerCase()===username.toLowerCase()),'Tên đăng nhập đã tồn tại.');requireThat(String(data.password||'').length>=8,'Mật khẩu cần ít nhất 8 ký tự.');requireThat(String(data.name||'').trim(),'Hãy nhập họ tên.');db.users.push({id:id('u'),username,password:data.password,name:String(data.name).trim().slice(0,100),role:'staff',active:true});}
  function toggleAccount(db,userId,targetId){user(db,userId,true);const target=db.users.find(u=>u.id===targetId);requireThat(target&&target.role==='staff','Chỉ được khóa hoặc mở khóa tài khoản nhân viên.');target.active=!target.active;}
  function editAccount(db,userId,targetId,data){user(db,userId,true);const target=db.users.find(u=>u.id===targetId);requireThat(target&&target.role==='staff','Chỉ được sửa tài khoản nhân viên.');const name=String(data.name||'').trim(),username=String(data.username||'').trim(),password=String(data.password||'');requireThat(name.length>0&&name.length<=100,'Họ tên phải có 1–100 ký tự.');requireThat(/^[a-zA-Z0-9_]{3,30}$/.test(username),'Tên đăng nhập gồm 3–30 chữ, số hoặc _.');requireThat(!db.users.some(u=>u.id!==targetId&&u.username.toLowerCase()===username.toLowerCase()),'Tên đăng nhập đã tồn tại.');requireThat(!password||password.length>=8,'Mật khẩu cần ít nhất 8 ký tự.');target.name=name;target.username=username;if(password)target.password=password;}
  function deleteAccount(db,userId,targetId){user(db,userId,true);const target=db.users.find(u=>u.id===targetId);requireThat(target&&target.role==='staff','Chỉ được xóa tài khoản nhân viên.');requireThat(!db.orders.some(o=>o.createdBy===targetId)&&!db.movements.some(m=>m.userId===targetId),'Tài khoản đã có lịch sử đơn hàng hoặc kho; hãy khóa để giữ lịch sử.');db.users=db.users.filter(u=>u.id!==targetId);}
  function renameCategory(db,userId,kind,oldName,newName){
    user(db,userId,true);
    requireThat(['brands','types'].includes(kind),'Danh mục không hợp lệ.');
    requireThat(db[kind].includes(oldName),'Danh mục không còn tồn tại.');
    newName=String(newName||'').trim();
    requireThat(newName.length>0&&newName.length<=50,'Tên danh mục phải có 1–50 ký tự.');
    requireThat(!db[kind].some(x=>x!==oldName&&x.toLowerCase()===newName.toLowerCase()),'Danh mục đã tồn tại.');
    db[kind][db[kind].indexOf(oldName)]=newName;
    const field=kind==='brands'?'brand':'type';
    db.products.forEach(p=>{if(p[field]===oldName)p[field]=newName;});
  }
  function restoreBusiness(current,userId,input){
    user(current,userId,true);
    requireThat(input&&typeof input==='object'&&!Array.isArray(input)&&input.version===1,'File sao lưu không đúng phiên bản.');
    requireThat(['products','customers','orders','movements','brands','types'].every(k=>Array.isArray(input[k])),'File sao lưu thiếu dữ liệu bắt buộc.');
    requireThat(!Object.hasOwn(input,'users'),'File nhập không được chứa tài khoản hoặc mật khẩu.');
    const unique=(rows,key)=>new Set(rows.map(x=>x[key])).size===rows.length;
    requireThat(input.products.length<=10000&&input.customers.length<=10000&&input.orders.length<=20000&&input.movements.length<=50000,'File có quá nhiều bản ghi.');
    for(const kind of ['brands','types'])requireThat(input[kind].every(x=>typeof x==='string'&&x.trim()&&x.length<=50)&&unique(input[kind].map(x=>({name:x.toLocaleLowerCase('vi')})),'name'),'Danh mục không hợp lệ hoặc bị trùng.');
    requireThat(unique(input.products,'id')&&unique(input.products,'code'),'Sản phẩm bị trùng ID hoặc mã.');
    requireThat(unique(input.customers,'id')&&unique(input.orders,'id')&&unique(input.orders,'code')&&unique(input.movements,'id'),'Bản ghi bị trùng ID hoặc mã đơn.');
    for(const p of input.products){
      requireThat(p&&typeof p.id==='string'&&p.id&&typeof p.code==='string'&&/^[A-Z0-9_-]{1,30}$/.test(p.code)&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=100,'Sản phẩm trong file không hợp lệ.');
      requireThat(input.brands.includes(p.brand)&&input.types.includes(p.type)&&Number.isSafeInteger(p.price)&&p.price>0&&Number.isSafeInteger(p.stock)&&p.stock>=0&&typeof p.active==='boolean','Giá, tồn hoặc danh mục sản phẩm không hợp lệ.');
      requireThat(typeof p.description==='string'&&p.description.length<=1000,'Mô tả sản phẩm không hợp lệ.');imageSource(p.image);
    }
    for(const c of input.customers)requireThat(c&&typeof c.id==='string'&&c.id&&typeof c.name==='string'&&c.name.trim()&&c.name.length<=100&&typeof c.phone==='string'&&/^0\d{9}$/.test(c.phone)&&typeof c.email==='string'&&(!c.email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))&&typeof c.address==='string','Khách hàng trong file không hợp lệ.');
    const ids=new Set(input.products.map(p=>p.id)),customerIds=new Set(input.customers.map(c=>c.id));
    for(const o of input.orders){
      requireThat(o&&typeof o.id==='string'&&typeof o.code==='string'&&customerIds.has(o.customerId)&&['draft','confirmed','cancelled'].includes(o.status)&&Array.isArray(o.items)&&o.items.length>0&&Number.isSafeInteger(o.total)&&o.total>0&&Number.isFinite(Date.parse(o.createdAt)),'Đơn hàng trong file không hợp lệ.');
      requireThat(o.items.every(i=>ids.has(i.productId)&&typeof i.name==='string'&&typeof i.code==='string'&&Number.isSafeInteger(i.price)&&i.price>0&&Number.isSafeInteger(i.quantity)&&i.quantity>0),'Dòng đơn hàng không hợp lệ.');
      requireThat(o.items.reduce((sum,i)=>sum+i.price*i.quantity,0)===o.total,'Tổng tiền đơn hàng không khớp.');
      if(o.status==='confirmed')requireThat(Number.isFinite(Date.parse(o.confirmedAt)),'Thiếu thời điểm xác nhận đơn.');
    }
    for(const m of input.movements)requireThat(m&&typeof m.id==='string'&&ids.has(m.productId)&&Number.isSafeInteger(m.quantity)&&typeof m.reason==='string'&&Number.isFinite(Date.parse(m.createdAt)),'Lịch sử kho không hợp lệ.');
    return {...clone(current),brands:clone(input.brands),types:clone(input.types),products:clone(input.products),customers:clone(input.customers),orders:clone(input.orders),movements:clone(input.movements)};
  }
  const api={KEY,seed,clone,migrate,nextOrderCode,product,customer,order,checkoutOrder,transition,stock,category,renameCategory,account,toggleAccount,editAccount,deleteAccount,user,imageSource,filterProducts,restoreBusiness};
  if(typeof module!=='undefined')module.exports=api;else root.WatchStore=api;
})(typeof window!=='undefined'?window:globalThis);
