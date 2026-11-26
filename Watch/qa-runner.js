/* Bộ kiểm tra nghiệp vụ chạy trên dữ liệu giả lập độc lập với cửa hàng đang sử dụng. */
(function(root){
  'use strict';
  const S=root.WatchStore;
  const check=(condition,detail)=>{if(!condition)throw Error(detail);};
  const rejects=(work,pattern)=>{let error;try{work();}catch(e){error=e;}check(error&&pattern.test(error.message),`Đáng lẽ phải từ chối với lỗi ${pattern}; nhận ${error?.message||'không có lỗi'}.`);};
  const cases=[
    {id:'AT-001',req:'FR-03',name:'Thêm sản phẩm và chuẩn hóa mã',run:d=>{const p=S.product(d,'u1',{code:' qa001 ',name:'Đồng hồ QA',brand:'Seiko',type:'Đồng hồ cơ',price:1000000,stock:2});check(p.code==='QA001'&&d.products.includes(p),'Sản phẩm hoặc mã không khớp.');return `Đã tạo ${p.code}, tồn 2.`;}},
    {id:'AT-002',req:'FR-03',name:'Chặn mã sản phẩm trùng',run:d=>{const count=d.products.length;rejects(()=>S.product(d,'u1',{code:' se001 ',name:'Trùng mã',brand:'Seiko',type:'Đồng hồ cơ',price:1000,stock:1}),/đã tồn tại/);check(d.products.length===count,'Dữ liệu bị ghi khi mã trùng.');return 'Mã SE001 bị từ chối, danh sách giữ nguyên.';}},
    {id:'AT-003',req:'FR-05',name:'Kiểm tra số điện thoại khách hàng',run:d=>{const count=d.customers.length;rejects(()=>S.customer(d,'u1',{name:'Khách QA',phone:'123'}),/điện thoại/);check(d.customers.length===count,'Khách không hợp lệ vẫn được lưu.');return 'Số 123 bị từ chối, dữ liệu giữ nguyên.';}},
    {id:'AT-004',req:'FR-06',name:'Đơn nháp chưa trừ tồn kho',run:d=>{const o=S.order(d,'u2','c1',[{productId:'p1',quantity:2}]);check(o.status==='draft'&&o.total===25000000&&d.products[0].stock===8,'Đơn nháp hoặc tồn kho sai.');return 'Đơn nháp 25.000.000 ₫; tồn vẫn 8.';}},
    {id:'AT-005',req:'FR-07',name:'Xác nhận đơn trừ tồn đúng số lượng',run:d=>{const o=S.order(d,'u2','c1',[{productId:'p1',quantity:2}]);S.transition(d,'u2',o.id,'confirmed');check(o.status==='confirmed'&&d.products[0].stock===6,'Xác nhận hoặc trừ kho sai.');return 'Đơn xác nhận; tồn giảm từ 8 còn 6.';}},
    {id:'AT-006',req:'FR-07',name:'Không bán vượt tồn, không trừ dở',run:d=>{const o=S.order(d,'u1','c1',[{productId:'p1',quantity:2},{productId:'p2',quantity:99}]);rejects(()=>S.transition(d,'u1',o.id,'confirmed'),/Không đủ tồn/);check(o.status==='draft'&&d.products[0].stock===8&&d.products[1].stock===12,'Đã trừ dở tồn hoặc đổi trạng thái.');return 'Xác nhận bị chặn; tồn cả hai sản phẩm giữ nguyên.';}},
    {id:'AT-007',req:'FR-08',name:'Hủy đơn xác nhận hoàn kho một lần',run:d=>{const o=S.order(d,'u2','c1',[{productId:'p1',quantity:2}]);S.transition(d,'u2',o.id,'confirmed');S.transition(d,'u2',o.id,'cancelled');rejects(()=>S.transition(d,'u2',o.id,'cancelled'),/đã được xử lý/);check(d.products[0].stock===8,'Tồn kho không được hoàn đúng một lần.');return 'Tồn trở về 8; hủy lặp bị chặn.';}},
    {id:'AT-008',req:'FR-09',name:'Nhập kho tạo lịch sử',run:d=>{S.stock(d,'u1','p1',4,'Kiểm tra tự động');check(d.products[0].stock===12&&d.movements[0]?.quantity===4,'Tồn hoặc lịch sử nhập kho sai.');return 'Tồn tăng lên 12; lịch sử ghi +4.';}},
    {id:'AT-009',req:'FR-02',name:'Nhân viên không sửa sản phẩm',run:d=>{const count=d.products.length;rejects(()=>S.product(d,'u2',{code:'QA002',name:'Đồng hồ',brand:'Seiko',type:'Đồng hồ cơ',price:1000,stock:1}),/không có quyền/);check(d.products.length===count,'Nhân viên vẫn thêm được sản phẩm.');return 'Thao tác của nhân viên bị từ chối.';}},
    {id:'AT-010',req:'FR-10',name:'Đổi thương hiệu cập nhật sản phẩm',run:d=>{S.renameCategory(d,'u1','brands','Seiko','Seiko QA');check(d.products.filter(p=>p.code.startsWith('SE')).every(p=>p.brand==='Seiko QA'),'Sản phẩm liên quan chưa cập nhật.');return 'Hai sản phẩm Seiko đổi sang Seiko QA.';}},
    {id:'AT-011',req:'FR-04',name:'Lọc kết hợp thương hiệu và loại',run:d=>{const rows=S.filterProducts(d.products,{brand:'Seiko',type:'Đồng hồ cơ',status:'active'});check(rows.length===1&&rows[0].id==='p1','Kết quả lọc không đúng.');return 'Bộ lọc trả đúng SE001.';}},
    {id:'AT-012',req:'FR-12',name:'Khóa nhân viên chặn nghiệp vụ',run:d=>{S.toggleAccount(d,'u1','u2');rejects(()=>S.customer(d,'u2',{name:'Khách QA',phone:'0900000000'}),/không có quyền/);return 'Tài khoản đã khóa không thể thêm khách.';}},
    {
      id:'AT-013',req:'FR-03',name:'Từ chối sản phẩm giá bằng 0',
      run(data){
        const before=data.products.length;
        const product={...data.products[0],code:'QA013',price:0};
        rejects(()=>S.product(data,'u1',product),/Giá bán/);
        check(data.products.length===before,'Số sản phẩm thay đổi sau khi bị từ chối.');
        return 'Giá 0 bị từ chối, số sản phẩm giữ nguyên.';
      }
    },
    {
      id:'AT-014',req:'FR-10',name:'Giữ danh mục đang được sử dụng',
      run(data){
        rejects(()=>S.category(data,'u1','brands','Seiko',true),/đang được sản phẩm sử dụng/);
        check(data.brands.includes('Seiko'),'Thương hiệu đang dùng bị xóa.');
        return 'Không xóa được Seiko khi sản phẩm còn sử dụng.';
      }
    },
    {
      id:'AT-015',req:'FR-05',name:'Thêm khách hàng có dữ liệu hợp lệ',
      run(data){
        const customer=S.customer(data,'u2',{name:' Khách thử ',phone:'0912345678',email:'qa@example.test'});
        check(data.customers.some(row=>row.id===customer.id&&row.name==='Khách thử'&&row.email==='qa@example.test'),'Khách hàng không được lưu đúng.');
        return 'Khách hàng được lưu với họ tên đã bỏ khoảng trắng thừa.';
      }
    },
    {
      id:'AT-016',req:'FR-05',name:'Từ chối sửa khách hàng bằng email sai',
      run(data){
        const customer=data.customers[0],before=JSON.stringify(customer);
        rejects(()=>S.customer(data,'u1',{...customer,email:'sai-email'},customer.id),/Email/);
        check(JSON.stringify(customer)===before,'Dữ liệu khách hàng cũ bị thay đổi.');
        return 'Email sai bị từ chối và thông tin cũ giữ nguyên.';
      }
    },
    {
      id:'AT-017',req:'FR-06',name:'Từ chối đơn có hai dòng trùng sản phẩm',
      run(data){
        const lines=[{productId:'p1',quantity:1},{productId:'p1',quantity:2}];
        rejects(()=>S.order(data,'u2','c1',lines),/Sản phẩm bị trùng/);
        check(data.orders.length===0&&data.products[0].stock===8,'Đơn lỗi đã được lưu hoặc thay đổi tồn.');
        return 'Đơn không được lưu, tồn kho vẫn là 8.';
      }
    },
    {
      id:'AT-018',req:'FR-06',name:'Giữ đơn giá cũ khi sửa số lượng đơn nháp',
      run(data){
        const order=S.order(data,'u2','c1',[{productId:'p1',quantity:1}]);
        S.product(data,'u1',{...data.products[0],price:15000000},'p1');
        const updated=S.order(data,'u2','c1',[{productId:'p1',quantity:2}],order.id);
        check(data.orders.length===1&&updated.items[0].price===12500000&&updated.total===25000000,'Sửa đơn tạo bản trùng hoặc dùng sai đơn giá.');
        return 'Số lượng đổi thành 2, tổng vẫn tính theo giá cũ là 25.000.000 ₫.';
      }
    },
    {
      id:'AT-019',req:'FR-08',name:'Hủy đơn nháp giữ nguyên tồn kho',
      run(data){
        const order=S.order(data,'u2','c1',[{productId:'p1',quantity:2}]);
        S.transition(data,'u2',order.id,'cancelled');
        check(order.status==='cancelled'&&data.products[0].stock===8,'Hủy nháp đổi sai trạng thái hoặc tồn kho.');
        return 'Đơn nháp chuyển sang đã hủy, tồn kho vẫn là 8.';
      }
    },
    {
      id:'AT-020',req:'FR-12',name:'Sửa tên đăng nhập giữ nguyên mật khẩu nếu để trống',
      run(data){
        const before=data.users.find(user=>user.id==='u2').password;
        S.editAccount(data,'u1','u2',{name:'Nhân viên QA',username:'staff_qa',password:''});
        const staff=S.user(data,'u2');
        check(staff.username==='staff_qa'&&staff.name==='Nhân viên QA'&&staff.password===before,'Thông tin nhân viên được cập nhật sai.');
        return 'Họ tên và tên đăng nhập đã đổi, mật khẩu giữ nguyên.';
      }
    },
    {
      id:'AT-021',req:'FR-12',name:'Từ chối đổi tên đăng nhập trùng',
      run(data){
        rejects(()=>S.editAccount(data,'u1','u2',{name:'Nhân viên QA',username:'ADMIN'}),/đã tồn tại/);
        check(S.user(data,'u2').username==='staff','Tên đăng nhập cũ bị đổi dù trùng.');
        return 'Tên ADMIN bị từ chối và tên staff giữ nguyên.';
      }
    },
    {
      id:'AT-022',req:'FR-12',name:'Bảo toàn tài khoản nhân viên có lịch sử đơn',
      run(data){
        const order=S.order(data,'u2','c1',[{productId:'p1',quantity:1}]);
        rejects(()=>S.deleteAccount(data,'u1','u2'),/lịch sử/);
        check(S.user(data,'u2').id==='u2'&&data.orders.some(row=>row.id===order.id),'Nhân viên hoặc đơn hàng bị mất.');
        return 'Tài khoản nhân viên và đơn đã tạo vẫn còn.';
      }
    },
    {
      id:'AT-023',req:'NFR-02',name:'Khôi phục tồn kho và giữ tài khoản hiện tại',
      run(data){
        const {users,...backup}=S.clone(data);
        backup.products[0].stock=15;
        const restored=S.restoreBusiness(data,'u1',backup);
        check(restored.products[0].stock===15&&data.products[0].stock===8,'Khôi phục sai tồn kho hoặc sửa trực tiếp dữ liệu nguồn.');
        check(restored.users.length===users.length&&restored.users.every((user,i)=>user.id===users[i].id),'Danh sách tài khoản bị thay đổi.');
        return 'Bản khôi phục có tồn 15 và vẫn giữ các tài khoản hiện tại.';
      }
    },
    {
      id:'AT-024',req:'NFR-02',name:'Từ chối bản sao lưu có giá âm',
      run(data){
        const backup=S.clone(data);
        delete backup.users;
        backup.products[0].price=-1;
        rejects(()=>S.restoreBusiness(data,'u1',backup),/Giá, tồn/);
        check(data.products[0].price===12500000,'Giá hiện tại bị đổi sau khi từ chối file.');
        return 'File giá âm bị từ chối, giá sản phẩm hiện tại giữ nguyên.';
      }
    }
  ];
  const groups=[
    {id:'all',label:'Tất cả chức năng',cases},
    {id:'basic',label:'Ca cơ bản',cases:cases.slice(0,12)},
    {id:'products',label:'Sản phẩm và danh mục',cases:cases.filter(c=>['FR-03','FR-04','FR-10'].includes(c.req))},
    {id:'customers',label:'Khách hàng',cases:cases.filter(c=>c.req==='FR-05')},
    {id:'orders',label:'Đơn hàng và kho',cases:cases.filter(c=>['FR-06','FR-07','FR-08','FR-09'].includes(c.req))},
    {id:'accounts',label:'Tài khoản và phân quyền',cases:cases.filter(c=>['FR-02','FR-12'].includes(c.req))},
    {id:'backup',label:'Sao lưu và khôi phục',cases:cases.filter(c=>c.req==='NFR-02')}
  ];
  function run(groupId='all'){
    if(!S)throw Error('Không tải được store.js để chạy kiểm thử.');
    const group=groups.find(entry=>entry.id===groupId);
    if(!group)throw Error('Không tìm thấy nhóm kiểm thử.');
    const started=performance.now();
    const results=group.cases.map(c=>{const begin=performance.now();try{const actual=c.run(S.seed());return {id:c.id,requirement:c.req,name:c.name,status:'Pass',actual,durationMs:Math.round((performance.now()-begin)*10)/10};}catch(error){return {id:c.id,requirement:c.req,name:c.name,status:'Fail',actual:error.message,durationMs:Math.round((performance.now()-begin)*10)/10};}});
    return {format:'chrono-functional-smoke-v1',group:group.id,executedAt:new Date().toISOString(),scope:'Quy tắc nghiệp vụ store.js trên dữ liệu giả lập; không kiểm thử giao diện hoặc dữ liệu cửa hàng đang dùng',durationMs:Math.round((performance.now()-started)*10)/10,results};
  }
  function demoFailure(){
    if(!S)throw Error('Không tải được store.js để chạy kiểm thử.');
    const original=S.product;
    S.product=(...args)=>{const record=original(...args);if(String(args[2]?.code||'').trim().toUpperCase()==='QA001')record.code='MÃ-SAI';return record;};
    try{const report=run('basic');report.demoFault=true;report.scope+='; lỗi chuẩn hóa mã được cố ý mô phỏng cho bài demo';return report;}
    finally{S.product=original;}
  }
  root.ChronoSmoke={
    run,demoFailure,
    groups:groups.map(group=>({id:group.id,label:group.label,caseIds:group.cases.map(c=>c.id)}))
  };
})(typeof window!=='undefined'?window:globalThis);
