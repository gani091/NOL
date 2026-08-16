const state={
  route:'home',
  activeTab:'home',
  rankMode:'group',
  guestAllowed:false,
  joinAuto:false,
  sport:'테니스',
  selectedGroup:'라켓헌터스',
  selectedGroupRole:'member',
  selectedActivityId:'act-1',
  selectedActivityDate:'2026.07.27',
  appliedActivityIds:[],
  activityRegisterRepeat:'반복 안함',
  activityRegisterMatch:'혼성',
  activityRegisterPlaceMode:'주요 활동 장소',
  dmTab:'member',
  manageTab:'activity',
  activityDetailTab:'detail',
  activityFilter:'전체'
};
const groups=[
  {name:'놀꼬지 텐션업',sport:'테니스',desc:'회사에서 떨어진 텐션 퇴근하고 함께 끌어 올려요~ 🔥',place:'올림픽공원 테니스장',guest:true,thumb:'tennis'},
  {name:'놀꼬지 핑퐁',sport:'탁구',desc:'놀꼬지 공식 모꼬지로 다양한 이벤트/행사용 모꼬지 입니다.',place:'올림픽공원 탁구 경기장',guest:true,thumb:'green'},
  {name:'라켓헌터스',sport:'테니스',desc:'강동, 송파 테니스 모임',place:'강동 해비치',guest:false,thumb:'blue'},
  {name:'놀꼬지 Luv',sport:'테니스',desc:'주말 오후 함께 즐겨요.',place:'송파구 테니스장',guest:true,thumb:'tennis'}
];
const activities=[
 {id:'act-1',group:'놀꼬지 텐션업',title:'놀꼬지 텐션업',registeredAt:'2026.07.20',date:'2026.08.10',time:'17:00 ~ 18:00',place:'올림픽공원 테니스장',status:'활동 예정',capacity:4,matchType:'혼성',skill:'실력 무관',applicants:[{name:'놀꼬지',phone:'010-1234-1234',gender:'남자',status:'approved',appliedAt:'2026.08.10'}]},
 {id:'act-2',group:'놀꼬지 텐션업',title:'놀꼬지 텐션업',registeredAt:'2026.07.20',date:'2026.08.17',time:'17:00 ~ 18:00',place:'올림픽공원 테니스장',status:'활동 예정',capacity:4,matchType:'혼성',skill:'실력 무관',applicants:[]}
];
const rankings={
 group:[['라켓헌터스',50],['놀꼬지 핑퐁',12],['놀꼬지 텐션업',12],['놀꼬지 INdoor',12],['놀꼬지 Luv',10]],
 member:[['놀꼬지',20],['쿠크다스',16],['모꼬',10],['이상헌',10],['MINJI',10]]
};
const icons={home:'⌂',group:'♧',activity:'▦',dm:'◯'};
let rankTimer;

