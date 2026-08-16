const SPORT_SCORE_RULES={
  '축구':{min:11,max:20},
  '풋살':{min:5,max:12},
  '테니스':{min:4,max:10},
  '배드민턴':{min:4,max:10},
  '탁구':{min:4,max:10},
  '기타':{min:10,max:20}
};

function activitySport(a){
  if(a?.sport&&SPORT_SCORE_RULES[a.sport]) return a.sport;
  const g=groups.find(x=>x.name===a?.group);
  return g?.sport&&SPORT_SCORE_RULES[g.sport]?g.sport:'기타';
}
function activityHours(a){return activityDurationMinutes(a)/60}
function activityTimeScore(a){return Math.round(activityHours(a)*5*10)/10}
function attendanceRate(a){
  const capacity=Math.max(1,Number(a?.capacity||1));
  return attendedCount(a)/capacity;
}
function attendanceHalfEligible(a){return attendanceRate(a)>=0.5}
function participationBonus(a){
  const sport=activitySport(a);const rule=SPORT_SCORE_RULES[sport]||SPORT_SCORE_RULES['기타'];const count=attendedCount(a);
  if(count<rule.min) return 0;
  if(count>=rule.max) return 10;
  return Math.round(5+((count-rule.min)/(rule.max-rule.min))*5);
}
function scoreEligible(a){return a?.status==='활동 완료'&&attendanceHalfEligible(a)}
function scoreLockedEligible(a){return scoreEligible(a)}
function formatPoint(value){return Number.isInteger(value)?String(value):String(Math.round(value*10)/10)}

function activityScoreSummary(a){
  const sport=activitySport(a);const rule=SPORT_SCORE_RULES[sport]||SPORT_SCORE_RULES['기타'];
  const time=activityTimeScore(a);const bonus=participationBonus(a);const rate=Math.round(attendanceRate(a)*100);
  const eligible=scoreEligible(a);
  return {sport,rule,time,bonus,rate,eligible,group:eligible?time+bonus:0,attended:attendedCount(a)};
}

function memberRecord(name=CURRENT_MEMBER){
  let score=0,participated=0,noShow=0,event=0;
  activities.forEach(a=>{
    if(a.status!=='활동 완료') return;
    const p=(a.applicants||[]).find(x=>x.name===name);
    if(p?.status==='no-show'){noShow+=1;return}
    if(p?.status!=='attended') return;
    if(!attendanceHalfEligible(a)) return;
    score+=activityTimeScore(a);participated+=1;
    if(p?.eventPoints){score+=p.eventPoints;event+=1}
  });
  return {score:Math.round(score*10)/10,participated,noShow,event};
}

function groupRecord(groupName=OWNER_GROUP){
  let score=0,opened=0,participants=0,events=0;
  activities.filter(a=>a.group===groupName).forEach(a=>{
    if(a.status!=='활동 완료'||!attendanceHalfEligible(a)) return;
    opened+=1;participants+=attendedCount(a);
    score+=activityTimeScore(a)+participationBonus(a);
    if(a.groupEventPoints){score+=a.groupEventPoints;events+=1}
  });
  return {score:Math.round(score*10)/10,opened,participants,events};
}

function scorePolicyCard(a){
  const s=activityScoreSummary(a);const halfOK=s.rate>=50;const minOK=s.attended>=s.rule.min;
  return `<div class="score-policy-card"><div class="score-policy-head"><div><small>랭킹 점수 기준</small><b>${s.sport} · ${formatPoint(s.time)}점 시간 점수</b></div><button onclick="go('score-guide')">자세히 ›</button></div><div class="score-condition-grid"><div class="${halfOK?'ok':'wait'}"><b>${s.rate}%</b><span>모집 인원 대비 참석률<br>50% 이상 ${halfOK?'✓':'필요'}</span></div><div class="${minOK?'ok':'wait'}"><b>${s.attended}/${s.rule.min}명</b><span>${s.sport} 보너스 최소 인원<br>${minOK?`+${s.bonus}점`:'미달 시 +0점'}</span></div></div><div class="score-preview">${a.status==='활동 완료'?(halfOK?`모꼬 ${formatPoint(s.time)}점 · 모꼬지 ${formatPoint(s.group)}점 반영`:'참석률 50% 미만으로 이번 활동은 점수가 반영되지 않습니다.'):`활동 완료 후 실제 참석 인원 기준으로 점수가 확정됩니다.`}</div></div>`;
}

