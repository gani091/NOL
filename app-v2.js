const V2_STORAGE_KEY='nol-prototype-v2.1';
const CURRENT_MEMBER='신가은';
const OWNER_GROUP='놀꼬지 텐션업';
const NOTICE_URL='https://bow-relative-525.notion.site/2d6231e585c7803788c6d2a43cad9335?pvs=74';
const POLICY_URL='https://bow-relative-525.notion.site/FAQ-2d6231e585c7807b8193f66887837264';

Object.assign(state,{
 calendarMonth:state.calendarMonth||'2026-08',
 pushEnabled:state.pushEnabled!==false,
 notifications:state.notifications||[],
 groupJoinRequests:state.groupJoinRequests||[]
});

function dotDate(value){
 const v=(value||'').trim().replace(/\//g,'.').replace(/-/g,'.');
 const m=v.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
 return m?`${m[1]}.${String(Number(m[2])).padStart(2,'0')}.${String(Number(m[3])).padStart(2,'0')}`:v;
}
function todayDot(){
 const d=new Date();
 return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function activityDateTime(a){
 const date=dotDate(a.date).replaceAll('.','-');
 const start=(a.time||'00:00 ~ 00:00').split('~')[0].trim();
 return new Date(`${date}T${start}:00`);
}
function activityDurationMinutes(a){
 const [s,e]=(a.time||'').split('~').map(x=>(x||'').trim());
 if(!s||!e) return 0;
 const toMin=t=>{const [h,m]=t.split(':').map(Number);return h*60+(m||0)};
 let start=toMin(s),end=toMin(e); if(end<=start) end+=1440;
 return end-start;
}
function applicantCount(a){return (a.applicants||[]).filter(p=>p.status!=='cancelled').length}
function approvedCount(a){return (a.applicants||[]).filter(p=>['approved','attended','no-show'].includes(p.status)).length}
function attendedCount(a){return (a.applicants||[]).filter(p=>p.status==='attended').length}
function noShowCount(a){return (a.applicants||[]).filter(p=>p.status==='no-show').length}
function scoreRegisteredCount(a){return attendedCount(a)+noShowCount(a)+(a.status==='활동 예정'?approvedCount(a):0)}
function scoreEligible(a){
 const registered=a.status==='활동 완료'||a.status==='출석 확인'?attendedCount(a)+noShowCount(a)+(a.status==='출석 확인'?(a.applicants||[]).filter(p=>p.status==='approved').length:0):approvedCount(a);
 return registered>=4&&activityDurationMinutes(a)>=60;
}
function scoreLockedEligible(a){return a.status==='활동 완료'?!!a.scoreEligible:scoreEligible(a)}
function memberRecord(name=CURRENT_MEMBER){
 let score=0,participated=0,noShow=0,event=0;
 activities.forEach(a=>{
  if(a.status!=='활동 완료'||!scoreLockedEligible(a)) return;
  const p=(a.applicants||[]).find(x=>x.name===name);
  if(p?.status==='attended'){score+=10;participated+=1}
  if(p?.status==='no-show'){score-=100;noShow+=1}
  if(p?.eventPoints){score+=p.eventPoints;event+=1}
 });
 return {score,participated,noShow,event};
}
function groupRecord(groupName=OWNER_GROUP){
 let score=0,opened=0,participants=0,events=0;
 activities.filter(a=>a.group===groupName).forEach(a=>{
  if(a.status!=='활동 완료'||!scoreLockedEligible(a)) return;
  opened+=1; participants+=attendedCount(a); score+=10+attendedCount(a);
  if(a.groupEventPoints){score+=a.groupEventPoints;events+=1}
 });
 return {score,opened,participants,events};
}
function saveV2(){
 try{
  localStorage.setItem(V2_STORAGE_KEY,JSON.stringify({activities,appliedActivityIds:state.appliedActivityIds,notifications:state.notifications,pushEnabled:state.pushEnabled,groupJoinRequests:state.groupJoinRequests}));
 }catch(e){}
}
function seedDemoData(){
 const a1=activities.find(a=>a.id==='act-1');
 if(a1) Object.assign(a1,{date:'2026.08.15',time:'17:00 ~ 18:00',status:'출석 확인',capacity:4,scoreEligible:false,applicants:[
  {name:CURRENT_MEMBER,phone:'010-9923-9935',gender:'여자',status:'approved',appliedAt:'2026.08.11'},
  {name:'놀꼬지',phone:'010-1234-1234',gender:'남자',status:'approved',appliedAt:'2026.08.10'},
  {name:'김민석',phone:'010-4312-6677',gender:'남자',status:'approved',appliedAt:'2026.08.10'},
  {name:'박수진',phone:'010-7821-3344',gender:'여자',status:'approved',appliedAt:'2026.08.10'}
 ]});
 const a2=activities.find(a=>a.id==='act-2');
 if(a2) Object.assign(a2,{date:'2026.08.23',time:'17:00 ~ 18:00',status:'활동 예정',capacity:4,applicants:[
  {name:'이서연',phone:'010-2344-8811',gender:'여자',status:'pending',appliedAt:'2026.08.16'},
  {name:'정우진',phone:'010-5522-1098',gender:'남자',status:'pending',appliedAt:'2026.08.16'},
  {name:'최하늘',phone:'010-8760-2301',gender:'여자',status:'pending',appliedAt:'2026.08.16'}
 ]});
 state.appliedActivityIds=['act-1'];
 state.selectedActivityId='act-2';
 state.selectedActivityDate='2026.08.23';
 state.calendarMonth='2026-08';
 state.groupJoinRequests=[{name:'모꼬4',sport:'테니스',status:'pending'},{name:'쿠크다스',sport:'테니스',status:'approved'}];
 state.notifications=[
  {id:'n-seed-1',title:'이번 주 놀꼬지 이벤트가 열렸어요. 새로운 활동을 확인해 보세요!',audience:'전체',type:'event',read:false,createdAt:'방금 전'},
  {id:'n-seed-2',title:'놀꼬지 텐션업 활동의 참여 여부를 확인해 주세요.',audience:'모꼬장',type:'activity',activityId:'act-1',role:'owner',read:false,createdAt:'5분 전'},
  {id:'n-seed-3',title:'놀꼬지 텐션업 가입이 승인되었습니다.',audience:'모꼬',type:'group',read:true,createdAt:'어제'}
 ];
}
function hydrateV2(){
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem(V2_STORAGE_KEY)||'null')}catch(e){}
 if(saved?.activities?.length){
  activities.splice(0,activities.length,...saved.activities);
  state.appliedActivityIds=saved.appliedActivityIds||[];
  state.notifications=saved.notifications||[];
  state.pushEnabled=saved.pushEnabled!==false;
  state.groupJoinRequests=saved.groupJoinRequests||[];
  const firstUpcoming=activities.find(a=>a.status==='활동 예정');
  if(firstUpcoming){state.selectedActivityDate=firstUpcoming.date;state.calendarMonth=firstUpcoming.date.slice(0,7).replace('.', '-')}
 }else seedDemoData();
}
function resetPrototype(){
 if(!confirm('활동 신청·승인·노쇼 테스트 데이터를 처음 상태로 되돌릴까요?')) return;
 try{localStorage.removeItem(V2_STORAGE_KEY)}catch(e){}
 location.reload();
}
function showToast(message,type='success'){
 document.querySelectorAll('.toast-v2').forEach(el=>el.remove());
 const el=document.createElement('div'); el.className=`toast-v2 ${type}`; el.textContent=message; document.body.appendChild(el);
 setTimeout(()=>el.remove(),2600);
}
function addNotification(title,audience='전체',activityId=null,role='member',type='activity'){
 state.notifications.unshift({id:'n-'+Date.now()+Math.random(),title,audience,type,activityId,role,read:false,createdAt:'방금 전'});
 saveV2();
}
function unreadCount(){return (state.notifications||[]).filter(n=>!n.read).length}

