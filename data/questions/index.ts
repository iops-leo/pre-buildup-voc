/**
 * 문제 데이터 통합 인덱스
 */

export * from './math';
export * from './korean';
export * from './social';
export * from './science';

import { mathCategories, MathCategory } from './math';
import { koreanCategories, KoreanCategory } from './korean';
import { socialCategories, SocialCategory } from './social';
import { scienceCategories, ScienceCategory } from './science';

// 과목 타입
export type Subject = 'math' | 'korean' | 'social' | 'science';

// 난이도 타입
export type Difficulty = 'easy' | 'normal' | 'hard';

// 모든 카테고리
export const allCategories = {
  math: mathCategories,
  korean: koreanCategories,
  social: socialCategories,
  science: scienceCategories,
};

// 과목 정보
export const subjectInfo = {
  math: {
    name: '수학',
    emoji: '🔢',
    categories: {
      addition: '덧셈',
      subtraction: '뺄셈',
      multiplication: '구구단',
      division: '나눗셈',
    },
  },
  korean: {
    name: '국어',
    emoji: '📖',
    categories: {
      idiom: '사자성어',
      proverb: '속담',
      spelling: '맞춤법',
      antonym: '반대말',
    },
  },
  social: {
    name: '사회',
    emoji: '🌍',
    categories: {
      flag: '국기',
      capital: '수도',
      koreaGeography: '한국지리',
      worldGeography: '세계지리',
    },
  },
  science: {
    name: '과학',
    emoji: '🔬',
    categories: {
      solarSystem: '태양계',
      animal: '동물',
      element: '원소',
      humanBody: '인체',
    },
  },
};

// 난이도 정보
export const difficultyInfo = {
  easy: {
    name: '쉬움',
    emoji: '⭐',
    timeLimit: 15,
    damage: 10,
  },
  normal: {
    name: '보통',
    emoji: '⭐⭐',
    timeLimit: 10,
    damage: 15,
  },
  hard: {
    name: '어려움',
    emoji: '⭐⭐⭐',
    timeLimit: 7,
    damage: 25,
  },
};

// 랜덤 문제 가져오기
export function getRandomQuestion(
  subject: Subject,
  category: string,
  difficulty: Difficulty
) {
  const categoryData = (allCategories[subject] as any)[category];
  if (!categoryData) return null;

  const questions = categoryData[difficulty];
  if (!questions || questions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// 문제 세트 가져오기
export function getQuestionSet(
  subject: Subject,
  category: string,
  difficulty: Difficulty,
  count: number = 10
) {
  const categoryData = (allCategories[subject] as any)[category];
  if (!categoryData) return [];

  const questions = categoryData[difficulty];
  if (!questions || questions.length === 0) return [];

  // 셔플하고 count개 반환
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
