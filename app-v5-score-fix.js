function completeActivity(activityId){
  const a=activities.find(x=>x.id===activityId);
  if(!a||a.status!=='출석 확인') return;
  const unresolved=(a.applicants||[]).filter(p=>p.status==='approved').length;
  if(unresolved){showToast(`참여 여부를 확인하지 않은 모꼬가 ${unresolved}명 있습니다.`,'danger');return}

  a.status='활동 완료';
  a.completedAt=todayDot();
  const summary=activityScoreSummary(a);
  a.scoreEligible=summary.eligible;
  a.scoreSummary={
    attended:attendedCount(a),
    noShow:noShowCount(a),
    duration:activityDurationMinutes(a),
    attendanceRate:summary.rate,
    sport:summary.sport,
    timePoints:summary.eligible?summary.time:0,
    bonusPoints:summary.eligible?summary.bonus:0,
    groupPoints:summary.group
  };

  const me=currentMemberStatus(a);
  if(me){
    let msg=`${a.group} 활동이 완료되었습니다.`;
    if(!summary.eligible) msg=`${a.group} 활동은 모집 인원의 50% 미만 참석으로 랭킹 점수가 반영되지 않았습니다.`;
    else if(me.status==='attended') msg=`${a.group} 활동 ${formatPoint(summary.time)}점이 반영되었습니다.`;
    else if(me.status==='no-show') msg=`${a.group} 활동에 노쇼로 기록되어 이번 활동 참여 점수는 없습니다.`;
    addNotification(msg,'모꼬',activityId,'member','activity');
  }

  const ownerMsg=summary.eligible
    ?`${a.group} 활동 완료 · 모꼬지 ${formatPoint(summary.group)}점(시간 ${formatPoint(summary.time)} + 참여 보너스 ${summary.bonus}) 반영`
    :`${a.group} 활동 완료 · 참석률 ${summary.rate}%로 랭킹 점수 미반영`;
  addNotification(ownerMsg,'모꼬장',activityId,'owner','activity');
  saveV2();render(false);
  showToast(summary.eligible?`활동을 완료하고 모꼬지 ${formatPoint(summary.group)}점을 반영했습니다.`:'활동을 완료했습니다. 참석률 50% 미만으로 점수는 반영되지 않습니다.',summary.eligible?'success':'danger');
}
