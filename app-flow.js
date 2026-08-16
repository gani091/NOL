function currentActivity(){
 return activities.find(a=>a.id===state.selectedActivityId)||activities[0];
}
function openActivity(id,tab='detail'){
 state.selectedActivityId=id;
 state.activityDetailTab=tab;
 go('activity-detail');
}
function groupActivities(groupName=state.selectedGroup){
 return activities.filter(a=>a.group===groupName && a.status!=='활동 취소');
}
function normalizeDateInput(value){
 return (value||'2026.07.27').trim().replace(/\./g,'-').replace(/\s/g,'').replace(/-+$/,'');
}
function registerActivity(){
 const date=normalizeDateInput(document.getElementById('activity-date')?.value);
 const start=(document.getElementById('activity-start')?.value||'13:00').trim();
 const end=(document.getElementById('activity-end')?.value||'14:00').trim();
 const capRaw=(document.getElementById('activity-capacity')?.value||'30').replace(/[^0-9]/g,'');
 const capacity=Math.max(1,Number(capRaw||30));
 const place=(document.getElementById('activity-place')?.value||'올림픽공원 테니스장').trim();
 const groupName='놀꼬지 텐션업';
 const id='act-'+Date.now();
 const activity={id,group:groupName,title:groupName,registeredAt:'2026.08.16',date,time:`${start} ~ ${end}`,place,status:'활동 예정',capacity,matchType:state.activityRegisterMatch,skill:'실력 무관',applicants:[]};
 activities.unshift(activity);
 state.selectedActivityId=id;
 state.selectedActivityDate=date;
 state.selectedGroup=groupName;
 state.selectedGroupRole='owner';
 go('my-leader');
}
function applyToActivity(id){
 const activity=activities.find(a=>a.id===id);
 if(!activity) return;
 if(!activity.applicants) activity.applicants=[];
 if(activity.applicants.some(p=>p.name==='신가은')) return;
 activity.applicants.push({name:'신가은',phone:'010-9923-9935',gender:'여자',status:'pending',appliedAt:activity.date});
 if(!state.appliedActivityIds.includes(id)) state.appliedActivityIds.push(id);
 state.selectedActivityId=id;
 render(false);
}
function approveApplicant(activityId,name){
 const activity=activities.find(a=>a.id===activityId);
 const person=activity?.applicants?.find(p=>p.name===name);
 if(person){ person.status='approved'; render(false); }
}
function cancelApplicant(activityId,name){
 const activity=activities.find(a=>a.id===activityId);
 if(!activity) return;
 activity.applicants=(activity.applicants||[]).filter(p=>p.name!==name);
 if(name==='신가은') state.appliedActivityIds=state.appliedActivityIds.filter(id=>id!==activityId);
 render(false);
}
function selectedDateActivities(){
 return groupActivities().filter(a=>a.date===state.selectedActivityDate);
}

