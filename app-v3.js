Object.assign(state,{ownerJoinOnCreate:state.ownerJoinOnCreate===true});

function ownerParticipant(a){
 return (a.applicants||[]).find(p=>p.name===CURRENT_MEMBER&&p.participantRole==='owner');
}
function isOwnerParticipating(a){
 const p=ownerParticipant(a);
 return !!p&&['approved','attended','no-show'].includes(p.status);
}
function joinOwnerActivity(activityId){
 const a=activities.find(x=>x.id===activityId);
 if(!a||a.status!=='활동 예정'){showToast('활동 시작 전까지만 참여할 수 있습니다.','danger');return}
 let p=(a.applicants||[]).find(x=>x.name===CURRENT_MEMBER);
 if(p&&['approved','attended','no-show'].includes(p.status)){showToast('이미 참여자로 등록되어 있습니다.','danger');return}
 if(approvedCount(a)>=a.capacity){showToast('정원이 가득 차 참여할 수 없습니다.','danger');return}
 if(p){Object.assign(p,{status:'approved',appliedAt:todayDot(),participantRole:'owner'})}
 else{
  a.applicants=a.applicants||[];
  a.applicants.push({name:CURRENT_MEMBER,phone:'010-9923-9935',gender:'여자',status:'approved',appliedAt:todayDot(),participantRole:'owner'});
 }
 if(!state.appliedActivityIds.includes(activityId))state.appliedActivityIds.push(activityId);
 saveV2();render(false);showToast('모꼬장도 참여자로 등록했습니다. 별도 승인 없이 참여가 확정됩니다.');
}
function leaveOwnerActivity(activityId){
 const a=activities.find(x=>x.id===activityId);const p=ownerParticipant(a);
 if(!a||!p||a.status!=='활동 예정')return;
 if(!confirm('이 활동에서 내 참여를 취소할까요? 활동 자체는 유지됩니다.'))return;
 p.status='cancelled';
 state.appliedActivityIds=state.appliedActivityIds.filter(id=>id!==activityId);
 saveV2();render(false);showToast('내 참여만 취소했습니다. 활동은 그대로 진행됩니다.');
}
function ownerParticipationPanel(a){
 if(a.status!=='활동 예정'){
  const p=ownerParticipant(a);
  if(!p||p.status==='cancelled')return '';
  return `<div class="owner-participation compact"><div><span class="owner-label">모꼬장 참여</span><b>${memberStatusLabel(a,p)}</b><div class="muted">모꼬장도 일반 참여자와 동일하게 출석·노쇼 및 개인 점수가 적용됩니다.</div></div></div>`;
 }
 const joined=isOwnerParticipating(a);
 return `<div class="owner-participation"><div><span class="owner-label">모꼬장 참여</span><b>${joined?'이 활동에 나도 참여해요':'직접 운동에 참여하시나요?'}</b><div class="muted">참여하면 별도 승인 없이 확정되며 정원과 4명 기준에 포함됩니다.</div></div><button class="${joined?'ghost':'secondary'} btn-small" onclick="${joined?`leaveOwnerActivity('${a.id}')`:`joinOwnerActivity('${a.id}')`}">${joined?'내 참여 취소':'나도 참여하기'}</button></div>`;
}

