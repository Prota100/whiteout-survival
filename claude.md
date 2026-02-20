# 화이트아웃 서바이벌 - 인수인계 문서

## 프로젝트 개요
Phaser 3 기반 2D 생존 웹게임. 화이트아웃 서바이벌 IP 기반 팬게임.
단일 파일(`game.js`) 기반 구조 + ElevenLabs 사전 생성 사운드.

## 배포
- **URL:** https://prota100.github.io/whiteout-survival/
- **저장소:** Prota100/whiteout-survival (GitHub)
- **브랜치:** `main` → GitHub Pages 자동 배포
- **캐시 버스팅:** `index.html`의 `game.js?v=YYYYMMDD-phaseN-NNN` 수동 업데이트 필수

## 주요 시스템

### 🔊 SoundManager (라인 4~70)
- Web Audio API 기반, ElevenLabs 사전 생성 mp3 사용
- `sounds/` 디렉토리에 16개 mp3 파일
- ⚠️ **API 키 클라이언트 코드 포함 절대 금지** (서버 스크립트로만 생성)
- 신규 사운드 추가 시: `sounds` 배열 → mp3 파일 → play 함수 3단계 순서로 추가

### 💾 SaveManager (라인 ~70~140)
- `localStorage` 키: `whiteout_save`
- 저장 항목: 플레이어 위치/HP/스탯, 자원, 건물, NPC, 업그레이드
- 자동 세이브: 60초 타이머 + 건설/제작 이벤트
- ⚠️ `localStorage.clear()` 절대 사용 금지 (다른 데이터 삭제됨)
- 세이브 마이그레이션: `GV`(게임 버전) 변경 시 기존 데이터 보존 코드 필수

### 🏠 TitleScene
- 이어하기/새로하기 버튼 (`SaveManager.hasSave()` 기반)
- 새로하기 시 덮어쓰기 확인 다이얼로그 필수
- 씬 전환: Title → Boot → Game

### 🕹️ 조이스틱 (GameScene)
- 전체화면 터치 조이스틱 (하단 버튼 영역 제외)
- lerp 기반 부드러운 이동
- 모바일: 자동 공격 (60px 범위 내 적/자원)
- PC: WASD/화살표 이동, Space/마우스 공격

### ⚔️ UpgradeManager (라인 ~176~300)
- 20종 업그레이드 카드 (전투 5/생존 5/경제 5/특수 5)
- 희귀도: 일반 70% / 희귀 25% / 에픽 5%
- 5킬마다 보급 상자 스폰 (플레이어 100~200px 거리)
- 삼택지 UI (게임 일시정지 + 카드 뒤집기 연출)
- 세이브 연동: `upgrades` 필드로 저장/복원

## 파일 구조
```
whiteout-survival/
├── index.html        # 진입점 (캐시 버스팅 버전 관리)
├── game.js           # 전체 게임 코드 (~2600줄)
├── sounds/           # ElevenLabs 생성 mp3 (16개)
│   ├── bgm.mp3, slash.mp3, hit.mp3, kill.mp3
│   ├── coin.mp3, chop.mp3, build.mp3, craft.mp3
│   ├── hire.mp3, hurt.mp3, eat.mp3, quest.mp3
│   ├── death.mp3, upgrade_select.mp3
│   ├── box_appear.mp3, epic_card.mp3
└── claude.md         # 이 문서
```

## 수정 시 주의사항
1. **캐시 버스팅:** `index.html`에서 `game.js?v=` 버전 반드시 업데이트
2. **테스트:** 모바일(터치) + PC(키보드) 양쪽 테스트 필수
3. **세이브:** 저장 구조 변경 시 마이그레이션 코드 추가
4. **사운드:** 신규 사운드는 ElevenLabs API → mp3 파일로 사전 생성
5. **배포:** `git push origin main` → 자동 배포 (2~3분 소요)

## Phase 진행 이력
| Phase | 내용 | 커밋 |
|-------|------|------|
| 1 | 코드 분리 (SoundManager, BootScene 등 리팩토링) | Phase1 |
| 2 | SaveManager + TitleScene (이어하기/새로하기) | `2b9cd38` |
| 3 | 전체화면 터치 조이스틱 + 자동공격 범위 60px | `5d22389` |
| 4 | 뱀서 업그레이드 시스템 (20종 카드, 삼택지 UI, 보급 상자) | `9a0d5ae` |
| 5 | 사운드 확장 (upgrade_select, box_appear, epic_card) | Phase5 |
| 6 | 문서화 (claude.md) | Phase6 |
