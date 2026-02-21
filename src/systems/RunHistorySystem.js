// Run History Manager
class RunHistoryManager {
  static KEY = 'whiteout_runs';
  static MAX = 10;
  constructor() { this._load(); }
  _load() { try { this.runs = JSON.parse(localStorage.getItem(RunHistoryManager.KEY) || '[]'); } catch(e) { this.runs = []; } }
  save(runData) {
    this.runs.unshift(runData);
    if (this.runs.length > RunHistoryManager.MAX) this.runs.pop();
    try { localStorage.setItem(RunHistoryManager.KEY, JSON.stringify(this.runs)); } catch(e) {}
  }
  getBest() {
    if (this.runs.length === 0) return null;
    return {
      longestSurvival: this.runs.reduce((a, b) => a.survivalTime > b.survivalTime ? a : b),
      mostKills: this.runs.reduce((a, b) => a.kills > b.kills ? a : b),
      highestLevel: this.runs.reduce((a, b) => a.level > b.level ? a : b),
    };
  }
  static formatTime(sec) { return `${Math.floor(sec/60)}분 ${Math.floor(sec%60)}초`; }
}

