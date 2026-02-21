// Phaser Game Configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  physics: { default: 'arcade', arcade: { gravity:{y:0}, debug:false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene, BootScene, GameScene],
  input: { activePointers: 3 },
};

window.phaserGame = new Phaser.Game(config);
