/* Dữ liệu giả lập để trình diễn UI. Không tự thay dữ liệu đang sử dụng. */
(function(root){
  const S=typeof module!=='undefined'?require('./store.js'):root.WatchStore;
  function create(){
    const db=S.seed();
    const extra=[
      ['SE003','Seiko Prospex Diver','Seiko','Đồng hồ cơ',15600000,14],
      ['CI002','Citizen Tsuyosa','Citizen','Đồng hồ cơ',11200000,9],
      ['CA003','Casio Edifice Sapphire','Casio','Đồng hồ quartz',4500000,18],
      ['OR002','Orient Sun & Moon','Orient','Đồng hồ cơ',9800000,11],
      ['TI002','Tissot Gentleman','Tissot','Đồng hồ quartz',10900000,7],
      ['SE004','Seiko SUR Classic','Seiko','Đồng hồ quartz',5200000,16],
      ['CI003','Citizen Promaster','Citizen','Đồng hồ quartz',8700000,6],
      ['CA004','Casio Baby-G Pastel','Casio','Đồng hồ điện tử',2800000,22],
      ['OR003','Orient Mako III','Orient','Đồng hồ cơ',7200000,10],
      ['TI003','Tissot Le Locle','Tissot','Đồng hồ cơ',18900000,4],
      ['CA005','Casio F-91W','Casio','Đồng hồ điện tử',650000,0]
    ];
    extra.forEach(([code,name,brand,type,price,stock],i)=>db.products.push({id:'p'+(i+8),code,name,brand,type,price,stock,active:true,description:'Sản phẩm mẫu phục vụ kiểm thử và bảo vệ đồ án.'}));
    ['Chi','Dũng','Hà','Linh','Minh','Ngọc','Phúc','Trang'].forEach((name,i)=>db.customers.push({id:'c'+(i+3),name:'Khách hàng mẫu '+name,phone:'09000000'+String(i+3).padStart(2,'0'),email:'demo'+(i+3)+'@example.com',address:'Địa chỉ giả lập '+(i+3)}));
    const anchor=new Date();anchor.setUTCHours(3,0,0,0);
    for(let i=0;i<18;i++){
      const productId=['p1','p2','p6','p8','p9','p10'][i%6];
      const order=S.order(db,'u1','c'+(i%10+1),[{productId,quantity:i%3===0?2:1}]);
      const stamp=new Date(anchor.getTime()-(i%7)*86400000).toISOString();
      order.createdAt=stamp;
      if(i<14){
        S.transition(db,'u1',order.id,'confirmed');order.confirmedAt=stamp;
        if(i>=10)S.transition(db,'u1',order.id,'cancelled');
      }
      db.movements.filter(m=>m.reason.includes(order.code)).forEach(m=>m.createdAt=stamp);
    }
    const {users,...business}=db;
    return business;
  }
  const api={create};
  if(typeof module!=='undefined')module.exports=api;else root.ChronoDemo=api;
})(typeof window!=='undefined'?window:globalThis);