function header(title='',opts={}){
 const unread=unreadCount();
 return `${statusbar()}<div class="header">
 ${opts.back?`<button class="icon-btn left" onclick="back()">‹</button>`:''}
 <h1>${title}</h1>
 ${opts.actions!==false?`<div class="header-actions"><button class="mini" onclick="go('notifications')" style="position:relative">🔔${unread?`<span class="badge">${unread>99?'99+':unread}</span>`:''}</button><button class="mini" onclick="go('settings')">⚙</button></div>`:''}
 </div>`;
}
function mergedMemberRanking(){
 const me=memberRecord();
 return [...rankings.member.filter(x=>x[0]!==CURRENT_MEMBER),[CURRENT_MEMBER,me.score]].sort((a,b)=>b[1]-a[1]);
}
function mergedGroupRanking(){
 const rec=groupRecord();
 return [...rankings.group.filter(x=>x[0]!==OWNER_GROUP),[OWNER_GROUP,rec.score]].sort((a,b)=>b[1]-a[1]);
}
function rankCard(){
 const list=(state.rankMode==='group'?mergedGroupRanking():mergedMemberRanking()).slice(0,5);
 const title=state.rankMode==='group'?'모꼬지 랭킹':'모꼬 랭킹';
 return `<div class="rank-card" onclick="toggleRank()"><div class="rank-title">${title}</div>${list.map((r,i)=>`<div class="rank-row"><span class="rank-name">${i<3?'🏆':(i+1)+'위'} ${r[0]}</span><span>${r[1]}점</span></div>`).join('')}</div><div class="dots"><span class="dot ${state.rankMode==='member'?'active':''}"></span><span class="dot ${state.rankMode==='group'?'active':''}"></span></div>`;
}
function groupRankStatic(){
 return `<div class="rank-card"><div class="rank-title">모꼬지 랭킹</div>${mergedGroupRanking().slice(0,5).map((r,i)=>`<div class="rank-row"><span>${i+1}위 ${r[0]}</span><span>${r[1]}점</span></div>`).join('')}</div>`;
}
function home(){
 const rec=memberRecord(); const ranking=mergedMemberRanking(); const rank=ranking.findIndex(x=>x[0]===CURRENT_MEMBER)+1;
 const upcoming=activities.filter(a=>a.status==='활동 예정'&&(a.applicants||[]).some(p=>p.name===CURRENT_MEMBER&&p.status==='approved')).sort((a,b)=>activityDateTime(a)-activityDateTime(b)).slice(0,2);
 return `${header('',{back:false})}<main class="screen">
 <div class="ad-banner" onclick="window.open('https://www.instagram.com/','_blank')"><div class="ad-copy"><small>ADVERTISEMENT · 놀꼬지 소식</small><strong>이번 주에도<br>함께 운동해요</strong></div><div><div class="ad-icon">🏃</div><button>소식 보기 ↗</button></div></div>
 <div class="section-title">활동 랭킹</div>${rankCard()}
 <div class="section-title green-title">${CURRENT_MEMBER}님의 활동 랭킹</div>
 <div class="soft-card"><div class="score-head">${rank}위 · ${rec.score}점</div><div class="metrics"><div class="metric"><small>활동 참여</small><strong>${rec.participated}</strong></div><div class="metric"><small>이벤트 참여</small><strong>${rec.event}</strong></div><div class="metric"><small>노쇼</small><strong>${rec.noShow}</strong></div></div><div class="rule-note">점수는 활동 완료 후, 승인된 참여 대상 4명 이상 · 활동 시간 60분 이상인 활동만 반영됩니다.</div></div>
 <div class="section-title green-title">${upcoming.length?'참여 예정된 활동이 있어요':'참여 예정된 활동이 없어요'}</div>
 ${upcoming.length?upcoming.map(a=>memberActivityCard(a)).join(''):`<div class="activity-card" style="text-align:center"><div class="muted">새 활동을 신청하고 랭킹을 올려보세요.</div><button class="primary btn-small" style="margin-top:10px" onclick="openGroup('${OWNER_GROUP}')">활동 찾기</button></div>`}
 </main>${tabbar('home')}`;
}

