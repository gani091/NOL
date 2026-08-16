const OPERATIONS_BLOG_URL='https://blog.naver.com/visom_info';
Object.assign(state,{bannerIndex:Number.isInteger(state.bannerIndex)?state.bannerIndex:0});
let bannerTimer;

const HOME_BANNERS=[
  {
    key:'score',
    eyebrow:'활동 점수 한눈에 보기',
    title:'4명 이상 · 60분 이상 · 활동 완료',
    description:'모꼬 +10 · 노쇼 -100 · 모꼬지 +10 + 참여 1명당 +1',
    action:'점수 기준 보기',
    icon:'🏆'
  },
  {
    key:'operations',
    eyebrow:'놀꼬지 공식 운영안',
    title:'활동 전에 운영 기준을 확인해 주세요',
    description:'실제 운영 블로그에서 참여·운영 관련 안내를 확인할 수 있어요.',
    action:'운영안 보기',
    icon:'📢'
  },
  {
    key:'activity',
    eyebrow:'이번 주 모꼬 활동',
    title:'모꼬장이 등록한 활동을 확인해 보세요',
    description:'활동 상세 확인 → 신청 → 모꼬장 승인 → 참여 확정 순서로 진행돼요.',
    action:'활동 보러가기',
    icon:'🎾'
  }
];

function openHomeBanner(key){
  if(key==='score'){
    go('score-guide');
    return;
  }
  if(key==='operations'){
    window.open(OPERATIONS_BLOG_URL,'_blank','noopener,noreferrer');
    return;
  }
  if(key==='activity'){
    state.selectedGroup=OWNER_GROUP;
    state.selectedGroupRole='member';
    go('group-detail');
  }
}

function setBanner(index,event){
  if(event)event.stopPropagation();
  state.bannerIndex=(index+HOME_BANNERS.length)%HOME_BANNERS.length;
  render(false);
}

function scoreBanner(){
  const banner=HOME_BANNERS[state.bannerIndex]||HOME_BANNERS[0];
  return `<section class="home-banner-carousel" aria-label="놀꼬지 안내 배너">
    <div class="home-banner-slide banner-${banner.key}" role="button" tabindex="0"
      onclick="openHomeBanner('${banner.key}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openHomeBanner('${banner.key}')}"
      aria-label="${banner.title} - ${banner.action}">
      <div class="home-banner-icon">${banner.icon}</div>
      <div class="home-banner-copy">
        <small>${banner.eyebrow}</small>
        <strong>${banner.title}</strong>
        <span>${banner.description}</span>
        <em>${banner.action} <b>›</b></em>
      </div>
    </div>
    <div class="home-banner-controls" aria-label="배너 선택">
      ${HOME_BANNERS.map((item,i)=>`<button class="home-banner-dot ${i===state.bannerIndex?'active':''}" aria-label="${i+1}번째 배너" onclick="setBanner(${i},event)"></button>`).join('')}
    </div>
  </section>`;
}

function startRankRotation(){
  clearInterval(rankTimer);
  clearInterval(bannerTimer);
  if(state.route==='home'){
    rankTimer=setInterval(()=>{
      state.rankMode=state.rankMode==='group'?'member':'group';
      render(false);
    },3000);
    bannerTimer=setInterval(()=>{
      state.bannerIndex=(state.bannerIndex+1)%HOME_BANNERS.length;
      render(false);
    },5000);
  }
}

render(false);
