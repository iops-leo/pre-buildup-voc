/**
 * 몬스터 데이터 정의
 */

export type MonsterTrait = 'poison' | 'freeze' | 'burn' | 'evade' | 'drain' | 'rage' | 'invisible' | 'revive';

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  world: number;
  stage: number;
  isBoss: boolean;
  hp: number;
  traits: MonsterTrait[];
  coinReward: number;
  description: string;
}

export interface MonsterWorld {
  id: number;
  name: string;
  theme: string;
  monsters: Monster[];
}

// 월드 1: 숲속 마을
const world1Monsters: Monster[] = [
  {
    id: 'green_slime',
    name: '초록 슬라임',
    emoji: '🟢',
    world: 1,
    stage: 1,
    isBoss: false,
    hp: 300,
    traits: [],
    coinReward: 10,
    description: '말랑말랑한 초록 슬라임. 처음 만나는 몬스터야!',
  },
  {
    id: 'angry_rabbit',
    name: '화난 토끼',
    emoji: '🐰',
    world: 1,
    stage: 2,
    isBoss: false,
    hp: 400,
    traits: ['evade'],
    coinReward: 15,
    description: '화가 난 토끼. 2번 연속 틀리면 도망가버려!',
  },
  {
    id: 'poison_mushroom',
    name: '독버섯',
    emoji: '🍄',
    world: 1,
    stage: 3,
    isBoss: false,
    hp: 500,
    traits: ['poison'],
    coinReward: 20,
    description: '틀리면 독에 걸려서 다음 문제 시간이 줄어들어!',
  },
  {
    id: 'fox_fairy',
    name: '여우 요정',
    emoji: '🦊',
    world: 1,
    stage: 4,
    isBoss: false,
    hp: 600,
    traits: ['invisible'],
    coinReward: 30,
    description: '요술을 부려서 가끔 힌트를 숨겨버려!',
  },
  {
    id: 'tree_golem',
    name: '나무 골렘',
    emoji: '🌳',
    world: 1,
    stage: 5,
    isBoss: true,
    hp: 800,
    traits: ['rage'],
    coinReward: 100,
    description: '숲의 수호자! 5문제마다 방어 모드로 바뀌어!',
  },
];

// 월드 2: 얼음 동굴
const world2Monsters: Monster[] = [
  {
    id: 'ice_slime',
    name: '얼음 슬라임',
    emoji: '❄️',
    world: 2,
    stage: 1,
    isBoss: false,
    hp: 500,
    traits: ['freeze'],
    coinReward: 20,
    description: '차가운 얼음 슬라임. 빙결 효과로 시간이 느리게 가!',
  },
  {
    id: 'penguin_warrior',
    name: '펭귄 전사',
    emoji: '🐧',
    world: 2,
    stage: 2,
    isBoss: false,
    hp: 600,
    traits: [],
    coinReward: 30,
    description: '용감한 펭귄 전사. 콤보가 끊기면 반격해!',
  },
  {
    id: 'snowman',
    name: '눈사람',
    emoji: '⛄',
    world: 2,
    stage: 3,
    isBoss: false,
    hp: 700,
    traits: ['drain'],
    coinReward: 40,
    description: '무서운 눈사람. HP가 조금씩 회복돼!',
  },
  {
    id: 'snow_wolf',
    name: '눈늑대',
    emoji: '🐺',
    world: 2,
    stage: 4,
    isBoss: false,
    hp: 800,
    traits: [],
    coinReward: 50,
    description: '2마리가 동시에 나타나! 둘 다 물리쳐야 해!',
  },
  {
    id: 'ice_queen',
    name: '얼음 여왕',
    emoji: '🧊',
    world: 2,
    stage: 5,
    isBoss: true,
    hp: 1200,
    traits: ['freeze', 'drain'],
    coinReward: 200,
    description: '얼음 동굴의 여왕! 빙결과 HP 회복을 동시에!',
  },
];

// 월드 3: 화산 지대
const world3Monsters: Monster[] = [
  {
    id: 'fire_spirit',
    name: '불꽃 정령',
    emoji: '🔥',
    world: 3,
    stage: 1,
    isBoss: false,
    hp: 700,
    traits: ['burn'],
    coinReward: 30,
    description: '틀리면 화상! 데미지가 30% 감소해!',
  },
  {
    id: 'lava_lizard',
    name: '용암 도마뱀',
    emoji: '🦎',
    world: 3,
    stage: 2,
    isBoss: false,
    hp: 800,
    traits: [],
    coinReward: 40,
    description: '빠른 도마뱀! 시간제한이 더 짧아!',
  },
  {
    id: 'magma_golem',
    name: '마그마 골렘',
    emoji: '🌋',
    world: 3,
    stage: 3,
    isBoss: false,
    hp: 1000,
    traits: ['burn'],
    coinReward: 60,
    description: '정답을 맞추면 폭발해서 추가 데미지!',
  },
  {
    id: 'baby_dragon',
    name: '아기 드래곤',
    emoji: '🐉',
    world: 3,
    stage: 4,
    isBoss: false,
    hp: 1200,
    traits: ['evade'],
    coinReward: 80,
    description: '날아다녀서 가끔 공격이 빗나가!',
  },
  {
    id: 'flame_king',
    name: '화염왕',
    emoji: '🔥',
    world: 3,
    stage: 5,
    isBoss: true,
    hp: 1500,
    traits: ['burn', 'rage'],
    coinReward: 300,
    description: '화산의 왕! HP가 50% 이하면 분노 모드!',
  },
];