function statusbar(){
 return `<div class="statusbar"><span>${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}</span><span class="right">▮▮▮ 5G <span class="battery">99%</span></span></div>`;
}
function header(title='',opts={}){
 return `${statusbar()}<div class="header">
 ${opts.back?`<button class="icon-btn left" onclick="back()">‹</button>`:''}
 <h1>${title}</h1>
 ${opts.actions!==false?`<div class="header-actions"><button class="mini" onclick="go('notifications')" style="position:relative">🔔<span class="badge">13</span></button><button class="mini" onclick="go('settings')">⚙</button></div>`:''}
 </div>`;
}
function tabbar(active=state.activeTab){
 const items=[['home','메인','home'],['group','모꼬지','group-home'],['activity','내 활동','my-activity'],['dm','DM','dm']];
 return `<nav class="tabbar">${items.map(([key,label,route])=>`<button class="${active===key?'active':''}" onclick="go('${route}')"><span class="tab-icon">${icons[key]}</span>${label}</button>`).join('')}</nav>`;
}
function setActiveForRoute(route){
 if(route.startsWith('group')||['exchange-list','exchange-detail','exchange-create','create-group','activity-apply','join'].includes(route)) state.activeTab='group';
 else if(route.startsWith('my-')||route.startsWith('manage')||route.startsWith('activity-detail')||route==='activity-register'||route==='activity-all') state.activeTab='activity';
 else if(route.startsWith('dm')||route==='chat') state.activeTab='dm';
 else state.activeTab='home';
}
function go(route,params={}){
 Object.assign(state,params);
 if(route==='my-leader'||route==='manage'||route==='activity-register') state.selectedGroupRole='owner';
 if(route==='my-activity') state.selectedGroupRole='member';
 state.route=route; setActiveForRoute(route); render(); window.scrollTo(0,0);
}
function back(){history.length>1?history.back():go('home')}
window.addEventListener('popstate',()=>{
 const route=(location.hash||'#home').slice(1);
 state.route=route||'home';
 setActiveForRoute(state.route);
 render(false);
});
function rankCard(){
 const list=rankings[state.rankMode];
 const title=state.rankMode==='group'?'모꼬지 랭킹':'모꼬 랭킹';
 return `<div class="rank-card" onclick="toggleRank()"><div class="rank-title">${title}</div>${list.map((r,i)=>`<div class="rank-row"><span class="rank-name">${i<4?'🏆':(i+1)+'위'} ${r[0]}</span><span>${r[1]}점</span></div>`).join('')}</div>
 <div class="dots"><span class="dot ${state.rankMode==='member'?'active':''}"></span><span class="dot ${state.rankMode==='group'?'active':''}"></span></div>`;
}
function toggleRank(){state.rankMode=state.rankMode==='group'?'member':'group';render(false)}
function startRankRotation(){
 clearInterval(rankTimer);
 if(state.route==='home') rankTimer=setInterval(()=>{state.rankMode=state.rankMode==='group'?'member':'group';render(false)},3000);
}
function home(){
 return `${header('',{back:false})}<main class="screen">
 <div class="home-hero"><div class="insta-card">◎</div><div class="hero-banner">다양한 소식은<br>공식 계정에서</div></div>
 <div class="section-title">활동 랭킹</div>${rankCard()}
 <div class="section-title green-title">신가은님의 활동 랭킹</div>
 <div class="soft-card"><div class="score-head">6위 6점</div><div class="metrics">
 <div class="metric"><small>활동 참여</small><strong>2</strong></div><div class="metric"><small>이벤트 참여</small><strong>-</strong></div><div class="metric"><small>노쇼</small><strong>-</strong></div></div></div>
 <div class="section-title green-title">참여 예정된 활동이 있어요</div>
 <div class="activity-card" onclick="openActivity('act-1')"><h3>놀꼬지 텐션업</h3><div class="muted">2026.08.10 (월) · 17:00 ~ 18:00<br>⌖ 올림픽공원 테니스장</div></div>
 </main>${tabbar('home')}`;
}
function notifications(){
 const rows=['놀꼬지 텐션업 2026.08.10 활동 신청이 승인되었습니다! 🎉','놀꼬지 텐션업 2026.08.10 활동 신청이 승인되었습니다! 🎉','신가은님이 놀꼬지 텐션업 활동을 신청했습니다.','신가은님이 놀꼬지 텐션업 활동을 신청했습니다.','놀꼬지님이 메시지를 보냈습니다.'];
 return `${header('알림',{back:true,actions:false})}<main class="screen"><div style="display:flex;justify-content:space-between;margin:8px 0 14px"><b>알림 <span class="tag">6</span></b><span class="green-title">전체 읽음</span></div>${rows.map((x,i)=>`<div class="notice ${i<4?'unread':''}" onclick="${i===4?"go('chat')":"go('activity-detail')"}"><span>🔔</span><div style="flex:1;font-size:13px;line-height:1.5">${x}<div class="muted">${i+1}분 전</div></div>${i<4?'<span class="dotmark"></span>':''}</div>`).join('')}</main>${tabbar('home')}`;
}
function settings(){
 return `${header('설정',{back:true,actions:false})}<main class="screen">
 <div class="settings-card"><div style="color:var(--green);font-size:12px">신가은</div><div class="muted">서울특별시 구로구</div><button class="ghost" style="width:100%;margin-top:10px" onclick="go('profile')">내 정보 수정</button></div>
 ${['공지사항','FAQ / 운영 정책'].map(x=>`<div class="settings-row"><span>${x}</span><span>›</span></div>`).join('')}
 <div class="settings-row"><span>PUSH 알림 수신 설정</span><span class="toggle-inline"></span></div>
 <div class="settings-row"><span>로그아웃</span></div><div class="settings-row" style="color:#ef7070"><span>회원 탈퇴</span></div>
 </main>${tabbar('home')}`;
}
function profile(){
 return `${header('정보 수정',{back:true,actions:false})}<main class="screen">
 ${field('이름','신가은')}<div class="field"><label>성별</label><div class="action-grid"><button class="ghost">남자</button><button class="secondary">여자</button></div></div>
 ${field('활동 지역','서울특별시 구로구')}
 <div class="field"><label>관심 종목</label><div class="option-grid">${[['🎾','테니스'],['🛼','풋살'],['⚽','축구'],['🏸','배드민턴'],['🏓','탁구'],['•••','기타']].map((x,i)=>`<button class="option ${i===0?'active':''}"><div style="font-size:26px">${x[0]}</div>${x[1]}</button>`).join('')}</div></div>
 <button class="primary" style="width:100%;margin-top:16px" onclick="back()">저장하기</button></main>${tabbar('home')}`;
}
function field(label,value='',type='input'){
 return `<div class="field"><label>${label}</label>${type==='textarea'?`<textarea>${value}</textarea>`:`<input value="${value}">`}</div>`;
}
function groupHome(){
 return `${header('',{})}<main class="screen">
 <div class="section-title" style="margin-top:6px">모꼬지 활동 랭킹</div>${groupRankStatic()}
 <div class="activity-card" onclick="go('exchange-list')" style="background:#eff9f1;border-color:#a8dbae"><div style="display:flex;justify-content:space-between"><b>모꼬지 교류전 참여</b><span>›</span></div><div class="muted">다른 모꼬지와 대결을 신청하고 랭킹에 도전하세요</div></div>
 <div style="display:flex;justify-content:space-between;align-items:center"><div class="section-title">추천 모꼬지</div><button class="ghost" style="height:32px" onclick="go('group-list')">모두 보기 ›</button></div>
 ${groups.slice(0,3).map(g=>groupListItem(g)).join('')}
 </main>${tabbar('group')}`;
}
function groupRankStatic(){
 return `<div class="rank-card"><div class="rank-title">모꼬지 랭킹</div>${rankings.group.map((r,i)=>`<div class="rank-row"><span>${i+1}위 ${r[0]}</span><span>${r[1]}점</span></div>`).join('')}</div>`;
}
function groupList(){
 return `${header('모꼬지 모두 보기',{back:true,actions:false})}<main class="screen"><input class="search" placeholder="모꼬지 이름으로 검색"><div class="chips">${['전체','축구','풋살','테니스','배드민턴','탁구','기타'].map((x,i)=>`<button class="chip ${i===0?'active':''}">${x}</button>`).join('')}</div>${groups.map(g=>groupListItem(g)).join('')}</main><button class="fab" onclick="go('create-group')">+</button>${tabbar('group')}`;
}
function groupListItem(g){
 const emoji=g.thumb==='blue'?'🏹':g.thumb==='green'?'🏓':'🎾';
 return `<div class="list-card" onclick="openGroup('${g.name.replaceAll("'","")}','member')"><div class="thumb ${g.thumb}">${emoji}</div><div class="body"><h3>${g.name}</h3><div class="muted">${g.desc}</div><span class="tag">${g.sport}</span></div></div>`;
}
function openGroup(name,role='member'){state.selectedGroup=name;state.selectedGroupRole=role;go('group-detail')}
function currentGroup(){return groups.find(g=>g.name===state.selectedGroup)||groups[2]}
function groupDetail(){
 const g=currentGroup(), owner=state.selectedGroupRole==='owner';
 const guest = g.name==='새로운 모꼬지' ? state.guestAllowed : g.guest;
 return `${header('모꼬지 상세',{back:true,actions:false})}<main class="screen">
 <div class="hero-image ${g.thumb==='blue'?'blue':'green'}">${g.name==='라켓헌터스'?'RACKET HUNTERS':g.name}</div>
 <div style="padding-top:14px"><span class="tag">${g.sport}</span><div class="detail-title">${g.name}</div><div class="detail-sub">${g.desc}</div><div class="location"><b>${g.place}</b><div class="muted">⌖ 서울 송파구 올림픽로 424</div></div>
 ${owner?`<div class="action-grid"><button class="secondary" onclick="go('manage')">모꼬지 관리</button><button class="primary" onclick="go('activity-register')">활동 등록</button></div>`:
 guest?`<div class="action-grid"><button class="primary" onclick="go('activity-apply')">활동 신청</button><button class="yellow" onclick="go('join')">가입 신청</button></div>`:
 `<button class="yellow" style="width:100%" onclick="go('join')">가입 신청</button>`}
 </div>
 <div class="info-section"><div class="inner"><h3>모꼬지 소개</h3><p>${g.desc}<br>함께 즐기실 분 모두 환영합니다.</p><h3>모꼬지 주요 활동 시간</h3><p>• 평일 오후<br>• 주말 오전<br>• 주말 오후</p><h3>활동비</h3><p>별도 문의</p><h3>해시태그</h3><div class="chips"><span class="tag">#${g.sport}</span><span class="tag">#놀꼬지</span></div>
 <div class="inquiry"><span>모꼬지 문의(모꼬장에게)</span><button onclick="go('chat',{dmTab:'group'})">궁금해요</button></div>
 </div></div></main>${tabbar('group')}`;
}
function exchangeList(){
 return `${header('모꼬지 교류전',{back:false})}<main class="screen"><div class="chips">${['전체','축구','풋살','테니스','배드민턴','탁구','기타'].map((x,i)=>`<button class="chip ${i===0?'active':''}">${x}</button>`).join('')}
 ${['놀꼬지FC','놀꼬지 Luv','라켓헌터스','놀꼬지 Luv'].map((x,i)=>`<div class="activity-card" onclick="go('exchange-detail')"><div style="display:flex;justify-content:space-between"><b>${x}</b><span class="tag">${i%2?'테니스':'축구'}</span></div><div class="muted">▦ 2026.07.12 (일) · 10:00 ~ 14:00<br>⌖ 올림픽공원<br>⚥ 20명 · 혼성</div></div>`).join('')}
 </main><button class="fab" style="background:var(--green)" onclick="go('exchange-create')">+</button>${tabbar('activity')}`;
}
function exchangeDetail(){
 return `${header('교류전 상세',{back:true,actions:false})}<main class="screen"><span class="tag">모집 중</span><h2>놀꼬지FC</h2><button class="secondary btn-small" style="float:right" onclick="openGroup('놀꼬지 핑퐁')">모꼬지 상세 ›</button>
 <div class="info-section" style="border-top:0;margin-top:10px"><div class="inner"><p><b>일정</b><br>2026.07.12 (일)<br>10:00 ~ 14:00</p><p><b>장소명</b><br>월드컵경기장</p><p><b>경기 정보</b><br>축구 / 20명 / 혼성</p><p><b>메모</b><br>테스트 등록입니다.</p></div></div>
 <button class="primary" style="width:100%">교류전 지원하기</button></main>${tabbar('activity')}`;
}
function exchangeCreate(){
 return `${header('교류전 등록',{back:true,actions:false})}<main class="screen">${field('모꼬지 선택','놀꼬지 텐션업')} ${field('종목','테니스')}<div class="field"><label>매칭 성별</label><div class="option-grid"><button class="option active">혼성</button><button class="option">남성</button><button class="option">여성</button></div></div>${field('매칭 일자','2026.07.27 (월)')}${field('시간','09:00 ~ 11:00')}${field('장소명','올림픽공원 테니스장')}${field('주소','서울 송파구 올림픽로 424 (올림픽공원)')}<button class="primary" style="width:100%;margin-top:18px">완료</button></main>${tabbar('activity')}`;
}
function join(){
 return `${header('가입 신청',{back:true,actions:false})}<main class="screen"><div class="white-card" style="border:1px solid #ddd;padding:12px;margin-top:8px"><p style="font-size:13px;line-height:1.65">스포츠 활동을 위해 공용으로 꼭 지켜야 할 사항입니다.<br>1. NO SHOW 금지 및 신청한 활동 시간 준수<br>2. 욕설·비방 금지<br>3. 공공질서 준수</p><div style="height:340px"></div><small>* 위 내용을 모두 확인하였습니다.</small><div class="field"><textarea placeholder="서명"></textarea></div></div><button class="primary" style="width:100%;margin-top:12px" onclick="openGroup(state.selectedGroup)">다음</button></main>${tabbar('group')}`;
}
function createGroup(){
 return `${header('모꼬지 개설',{back:true,actions:false})}<main class="screen"><h3>어떤 모꼬지를 만드시나요?</h3><div class="muted">종목을 선택하세요</div><div class="step-icons">${[['⚽','축구'],['🛼','풋살'],['🎾','테니스'],['🏸','배드민턴'],['🏓','탁구'],['•••','기타']].map(x=>`<button class="sport ${state.sport===x[1]?'active':''}" onclick="state.sport='${x[1]}';render(false)"><span>${x[0]}</span><small>${x[1]}</small></button>`).join('')}</div>
 ${field('모꼬지명','새로운 모꼬지')}${field('모꼬지 소개','퇴근 후 함께 즐기는 모꼬지입니다.','textarea')}
 <div class="field"><label>주요 활동 시간</label><div class="option-grid"><button class="option active">평일 오후</button><button class="option">주말 오전</button><button class="option">주말 오후</button></div></div>
 ${field('주요 활동 장소','올림픽공원 테니스장')}${field('태그 입력','#테니스, #놀꼬지')}${field('활동비','별도 문의')}
 <div class="form-title">활동 신청 권한</div><div class="switch-row"><div><b>게스트 참여 허용</b><div class="muted">가입한 모꼬만 활동 신청을 할 수 있어요.</div></div><button class="switch ${state.guestAllowed?'on':''}" onclick="state.guestAllowed=!state.guestAllowed;render(false)"></button></div>
 <div class="switch-row"><div><b>가입 자동 승인</b><div class="muted">가입 신청을 모꼬지장이 직접 승인해요.</div></div><button class="switch ${state.joinAuto?'on':''}" onclick="state.joinAuto=!state.joinAuto;render(false)"></button></div>
 <button class="primary" style="width:100%;margin-top:18px" onclick="finishCreate()">완료</button></main>${tabbar('group')}`;
}
function finishCreate(){
 if(!groups.find(g=>g.name==='새로운 모꼬지')) groups.unshift({name:'새로운 모꼬지',sport:state.sport,desc:'퇴근 후 함께 즐기는 모꼬지입니다.',place:'올림픽공원 테니스장',guest:state.guestAllowed,thumb:'tennis'});
 else groups.find(g=>g.name==='새로운 모꼬지').guest=state.guestAllowed;
 state.selectedGroup='새로운 모꼬지'; state.selectedGroupRole='member'; go('group-detail');
}
