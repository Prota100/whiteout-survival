// Skin Manager
class SkinManager {
  static KEY = 'whiteout_skins';
  static SELECTED_KEY = 'whiteout_selected_skin';

  static load() {
    try {
      return JSON.parse(localStorage.getItem(SkinManager.KEY) || '{}');
    } catch(e) { return {}; }
  }

  static save(data) {
    try { localStorage.setItem(SkinManager.KEY, JSON.stringify(data)); } catch(e) {}
  }

  static getSelectedId() {
    return localStorage.getItem(SkinManager.SELECTED_KEY) || 'default';
  }

  static getCurrentSkin() {
    const id = SkinManager.getSelectedId();
    return PLAYER_SKINS.find(s => s.id === id) || PLAYER_SKINS[0];
  }

  static select(skinId) {
    if (SkinManager.isUnlocked(skinId)) {
      try { localStorage.setItem(SkinManager.SELECTED_KEY, skinId); } catch(e) {}
    }
  }

  static isUnlocked(skinId) {
    const skin = PLAYER_SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    return SkinManager._checkCondition(skin.unlockCondition);
  }

  static _checkCondition(cond) {
    if (cond === 'always') return true;
    const rec = RecordManager.load();
    let achCount = 0;
    try { achCount = Object.keys(JSON.parse(localStorage.getItem('achievements_whiteout') || '{}')).length; } catch(e) {}

    switch (cond) {
      case 'win_once': return rec.wins >= 1;
      case 'kills_100_total': return rec.totalKills >= 100;
      case 'achievements_5': return achCount >= 5;
      case 'endless_60min': return (rec.longestEndlessSurvival || 0) >= 3600;
      case 'class_warrior_win': return SkinManager._classWin('warrior');
      case 'class_mage_win': return SkinManager._classWin('mage');
      case 'class_survivor_win': return SkinManager._classWin('survivor');
      case 'class_shaman_win': return SkinManager._classWin('shaman');
      case 'class_hunter_win': return SkinManager._classWin('hunter');
      default: return false;
    }
  }

  static _classWin(cls) {
    try {
      const data = JSON.parse(localStorage.getItem('whiteout_class_wins') || '{}');
      return !!data[cls];
    } catch(e) { return false; }
  }

  static recordClassWin(cls) {
    try {
      const data = JSON.parse(localStorage.getItem('whiteout_class_wins') || '{}');
      data[cls] = true;
      localStorage.setItem('whiteout_class_wins', JSON.stringify(data));
    } catch(e) {}
  }

  static getUnlockDescription(cond) {
    const descs = {
      'always': '기본 해제',
      'class_warrior_win': '전사로 60분 클리어',
      'class_mage_win': '마법사로 60분 클리어',
      'class_survivor_win': '생존가로 60분 클리어',
      'class_shaman_win': '무당으로 60분 클리어',
      'class_hunter_win': '사냥꾼으로 60분 클리어',
      'win_once': '1회 클리어',
      'kills_100_total': '누적 킬 100 이상',
      'achievements_5': '성취 5개 이상 달성',
      'endless_60min': '무한 모드 60분 생존',
    };
    return descs[cond] || '???';
  }

  static getUnlockedCount() {
    return PLAYER_SKINS.filter(s => SkinManager.isUnlocked(s.id)).length;
  }
}

