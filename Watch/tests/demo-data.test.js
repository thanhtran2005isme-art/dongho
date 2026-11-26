const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../store.js'),D=require('../demo-data.js');
test('Bộ demo nhập qua validation thật, giữ tài khoản và không chứa mật khẩu',()=>{
  const current=S.seed();current.users[1].name='Nhân viên hiện tại';const data=D.create();
  assert.equal(Object.hasOwn(data,'users'),false);
  const imported=S.restoreBusiness(current,'u1',data);
  assert.equal(imported.users[1].name,'Nhân viên hiện tại');assert.equal(imported.products.length,18);assert.equal(imported.customers.length,10);assert.equal(imported.orders.length,18);
  assert.equal(current.orders.length,0);
});
test('Tồn kho demo khớp tổng xuất và hoàn; đơn hủy không tính doanh thu',()=>{
  const data=D.create(),baseline=S.seed();
  for(const product of data.products){
    assert.ok(Number.isSafeInteger(product.stock)&&product.stock>=0);
    const initial=baseline.products.find(p=>p.id===product.id);
    if(initial)assert.equal(product.stock,initial.stock+data.movements.filter(m=>m.productId===product.id).reduce((n,m)=>n+m.quantity,0));
  }
  assert.equal(data.orders.filter(o=>o.status==='confirmed').length,10);
  assert.equal(data.orders.filter(o=>o.status==='cancelled').length,4);
  assert.equal(data.orders.filter(o=>o.status==='draft').length,4);
  const revenue=data.orders.filter(o=>o.status==='confirmed').reduce((n,o)=>n+o.total,0);assert.ok(revenue>0);
  for(const order of data.orders)assert.equal(order.total,order.items.reduce((n,i)=>n+i.price*i.quantity,0));
});
test('Bộ demo có thể tải độc lập và hủy đơn xác nhận chỉ hoàn kho một lần',()=>{
  const a=S.restoreBusiness(S.seed(),'u1',D.create()),b=D.create(),order=a.orders.find(o=>o.status==='confirmed');
  const p=a.products.find(p=>p.id===order.items[0].productId),before=p.stock,quantity=order.items[0].quantity;
  S.transition(a,'u1',order.id,'cancelled');assert.equal(p.stock,before+quantity);
  assert.throws(()=>S.transition(a,'u1',order.id,'cancelled'));assert.equal(p.stock,before+quantity);
  assert.equal(b.orders.filter(o=>o.status==='confirmed').length,10);
});
