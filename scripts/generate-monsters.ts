/**
 * Gemini 3 Pro Image Preview를 사용한 몬스터 이미지 생성 스크립트
 *
 * 사용법: npx tsx scripts/generate-monsters.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = 'AIzaSyDo5-DahXe5q-4Do3mWaQ8ozd_vE_xqNFQ';
const OUTPUT_DIR = path.join(__dirname, '../public/monsters');

// 몬스터 정의
const monsters = [
  // 월드 1: 숲속 마을
  { id: 'green_slime', name: '초록 슬라임', prompt: 'Generate an image of a cute green slime monster, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'angry_rabbit', name: '화난 토끼', prompt: 'Generate an image of an angry cute rabbit monster with red eyes, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'poison_mushroom', name: '독버섯', prompt: 'Generate an image of a purple poison mushroom monster with a cute face, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'fox_fairy', name: '여우 요정', prompt: 'Generate an image of a magical fox fairy monster with orange fur, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'tree_golem', name: '나무 골렘', prompt: 'Generate an image of a tree golem boss monster with wooden body and green leaves, fantasy RPG style, chibi, kids game, white background' },

  // 월드 2: 얼음 동굴
  { id: 'ice_slime', name: '얼음 슬라임', prompt: 'Generate an image of a cute ice slime monster, light blue crystal body, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'penguin_warrior', name: '펭귄 전사', prompt: 'Generate an image of a penguin warrior monster holding a tiny sword, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'snowman', name: '눈사람', prompt: 'Generate an image of a mischievous snowman monster with carrot nose, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'snow_wolf', name: '눈늑대', prompt: 'Generate an image of a white snow wolf monster with ice blue eyes, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'ice_queen', name: '얼음 여왕', prompt: 'Generate an image of an ice queen boss monster wearing elegant frozen dress, fantasy RPG style, chibi, kids game, white background' },

  // 월드 3: 화산 지대
  { id: 'fire_spirit', name: '불꽃 정령', prompt: 'Generate an image of a fire spirit monster made of orange flames, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'lava_lizard', name: '용암 도마뱀', prompt: 'Generate an image of a lava lizard monster with red scales and fire patterns, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'magma_golem', name: '마그마 골렘', prompt: 'Generate an image of a magma golem monster with rocky body and lava cracks, fantasy RPG style, chibi, kids game, white background' },
  { id: 'baby_dragon', name: '아기 드래곤', prompt: 'Generate an image of a cute baby dragon monster with red scales and small wings, fantasy RPG style, chibi, kids game, white background' },
  { id: 'flame_king', name: '화염왕', prompt: 'Generate an image of a flame king boss monster wearing a crown of fire, fantasy RPG style, chibi, kids game, white background' },

  // 월드 4: 유령의 성
  { id: 'ghost', name: '유령', prompt: 'Generate an image of a cute friendly ghost monster, white and slightly transparent, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'pumpkin_knight', name: '호박 기사', prompt: 'Generate an image of a pumpkin head knight monster wearing armor, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'vampire', name: '뱀파이어', prompt: 'Generate an image of a cute vampire monster wearing black cape, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'skeleton_king', name: '해골 왕', prompt: 'Generate an image of a skeleton king monster with golden crown, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'dark_lord', name: '어둠의 군주', prompt: 'Generate an image of a dark lord final boss monster with purple aura, fantasy RPG style, chibi, kids game, white background' },

  // 히든/이벤트 몬스터
  { id: 'rainbow_slime', name: '무지개 슬라임', prompt: 'Generate an image of a rainbow slime monster with colorful sparkles, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'gift_box', name: '선물 상자', prompt: 'Generate an image of a gift box monster with cute eyes and red ribbon, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'cat_fairy', name: '고양이 요정', prompt: 'Generate an image of a magical cat fairy monster with tiny wings, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'rudolph', name: '루돌프', prompt: 'Generate an image of a rudolph reindeer monster with glowing red nose, fantasy RPG style, chibi, simple design for kids game, white background' },
  { id: 'golden_dragon', name: '황금 드래곤', prompt: 'Generate an image of a golden dragon legendary boss with shiny scales, fantasy RPG style, chibi, kids game, white background' },
];

async function generateMonsterImage(monster: typeof monsters[0]): Promise<string | null> {
  // Gemini 3 Pro Image Preview 모델 사용
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: monster.prompt
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error for ${monster.name}:`, errorText);
      return null;
    }

    const data = await response.json();

    // 이미지 데이터 추출
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (part: { inlineData?: { mimeType: string; data: string } }) =>
        part.inlineData?.mimeType?.startsWith('image/')
    );

    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }

    console.log(`No image data for ${monster.name}`);
    // 텍스트 응답이 있으면 출력
    const textPart = parts.find((part: { text?: string }) => part.text);
    if (textPart?.text) {
      console.log(`Response: ${textPart.text.substring(0, 100)}...`);
    }
    return null;
  } catch (error) {
    console.error(`Failed to generate ${monster.name}:`, error);
    return null;
  }
}

async function saveImage(monster: typeof monsters[0], base64Data: string) {
  const filePath = path.join(OUTPUT_DIR, `${monster.id}.png`);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Saved: ${monster.name} -> ${filePath}`);
}

async function main() {
  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🎨 몬스터 이미지 생성 시작...\n');
  console.log('사용 모델: gemini-3-pro-image-preview\n');

  let successCount = 0;
  let failCount = 0;

  for (const monster of monsters) {
    console.log(`🔄 생성 중: ${monster.name}...`);

    const imageData = await generateMonsterImage(monster);

    if (imageData) {
      await saveImage(monster, imageData);
      successCount++;
    } else {
      console.log(`❌ 실패: ${monster.name}`);
      failCount++;
    }

    // API 속도 제한 방지 (이미지 생성은 시간이 걸림)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`\n✨ 완료! 성공: ${successCount}, 실패: ${failCount}`);
}

main().catch(console.error);
