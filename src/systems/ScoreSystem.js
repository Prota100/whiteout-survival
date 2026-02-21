// Score calculation + grade system
class ScoreSystem {
  static GRADE_TABLE = [
    { min: 1000000, grade: 'S+', title: '전설의 생존자', color: '#FFD700' },
    { min: 500000,  grade: 'S',  title: '눈폭풍의 지배자', color: '#C0C0C0' },
    { min: 200000,  grade: 'A',  title: '얼음의 투사', color: '#4488FF' },
    { min: 100000,  grade: 'B',  title: '혹한의 전사', color: '#44DD44' },
    { min: 50000,   grade: 'C',  title: '생존자', color: '#CCDDEE' },
    { min: 0,       grade: 'D',  title: '겨울의 초보자', color: '#888888' },
  ];

  static PERCENTILE_TABLE = [
    { min: 1000000, pct: 1 },
    { min: 500000,  pct: 5 },
    { min: 200000,  pct: 15 },
    { min: 100000,  pct: 30 },
    { min: 50000,   pct: 50 },
    { min: 20000,   pct: 70 },
    { min: 0,       pct: 95 },
  ];

  static calculate(opts) {
    const { survivalTime, kills, maxCombo, level, difficulty, handicap, equipmentManager, isSpeedrun, speedrunRemaining } = opts;
    let base = Math.floor(survivalTime) * 100
      + kills * 10
      + maxCombo * 50
      + level * 200;
    // Equipment grade sum
    if (equipmentManager) {
      const gradeValues = { common: 1, rare: 2, epic: 3, legendary: 4, unique: 5 };
      for (const item of Object.values(equipmentManager.slots || {})) {
        if (item && item.grade) base += (gradeValues[item.grade] || 0) * 300;
      }
    }
    // Difficulty multiplier
    const diffMul = { normal: 1, hard: 1.5, hell: 2.5 };
    base = Math.floor(base * (diffMul[difficulty] || 1));
    // Handicap bonus (+10% each)
    if (handicap && handicap !== 'none') {
      base = Math.floor(base * 1.1);
    }
    // Speedrun time bonus
    if (isSpeedrun && speedrunRemaining > 0) {
      base += Math.floor(speedrunRemaining) * 50;
    }
    return base;
  }

  static getGrade(score) {
    if (score === undefined || score === null || isNaN(score)) return ScoreSystem.GRADE_TABLE[ScoreSystem.GRADE_TABLE.length - 1];
    for (const entry of ScoreSystem.GRADE_TABLE) {
      if (score >= entry.min) return entry;
    }
    return ScoreSystem.GRADE_TABLE[ScoreSystem.GRADE_TABLE.length - 1];
  }

  static getPercentile(score) {
    for (const entry of ScoreSystem.PERCENTILE_TABLE) {
      if (score >= entry.min) return entry.pct;
    }
    return 99;
  }

  static SCORES_KEY = 'whiteout_scores';
  static saveScore(scoreData) {
    try {
      let arr = JSON.parse(localStorage.getItem(ScoreSystem.SCORES_KEY) || '[]');
      arr.unshift(scoreData);
      if (arr.length > 5) arr = arr.slice(0, 5);
      localStorage.setItem(ScoreSystem.SCORES_KEY, JSON.stringify(arr));
    } catch(e) {}
    // Update bestScore in RecordManager
    try {
      const rec = RecordManager.load();
      if (!rec.bestScore || scoreData.score > rec.bestScore) {
        rec.bestScore = scoreData.score;
        RecordManager.save(rec);
      }
    } catch(e) {}
  }

  static loadScores() {
    try { return JSON.parse(localStorage.getItem(ScoreSystem.SCORES_KEY) || '[]'); } catch(e) { return []; }
  }

  static formatScore(n) {
    if (n === undefined || n === null || isNaN(n)) n = 0;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 플레이어 스킨 시스템
// ═══════════════════════════════════════════════════════════════════