// 월드 4: 유령의 성
const world4Monsters: Monster[] = [
  {
    id: 'ghost',
    name: '유령',
    emoji: '👻',
    world: 4,
    stage: 1,
    isBoss: false,
    hp: 900,
    traits: ['invisible'],
    coinReward: 40,
    description: '투명해져서 문제 일부가 안 보여!',
  },
  {
    id: 'pumpkin_knight',
    name: '호박 기사',
    emoji: '🎃',
    world: 4,
    stage: 2,
    isBoss: false,
    hp: 1100,
    traits: [],
    coinReward: 60,
    description: '머리가 분리되면 2페이즈 시작!',
  },
  {
    id: 'vampire',
    name: '뱀파이어',
    emoji: '🧛',
    world: 4,
    stage: 3,
    isBoss: false,
    hp: 1300,
    traits: ['drain'],
    coinReward: 80,
    description: '흡혈! 틀리면 HP를 회복해버려!',
  },
  {
    id: 'skeleton_king',
    name: '해골 왕',
    emoji: '💀',
    world: 4,
    stage: 4,
    isBoss: false,
    hp: 1500,
    traits: ['revive'],
    coinReward: 100,
    description: '1번 부활할 수 있어! 완전히 쓰러뜨려야 해!',
  },
  {
    id: 'dark_lord',
    name: '어둠의 군주',
    emoji: '👿',
    world: 4,
    stage: 5,
    isBoss: true,
    hp: 2000,
    traits: ['invisible', 'drain', 'rage'],
    coinReward: 500,
    description: '최종 보스! 모든 특성을 가지고 있어!',
  },
];

// 히든/이벤트 몬스터
export const hiddenMonsters: Monster[] = [
  {
    id: 'rainbow_slime',
    name: '무지개 슬라임',
    emoji: '🌈',
    world: 0,
    stage: 0,
    isBoss: false,
    hp: 200,
    traits: [],
    coinReward: 30,
    description: '10콤보 달성 시 등장! 보상 3배!',
  },
  {
    id: 'gift_box',
    name: '선물 상자',
    emoji: '🎁',
    world: 0,
    stage: 0,
    isBoss: false,
    hp: 100,
    traits: [],
    coinReward: 100,
    description: '랜덤 등장! 코인 대박 or 꽝!',
  },
  {
    id: 'cat_fairy',
    name: '고양이 요정',
    emoji: '🐱',
    world: 0,
    stage: 0,
    isBoss: false,
    hp: 300,
    traits: [],
    coinReward: 50,
    description: '주말 한정! 경험치 2배!',
  },
  {
    id: 'rudolph',
    name: '루돌프',
    emoji: '🎄',
    world: 0,
    stage: 0,
    isBoss: false,
    hp: 400,
    traits: [],
    coinReward: 100,
    description: '12월 한정! 특별 스킨 드롭!',
  },
  {
    id: 'golden_dragon',
    name: '황금 드래곤',
    emoji: '🐲',
    world: 0,
    stage: 0,
    isBoss: true,
    hp: 3000,
    traits: ['evade', 'rage'],
    coinReward: 1000,
    description: '100마리 처치 후 등장! 전설의 보상!',
  },
];

// 월드 데이터
export const monsterWorlds: MonsterWorld[] = [
  {
    id: 1,
    name: '숲속 마을',
    theme: 'forest',
    monsters: world1Monsters,
  },
  {
    id: 2,
    name: '얼음 동굴',
    theme: 'ice',
    monsters: world2Monsters,
  },
  {
    id: 3,
    name: '화산 지대',
    theme: 'volcano',
    monsters: world3Monsters,
  },
  {
    id: 4,
    name: '유령의 성',
    theme: 'haunted',
    monsters: world4Monsters,
  },
];

// 모든 몬스터
export const allMonsters: Monster[] = [
  ...world1Monsters,
  ...world2Monsters,
  ...world3Monsters,
  ...world4Monsters,
  ...hiddenMonsters,
];

// 몬스터 찾기 헬퍼
export function getMonsterById(id: string): Monster | undefined {
  return allMonsters.find(m => m.id === id);
}

export function getMonstersByWorld(worldId: number): Monster[] {
  return allMonsters.filter(m => m.world === worldId);
}

export function getBossMonster(worldId: number): Monster | undefined {
  return allMonsters.find(m => m.world === worldId && m.isBoss);
}