function scoreBanner(){
 return `<button class="score-banner" onclick="go('score-guide')"><div class="score-banner-copy"><small>활동 점수 한눈에 보기</small><strong>4명 이상 · 60분 이상 · 활동 완료</strong><span>모꼬 +10 · 노쇼 -100 · 모꼬지 +10 + 참여 1명당 +1</span></div><div class="score-banner-arrow">›</div></button>`;
}
function scoreGuide(){
 return `${header('점수 안내',{back:true,actions:false})}<main class="screen score-guide"><div class="guide-hero"><div class="guide-icon">🏆</div><h2>운동을 실제로 완료해야<br>점수가 반영돼요</h2><p>점수용 활동 생성만 반복하는 것을 막기 위해 공통 조건을 충족한 완료 활동만 집계합니다.</p></div><div class="condition-row"><div><b>4명+</b><span>참여 대상</span></div><div><b>60분+</b><span>활동 시간</span></div><div><b>완료</b><span>상태</span></div></div><section class="guide-section"><h3>모꼬 점수</h3><div class="guide-score-row"><span>활동 참여</span><b class="plus">+10점</b></div><div class="guide-score-row"><span>이벤트 참여</span><b class="plus">+10 ~ +100점</b></div><div class="guide-score-row"><span>노쇼</span><b class="minus">-100점</b></div></section><section class="guide-section"><h3>모꼬지 점수</h3><div class="guide-score-row"><span>활동 개설</span><b class="plus">+10점</b></div><div class="guide-score-row"><span>실제 참여 인원</span><b class="plus">+1점 / 1인</b></div><div class="guide-score-row"><span>이벤트 주최/참여</span><b class="plus">+10 ~ +100점</b></div></section><div class="guide-note"><b>모꼬장이 직접 참여하는 경우</b><p>모꼬장도 참여자로 등록되면 4명 기준과 실제 참여 인원에 포함됩니다. 활동 완료 시 본인의 모꼬 점수도 동일하게 적용됩니다.</p></div></main>${tabbar('home')}`;
}

function home(){
 const rec=memberRecord();const ranking=mergedMemberRanking();const rank=ranking.findIndex(x=>x[0]===CURRENT_MEMBER)+1;
 const upcoming=activities.filter(a=>['활동 예정','출석 확인'].includes(a.status)&&(a.applicants||[]).some(p=>p.name===CURRENT_MEMBER&&['approved','attended'].includes(p.status))).sort((a,b)=>activityDateTime(a)-activityDateTime(b)).slice(0,2);
 return `${header('',{back:false})}<main class="screen"><div class="ad-banner" onclick="window.open('https://www.instagram.com/','_blank')"><div class="ad-copy"><small>ADVERTISEMENT · 놀꼬지 소식</small><strong>이번 주에도<br>함께 운동해요</strong></div><div><div class="ad-icon">🏃</div><button>소식 보기 ↗</button></div></div>${scoreBanner()}<div class="section-title">활동 랭킹</div>${rankCard()}<div class="section-title green-title">${CURRENT_MEMBER}님의 활동 랭킹</div><div class="soft-card"><div class="score-head">${rank}위 · ${rec.score}점</div><div class="metrics"><div class="metric"><small>활동 참여</small><strong>${rec.participated}</strong></div><div class="metric"><small>이벤트 참여</small><strong>${rec.event}</strong></div><div class="metric"><small>노쇼</small><strong>${rec.noShow}</strong></div></div><div class="rule-note">점수는 4명 이상 · 60분 이상 · 활동 완료 조건을 모두 만족한 경우에만 반영됩니다.</div></div><div class="section-title green-title">${upcoming.length?'참여 예정된 활동이 있어요':'참여 예정된 활동이 없어요'}</div>${upcoming.length?upcoming.map(a=>memberActivityCard(a)).join(''):`<div class="activity-card" style="text-align:center"><div class="muted">새 활동을 신청하고 랭킹을 올려보세요.</div><button class="primary btn-small" style="margin-top:10px" onclick="openGroup('${OWNER_GROUP}')">활동 찾기</button></div>`}</main>${tabbar('home')}`;
}