function activityRegister(){
 return `${header('모꼬 활동 등록',{back:true,actions:false})}<main class="screen"><h3 style="font-size:21px;margin:18px 0 26px">모꼬 활동을 등록해 주세요.</h3>
 <div class="field"><label>활동 날짜 <span class="green-title">*</span></label><input id="activity-date" value="2026.07.27"></div>
 <div class="field"><label>활동 시간 (시작 - 종료) <span class="green-title">*</span></label><div class="field-row"><input id="activity-start" value="13:00"><input id="activity-end" value="14:00"></div></div>
 <div class="field"><label>정기 활동 (자동 반복 생성)</label><div class="option-grid">${['반복 안함','매주','매월'].map(x=>`<button class="form-choice ${state.activityRegisterRepeat===x?'active':''}" onclick="state.activityRegisterRepeat='${x}';render(false)">${x}</button>`).join('')}</div></div>
 <div class="field"><label>활동 가능 인원 (미 입력 시 30명으로 지정됩니다.)</label><input id="activity-capacity" placeholder="최대 30명" value="4"></div>
 <div class="field"><label>참여 유형 (Match Type) <span class="green-title">*</span></label><div class="option-grid">${['혼성','남성','여성'].map(x=>`<button class="form-choice ${state.activityRegisterMatch===x?'active':''}" onclick="state.activityRegisterMatch='${x}';render(false)">${x}</button>`).join('')}</div></div>
 <div class="field"><label>운동 장소 <span class="green-title">*</span></label><div class="field-row"><button class="form-choice ${state.activityRegisterPlaceMode==='주요 활동 장소'?'active':''}" onclick="state.activityRegisterPlaceMode='주요 활동 장소';render(false)">주요 활동 장소</button><button class="form-choice ${state.activityRegisterPlaceMode==='새로운 장소 입력'?'active':''}" onclick="state.activityRegisterPlaceMode='새로운 장소 입력';render(false)">새로운 장소 입력</button></div></div>
 <div class="field"><label>주소 검색</label><input value="서울 송파구 올림픽로 424 (올림픽공원)" disabled></div>
 <div class="field"><label>활동 장소명 입력 (미 입력 시, 검색된 도로명 주소가 표시됩니다.)</label><input id="activity-place" value="올림픽공원 테니스장"></div>
 <div class="field"><label>참여 가능한 운동 실력</label><div class="field-row"><button class="form-choice active">실력 무관</button><button class="form-choice">실력 입력</button></div></div>
 <button class="primary" style="width:100%;margin-top:22px" onclick="registerActivity()">완료</button></main>${tabbar('activity')}`;
}
function activityApply(){
 const groupName=state.selectedGroup;
 const allForGroup=groupActivities(groupName);
 const selected=selectedDateActivities();
 const days=['SUN','MON','TUE','WED','THU','FRI','SAT','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
 const activeDays=new Set(allForGroup.filter(a=>a.date.startsWith('2026.07.')).map(a=>String(Number(a.date.slice(-2)))));
 return `${header('모꼬 활동 신청',{back:true,actions:false})}<main class="screen"><div class="calendar"><div class="cal-head"><span>2026년 7월</span><span>‹　›</span></div><div class="cal-grid">${days.map(x=>{
   const numeric=/^\d+$/.test(x);
   const day=numeric?String(Number(x)):x;
   const date=numeric?`2026.07.${String(Number(x)).padStart(2,'0')}`:'';
   const selectedClass=date===state.selectedActivityDate?'selected':'';
   const hasClass=numeric&&activeDays.has(day)?'has-activity':'';
   return `<button style="border:0;background:transparent" class="day ${selectedClass} ${hasClass}" ${numeric?`onclick="state.selectedActivityDate='${date}';render(false)"`:''}>${x}</button>`;
 }).join('')}</div></div>
 ${selected.length?`<div class="activity-apply-list"><div class="section-title" style="margin-top:0">신청 가능한 활동</div>${selected.map(a=>{
   const already=a.applicants?.find(p=>p.name==='신가은');
   return `<div class="activity-apply-card"><div class="apply-head"><div><h3>${a.group}</h3><div class="apply-meta">${a.date} · ${a.time}<br>⌖ ${a.place}<br>신청 ${a.applicants?.length||0}명 / 정원 ${a.capacity}명 · ${a.matchType}</div></div><button class="apply-button" ${already?'disabled':''} onclick="applyToActivity('${a.id}')">${already?(already.status==='approved'?'승인 완료':'신청 완료'):'신청하기'}</button></div></div>`;
 }).join('')}</div>`:`<div style="text-align:center;color:#8f949d;padding:62px 0">등록된 활동이 없습니다.</div>`}
 </main>${tabbar('group')}`;
}
function myActivity(){
 const applied=state.appliedActivityIds.map(id=>activities.find(a=>a.id===id)).filter(Boolean);
 return `${header('내 활동',{back:false})}<main class="screen"><div class="segment"><button class="active">모꼬</button><button onclick="go('my-leader')">모꼬장</button></div>
 <div class="section-title" style="margin-top:8px">신가은의 활동 기록</div><div class="soft-card"><div class="muted" style="text-align:center">아직 활동 기록이 없습니다.<br>점수는 활동을 시작하면 자동으로 기록돼요!</div><div class="metrics" style="margin-top:14px"><div class="metric"><small>활동 참여</small><strong>-</strong></div><div class="metric"><small>이벤트 참여</small><strong>-</strong></div><div class="metric"><small>노쇼</small><strong>-</strong></div></div></div>
 ${applied.length?`<div style="display:flex;justify-content:space-between;align-items:center"><div class="section-title">참여 예정된 활동이 있어요!</div><button class="ghost" style="height:34px" onclick="go('activity-all')">상세 보기 ›</button></div>${applied.map(a=>memberActivityCard(a)).join('')}`:`<div style="display:flex;justify-content:space-between"><div class="section-title">참여 예정된 활동이 없어요!</div><button class="ghost" style="height:34px" onclick="go('activity-all')">상세 보기 ›</button></div><div class="activity-card" style="text-align:center"><div class="muted">활동을 신청하고<br>랭킹을 더 올려보세요!</div><button class="primary btn-small" onclick="openGroup('라켓헌터스')">모꼬지 구경하기</button></div>`}
 <div class="section-title">가입 중인 모꼬지</div><div class="activity-card" style="text-align:center"><div class="muted">가입한 모꼬지가 없습니다.<br>모꼬지를 구경하고 함께 활동해 보세요!</div><button class="primary btn-small" onclick="openGroup('라켓헌터스')">모꼬지 구경하기</button></div>
 </main>${tabbar('activity')}`;
}
function memberActivityCard(a){
 const me=(a.applicants||[]).find(p=>p.name==='신가은');
 const label=me?.status==='approved'?'활동 예정':'승인 대기';
 return `<div class="activity-card" onclick="openActivity('${a.id}')"><span class="tag">${label}</span><h3>${a.group}</h3><div class="muted">▦ ${a.date}　·　${a.time}<br>⌖ ${a.place}</div></div>`;
}
function myLeader(){
 const own=activities.filter(a=>a.group==='놀꼬지 텐션업');
 return `${header('',{})}<main class="screen"><div class="segment"><button onclick="go('my-activity')">모꼬</button><button class="active">모꼬장</button></div><div style="display:flex;justify-content:space-between;align-items:center"><h3>놀꼬지 텐션업</h3><button class="ghost" style="height:34px" onclick="openGroup('놀꼬지 텐션업','owner')">상세 보기 ›</button></div>
 <div class="summary-box"><div class="score-head">2위 18점</div><div class="metrics"><div class="metric"><small>활동 개설</small><strong>${own.length}회</strong></div><div class="metric"><small>참여 모꼬 수</small><strong>${own.reduce((n,a)=>n+(a.applicants?.length||0),0)}명</strong></div><div class="metric"><small>이벤트 주최</small><strong>-</strong></div></div><div class="leader-actions"><button class="secondary" onclick="go('manage')">모꼬지 관리</button><button class="primary" onclick="go('activity-register')">활동 등록</button></div></div>
 <div style="display:flex;justify-content:space-between"><div class="section-title">예정된 활동이 있어요!</div><button class="ghost" style="height:34px" onclick="go('activity-all')">모두 보기 ›</button></div>${own.map(a=>activityCard(a)).join('')}
 </main>${tabbar('activity')}`;
}
function activityCard(a){return `<div class="activity-card" onclick="openActivity('${a.id}')"><span class="tag">${a.status}</span><h3>${a.title}</h3><div class="muted">▦ ${a.date}　·　${a.time}<br>⌖ ${a.place}</div></div>`}
function activityAll(){
 const appliedSet=new Set(state.appliedActivityIds);
 const source=state.selectedGroupRole==='owner'?activities.filter(a=>a.group==='놀꼬지 텐션업'):activities.filter(a=>appliedSet.has(a.id));
 const filtered=state.activityFilter==='전체'?source:source.filter(a=>a.status===state.activityFilter);
 return `${header('활동 모두 보기',{back:true,actions:false})}<main class="screen"><div class="top-filter">${['전체','활동 예정','활동 완료','활동 취소'].map(x=>`<button class="${state.activityFilter===x?'active':''}" onclick="state.activityFilter='${x}';render(false)">${x}</button>`).join('')}</div>${filtered.length?filtered.map(activityCard).join(''):'<div style="text-align:center;color:#aaa;padding:80px 0">활동 내역이 없습니다.</div>'}</main>${tabbar('activity')}`;
}
function manage(){
 const own=activities.filter(a=>a.group==='놀꼬지 텐션업');
 return `${header('놀꼬지 텐션업',{back:true,actions:false})}<main class="screen"><div class="segment"><button class="${state.manageTab==='activity'?'active':''}" onclick="state.manageTab='activity';render(false)">활동 관리</button><button class="${state.manageTab==='members'?'active':''}" onclick="state.manageTab='members';render(false)">모꼬 관리</button></div>
 ${state.manageTab==='activity'?own.map(a=>activityCard(a)).join(''):`<div style="text-align:center;color:#aaa;padding:80px 0">가입 신청한 모꼬가 없습니다.</div>`}
 </main>${tabbar('activity')}`;
}
function activityDetail(){
 const a=currentActivity();
 const applicants=a.applicants||[];
 const approved=applicants.filter(p=>p.status==='approved').length;
 const ownerView=state.selectedGroupRole==='owner';
 return `${header('활동 상세보기',{back:true,actions:false})}<main class="screen">${ownerView?`<div class="subtabs"><button class="${state.activityDetailTab==='detail'?'active':''}" onclick="state.activityDetailTab='detail';render(false)">활동 상세</button><button class="${state.activityDetailTab==='applicants'?'active':''}" onclick="state.activityDetailTab='applicants';render(false)">신청한 모꼬</button></div>`:''}
 ${state.activityDetailTab==='detail'||!ownerView?`<span class="tag">${a.status}</span><p><b>등록일</b><br>${a.registeredAt}</p><p><b>활동 날짜</b><br>${a.date}</p><p><b>활동 시간</b><br>${a.time}</p><p><b>운동 장소</b><br>⌖ ${a.place}</p><p><b>활동 가능 인원 (명)</b><br>${a.capacity}</p><p><b>참여 유형 (Match Type)</b><br>${a.matchType}</p><p><b>참여 실력</b><br>${a.skill}</p>${ownerView?`<button class="ghost" style="width:100%;margin-top:110px">삭제</button>`:''}`:
 `<div class="approval-summary"><b>승인 <span class="green-title">${approved}</span> / 정원 <span class="green-title">${a.capacity}</span> 명</b><span style="float:right">신청 ${applicants.length}명</span></div>${applicants.length?applicants.map(p=>`<div class="person-card"><div class="person-info"><div class="avatar">${p.name[0]}</div><div><b>${p.name}</b>${p.status==='approved'?'<span class="status-approved">✓ 승인</span>':'<span class="status-pending">승인 대기</span>'}<div class="muted">${p.phone} · ${p.gender}<br>${p.appliedAt} 신청</div></div></div><div class="applicant-actions">${p.status==='approved'?`<button class="ghost btn-small" onclick="cancelApplicant('${a.id}','${p.name}')">취소하기</button><button class="danger-outline btn-small">노쇼 신고</button>`:`<button class="primary btn-small" onclick="approveApplicant('${a.id}','${p.name}')">승인하기</button>`}</div></div>`).join(''):'<div style="text-align:center;color:#aaa;padding:80px 0">신청한 모꼬가 없습니다.</div>'}`}
 </main>${tabbar('activity')}`;
}
function dm(){
 return `${header('',{})}<main class="screen"><div class="segment"><button class="${state.dmTab==='member'?'active':''}" onclick="state.dmTab='member';render(false)">모꼬</button><button class="${state.dmTab==='group'?'active':''}" onclick="state.dmTab='group';render(false)">모꼬지</button></div>
 ${state.dmTab==='member'?['놀꼬지','모꼬4','모꼬4'].map((x,i)=>dmItem(x,i?'활동 취소 안내':'2026년 화이팅👍')).join(''):['놀꼬지 텐션업','라켓헌터스','놀꼬지 테스크','오케이 등록'].map((x,i)=>dmItem(x,i?'활동 1명':'안내 1명')).join('')}</main>${tabbar('dm')}`;
}
function dmItem(name,msg){return `<div class="dm-item" onclick="go('chat')"><div class="avatar">${name[0]}</div><div class="body"><h4>${name}</h4><div class="muted">${msg}</div></div><time>2026.07.20</time></div>`}
function chat(){
 return `${header(state.dmTab==='group'?'놀꼬지 텐션업':'놀꼬지',{back:true,actions:false})}<main class="screen chat"><div class="chat-date">2026년 7월 20일</div><div class="bubble-row"><div class="bubble">안녕하세요, 활동비가 별도 문의로 되어있던데, 얼마인가요?</div></div><div class="bubble-row me"><div class="bubble">안녕하세요! 테니스공 이용료 및 제공비까지 25,000원 입니다. 인원은 당일 모꼬로 받을게요</div></div><div class="bubble-row"><div class="bubble">신청했는데 승인 부탁드립니다.</div></div><div class="bubble-row me"><div class="bubble">20일에 뵙겠습니다🙂</div></div></main><div class="chat-input"><button>▧</button><input placeholder="메시지를 입력하세요"><button>➤</button></div>`;
}
function render(push=true){
 const app=document.getElementById('app');
 const views={home,notifications,settings,profile,'group-home':groupHome,'group-list':groupList,'group-detail':groupDetail,'exchange-list':exchangeList,'exchange-detail':exchangeDetail,'exchange-create':exchangeCreate,join,'create-group':createGroup,'activity-register':activityRegister,'activity-apply':activityApply,'my-activity':myActivity,'my-leader':myLeader,'activity-all':activityAll,manage,'activity-detail':activityDetail,dm,chat};
 app.innerHTML=(views[state.route]||home)();
 if(push){history.pushState({route:state.route},'',`#${state.route}`)}
 startRankRotation();
}
render(false);