function scoreGuide(){
  return `${header('랭킹 점수 안내',{back:true,actions:false})}<main class="screen score-guide"><div class="guide-hero"><div class="guide-icon">🏆</div><h2>뛴 만큼 쌓이고,<br>함께할수록 더 올라가요</h2><p>활동 완료 후 실제 참석 결과를 기준으로 모꼬와 모꼬지 랭킹 점수를 계산합니다.</p></div><section class="guide-section"><h3>모꼬 점수</h3><div class="guide-score-row"><span>1시간 활동 참여</span><b class="plus">+5점</b></div><div class="guide-score-row"><span>2시간 활동 참여</span><b class="plus">+10점</b></div><p class="muted">활동 시간 × 5점으로 계산합니다. 단, 모집 인원의 50% 미만이 실제 참석한 활동은 개인 점수도 부여되지 않습니다.</p></section><section class="guide-section"><h3>모꼬지 점수</h3><div class="guide-score-row"><span>활동 시간 점수</span><b class="plus">시간 × 5점</b></div><div class="guide-score-row"><span>참여 인원 보너스</span><b class="plus">+5 ~ +10점</b></div><p class="muted">종목별 최소 활동 인원부터 5점이 부여되고, 참여 인원이 늘어날수록 최대 10점까지 올라갑니다.</p></section><section class="guide-section"><h3>종목별 참여 보너스 기준</h3><div class="ranking-rule-table"><div class="rule-tr head"><b>종목</b><b>5점 기준</b><b>10점 기준</b></div>${[['축구','11명','20명'],['풋살','5명','12명'],['테니스·배드민턴·탁구','4명','10명'],['기타','10명','20명']].map(r=>`<div class="rule-tr"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}</div></section><section class="guide-section"><h3>점수가 쌓이지 않는 경우</h3><div class="guide-note"><b>① 모집 인원의 50% 미만 참석</b><p>활동이 원활하게 이루어지지 않은 것으로 보아 모꼬·모꼬지 모두 점수가 없습니다.</p></div><div class="guide-note"><b>② 종목 최소 활동 인원 미달</b><p>참석률이 50% 이상이면 활동 시간 점수는 받을 수 있지만, 모꼬지 참여 인원 보너스는 0점입니다.</p></div></section><section class="guide-section"><h3>예시 · 2시간 활동</h3><div class="guide-score-row"><span>축구 11명 참석</span><b>개인 10 · 모꼬지 15</b></div><div class="guide-score-row"><span>풋살 9명 참석</span><b>개인 10 · 모꼬지 18</b></div><div class="guide-score-row"><span>테니스 8명 참석</span><b>개인 10 · 모꼬지 18</b></div><div class="guide-score-row"><span>축구 20명 모집 · 9명 참석</span><b class="minus">0점</b></div></section><div class="guide-note"><b>랭킹 혜택</b><p>랭킹은 연 2회 정산되며 상위 팀에 총 100만원 상당의 혜택이 순위별로 차등 제공될 예정입니다. 세부 혜택은 운영 일정에 따라 공개됩니다.</p></div></main>${tabbar('home')}`;
}

if(typeof HOME_BANNERS!=='undefined'&&HOME_BANNERS.length){
  const score=HOME_BANNERS.find(x=>x.key==='score');
  if(score){
    score.eyebrow='우리 동호회, 지금 몇 등일까요?';
    score.title='1시간 5점 · 함께할수록 보너스 UP';
    score.description='모꼬는 활동 시간×5점, 모꼬지는 시간 점수+종목별 참여 보너스';
    score.action='새 점수 기준 보기';
  }
}

render(false);