function notificationIcon(type){return type==='event'?'🎁':type==='dm'?'💬':type==='group'?'👥':'🏃'}
function openNotification(id){
 const n=state.notifications.find(x=>x.id===id); if(!n) return; n.read=true; saveV2();
 if(n.activityId){state.selectedGroupRole=n.role==='owner'?'owner':'member';openActivity(n.activityId,n.role==='owner'?'applicants':'detail')}
 else if(n.type==='dm') go('dm'); else render(false);
}
function markAllRead(){state.notifications.forEach(n=>n.read=true);saveV2();render(false)}
function notifications(){
 const rows=state.notifications||[];
 return `${header('알림',{back:true,actions:false})}<main class="screen"><div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 14px"><b>알림 <span class="tag">${unreadCount()}</span></b><button class="ghost" style="height:32px" onclick="markAllRead()">전체 읽음</button></div>
 ${rows.length?rows.map(n=>`<div class="notice-card ${n.read?'':'unread'}" onclick="openNotification('${n.id}')"><div class="notice-icon">${notificationIcon(n.type)}</div><div class="notice-body"><div class="notice-title">${n.title}<span class="notice-target">${n.audience}</span></div><div class="notice-meta">${n.createdAt}</div></div>${n.read?'':'<span class="dotmark"></span>'}</div>`).join(''):'<div class="empty-state"><div class="empty-icon">🔔</div><b>새 알림이 없어요</b><span>활동 신청·승인 결과를 여기에서 확인할 수 있어요.</span></div>'}</main>${tabbar('home')}`;
}
function togglePush(){state.pushEnabled=!state.pushEnabled;saveV2();render(false);showToast(state.pushEnabled?'PUSH 알림을 받습니다.':'PUSH 알림을 끄고 앱 내 알림만 표시합니다.','success')}
function settings(){
 return `${header('설정',{back:true,actions:false})}<main class="screen"><div class="settings-card"><div style="color:var(--green);font-size:12px">${CURRENT_MEMBER}</div><div class="muted">서울특별시 구로구 · 테니스</div><button class="ghost" style="width:100%;margin-top:10px" onclick="go('profile')">내 정보 수정</button></div>
 <button class="settings-row button" onclick="window.open(NOTICE_URL,'_blank')"><span>공지사항</span><span>외부 링크 ↗</span></button>
 <button class="settings-row button" onclick="window.open(POLICY_URL,'_blank')"><span>FAQ / 운영 정책</span><span>외부 링크 ↗</span></button>
 <button class="settings-row button" onclick="togglePush()"><span>PUSH 알림 수신 설정</span><span class="push-toggle ${state.pushEnabled?'on':''}"></span></button>
 <button class="settings-row button" onclick="showToast('로그아웃 기능은 프로토타입에서 화면만 제공합니다.')"><span>로그아웃</span><span>›</span></button>
 <button class="settings-row button" onclick="resetPrototype()"><span>프로토타입 데이터 초기화</span><span>↻</span></button>
 <div class="settings-row" style="color:#ef7070"><span>회원 탈퇴</span><span>›</span></div></main>${tabbar('home')}`;
}

function activityFlowStepper(a){
 const idx=a.status==='활동 예정'?1:a.status==='출석 확인'?2:a.status==='활동 완료'?3:0;
 return `<div class="flow-stepper">${['활동 생성','신청·승인','출석 확인','점수 반영'].map((x,i)=>`<div class="flow-step ${i<=idx?'on':''}">${x}</div>`).join('')}</div>`;
}
function scorePolicyCard(a){
 const duration=activityDurationMinutes(a); const registered=a.status==='활동 완료'?attendedCount(a)+noShowCount(a):approvedCount(a); const eligible=a.status==='활동 완료'?a.scoreEligible:(registered>=4&&duration>=60);
 return `<div class="score-policy"><strong>점수 반영 조건 ${a.status==='활동 완료'?'결과':'예상'}</strong><div class="policy-line"><span>승인/참여 대상 4명 이상</span><span class="${registered>=4?'ok':'no'}">${registered}명 ${registered>=4?'✓':'필요'}</span></div><div class="policy-line"><span>활동 시간 60분 이상</span><span class="${duration>=60?'ok':'no'}">${duration}분 ${duration>=60?'✓':'필요'}</span></div><div class="score-preview ${eligible?'':'warn'}">${eligible?'조건을 충족합니다. 활동 완료 후 모꼬 +10점, 모꼬지 활동 개설 +10점 및 실제 참여 1명당 +1점이 반영됩니다.':'현재 조건으로는 활동 완료 후에도 점수가 반영되지 않습니다.'}</div><div class="rule-note">※ 프로토타입은 등록된 활동 시간을 실제 운동 시간 기준으로 사용합니다.</div></div>`;
}
function currentMemberStatus(a){return (a.applicants||[]).find(p=>p.name===CURRENT_MEMBER)}
function memberStatusLabel(a,p){
 if(!p) return '미신청';
 if(p.status==='pending') return '승인 대기';
 if(p.status==='approved') return a.status==='출석 확인'?'참여 확인 대기':'참여 확정';
 if(p.status==='attended') return a.status==='활동 완료'?'참여 완료':'참여 확인됨';
 if(p.status==='no-show') return '노쇼';
 if(p.status==='cancelled') return '신청 취소';
 return p.status;
}
function memberStatusClass(p){return !p?'cancelled':p.status==='pending'?'pending':p.status==='approved'?'approved':p.status==='attended'?'attended':p.status==='no-show'?'noshow':'cancelled'}
function activityCard(a){
 const eligible=scoreEligible(a); const registered=approvedCount(a);
 return `<div class="activity-card" onclick="openActivity('${a.id}')"><div class="card-top"><span class="status-pill ${a.status==='활동 완료'?'complete':a.status==='출석 확인'?'attended':'approved'}">${a.status}</span><span class="card-count">신청 ${applicantCount(a)} · 승인 ${registered}/${a.capacity}</span></div><h3>${a.title}</h3><div class="muted">▦ ${a.date} · ${a.time}<br>⌖ ${a.place}</div><div class="card-bottom"><span class="score-hint">${eligible?'점수 조건 충족 가능':'점수 조건 확인 필요'}</span><span>›</span></div></div>`;
}
function memberActivityCard(a){
 const me=currentMemberStatus(a); const label=memberStatusLabel(a,me);
 const scoreText=a.status==='활동 완료'&&me?(scoreLockedEligible(a)?(me.status==='attended'?'+10점':me.status==='no-show'?'-100점':'0점'):'점수 미반영'):'';
 return `<div class="activity-card" onclick="openActivity('${a.id}')"><div class="card-top"><span class="status-pill ${memberStatusClass(me)}">${label}</span><span class="card-count">${scoreText}</span></div><h3>${a.group}</h3><div class="muted">▦ ${a.date} · ${a.time}<br>⌖ ${a.place}</div></div>`;
}

