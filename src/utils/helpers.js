// Game tips, FTUE, mobile helpers
const GAME_TIPS = [
  // ⚔️ 전투
  "⚔️ 같은 등급 장비 3개를 모으면 합성할 수 있어요!",
  "⚔️ 콤보 20킬 이상이면 광전사 모드 발동!",
  "⚔️ 스킬 시너지를 노려보세요. 조합에 따라 숨겨진 효과가 있어요!",
  "⚔️ 보스는 패턴이 있어요. 관찰한 뒤 공격하세요!",
  "⚔️ 곰은 강하지만 느립니다. 옆으로 피하면서 공격하세요!",
  // ❄️ 생존
  "❄️ 한파가 심할 때는 캠프파이어 근처에 있으면 HP가 회복돼요",
  "❄️ 나무와 돌을 모아 건물을 지으면 생존에 유리해요",
  "❄️ 온도가 0 이하로 떨어지면 HP가 감소합니다!",
  "❄️ 한파를 견디면 보상이 있어요. 포기하지 마세요!",
  // 🎯 전략
  "🎯 레벨업 시 카드를 신중하게 골라보세요!",
  "🎯 지옥 난이도 클리어 시 50포인트 보너스!",
  "🎯 클래스마다 패시브가 다릅니다. 전략에 맞는 클래스를 선택하세요!",
  "🎯 무한 모드에서는 60분 이후에도 계속 플레이할 수 있어요!",
  "🎯 장비 슬롯을 모두 에픽으로 채우면 특별한 성취를 달성합니다!",
  // 🏆 비밀
  "🏆 콘아미 코드를 알고 있나요? 버전 텍스트를 5번 클릭해보세요...",
  "🏆 백색 군주는 20분 이후 극한 구역에서 나타난다는 소문이...",
  "🏆 보스 러시 모드에서 모든 보스를 쓰러뜨리면 숨겨진 엔딩이!",
  "🏆 스피드런 30분 이내 클리어 시 특별 칭호를 얻을 수 있어요!",
];

// ═══ FTUE (First Time User Experience) Manager ═══
const FTUEManager = {
  KEY: 'whiteout_firstplay',
  isFirstPlay() { return localStorage.getItem(this.KEY) !== 'done'; },
  markDone() { try { localStorage.setItem(this.KEY, 'done'); } catch(e) {} },
  _shown: {},
  showOnce(scene, id, text, duration) {
    if (!this.isFirstPlay()) return false;
    if (this._shown[id]) return false;
    this._shown[id] = true;
    duration = duration || 3000;
    const cam = scene.cameras.main;
    const bg = scene.add.graphics().setScrollFactor(0).setDepth(500);
    const txt = scene.add.text(cam.width / 2, cam.height * 0.15, text, {
      fontSize: '16px', fontFamily: 'monospace', color: '#FFD700',
      backgroundColor: 'rgba(0,0,0,0.8)', padding: { x: 20, y: 12 },
      stroke: '#000', strokeThickness: 2, wordWrap: { width: cam.width * 0.8 }, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);
    scene.tweens.add({ targets: txt, alpha: 1, duration: 400 });
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({ targets: txt, alpha: 0, duration: 400, onComplete: () => { txt.destroy(); bg.destroy(); } });
    });
    return true;
  },
  reset() { this._shown = {}; }
};

// ═══ Mobile helpers ═══
function isMobileLayout() { return window.innerWidth < 768; }
function mobileFS(desktop, mobile) { return isMobileLayout() ? mobile : desktop; }