function upcomingGroupActivities(groupName){
 return activities.filter(a=>a.group===groupName&&a.status==='활동 예정').sort((a,b)=>activityDateTime(a)-activityDateTime(b));
}
function groupActivityPreview(a){
 const me=currentMemberStatus(a);const full=approvedCount(a)>=a.capacity&&!me;
 const label=me?.status==='pending'?'승인 대기':me?.status==='approved'?'참여 확정':full?'모집 마감':'신청 가능';
 const cls=me?.status==='pending'?'pending':me?.status==='approved'?'approved':full?'cancelled':'open';
 return `<button class="group-activity-card" onclick="openActivityApplyDetail('${a.id}')"><div class="group-activity-top"><span class="status-pill ${cls}">${label}</span><span>${approvedCount(a)}/${a.capacity}명</span></div><b>${a.date} · ${a.time}</b><span>⌖ ${a.place}</span><small>모꼬장이 등록한 활동입니다. 상세 확인 후 신청할 수 있어요.</small></button>`;
}
function groupDetail(){
 const g=currentGroup(),owner=state.selectedGroupRole==='owner';const guest=g.name==='새로운 모꼬지'?state.guestAllowed:g.guest;const upcoming=upcomingGroupActivities(g.name);
 return `${header('모꼬지 상세',{back:true,actions:false})}<main class="screen"><div class="hero-image ${g.thumb==='blue'?'blue':'green'}">${g.name==='라켓헌터스'?'RACKET HUNTERS':g.name}</div><div style="padding-top:14px"><span class="tag">${g.sport}</span><div class="detail-title">${g.name}</div><div class="detail-sub">${g.desc}</div><div class="location"><b>${g.place}</b><div class="muted">⌖ 서울 송파구 올림픽로 424</div></div>${owner?`<div class="action-grid"><button class="secondary" onclick="go('manage')">모꼬지 관리</button><button class="primary" onclick="go('activity-register')">활동 등록</button></div>`:guest?`<div class="action-grid"><button class="primary" onclick="go('activity-apply')">활동 신청</button><button class="yellow" onclick="go('join')">가입 신청</button></div>`:`<button class="yellow" style="width:100%" onclick="go('join')">가입 신청</button>`}</div>${!owner?`<section class="group-activity-section"><div class="section-head"><div><h3>모꼬 활동</h3><p>모꼬장이 등록한 활동을 확인하고 신청해 보세요.</p></div>${upcoming.length?`<button onclick="go('activity-apply')">전체 보기 ›</button>`:''}</div>${upcoming.length?upcoming.slice(0,2).map(groupActivityPreview).join(''):`<div class="empty-state compact"><b>신청 가능한 활동이 없어요</b><span>모꼬장이 새 활동을 등록하면 여기에 표시됩니다.</span></div>`}</section>`:''}<div class="info-section"><div class="inner"><h3>모꼬지 소개</h3><p>${g.desc}<br>함께 즐기실 분 모두 환영합니다.</p><h3>모꼬지 주요 활동 시간</h3><p>• 평일 오후<br>• 주말 오전<br>• 주말 오후</p><h3>활동비</h3><p>별도 문의</p><h3>해시태그</h3><div class="chips"><span class="tag">#${g.sport}</span><span class="tag">#놀꼬지</span></div><div class="inquiry"><span>모꼬지 문의(모꼬장에게)</span><button onclick="go('chat',{dmTab:'group'})">궁금해요</button></div></div></div></main>${tabbar('group')}`;
}

function openActivityApplyDetail(id){
 state.selectedActivityId=id;state.selectedGroupRole='member';go('activity-apply-detail');
}
function activityApplyDetail(){
 const a=currentActivity();const me=currentMemberStatus(a);const full=approvedCount(a)>=a.capacity&&!me;const closed=a.status!=='활동 예정';
 let cta='신청하기',disabled=false,action=`applyToActivity('${a.id}')`;
 if(closed){cta='신청이 종료된 활동입니다';disabled=true}
 else if(me?.status==='pending'){cta='승인 대기 중';disabled=true}
 else if(me?.status==='approved'){cta='참여 확정';disabled=true}
 else if(full){cta='모집 마감';disabled=true}
 else if(me?.status==='cancelled'){cta='다시 신청하기'}
 return `${header('활동 신청',{back:true,actions:false})}<main class="screen apply-detail-screen"><div class="apply-detail-hero"><span class="tag">${a.matchType}</span><h2>${a.group}</h2><p>${a.date} · ${a.time}</p><p>⌖ ${a.place}</p></div><div class="application-flow"><div class="flow-item on"><b>1</b><span>활동 확인</span></div><div class="flow-item"><b>2</b><span>신청</span></div><div class="flow-item"><b>3</b><span>모꼬장 승인</span></div><div class="flow-item"><b>4</b><span>참여 확정</span></div></div>${me?`<div class="member-status-box"><div class="status-title"><span class="status-pill ${memberStatusClass(me)}">${memberStatusLabel(a,me)}</span></div><div class="status-desc">${me.status==='pending'?'모꼬장이 승인하면 참여가 확정됩니다.':me.status==='approved'?'참여가 확정되었습니다. 활동 종료 후 실제 참여 여부가 확인됩니다.':me.status==='cancelled'?'신청을 취소했습니다. 모집 중이라면 다시 신청할 수 있습니다.':'활동 상태를 확인해 주세요.'}</div></div>`:''}<section class="apply-info-card"><div><span>신청 인원</span><b>${applicantCount(a)}명</b></div><div><span>승인 인원</span><b>${approvedCount(a)} / ${a.capacity}명</b></div><div><span>참여 실력</span><b>${a.skill}</b></div></section>${scorePolicyCard(a)}<div class="apply-help"><b>신청하면 바로 참여가 확정되나요?</b><p>아니요. 모꼬가 신청하면 먼저 <b>승인 대기</b> 상태가 되고, 모꼬장이 승인한 뒤 <b>참여 확정</b>으로 변경됩니다.</p></div><button class="primary sticky-apply" ${disabled?'disabled':''} onclick="${action}">${cta}</button>${a.status==='활동 예정'&&me&&['pending','approved'].includes(me.status)?`<button class="ghost" style="width:100%;margin-top:8px" onclick="cancelOwnApplication('${a.id}')">신청 취소</button>`:''}</main>${tabbar('group')}`;
}