function registerActivity(){
 const date=dotDate(document.getElementById('activity-date')?.value||todayDot());
 const start=(document.getElementById('activity-start')?.value||'19:00').trim();
 const end=(document.getElementById('activity-end')?.value||'20:00').trim();
 const capRaw=(document.getElementById('activity-capacity')?.value||'8').replace(/[^0-9]/g,'');
 const capacity=Math.max(1,Number(capRaw||8));
 const place=(document.getElementById('activity-place')?.value||'올림픽공원 테니스장').trim();
 if(!/^\d{4}\.\d{2}\.\d{2}$/.test(date)){showToast('활동 날짜를 YYYY.MM.DD 형식으로 입력해 주세요.','danger');return}
 const groupName=state.selectedGroupRole==='owner'&&state.selectedGroup?state.selectedGroup:OWNER_GROUP;
 const id='act-'+Date.now();
 const activity={id,group:groupName,title:groupName,registeredAt:todayDot(),date,time:`${start} ~ ${end}`,place,status:'활동 예정',capacity,matchType:state.activityRegisterMatch,skill:'실력 무관',applicants:[],scoreEligible:false};
 activities.unshift(activity); state.selectedActivityId=id; state.selectedActivityDate=date; state.calendarMonth=date.slice(0,7).replace('.', '-'); state.selectedGroup=groupName; state.selectedGroupRole='owner';
 addNotification(`${groupName} ${date} 활동이 등록되었습니다.`,'모꼬장',id,'owner','activity'); saveV2(); go('activity-detail',{activityDetailTab:'detail'}); showToast('활동을 등록했습니다. 모꼬의 신청을 기다려 주세요.');
}
function activityRegister(){
 const defaultDate='2026.08.24';
 return `${header('모꼬 활동 등록',{back:true,actions:false})}<main class="screen"><h3 style="font-size:21px;margin:18px 0 8px">모꼬 활동을 등록해 주세요.</h3><div class="score-preview">점수 집계는 <b>활동 완료 + 승인된 참여 대상 4명 이상 + 60분 이상</b>일 때만 적용됩니다.</div>
 <div class="field"><label>활동 날짜 <span class="green-title">*</span></label><input id="activity-date" value="${defaultDate}"></div>
 <div class="field"><label>활동 시간 (시작 - 종료) <span class="green-title">*</span></label><div class="field-row"><input id="activity-start" value="19:00"><input id="activity-end" value="20:00"></div></div>
 <div class="field"><label>정기 활동</label><div class="option-grid">${['반복 안함','매주','매월'].map(x=>`<button class="form-choice ${state.activityRegisterRepeat===x?'active':''}" onclick="state.activityRegisterRepeat='${x}';render(false)">${x}</button>`).join('')}</div></div>
 <div class="field"><label>활동 가능 인원</label><input id="activity-capacity" value="8" inputmode="numeric"><div class="rule-note">정원과 별개로, 점수 반영을 위해서는 승인된 참여 대상이 4명 이상이어야 합니다.</div></div>
 <div class="field"><label>참여 유형 (Match Type) <span class="green-title">*</span></label><div class="option-grid">${['혼성','남성','여성'].map(x=>`<button class="form-choice ${state.activityRegisterMatch===x?'active':''}" onclick="state.activityRegisterMatch='${x}';render(false)">${x}</button>`).join('')}</div></div>
 <div class="field"><label>운동 장소 <span class="green-title">*</span></label><div class="field-row"><button class="form-choice ${state.activityRegisterPlaceMode==='주요 활동 장소'?'active':''}" onclick="state.activityRegisterPlaceMode='주요 활동 장소';render(false)">주요 활동 장소</button><button class="form-choice ${state.activityRegisterPlaceMode==='새로운 장소 입력'?'active':''}" onclick="state.activityRegisterPlaceMode='새로운 장소 입력';render(false)">새로운 장소 입력</button></div></div>
 <div class="field"><label>주소</label><input value="서울 송파구 올림픽로 424 (올림픽공원)" disabled></div><div class="field"><label>활동 장소명</label><input id="activity-place" value="올림픽공원 테니스장"></div>
 <div class="field"><label>참여 가능한 운동 실력</label><div class="field-row"><button class="form-choice active">실력 무관</button><button class="form-choice">실력 입력</button></div></div>
 <button class="primary" style="width:100%;margin-top:22px" onclick="registerActivity()">활동 등록하기</button></main>${tabbar('activity')}`;
}

