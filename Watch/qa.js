'use strict';
(() => {
  const KEY='chrono-qa-results-v1';
  const RUNS_KEY='chrono-qa-runs-v2',SELECTION_KEY='chrono-qa-selected-run';
  const SMOKE_KEY='chrono-smoke-latest-v1';
  const SMOKE_HISTORY_KEY='chrono-smoke-history-v1';
  let runId='',metaDirty=false;
  const statuses=['Not Run','Pass','Fail','Blocked'];
  const $=s=>document.querySelector(s);
  const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
  let cases=[],state={meta:{},results:{}},selected=null,baseline='',dirty=false;
  let smokeResult=null,smokeHistory=[],smokeIndex=0;
  const blank=()=>({status:'Not Run',actual:'',bugId:'',evidence:''});
  const result=id=>state.results[id]||blank();
  function validateState(value){
    if(!value||!value.meta||!value.results||typeof value.results!=='object'||Array.isArray(value.results)||Object.values(value.results).some(r=>!r||!statuses.includes(r.status)))throw Error('Dữ liệu QA không hợp lệ. Sao lưu khóa chrono-qa-results-v1 trước khi khôi phục; dữ liệu chưa bị ghi đè.');
    return value;
  }
  function collection(){
    const raw=localStorage.getItem(RUNS_KEY);
    if(raw){const data=JSON.parse(raw);if(data.version!==2||!Array.isArray(data.runs)||!data.runs.length||new Set(data.runs.map(r=>r.id)).size!==data.runs.length)throw Error('Danh sách đợt kiểm thử không hợp lệ; chưa ghi đè dữ liệu.');data.runs.forEach(r=>{if(typeof r.id!=='string')throw Error('Mã đợt không hợp lệ.');validateState(r.data);});return data;}
    const legacy=localStorage.getItem(KEY),data=legacy?validateState(JSON.parse(legacy)):{meta:{runName:'Đợt kiểm thử đầu tiên'},results:{}};
    const migrated={version:2,runs:[{id:'initial',createdAt:new Date().toISOString(),data}]};
    localStorage.setItem(RUNS_KEY,JSON.stringify(migrated));return migrated;
  }
  function read(){const all=collection();if(!runId)runId=all.runs.some(r=>r.id===sessionStorage.getItem(SELECTION_KEY))?sessionStorage.getItem(SELECTION_KEY):all.runs[0].id;const run=all.runs.find(r=>r.id===runId);if(!run)throw Error('Đợt đang xem không còn tồn tại. Tải lại trang để chọn đợt.');return run.data;}
  function renderRuns(){const all=collection();$('#run-picker').replaceChildren(...all.runs.map((r,i)=>{const opt=text('option',`${i+1}. ${r.data.meta.runName||'Chưa đặt tên'}`);opt.value=r.id;opt.selected=r.id===runId;return opt;}));}
  function fillMeta(){for(const key of ['tester','version','environment','runName'])$('#run-form').elements[key].value=state.meta[key]||'';metaDirty=false;}
  function selectRun(id){runId=id;sessionStorage.setItem(SELECTION_KEY,id);state=read();fillMeta();$('#case-search').value='';$('#status-filter').value='';$('#priority-filter').value='';$('#feature-filter').value='';render();}
  function addRun(data){const all=collection(),id=crypto.randomUUID();all.runs.push({id,createdAt:new Date().toISOString(),data});localStorage.setItem(RUNS_KEY,JSON.stringify(all));selectRun(id);}
  function message(value){$('#qa-message').textContent=value;}
  const smokeGroup=id=>window.ChronoSmoke?.groups.find(group=>group.id===id);
  const reportGroup=report=>smokeGroup(report.group??'basic');
  function updateSmokeButton(){
    const count=smokeGroup($('#smoke-group').value)?.caseIds.length;
    $('#run-smoke').textContent=count?`Chạy ${count} ca`:'Chạy kiểm thử';
  }
  function renderSmokeRows(){
    if(!smokeResult)return;
    const filter=$('#smoke-status-filter').value;
    const visible=smokeResult.results.filter(row=>!filter||row.status===filter);
    const list=$('#smoke-list');
    list.replaceChildren(...visible.map(r=>{
      const tr=document.createElement('tr'),idCell=document.createElement('td');idCell.append(text('strong',r.id),text('small',r.requirement));
      tr.append(idCell,text('td',r.name),text('td',r.status,'smoke-'+r.status.toLowerCase()),text('td',r.actual),text('td',`${r.durationMs} ms`));return tr;
    }));
    if(!visible.length){
      const row=document.createElement('tr'),cell=text('td',`Không có ca ${filter} trong lần chạy này.`,'empty');
      cell.colSpan=5;
      row.append(cell);
      list.append(row);
    }
  }
  function renderSmoke(){
    if(!smokeResult)return;
    const passed=smokeResult.results.filter(r=>r.status==='Pass').length,failed=smokeResult.results.length-passed;
    $('.smoke-history').hidden=false;$('#auto-results').hidden=false;$('#smoke-result-actions').hidden=false;
    $('#smoke-run-picker').disabled=false;
    $('#smoke-run-picker').replaceChildren(...smokeHistory.map((run,i)=>{
      const pass=run.results.filter(r=>r.status==='Pass').length;
      const option=new Option(`${run.demoFault?'Mô phỏng · ':''}${reportGroup(run).label} · ${new Date(run.executedAt).toLocaleString('vi-VN')} · ${pass}/${run.results.length} Pass`,String(i));
      option.selected=i===smokeIndex;
      return option;
    }));
    const group=reportGroup(smokeResult);
    $('#smoke-summary').textContent=`${smokeResult.demoFault?'DEMO FAIL MÔ PHỎNG · ':''}${group.label} · ${passed} Pass, ${failed} Fail · ${smokeResult.durationMs} ms`;
    const previous=smokeHistory.slice(smokeIndex+1).find(run=>reportGroup(run).id===group.id);
    $('#smoke-diff').hidden=!previous;
    if(previous){const before=new Map(previous.results.map(r=>[r.id,r.status]));const regressions=smokeResult.results.filter(r=>r.status==='Fail'&&before.get(r.id)==='Pass').map(r=>r.id),fixed=smokeResult.results.filter(r=>r.status==='Pass'&&before.get(r.id)==='Fail').map(r=>r.id);$('#smoke-diff').textContent=`So với lần chạy trước của cùng nhóm${previous.demoFault?' (mô phỏng)':''}: ${regressions.length} ca Pass → Fail${regressions.length?' ('+regressions.join(', ')+')':''}; ${fixed.length} ca Fail → Pass${fixed.length?' ('+fixed.join(', ')+')':''}.`;}
    $('#export-smoke').disabled=false;
    $('#smoke-status-filter').value='';
    renderSmokeRows();
  }
  async function executeSmoke(demo=false){
    const groupPicker=$('#smoke-group');
    if(demo)groupPicker.value='basic';
    const group=smokeGroup(groupPicker.value);
    if(!group)return;
    updateSmokeButton();
    const controls=[$('#run-smoke'),$('#demo-smoke-fail'),groupPicker];controls.forEach(control=>control.disabled=true);
    $('#smoke-summary').textContent=demo?'Đang chạy tình huống Fail mô phỏng…':`Đang chạy ${group.caseIds.length} ca trên dữ liệu mẫu…`;
    await new Promise(resolve=>requestAnimationFrame(resolve));
    try{smokeResult=demo?ChronoSmoke.demoFailure():ChronoSmoke.run(group.id);smokeHistory.unshift(smokeResult);smokeHistory=smokeHistory.slice(0,10);smokeIndex=0;renderSmoke();try{localStorage.setItem(SMOKE_HISTORY_KEY,JSON.stringify(smokeHistory));localStorage.setItem(SMOKE_KEY,JSON.stringify(smokeResult));}catch{$('#smoke-summary').textContent+=' Không lưu được lần chạy vào trình duyệt. Hãy xuất JSON nếu cần giữ kết quả.';}}
    catch(error){$('#smoke-summary').textContent=`Không chạy được bộ kiểm thử: ${error.message}`;}
    finally{controls.forEach(control=>control.disabled=false);}
  }
  $('#run-smoke').onclick=()=>executeSmoke(false);
  $('#demo-smoke-fail').onclick=()=>executeSmoke(true);
  $('#smoke-group').onchange=updateSmokeButton;
  $('#smoke-status-filter').onchange=renderSmokeRows;
  $('#smoke-run-picker').onchange=e=>{smokeIndex=Number(e.target.value);smokeResult=smokeHistory[smokeIndex];renderSmoke();};
  $('#export-smoke').onclick=()=>{if(smokeResult)download('chrono-functional-smoke.json',JSON.stringify(smokeResult,null,2),'application/json');};
  function save(next){const all=collection(),run=all.runs.find(r=>r.id===runId);if(!run)throw Error('Đợt kiểm thử không còn tồn tại.');run.data=next;localStorage.setItem(RUNS_KEY,JSON.stringify(all));state=next;renderRuns();}
  function failure(error){return error.name==='QuotaExceededError'?'Bộ nhớ đầy. Kết quả chưa được lưu; hãy xuất dữ liệu hiện có trước khi dọn bộ nhớ.':error.message;}
  function parseCSV(raw){
    const rows=[];let row=[],cell='',quoted=false;raw=raw.replace(/^\uFEFF/,'');
    for(let i=0;i<raw.length;i++){
      const c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(c===','&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(quoted)throw Error('File test case có dấu ngoặc kép chưa đóng.');
    if(cell||row.length){row.push(cell);rows.push(row);}
    const header=rows.shift();if(!header?.includes('Test Case ID'))throw Error('Không tìm thấy cột Test Case ID.');
    return rows.map(values=>Object.fromEntries(header.map((key,i)=>[key,values[i]||''])));
  }
  function counts(list){const n={'Not Run':0,Pass:0,Fail:0,Blocked:0};list.forEach(c=>n[result(c['Test Case ID']).status]++);return n;}
  function render(){
    renderRuns();
    const n=counts(cases),executed=n.Pass+n.Fail;
    const progress=$('#manual-progress');
    progress.max=cases.length||1;
    progress.value=executed;
    $('#manual-progress-text').textContent=`${executed}/${cases.length} ca đã chạy`;
    const values=[['Tổng ca',cases.length],['Pass',n.Pass],['Fail',n.Fail],['Blocked',n.Blocked],['Not Run',n['Not Run']],['Tỷ lệ đạt',executed?`${(100*n.Pass/executed).toFixed(1)}%`:'N/A']];
    $('#metrics').replaceChildren(...values.map(([label,value])=>{const el=text('div','','qa-metric');el.append(text('span',label),text('strong',value));return el;}));
    const q=$('#case-search').value.trim().toLocaleLowerCase('vi'),status=$('#status-filter').value,priority=$('#priority-filter').value,feature=$('#feature-filter').value;
    const visible=cases.filter(c=>[c['Test Case ID'],c['Requirement ID'],c['Chức năng'],c['Mục tiêu']].join(' ').toLocaleLowerCase('vi').includes(q)&&(!status||result(c['Test Case ID']).status===status)&&(!priority||c['Ưu tiên']===priority)&&(!feature||c['Chức năng']===feature));
    $('#result-count').textContent=`${visible.length}/${cases.length} ca · Đã thực thi ${executed}/${cases.length}`;
    $('#case-list').replaceChildren(...visible.map(c=>{
      const id=c['Test Case ID'],r=result(id),tr=document.createElement('tr'),idCell=document.createElement('td'),goal=document.createElement('td');
      idCell.append(text('strong',id),text('small',c['Requirement ID']));goal.append(text('strong',c['Chức năng']),text('small',c['Mục tiêu']));
      const statusCell=document.createElement('td');statusCell.append(text('span',r.status,'badge '+({Pass:'',Fail:'off',Blocked:'warn','Not Run':'neutral'}[r.status])));
      const action=document.createElement('td'),button=text('button','Ghi kết quả','small');button.type='button';button.setAttribute('aria-label',`Ghi kết quả ${id}`);button.onclick=()=>openCase(c);action.append(button);
      tr.append(idCell,goal,text('td',c['Ưu tiên']),statusCell,text('td',r.bugId||'—'),action);return tr;
    }));
    if(!visible.length){const tr=document.createElement('tr'),td=text('td','Không có ca phù hợp.','empty');td.colSpan=6;tr.append(td);$('#case-list').append(tr);}
    const pending=cases.find(c=>result(c['Test Case ID']).status==='Not Run');
    $('#next-case').disabled=!pending;$('#next-case').textContent=pending?`Bắt đầu ${pending['Test Case ID']}`:`Đã ghi hết ${cases.length} ca`;
    const failures=cases.filter(c=>result(c['Test Case ID']).status==='Fail');
    $('#fail-count').textContent=`${failures.length} ca Fail`;
    $('#export-bugs').disabled=!failures.length;
    $('#fail-list').replaceChildren(...failures.map(c=>{
      const id=c['Test Case ID'],r=result(id),tr=document.createElement('tr'),action=document.createElement('td'),button=text('button','Mở ca','small');
      button.type='button';button.setAttribute('aria-label',`Mở lỗi ${id}`);button.onclick=()=>openCase(c);action.append(button);
      const caseCell=document.createElement('td');caseCell.append(text('strong',id),text('small',c['Mục tiêu']));
      tr.append(caseCell,text('td',r.bugId||'—'),text('td',r.actual||'—'),text('td',r.evidence||'—'),action);return tr;
    }));
    if(!failures.length){const tr=document.createElement('tr'),td=text('td','Chưa có ca Fail trong đợt này.','empty');td.colSpan=5;tr.append(td);$('#fail-list').append(tr);}
    const requirements=[...new Set(cases.map(c=>c['Requirement ID']))];
    $('#trace-list').replaceChildren(...requirements.map(req=>{const list=cases.filter(c=>c['Requirement ID']===req),n=counts(list),tr=document.createElement('tr');[req,list.length,n.Pass,n.Fail,n.Blocked,n['Not Run']].forEach(v=>tr.append(text('td',v)));return tr;}));
  }
  function openCase(c){
    try{state=read();}catch(e){message(failure(e));return;}
    selected=c;const id=c['Test Case ID'],r=result(id);baseline=JSON.stringify(state.results[id]||null);dirty=false;
    $('#case-title').textContent=`${id} · ${c['Mục tiêu']}`;
    const instructions=['Tiền điều kiện','Dữ liệu','Các bước','Kết quả mong đợi'];
    $('#case-instructions').replaceChildren(...instructions.map(key=>{
      const block=document.createElement('dl');
      block.append(text('dt',key),text('dd',c[key]));
      return block;
    }));
    const target=$('#case-target');
    const isHome=c['Chức năng']==='Trang chủ'||id==='TC-090';
    const isQA=c['Chức năng']==='QA';
    target.href=isHome?'home.html':isQA?'qa.html':'index.html';
    target.textContent=isHome?'Mở trang chủ trong tab mới ↗':isQA?'Mở trang kiểm thử trong tab mới ↗':'Mở cửa hàng trong tab mới ↗';
    $('#case-secondary-target').hidden=!['TC-068','TC-069'].includes(id);
    const tips={
      'TC-003':'Nếu tab cửa hàng đang đăng nhập, hãy đăng xuất trước khi thử mật khẩu sai.',
      'TC-084':'Thực hiện ca này bằng cách mở trực tiếp file qa.html trong trình duyệt.'
    };
    $('#case-target-tip').textContent=tips[id]||'Thực hiện các bước, sau đó quay lại tab này để ghi kết quả.';
    for(const key of ['status','actual','bugId','evidence'])$('#case-form').elements[key].value=r[key]||'';
    updateStatusHelp();
    $('#case-error').textContent='';
    const dialog=$('#case-dialog');
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
    $('#case-title').focus({preventScroll:true});
  }
  function updateStatusHelp(){
    const {status,bugId}=$('#case-form').elements;
    const hints={
      'Not Run':'Chọn trạng thái sau khi thử ca này.',
      Pass:'Kết quả đúng mong đợi. Ghi điều đã quan sát và tên hoặc đường dẫn bằng chứng.',
      Fail:'Kết quả khác mong đợi. Ghi điểm khác, bằng chứng và mã lỗi.',
      Blocked:'Chưa thể thực hiện. Ghi lý do, ví dụ thiếu dữ liệu hoặc trang không mở được.'
    };
    $('#case-bug-field').hidden=status.value!=='Fail'&&!bugId.value;
    $('#case-status-help').textContent=hints[status.value]||hints['Not Run'];
  }
  function closeCase(){if(dirty&&!confirm('Đóng và bỏ thay đổi chưa lưu của test case này?'))return;dirty=false;$('#case-dialog').close();}
  $('#close-case').onclick=closeCase;
  $('#next-case').onclick=()=>{try{state=read();const next=cases.find(c=>result(c['Test Case ID']).status==='Not Run');if(next)openCase(next);else{render();message('Tất cả test case của đợt này đã được ghi trạng thái.');}}catch(err){message(failure(err));}};
  $('#practice-example').onclick=()=>{const example=cases.find(c=>c['Test Case ID']==='TC-003');if(example)openCase(example);};
  $('#practice-search').onclick=()=>{const example=cases.find(c=>c['Test Case ID']==='TC-064');if(example)openCase(example);};
  $('#case-dialog').addEventListener('cancel',e=>{e.preventDefault();closeCase();});
  $('#case-form').oninput=()=>{dirty=true;};
  $('#case-form').elements.status.onchange=updateStatusHelp;
  $('#case-form').onsubmit=e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(e.target));for(const key of ['actual','bugId','evidence'])data[key]=data[key].trim();
    if(data.status!=='Not Run'&&!data.actual){$('#case-error').textContent='Hãy ghi kết quả thực tế hoặc lý do bị chặn.';return;}
    if(['Pass','Fail'].includes(data.status)&&!data.evidence){$('#case-error').textContent='Hãy ghi tham chiếu bằng chứng trước khi đánh dấu Pass/Fail.';return;}
    if(data.status==='Fail'&&!data.bugId){$('#case-error').textContent='Ca Fail cần Bug ID để truy vết lỗi.';return;}
    try{
      const next=read(),id=selected['Test Case ID'];if(JSON.stringify(next.results[id]||null)!==baseline)throw Error('Ca này đã được sửa ở tab khác. Đóng và mở lại để xem kết quả mới trước khi lưu.');
      next.results[id]={...data,updatedAt:new Date().toISOString()};
      save(next);
      dirty=false;
      render();
      if(e.submitter?.value==='next'){
        const index=cases.indexOf(selected);
        const pending=[...cases.slice(index+1),...cases.slice(0,index)].find(c=>result(c['Test Case ID']).status==='Not Run');
        if(pending){
          message(`Đã lưu ${id} · ${data.status}. Đang mở ${pending['Test Case ID']}.`);
          openCase(pending);
          return;
        }
        message(`Đã lưu ${id} · ${data.status}. Không còn ca chưa chạy khác trong đợt này.`);
      }else message(`Đã lưu ${id} · ${data.status}.`);
      $('#case-dialog').close();
    }catch(err){$('#case-error').textContent=failure(err);}
  };
  $('#run-form').oninput=()=>{metaDirty=true;};
  $('#run-form').onsubmit=e=>{e.preventDefault();try{const next=read();next.meta=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,v.trim()]));save(next);metaDirty=false;message('Đã lưu thông tin đợt kiểm thử.');}catch(err){message(failure(err));}};
  function canLeave(){return !(dirty||metaDirty)||confirm('Bỏ thay đổi chưa lưu để chuyển đợt?');}
  $('#run-picker').onchange=e=>{const id=e.target.value;if(!canLeave()){e.target.value=runId;return;}try{selectRun(id);}catch(err){message(failure(err));}};
  $('#new-run').onclick=()=>{const name=$('#new-run-name').value.trim();if(!name){message('Hãy nhập tên đợt mới.');return;}if(!canLeave())return;try{addRun({meta:{runName:name},results:{}});$('#new-run-name').value='';message('Đã tạo đợt mới với 90 ca Not Run; đợt cũ được giữ nguyên.');}catch(err){message(failure(err));}};
  function importData(input){
    if(input?.format!=='chrono-qa-v1'||!Array.isArray(input.cases)||![60,cases.length].includes(input.cases.length))throw Error('File cần chứa đủ 60 ca cũ hoặc toàn bộ ca hiện tại.');
    const known=new Map(cases.map(c=>[c['Test Case ID'],c['Requirement ID']])),seen=new Set(),results=Object.create(null);
    for(const c of input.cases){
      const id=c?.['Test Case ID'],r=c?.result;if(!known.has(id)||seen.has(id)||c['Requirement ID']!==known.get(id))throw Error('Mã test case/yêu cầu bị sai hoặc trùng.');seen.add(id);
      if(!r||!statuses.includes(r.status))throw Error(`Trạng thái không hợp lệ tại ${id}.`);
      const clean={status:r.status};for(const [key,max]of [['actual',3000],['evidence',1500],['bugId',100]]){if(typeof r[key]!=='string'||r[key].length>max)throw Error(`Trường ${key} không hợp lệ tại ${id}.`);clean[key]=r[key].trim();}
      if((r.status!=='Not Run'&&!clean.actual)||(['Pass','Fail'].includes(r.status)&&!clean.evidence)||(r.status==='Fail'&&!clean.bugId))throw Error(`Thiếu kết quả, bằng chứng hoặc Bug ID tại ${id}.`);
      if(typeof r.updatedAt==='string'&&!Number.isNaN(Date.parse(r.updatedAt)))clean.updatedAt=r.updatedAt;
      results[id]=clean;
    }
    if(input.cases.length===60&&Array.from({length:60},(_,i)=>`TC-${String(i+1).padStart(3,'0')}`).some(id=>!seen.has(id)))throw Error('File 60 ca cũ phải có đủ TC-001 đến TC-060.');
    const meta={};for(const [key,max]of [['tester',100],['version',100],['environment',300],['runName',150]]){const value=input.meta?.[key]??'';if(typeof value!=='string'||value.length>max)throw Error('Thông tin đợt kiểm thử không hợp lệ.');meta[key]=value.trim();}
    meta.runName=meta.runName||'Đợt khôi phục';return {meta,results};
  }
  $('#import-run').onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>1024*1024)throw Error('File JSON vượt giới hạn 1 MB.');const data=importData(JSON.parse(await file.text()));
      const done=Object.values(data.results).filter(r=>r.status!=='Not Run').length;
      if(!canLeave()||!confirm(`Nhập “${data.meta.runName}” thành đợt mới? Có ${cases.length} ca, ${done} ca đã ghi trạng thái. Đợt hiện có được giữ nguyên.`))return;
      addRun(data);message('Đã khôi phục thành đợt mới. Kết quả và tham chiếu bằng chứng do file cung cấp, chưa được xác minh độc lập.');
    }catch(err){message(failure(err));}finally{e.target.value='';}
  };
  for(const id of ['case-search','status-filter','priority-filter','feature-filter'])$('#'+id).addEventListener('input',render);
  $('#clear-case-filters').onclick=()=>{for(const id of ['case-search','status-filter','priority-filter','feature-filter'])$('#'+id).value='';render();$('#case-search').focus();};
  function snapshot(){state=read();return {format:'chrono-qa-v1',exportedAt:new Date().toISOString(),method:'Manual — kết quả do người thực thi ghi nhận',meta:state.meta,summary:{total:cases.length,...counts(cases)},cases:cases.map(c=>({...c,result:result(c['Test Case ID'])}))};}
  function download(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  // Giữ nguyên văn bản nhưng vô hiệu hóa công thức khi mở CSV bằng Excel.
  const csvCell=value=>{let v=String(value??'');if(/^[\s\uFEFF]*[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
  const csvBody=rows=>'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
  $('#export-results').onclick=()=>{try{download('chrono-qa-results.json',JSON.stringify(snapshot(),null,2),'application/json');message('Đã xuất JSON. Lưu file cùng ảnh/log bằng chứng.');}catch(e){message(failure(e));}};
  $('#export-csv').onclick=()=>{
    try{
      const s=snapshot(),headers=['Test Case ID','Requirement ID','Chức năng','Mục tiêu','Tiền điều kiện','Dữ liệu','Các bước','Kết quả mong đợi','Ưu tiên','Loại','Kết quả thực tế','Trạng thái','Bug ID','Bằng chứng','Thời điểm cập nhật'];
      const lines=[headers,...s.cases.map(c=>[c['Test Case ID'],c['Requirement ID'],c['Chức năng'],c['Mục tiêu'],c['Tiền điều kiện'],c['Dữ liệu'],c['Các bước'],c['Kết quả mong đợi'],c['Ưu tiên'],c['Loại'],c.result.actual,c.result.status,c.result.bugId,c.result.evidence,c.result.updatedAt||''])];
      download('chrono-qa-test-cases.csv',csvBody(lines),'text/csv;charset=utf-8');message('Đã xuất CSV của đợt đang xem. Mở bằng Excel và lưu cùng bằng chứng.');
    }catch(e){message(failure(e));}
  };
  $('#export-bugs').onclick=()=>{
    try{
      const s=snapshot(),failed=s.cases.filter(c=>c.result.status==='Fail');
      if(!failed.length){render();message('Đợt hiện tại không có ca Fail để xuất.');return;}
      const headers=['Bug ID','Test Case ID','Requirement ID','Chức năng','Mục tiêu','Ưu tiên test case','Tiền điều kiện','Dữ liệu kiểm thử','Các bước tái hiện','Kết quả mong đợi','Kết quả thực tế','Bằng chứng','Cập nhật lúc','Đợt kiểm thử','Người thực thi','Phiên bản nguồn','Môi trường'];
      const rows=[headers,...failed.map(c=>[c.result.bugId,c['Test Case ID'],c['Requirement ID'],c['Chức năng'],c['Mục tiêu'],c['Ưu tiên'],c['Tiền điều kiện'],c['Dữ liệu'],c['Các bước'],c['Kết quả mong đợi'],c.result.actual,c.result.evidence,c.result.updatedAt||'',s.meta.runName||'',s.meta.tester||'',s.meta.version||'',s.meta.environment||''])];
      download('chrono-qa-bugs.csv',csvBody(rows),'text/csv;charset=utf-8');message(`Đã xuất ${failed.length} ca Fail của đợt hiện tại. Kiểm tra và đính kèm file bằng chứng trước khi gửi lỗi.`);
    }catch(e){message(failure(e));}
  };
  $('#export-report').onclick=()=>{
    try{const s=snapshot(),clean=v=>String(v||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ').replace(/\|/g,'\\|');
      let md=`# Báo cáo kiểm thử thủ công CHRONO\n\nXuất lúc: ${s.exportedAt}\n\nNguồn: kết quả do người thực thi ghi nhận; chưa xác minh độc lập.\n\n`;
      for(const [key,label]of [['tester','Người thực thi'],['version','Phiên bản'],['environment','Môi trường'],['runName','Đợt kiểm thử']])md+=`${label}: ${clean(s.meta[key])}\n\n`;
      const n=s.summary;md+=`Tổng: ${n.total}; Pass: ${n.Pass}; Fail: ${n.Fail}; Blocked: ${n.Blocked}; Not Run: ${n['Not Run']}.\n\nTỷ lệ đạt trong ca đã thực thi: ${n.Pass+n.Fail?(100*n.Pass/(n.Pass+n.Fail)).toFixed(1)+'%':'N/A'}. Blocked không tính là đã thực thi.\n\n| Ca | Yêu cầu | Trạng thái | Thực tế | Bug ID | Bằng chứng |\n|---|---|---|---|---|---|\n`;
      for(const c of s.cases)md+=`| ${[c['Test Case ID'],c['Requirement ID'],c.result.status,c.result.actual,c.result.bugId,c.result.evidence].map(clean).join(' | ')} |\n`;
      download('chrono-qa-summary.md',md,'text/markdown;charset=utf-8');message('Đã xuất báo cáo Markdown. Kiểm tra dữ liệu và bằng chứng trước khi nộp.');
    }catch(e){message(failure(e));}
  };
  window.addEventListener('beforeunload',e=>{if(dirty||metaDirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if(e.key===RUNS_KEY){try{state=read();render();if(!metaDirty)fillMeta();message('Kết quả QA được cập nhật từ tab khác.');}catch(err){message(failure(err));}}});
  async function start(){
    const loadStatus=document.querySelector('.qa-load-status');
    loadStatus.dataset.state='loading';$('#retry-load').hidden=true;$('#jump-cases').hidden=true;$('#next-case').hidden=true;message('Đang tải danh sách test case…');
    try{
      state=read();let csv;if(location.protocol==='file:'){if(!window.CHRONO_CASES_CSV)throw Error('Thiếu dữ liệu test case. Hãy mở trang bằng Go Live.');csv=window.CHRONO_CASES_CSV;}else{const response=await fetch('docs/TEST-CASES.csv');if(!response.ok)throw Error('Không tải được test case. Hãy mở qa.html bằng Go Live.');csv=await response.text();}cases=parseCSV(csv);
      if(cases.length===0||new Set(cases.map(c=>c['Test Case ID'])).size!==cases.length)throw Error('Danh sách test case rỗng hoặc mã bị trùng.');
      const filter=$('#feature-filter'),previous=filter.value;filter.replaceChildren(new Option('Tất cả chức năng',''),...[...new Set(cases.map(c=>c['Chức năng']).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi')).map(name=>new Option(name,name)));filter.value=previous;
      fillMeta();
      $('#practice-example').disabled=!cases.some(c=>c['Test Case ID']==='TC-003');
      $('#practice-search').disabled=!cases.some(c=>c['Test Case ID']==='TC-064');
      $('#run-picker').disabled=false;$('#new-run').disabled=false;$('#import-run').disabled=false;
      $('#export-results').disabled=false;$('#export-csv').disabled=false;$('#export-report').disabled=false;$('#run-form').querySelector('button').disabled=false;render();loadStatus.dataset.state='ready';$('#jump-cases').hidden=false;$('#next-case').hidden=false;message(`Đã tải ${cases.length} test case. Bạn có thể mở ca chưa chạy tiếp theo hoặc chọn một ca trong danh sách.`);
    }catch(e){loadStatus.dataset.state='error';message(`Không thể mở sổ kiểm thử: ${failure(e)}`);$('#retry-load').hidden=false;$('#run-form').querySelector('button').disabled=true;}
  }
  $('#retry-load').onclick=start;
  if(window.ChronoSmoke){
    $('#smoke-group').replaceChildren(...ChronoSmoke.groups.map(group=>new Option(`${group.label} · ${group.caseIds.length} ca`,group.id)));
    updateSmokeButton();
    $('#run-smoke').disabled=false;
    $('#demo-smoke-fail').disabled=false;
  }else $('#smoke-summary').textContent='Không tải được bộ kiểm thử tự động.';
  try{
    const valid=r=>{
      if(r?.format!=='chrono-functional-smoke-v1'||!Number.isFinite(Date.parse(r.executedAt))||!Array.isArray(r.results))return false;
      const group=reportGroup(r);
      return group&&r.results.length===group.caseIds.length&&r.results.every((row,i)=>row?.id===group.caseIds[i]&&['Pass','Fail'].includes(row.status));
    };
    const saved=JSON.parse(localStorage.getItem(SMOKE_HISTORY_KEY)||'null'),legacy=JSON.parse(localStorage.getItem(SMOKE_KEY)||'null');
    smokeHistory=Array.isArray(saved)?saved.filter(valid).slice(0,10):[];
    if(!smokeHistory.length&&valid(legacy))smokeHistory=[legacy];
    smokeResult=smokeHistory[0]||null;renderSmoke();
  }catch{/* Lần chạy cũ hỏng không ảnh hưởng sổ thủ công. */}
  start();
})();