function activityApply(){
 const groupName=state.selectedGroup;const all=activities.filter(a=>a.group===groupName&&a.status==='활동 예정');
 if(all.length&&(!state.calendarMonth||!all.some(a=>a.date.startsWith(state.calendarMonth.replace('-','.'))))){state.calendarMonth=all[0].date.slice(0,7).replace('.', '-');state.selectedActivityDate=all[0].date}
 const ym=(state.calendarMonth||'2026-08').split('-').map(Number),year=ym[0],month=ym[1],first=new Date(year,month-1,1).getDay(),last=new Date(year,month,0).getDate(),cells=[...Array(first).fill(null),...Array.from({length:last},(_,i)=>i+1)],hasDates=new Set(all.map(a=>a.date)),selected=all.filter(a=>a.date===state.selectedActivityDate);
 return `${header('모꼬 활동 신청',{back:true,actions:false})}<main class="screen"><div class="score-preview">모꼬장이 만든 활동을 선택한 뒤 상세 화면에서 신청합니다. 신청 후에는 모꼬장 승인이 필요합니다.</div><div class="calendar"><div class="cal-head"><button class="cal-nav" onclick="monthShift(-1)">‹</button><span>${year}년 ${month}월</span><button class="cal-nav" onclick="monthShift(1)">›</button></div><div class="cal-grid">${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x=>`<span>${x}</span>`).join('')}${cells.map(day=>{if(!day)return '<span class="day blank">0</span>';const date=`${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`,has=hasDates.has(date);return `<button style="border:0;background:transparent" class="day ${date===state.selectedActivityDate?'selected':''} ${has?'has-activity':''}" onclick="state.selectedActivityDate='${date}';render(false)">${day}</button>`}).join('')}</div></div>${selected.length?`<div class="activity-apply-list"><div class="section-title" style="margin-top:0">이 날짜의 활동</div>${selected.map(a=>`<div class="activity-apply-card clickable" onclick="openActivityApplyDetail('${a.id}')"><div class="apply-head"><div><h3>${a.group}</h3><div class="apply-meta">${a.date} · ${a.time}<br>⌖ ${a.place}<br>신청 ${applicantCount(a)}명 · 승인 ${approvedCount(a)}/${a.capacity}명</div></div><button class="secondary btn-small" onclick="event.stopPropagation();openActivityApplyDetail('${a.id}')">상세 보기</button></div></div>`).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">📅</div><b>이 날짜에는 등록된 활동이 없어요</b><span>초록 점이 있는 날짜를 선택해 주세요.</span></div>`}</main>${tabbar('group')}`;
}

function registerActivity(){
 const date=dotDate(document.getElementById('activity-date')?.value||todayDot()),start=(document.getElementById('activity-start')?.value||'19:00').trim(),end=(document.getElementById('activity-end')?.value||'20:00').trim(),capRaw=(document.getElementById('activity-capacity')?.value||'8').replace(/[^0-9]/g,''),capacity=Math.max(1,Number(capRaw||8)),place=(document.getElementById('activity-place')?.value||'올림픽공원 테니스장').trim();
 if(!/^\d{4}\.\d{2}\.\d{2}$/.test(date)){showToast('활동 날짜를 YYYY.MM.DD 형식으로 입력해 주세요.','danger');return}
 const groupName=state.selectedGroupRole==='owner'&&state.selectedGroup?state.selectedGroup:OWNER_GROUP,id='act-'+Date.now(),applicants=[];
 if(state.ownerJoinOnCreate)applicants.push({name:CURRENT_MEMBER,phone:'010-9923-9935',gender:'여자',status:'approved',appliedAt:todayDot(),participantRole:'owner'});
 const activity={id,group:groupName,title:groupName,registeredAt:todayDot(),date,time:`${start} ~ ${end}`,place,status:'활동 예정',capacity,matchType:state.activityRegisterMatch,skill:'실력 무관',applicants,scoreEligible:false};
 activities.unshift(activity);if(state.ownerJoinOnCreate&&!state.appliedActivityIds.includes(id))state.appliedActivityIds.push(id);state.selectedActivityId=id;state.selectedActivityDate=date;state.calendarMonth=date.slice(0,7).replace('.', '-');state.selectedGroup=groupName;state.selectedGroupRole='owner';
 addNotification(`${groupName} ${date} 활동이 등록되었습니다.`,'모꼬장',id,'owner','activity');saveV2();go('activity-detail',{activityDetailTab:'detail'});showToast(state.ownerJoinOnCreate?'활동을 등록하고 모꼬장 참여도 확정했습니다.':'활동을 등록했습니다. 모꼬의 신청을 기다려 주세요.');
}
function activityRegister(){
 const defaultDate='2026.08.24';
 return `${header('모꼬 활동 등록',{back:true,actions:false})}<main class="screen"><h3 style="font-size:21px;margin:18px 0 8px">모꼬 활동을 등록해 주세요.</h3><div class="score-preview">점수 집계는 <b>활동 완료 + 참여 대상 4명 이상 + 60분 이상</b>일 때만 적용됩니다.</div><div class="field"><label>활동 날짜 <span class="green-title">*</span></label><input id="activity-date" value="${defaultDate}"></div><div class="field"><label>활동 시간 (시작 - 종료) <span class="green-title">*</span></label><div class="field-row"><input id="activity-start" value="19:00"><input id="activity-end" value="20:00"></div></div><div class="field"><label>정기 활동</label><div class="option-grid">${['반복 안함','매주','매월'].map(x=>`<button class="form-choice ${state.activityRegisterRepeat===x?'active':''}" onclick="state.activityRegisterRepeat='${x}';render(false)">${x}</button>`).join('')}</div></div><div class="field"><label>활동 가능 인원</label><input id="activity-capacity" value="8" inputmode="numeric"><div class="rule-note">모꼬장이 직접 참여하는 경우에도 정원 1명과 점수 조건의 참여 인원 1명으로 포함됩니다.</div></div><div class="owner-join-register"><div><b>나도 이 활동에 참여하기</b><span>활동 등록과 동시에 별도 승인 없이 참여 확정됩니다.</span></div><button class="switch ${state.ownerJoinOnCreate?'on':''}" onclick="state.ownerJoinOnCreate=!state.ownerJoinOnCreate;render(false)"></button></div><div class="field"><label>참여 유형 (Match Type) <span class="green-title">*</span></label><div class="option-grid">${['혼성','남성','여성'].map(x=>`<button class="form-choice ${state.activityRegisterMatch===x?'active':''}" onclick="state.activityRegisterMatch='${x}';render(false)">${x}</button>`).join('')}</div></div><div class="field"><label>운동 장소 <span class="green-title">*</span></label><div class="field-row"><button class="form-choice ${state.activityRegisterPlaceMode==='주요 활동 장소'?'active':''}" onclick="state.activityRegisterPlaceMode='주요 활동 장소';render(false)">주요 활동 장소</button><button class="form-choice ${state.activityRegisterPlaceMode==='새로운 장소 입력'?'active':''}" onclick="state.activityRegisterPlaceMode='새로운 장소 입력';render(false)">새로운 장소 입력</button></div></div><div class="field"><label>주소</label><input value="서울 송파구 올림픽로 424 (올림픽공원)" disabled></div><div class="field"><label>활동 장소명</label><input id="activity-place" value="올림픽공원 테니스장"></div><div class="field"><label>참여 가능한 운동 실력</label><div class="field-row"><button class="form-choice active">실력 무관</button><button class="form-choice">실력 입력</button></div></div><button class="primary" style="width:100%;margin-top:22px" onclick="registerActivity()">활동 등록하기</button></main>${tabbar('activity')}`;
}

function activityDetail(){
 const a=currentActivity(),applicants=a.applicants||[],ownerView=state.selectedGroupRole==='owner',me=currentMemberStatus(a),unresolved=applicants.filter(p=>p.status==='approved').length;
 const memberBox=!ownerView&&me?`<div class="member-status-box"><div class="status-title"><span class="status-pill ${memberStatusClass(me)}">${me.participantRole==='owner'?'모꼬장 · ':''}${memberStatusLabel(a,me)}</span></div><div class="status-desc">${me.participantRole==='owner'?'내가 만든 활동에 참여자로 등록되어 있습니다. 출석·노쇼 및 개인 점수는 다른 모꼬와 동일하게 적용됩니다.':me.status==='pending'?'모꼬장이 승인하면 참여가 확정됩니다.':me.status==='approved'?'참여가 확정되었습니다. 활동 후 모꼬장이 실제 참여 여부를 확인합니다.':me.status==='attended'?(a.status==='활동 완료'?(a.scoreEligible?'+10점이 반영되었습니다.':'점수 조건 미충족으로 점수가 반영되지 않았습니다.'):'참여 확인이 완료되었습니다. 활동 완료 후 점수가 확정됩니다.'):me.status==='no-show'?(a.status==='활동 완료'?(a.scoreEligible?'-100점이 반영되었습니다.':'점수 조건 미충족으로 노쇼 점수는 반영되지 않았습니다.'):'노쇼로 표시되었습니다.'):'신청이 취소된 활동입니다.'}</div>${a.status==='활동 예정'&&['pending','approved'].includes(me.status)?`<button class="ghost" style="width:100%;margin-top:10px" onclick="${me.participantRole==='owner'?`leaveOwnerActivity('${a.id}')`:`cancelOwnApplication('${a.id}')`}">${me.participantRole==='owner'?'내 참여 취소':'신청 취소'}</button>`:''}</div>`:'';
 const detail=`${activityFlowStepper(a)}<div class="card-top"><span class="status-pill ${a.status==='활동 완료'?'complete':a.status==='출석 확인'?'attended':a.status==='활동 취소'?'cancelled':'approved'}">${a.status}</span><span class="card-count">신청 ${applicantCount(a)} · 승인/대상 ${approvedCount(a)}/${a.capacity}</span></div>${ownerView?ownerParticipationPanel(a):memberBox}<p><b>등록일</b><br>${a.registeredAt}</p><p><b>활동 날짜</b><br>${a.date}</p><p><b>활동 시간</b><br>${a.time}</p><p><b>운동 장소</b><br>⌖ ${a.place}</p><p><b>활동 가능 인원</b><br>${a.capacity}명</p><p><b>참여 유형</b><br>${a.matchType}</p>${scorePolicyCard(a)}${a.status==='활동 완료'&&a.scoreSummary?`<div class="summary-box"><b>활동 점수 결과</b><div class="muted" style="margin-top:8px">참여 ${a.scoreSummary.attended}명 · 노쇼 ${a.scoreSummary.noShow}명 · ${a.scoreSummary.duration}분</div><div class="score-total" style="margin-top:12px">+${a.scoreSummary.groupPoints}<span>모꼬지 점수</span></div></div>`:''}${ownerView&&a.status==='활동 예정'?`<button class="primary" style="width:100%;margin-top:12px" onclick="startAttendance('${a.id}')">활동 종료 · 출석 확인</button><button class="ghost" style="width:100%;margin-top:8px" onclick="cancelActivity('${a.id}')">활동 취소</button>`:''}${ownerView&&a.status==='출석 확인'?`<button class="secondary" style="width:100%;margin-top:12px" onclick="state.activityDetailTab='applicants';render(false)">참여 여부 확인하기</button>`:''}`;
 const applicantView=`<div class="approval-summary"><b>승인/참여 대상 <span class="green-title">${approvedCount(a)}</span> / 정원 <span class="green-title">${a.capacity}</span>명</b><span style="float:right">신청 ${applicantCount(a)}명</span></div>${a.status==='출석 확인'?'<div class="score-preview">모꼬장을 포함한 모든 참여 대상의 실제 참여 여부를 확인해 주세요. 완료 후 점수가 확정됩니다.</div>':''}${applicants.length?applicants.map(p=>{const label=memberStatusLabel(a,p),cls=memberStatusClass(p);let actions='';if(a.status==='활동 예정'&&p.participantRole==='owner'&&p.status==='approved')actions=`<button class="ghost btn-small" onclick="leaveOwnerActivity('${a.id}')">내 참여 취소</button>`;else if(a.status==='활동 예정'&&p.status==='pending')actions=`<button class="ghost btn-small" onclick="cancelApplicant('${a.id}','${p.name}')">신청 취소</button><button class="primary btn-small" onclick="approveApplicant('${a.id}','${p.name}')">승인하기</button>`;else if(a.status==='활동 예정'&&p.status==='approved')actions=`<button class="ghost btn-small" onclick="cancelApplicant('${a.id}','${p.name}')">승인 취소</button>`;else if(a.status==='출석 확인'&&p.status==='approved')actions=`<button class="primary btn-small" onclick="markAttendance('${a.id}','${p.name}','attended')">참여 완료</button><button class="danger-outline btn-small" onclick="markAttendance('${a.id}','${p.name}','no-show')">노쇼</button>`;else if(a.status==='출석 확인'&&p.status==='attended')actions=`<button class="danger-outline btn-small" onclick="markAttendance('${a.id}','${p.name}','no-show')">노쇼로 변경</button>`;else if(a.status==='출석 확인'&&p.status==='no-show')actions=`<button class="secondary btn-small" onclick="markAttendance('${a.id}','${p.name}','attended')">참여로 변경</button>`;return `<div class="person-card v2"><div class="person-top"><div class="person-info"><div class="avatar">${p.name[0]}</div><div><b>${p.name}</b>${p.participantRole==='owner'?'<span class="role-chip">모꼬장 참여</span>':''}<div class="muted">${p.phone} · ${p.gender}<br>${p.appliedAt} ${p.participantRole==='owner'?'참여 등록':'신청'}</div></div></div><span class="status-pill ${cls}">${label}</span></div>${actions?`<div class="person-bottom">${actions}</div>`:''}</div>`}).join(''):'<div class="empty-state"><b>참여자가 없습니다.</b></div>'}${a.status==='출석 확인'?`<div class="attendance-toolbar"><div class="muted" style="margin-bottom:8px">${unresolved?`아직 ${unresolved}명의 참여 여부를 확인해야 합니다.`:'모든 참여 여부 확인이 완료되었습니다.'}</div><button class="primary" ${unresolved?'disabled':''} onclick="completeActivity('${a.id}')">활동 완료 · 점수 확정</button></div>`:''}`;
 return `${header('활동 상세보기',{back:true,actions:false})}<main class="screen">${ownerView?`<div class="subtabs"><button class="${state.activityDetailTab==='detail'?'active':''}" onclick="state.activityDetailTab='detail';render(false)">활동 상세</button><button class="${state.activityDetailTab==='applicants'?'active':''}" onclick="state.activityDetailTab='applicants';render(false)">신청한 모꼬</button></div>`:''}${state.activityDetailTab==='applicants'&&ownerView?applicantView:detail}</main>${tabbar('activity')}`;
}

function render(push=true){
 const app=document.getElementById('app');
 const views={home,notifications,settings,profile,'score-guide':scoreGuide,'group-home':groupHome,'group-list':groupList,'group-detail':groupDetail,'exchange-list':exchangeList,'exchange-detail':exchangeDetail,'exchange-create':exchangeCreate,join,'create-group':createGroup,'activity-register':activityRegister,'activity-apply':activityApply,'activity-apply-detail':activityApplyDetail,'my-activity':myActivity,'my-leader':myLeader,'activity-all':activityAll,manage,'activity-detail':activityDetail,dm,chat};
 app.innerHTML=(views[state.route]||home)();if(push){history.pushState({route:state.route},'',`#${state.route}`)}startRankRotation();
}

render(false);