function applyToActivity(id){
 const a=activities.find(x=>x.id===id); if(!a||a.status!=='활동 예정'){showToast('현재 신청할 수 없는 활동입니다.','danger');return}
 let me=(a.applicants||[]).find(p=>p.name===CURRENT_MEMBER);
 if(me&&['pending','approved','attended','no-show'].includes(me.status)){showToast('이미 신청한 활동입니다.','danger');return}
 if(approvedCount(a)>=a.capacity){showToast('승인 인원이 정원에 도달해 모집이 마감되었습니다.','danger');return}
 if(me){Object.assign(me,{status:'pending',appliedAt:todayDot()})}else{a.applicants=a.applicants||[];a.applicants.push({name:CURRENT_MEMBER,phone:'010-9923-9935',gender:'여자',status:'pending',appliedAt:todayDot()})}
 if(!state.appliedActivityIds.includes(id)) state.appliedActivityIds.push(id); state.selectedActivityId=id;
 addNotification(`${CURRENT_MEMBER}님이 ${a.group} ${a.date} 활동을 신청했습니다.`,'모꼬장',id,'owner','activity'); saveV2(); render(false); showToast('신청을 완료했습니다. 모꼬장 승인 후 참여가 확정됩니다.');
}
function approveApplicant(activityId,name){
 const a=activities.find(x=>x.id===activityId); const p=a?.applicants?.find(x=>x.name===name); if(!a||!p||p.status!=='pending') return;
 if(approvedCount(a)>=a.capacity){showToast('정원이 가득 차 더 이상 승인할 수 없습니다.','danger');return}
 p.status='approved'; if(name===CURRENT_MEMBER)addNotification(`${a.group} ${a.date} 활동 신청이 승인되었습니다. 참여가 확정됐어요!`,'모꼬',activityId,'member','activity');
 saveV2(); render(false); showToast(`${name}님의 활동 신청을 승인했습니다.`);
}
function cancelApplicant(activityId,name){
 const a=activities.find(x=>x.id===activityId); const p=a?.applicants?.find(x=>x.name===name); if(!p) return;
 if(!confirm(`${name}님의 신청/승인을 취소할까요?`)) return; p.status='cancelled';
 if(name===CURRENT_MEMBER)addNotification(`${a.group} ${a.date} 활동 신청이 취소되었습니다.`,'모꼬',activityId,'member','activity');
 saveV2(); render(false); showToast('신청을 취소했습니다.');
}
function cancelOwnApplication(activityId){
 const a=activities.find(x=>x.id===activityId); const p=a?.applicants?.find(x=>x.name===CURRENT_MEMBER); if(!p||!['pending','approved'].includes(p.status)) return;
 if(!confirm('활동 신청을 취소할까요?')) return; p.status='cancelled'; addNotification(`${CURRENT_MEMBER}님이 ${a.group} ${a.date} 활동 신청을 취소했습니다.`,'모꼬장',activityId,'owner','activity'); saveV2(); render(false); showToast('활동 신청을 취소했습니다.');
}
function startAttendance(activityId){
 const a=activities.find(x=>x.id===activityId); if(!a||a.status!=='활동 예정') return;
 if(approvedCount(a)===0){showToast('승인된 모꼬가 없어 출석 확인을 시작할 수 없습니다.','danger');return}
 (a.applicants||[]).forEach(p=>{if(p.status==='pending')p.status='cancelled'}); a.status='출석 확인'; state.activityDetailTab='applicants'; addNotification(`${a.group} ${a.date} 활동의 출석 확인이 시작되었습니다.`,'모꼬장',activityId,'owner','activity'); saveV2(); render(false); showToast('출석 확인을 시작했습니다. 참여 완료 또는 노쇼를 선택해 주세요.');
}
function markAttendance(activityId,name,result){
 const a=activities.find(x=>x.id===activityId); const p=a?.applicants?.find(x=>x.name===name); if(!a||a.status!=='출석 확인'||!p||!['approved','attended','no-show'].includes(p.status)) return;
 if(result==='no-show'&&!confirm(`${name}님을 노쇼로 표시할까요? 활동 완료 전에는 변경할 수 있습니다.`)) return;
 p.status=result; saveV2(); render(false); showToast(result==='attended'?`${name}님의 참여를 확인했습니다.`:`${name}님을 노쇼로 표시했습니다.`,result==='no-show'?'danger':'success');
}
function completeActivity(activityId){
 const a=activities.find(x=>x.id===activityId); if(!a||a.status!=='출석 확인') return;
 const unresolved=(a.applicants||[]).filter(p=>p.status==='approved').length; if(unresolved){showToast(`참여 여부를 확인하지 않은 모꼬가 ${unresolved}명 있습니다.`,'danger');return}
 const registered=attendedCount(a)+noShowCount(a); const eligible=registered>=4&&activityDurationMinutes(a)>=60; a.scoreEligible=eligible; a.status='활동 완료'; a.completedAt=todayDot(); a.scoreSummary={registered,attended:attendedCount(a),noShow:noShowCount(a),duration:activityDurationMinutes(a),groupPoints:eligible?10+attendedCount(a):0};
 const me=currentMemberStatus(a); if(me){
  const msg=!eligible?'활동이 완료되었지만 점수 반영 조건을 충족하지 않아 점수가 반영되지 않았습니다.':me.status==='attended'?`${a.group} 활동 참여가 완료되어 +10점이 반영되었습니다.`:me.status==='no-show'?`${a.group} 활동이 노쇼로 확정되어 -100점이 반영되었습니다.`:`${a.group} 활동이 완료되었습니다.`;
  addNotification(msg,'모꼬',activityId,'member','activity');
 }
 addNotification(`${a.group} ${a.date} 활동 완료 · ${eligible?`모꼬지 +${10+attendedCount(a)}점 반영`:'점수 조건 미충족'}`,'모꼬장',activityId,'owner','activity'); saveV2(); render(false); showToast(eligible?'활동을 완료하고 점수를 반영했습니다.':'활동을 완료했습니다. 점수 조건은 충족하지 못했습니다.',eligible?'success':'danger');
}
function cancelActivity(activityId){
 const a=activities.find(x=>x.id===activityId); if(!a||a.status==='활동 완료') return; if(!confirm('활동을 취소할까요? 승인된 모꼬에게도 취소 알림이 표시됩니다.')) return;
 (a.applicants||[]).forEach(p=>{if(['pending','approved'].includes(p.status))p.status='cancelled'}); a.status='활동 취소'; if((a.applicants||[]).some(p=>p.name===CURRENT_MEMBER))addNotification(`${a.group} ${a.date} 활동이 취소되었습니다.`,'모꼬',activityId,'member','activity'); saveV2(); render(false); showToast('활동을 취소했습니다.','danger');
}

