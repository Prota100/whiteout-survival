// Record Manager - personal records
class RecordManager {
  static KEY = 'whiteout_records';

  static _default() {
    return {
      bestSurvivalTime: 0, bestKills: 0, bestLevel: 0, bestCombo: 0,
      totalPlays: 0, totalKills: 0, totalPlayTime: 0, wins: 0, achievementsUnlocked: 0,
      longestEndlessSurvival: 0, totalQuestsCompleted: 0, ngPlusClears: 0,
      bossRushClears: 0, hardClears: 0,
      speedrunClears: 0, bestSpeedrunTime: 0, handicapClears: 0
    };
  }

  static load() {
    try {
      const raw = localStorage.getItem(RecordManager.KEY);
      return raw ? { ...RecordManager._default(), ...JSON.parse(raw) } : RecordManager._default();
    } catch(e) { return RecordManager._default(); }
  }

  static save(data) {
    try { localStorage.setItem(RecordManager.KEY, JSON.stringify(data)); } catch(e) {}
  }

  /** 게임 종료 시 호출. 신기록 항목 배열 반환 */
  static recordRun(survivalTime, kills, level, combo, isWin, achievementsCount) {
    const rec = RecordManager.load();
    const newRecords = [];

    if (survivalTime > rec.bestSurvivalTime) { rec.bestSurvivalTime = survivalTime; newRecords.push('survivalTime'); }
    if (kills > rec.bestKills) { rec.bestKills = kills; newRecords.push('kills'); }
    if (level > rec.bestLevel) { rec.bestLevel = level; newRecords.push('level'); }
    if (combo > rec.bestCombo) { rec.bestCombo = combo; newRecords.push('combo'); }

    rec.totalPlays++;
    rec.totalKills += kills;
    rec.totalPlayTime += survivalTime;
    if (isWin) rec.wins++;
    if (typeof achievementsCount === 'number') rec.achievementsUnlocked = achievementsCount;

    RecordManager.save(rec);
    return newRecords;
  }

  static formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분 ${s}초`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🏆 점수 계산 + 등급 시스템
// ═══════════════════════════════════════════════════════════════════