function monthShift(delta){
 const [y,m]=state.calendarMonth.split('-').map(Number); const d=new Date(y,m-1+delta,1); state.calendarMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; state.selectedActivityDate=`${state.calendarMonth.replace('-', '.')}.01`; render(false);
}
function activityApply(){
 const groupName=state.selectedGroup; const all=activities.filter(a=>a.group===groupName&&a.status==='활동 예정');
 if(all.length&&(!state.calendarMonth||!all.some(a=>a.date.startsWith(state.calendarMonth.replace('-','.'))))){state.calendarMonth=all[0].date.slice(0,7).replace('.', '-');state.selectedActivityDate=all[0].date}
 const [year,month]=state.calendarMonth.split('-').map(Number); const first=new Date(year,month-1,1).getDay(); const last=new Date(year,month,0).getDate(); const cells=[...Array(first).fill(null),...Array.from({length:last},(_,i)=>i+1)];
 const hasDates=new Set(all.map(a=>a.date)); const selected=all.filter(a=>a.date===state.selectedActivityDate);
 return `${header('모꼬 활동 신청',{back:true,actions:false})}<main class="screen"><div class="score-preview">신청 → 모꼬장 승인 → 실제 참여 확인 → 활동 완료 순서로 진행됩니다. 점수는 완료된 활동만 반영됩니다.</div><div class="calendar"><div class="cal-head"><button class="cal-nav" onclick="monthShift(-1)">‹</button><span>${year}년 ${month}월</span><button class="cal-nav" onclick="monthShift(1)">›</button></div><div class="cal-grid">${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x=>`<span>${x}</span>`).join('')}${cells.map(day=>{
  if(!day)return '<span class="day blank">0</span>'; const date=`${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`; const has=hasDates.has(date); return `<button style="border:0;background:transparent" class="day ${date===state.selectedActivityDate?'selected':''} ${has?'has-activity':''}" onclick="state.selectedActivityDate='${date}';render(false)">${day}</button>`;
 }).join('')}</div></div>
 ${selected.length?`<div class="activity-apply-list"><div class="section-title" style="margin-top:0">신청 가능한 활동</div>${selected.map(a=>{
  const me=currentMemberStatus(a); const full=approvedCount(a)>=a.capacity&&!me; const text=me?.status==='pending'?'승인 대기':me?.status==='approved'?'승인 완료':me?.status==='cancelled'?'다시 신청':full?'모집 마감':'신청하기'; const disabled=(me&&['pending','approved'].includes(me.status))||full;
  return `<div class="activity-apply-card"><div class="apply-head"><div><h3>${a.group}</h3><div class="apply-meta">${a.date} · ${a.time}<br>⌖ ${a.place}<br>신청 ${applicantCount(a)}명 · 승인 ${approvedCount(a)}/${a.capacity}명 · ${a.matchType}</div></div><button class="apply-button" ${disabled?'disabled':''} onclick="applyToActivity('${a.id}')">${text}</button></div>${scorePolicyCard(a)}</div>`;
 }).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">📅</div><b>이 날짜에는 등록된 활동이 없어요</b><span>초록 점이 있는 날짜를 선택해 주세요.</span></div>`}</main>${tabbar('group')}`;
}

function myActivity(){
 const rec=memberRecord(); const source=state.appliedActivityIds.map(id=>activities.find(a=>a.id===id)).filter(Boolean); const upcoming=source.filter(a=>['활동 예정','출석 확인'].includes(a.status)); const history=source.filter(a=>['활동 완료','활동 취소'].includes(a.status));
 return `${header('내 활동',{back:false})}<main class="screen"><div class="segment"><button class="active">모꼬</button><button onclick="go('my-leader')">모꼬장</button></div><div class="section-title" style="margin-top:8px">${CURRENT_MEMBER}의 활동 기록</div><div class="soft-card"><div class="score-total">${rec.score}<span>점</span></div><div class="metrics"><div class="metric"><small>활동 참여</small><strong>${rec.participated}</strong></div><div class="metric"><small>이벤트 참여</small><strong>${rec.event}</strong></div><div class="metric"><small>노쇼</small><strong>${rec.noShow}</strong></div></div><div class="rule-note">활동 완료 전의 승인/참여 확인 상태는 점수에 포함되지 않습니다.</div></div>
 <div class="activity-history-title"><div class="section-title">참여 예정 / 확인 중</div><button class="ghost" style="height:34px" onclick="go('activity-all')">전체 보기 ›</button></div>${upcoming.length?upcoming.map(a=>memberActivityCard(a)).join(''):`<div class="activity-card" style="text-align:center"><div class="muted">예정된 활동이 없습니다.</div><button class="primary btn-small" style="margin-top:10px" onclick="openGroup('${OWNER_GROUP}')">활동 신청하기</button></div>`}
 ${history.length?`<div class="section-title">지난 활동</div>${history.slice(0,3).map(a=>memberActivityCard(a)).join('')}`:''}
 <div class="section-title">가입 중인 모꼬지</div><div class="activity-card" style="text-align:center"><div class="muted">가입한 모꼬지가 없습니다.<br>게스트 참여가 가능한 모꼬지 활동은 바로 신청할 수 있어요.</div><button class="primary btn-small" style="margin-top:10px" onclick="go('group-list')">모꼬지 구경하기</button></div></main>${tabbar('activity')}`;
}
function myLeader(){
 const own=activities.filter(a=>a.group===OWNER_GROUP&&a.status!=='활동 취소'); const rec=groupRecord(); const active=own.filter(a=>a.status!=='활동 완료');
 return `${header('',{})}<main class="screen"><div class="segment"><button onclick="go('my-activity')">모꼬</button><button class="active">모꼬장</button></div><div style="display:flex;justify-content:space-between;align-items:center"><h3>${OWNER_GROUP}</h3><button class="ghost" style="height:34px" onclick="openGroup('${OWNER_GROUP}','owner')">상세 보기 ›</button></div><div class="summary-box"><div class="score-total">${rec.score}<span>점</span></div><div class="metrics"><div class="metric"><small>점수 반영 활동</small><strong>${rec.opened}회</strong></div><div class="metric"><small>실제 참여 모꼬</small><strong>${rec.participants}명</strong></div><div class="metric"><small>이벤트 주최</small><strong>${rec.events}</strong></div></div><div class="leader-actions"><button class="secondary" onclick="go('manage')">모꼬지 관리</button><button class="primary" onclick="go('activity-register')">활동 등록</button></div><div class="rule-note">모꼬지 점수: 조건을 충족한 완료 활동 +10점, 실제 참여 모꼬 1명당 +1점</div></div><div class="activity-history-title"><div class="section-title">진행 중인 활동</div><button class="ghost" style="height:34px" onclick="go('activity-all')">모두 보기 ›</button></div>${active.length?active.map(a=>activityCard(a)).join(''):'<div class="empty-state"><b>진행 중인 활동이 없어요</b><span>새 활동을 등록해 보세요.</span></div>'}</main>${tabbar('activity')}`;
}
function activityAll(){
 const appliedSet=new Set(state.appliedActivityIds); const owner=state.selectedGroupRole==='owner'; const source=owner?activities.filter(a=>a.group===OWNER_GROUP):activities.filter(a=>appliedSet.has(a.id)); const filters=['전체','활동 예정','출석 확인','활동 완료','활동 취소']; const filtered=state.activityFilter==='전체'?source:source.filter(a=>a.status===state.activityFilter);
 return `${header('활동 모두 보기',{back:true,actions:false})}<main class="screen"><div class="top-filter" style="overflow:auto">${filters.map(x=>`<button class="${state.activityFilter===x?'active':''}" onclick="state.activityFilter='${x}';render(false)">${x}</button>`).join('')}</div>${filtered.length?filtered.map(a=>owner?activityCard(a):memberActivityCard(a)).join(''):'<div class="empty-state"><b>활동 내역이 없습니다.</b></div>'}</main>${tabbar('activity')}`;
}

function approveGroupJoin(name){const r=state.groupJoinRequests.find(x=>x.name===name);if(!r)return;r.status='approved';addNotification(`${OWNER_GROUP} 가입이 승인되었습니다.`,'모꼬',null,'member','group');saveV2();render(false);showToast(`${name}님의 가입을 승인했습니다.`)}
function cancelGroupJoin(name){const r=state.groupJoinRequests.find(x=>x.name===name);if(!r)return;if(!confirm(`${name}님의 가입을 취소할까요?`))return;r.status='cancelled';addNotification(`${OWNER_GROUP} 가입 요청이 취소되었습니다.`,'모꼬',null,'member','group');saveV2();render(false);showToast('가입 요청을 취소했습니다.','danger')}
function manage(){
 const own=activities.filter(a=>a.group===OWNER_GROUP);
 return `${header(OWNER_GROUP,{back:true,actions:false})}<main class="screen"><div class="segment"><button class="${state.manageTab==='activity'?'active':''}" onclick="state.manageTab='activity';render(false)">활동 관리</button><button class="${state.manageTab==='members'?'active':''}" onclick="state.manageTab='members';render(false)">모꼬 관리</button></div>${state.manageTab==='activity'?own.map(a=>activityCard(a)).join(''):state.groupJoinRequests.map(r=>`<div class="person-card v2"><div class="person-top"><div class="person-info"><div class="avatar">${r.name[0]}</div><div><b>${r.name}</b><div class="muted">${r.sport} · 가입 요청</div></div></div><span class="status-pill ${r.status==='approved'?'approved':r.status==='cancelled'?'cancelled':'pending'}">${r.status==='approved'?'가입 승인':r.status==='cancelled'?'취소':'승인 대기'}</span></div>${r.status==='pending'?`<div class="person-bottom"><button class="ghost btn-small" onclick="cancelGroupJoin('${r.name}')">취소</button><button class="primary btn-small" onclick="approveGroupJoin('${r.name}')">가입 승인</button></div>`:''}</div>`).join('')}</main>${tabbar('activity')}`;
}

function activityDetail(){
 const a=currentActivity(); const applicants=a.applicants||[]; const ownerView=state.selectedGroupRole==='owner'; const me=currentMemberStatus(a); const unresolved=applicants.filter(p=>p.status==='approved').length;
 const memberBox=!ownerView&&me?`<div class="member-status-box"><div class="status-title"><span class="status-pill ${memberStatusClass(me)}">${memberStatusLabel(a,me)}</span></div><div class="status-desc">${me.status==='pending'?'모꼬장이 승인하면 참여가 확정됩니다.':me.status==='approved'?'참여가 확정되었습니다. 활동 후 모꼬장이 실제 참여 여부를 확인합니다.':me.status==='attended'?(a.status==='활동 완료'?(a.scoreEligible?'+10점이 반영되었습니다.':'활동은 완료되었지만 점수 조건 미충족으로 점수가 반영되지 않았습니다.'):'참여 확인이 완료되었습니다. 활동 완료 후 점수가 확정됩니다.'):me.status==='no-show'?(a.status==='활동 완료'?(a.scoreEligible?'-100점이 반영되었습니다.':'점수 조건 미충족 활동으로 노쇼 점수는 반영되지 않았습니다.'):'노쇼로 표시되었습니다. 활동 완료 전 모꼬장이 상태를 변경할 수 있습니다.'):'신청이 취소된 활동입니다.'}</div>${a.status==='활동 예정'&&['pending','approved'].includes(me.status)?`<button class="ghost" style="width:100%;margin-top:10px" onclick="cancelOwnApplication('${a.id}')">신청 취소</button>`:''}</div>`:'';
 const detail=`${activityFlowStepper(a)}<div class="card-top"><span class="status-pill ${a.status==='활동 완료'?'complete':a.status==='출석 확인'?'attended':a.status==='활동 취소'?'cancelled':'approved'}">${a.status}</span><span class="card-count">신청 ${applicantCount(a)} · 승인/대상 ${approvedCount(a)}/${a.capacity}</span></div>${memberBox}<p><b>등록일</b><br>${a.registeredAt}</p><p><b>활동 날짜</b><br>${a.date}</p><p><b>활동 시간</b><br>${a.time}</p><p><b>운동 장소</b><br>⌖ ${a.place}</p><p><b>활동 가능 인원</b><br>${a.capacity}명</p><p><b>참여 유형</b><br>${a.matchType}</p>${scorePolicyCard(a)}${a.status==='활동 완료'&&a.scoreSummary?`<div class="summary-box"><b>활동 점수 결과</b><div class="muted" style="margin-top:8px">참여 ${a.scoreSummary.attended}명 · 노쇼 ${a.scoreSummary.noShow}명 · ${a.scoreSummary.duration}분</div><div class="score-total" style="margin-top:12px">+${a.scoreSummary.groupPoints}<span>모꼬지 점수</span></div></div>`:''}${ownerView&&a.status==='활동 예정'?`<button class="primary" style="width:100%;margin-top:12px" onclick="startAttendance('${a.id}')">활동 종료 · 출석 확인</button><button class="ghost" style="width:100%;margin-top:8px" onclick="cancelActivity('${a.id}')">활동 취소</button>`:''}${ownerView&&a.status==='출석 확인'?`<button class="secondary" style="width:100%;margin-top:12px" onclick="state.activityDetailTab='applicants';render(false)">참여 여부 확인하기</button>`:''}`;
 const applicantView=`<div class="approval-summary"><b>승인/참여 대상 <span class="green-title">${approvedCount(a)}</span> / 정원 <span class="green-title">${a.capacity}</span>명</b><span style="float:right">신청 ${applicantCount(a)}명</span></div>${a.status==='출석 확인'?'<div class="score-preview">활동을 완료하려면 승인된 모꼬의 참여 여부를 모두 확인해야 합니다. 노쇼는 활동 완료 시 점수 조건을 충족한 경우 -100점이 반영됩니다.</div>':''}${applicants.length?applicants.map(p=>{
  const label=memberStatusLabel(a,p),cls=memberStatusClass(p); let actions='';
  if(a.status==='활동 예정'&&p.status==='pending')actions=`<button class="ghost btn-small" onclick="cancelApplicant('${a.id}','${p.name}')">신청 취소</button><button class="primary btn-small" onclick="approveApplicant('${a.id}','${p.name}')">승인하기</button>`;
  else if(a.status==='활동 예정'&&p.status==='approved')actions=`<button class="ghost btn-small" onclick="cancelApplicant('${a.id}','${p.name}')">승인 취소</button>`;
  else if(a.status==='출석 확인'&&p.status==='approved')actions=`<button class="primary btn-small" onclick="markAttendance('${a.id}','${p.name}','attended')">참여 완료</button><button class="danger-outline btn-small" onclick="markAttendance('${a.id}','${p.name}','no-show')">노쇼</button>`;
  else if(a.status==='출석 확인'&&p.status==='attended')actions=`<button class="danger-outline btn-small" onclick="markAttendance('${a.id}','${p.name}','no-show')">노쇼로 변경</button>`;
  else if(a.status==='출석 확인'&&p.status==='no-show')actions=`<button class="secondary btn-small" onclick="markAttendance('${a.id}','${p.name}','attended')">참여로 변경</button>`;
  return `<div class="person-card v2"><div class="person-top"><div class="person-info"><div class="avatar">${p.name[0]}</div><div><b>${p.name}</b><div class="muted">${p.phone} · ${p.gender}<br>${p.appliedAt} 신청</div></div></div><span class="status-pill ${cls}">${label}</span></div>${actions?`<div class="person-bottom">${actions}</div>`:''}</div>`;
 }).join(''):'<div class="empty-state"><b>신청한 모꼬가 없습니다.</b></div>'}${a.status==='출석 확인'?`<div class="attendance-toolbar"><div class="muted" style="margin-bottom:8px">${unresolved?`아직 ${unresolved}명의 참여 여부를 확인해야 합니다.`:'모든 참여 여부 확인이 완료되었습니다.'}</div><button class="primary" ${unresolved?'disabled':''} onclick="completeActivity('${a.id}')">활동 완료 · 점수 확정</button></div>`:''}`;
 return `${header('활동 상세보기',{back:true,actions:false})}<main class="screen">${ownerView?`<div class="subtabs"><button class="${state.activityDetailTab==='detail'?'active':''}" onclick="state.activityDetailTab='detail';render(false)">활동 상세</button><button class="${state.activityDetailTab==='applicants'?'active':''}" onclick="state.activityDetailTab='applicants';render(false)">신청한 모꼬</button></div>`:''}${state.activityDetailTab==='applicants'&&ownerView?applicantView:detail}</main>${tabbar('activity')}`;
}

function render(push=true){
 const app=document.getElementById('app');
 const views={home,notifications,settings,profile,'group-home':groupHome,'group-list':groupList,'group-detail':groupDetail,'exchange-list':exchangeList,'exchange-detail':exchangeDetail,'exchange-create':exchangeCreate,join,'create-group':createGroup,'activity-register':activityRegister,'activity-apply':activityApply,'my-activity':myActivity,'my-leader':myLeader,'activity-all':activityAll,manage,'activity-detail':activityDetail,dm,chat};
 app.innerHTML=(views[state.route]||home)(); if(push){history.pushState({route:state.route},'',`#${state.route}`)} startRankRotation();
}

hydrateV2();
render(false);