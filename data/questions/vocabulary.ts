/**
 * 영어 단어 → 레이드 문제 변환
 */

import { VOCABULARY_DATA, Vocabulary } from '@/data/vocabulary';
import type { Question } from './math';

/** 품사 표기 제거: "feel/felt (v.)" → "feel/felt" */
function cleanWord(word: string): string {
  return word.replace(/\s*\(.*?\)/g, '').trim();
}

/** 같은 Unit의 다른 단어들에서 오답 후보 가져오기 */
function getDistractors(
  unitIndex: number,
  correctWord: string,
  count: number
): string[] {
  const unit = VOCABULARY_DATA.units[unitIndex];
  if (!unit) return [];

  const allWords = unit.lessons
    .flatMap((l) => l.vocabulary)
    .map((v) => cleanWord(v.word))
    .filter((w) => w !== correctWord);

  // 셔플
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 단어 데이터에서 랜덤 레이드 문제 생성
 * - easy: 4지선다 (한글 뜻 보고 영단어 고르기)
 * - normal/hard: 타이핑 (한글 뜻 보고 영단어 입력)
 */
export function getRandomVocabQuestion(
  unitNum: number,
  lessonNum: number,
  difficulty: 'easy' | 'normal' | 'hard'
): Question | null {
  const unitIndex = unitNum - 1;
  const unit = VOCABULARY_DATA.units[unitIndex];
  if (!unit) return null;

  const lesson = unit.lessons.find((l) => l.lesson === lessonNum);
  if (!lesson || lesson.vocabulary.length === 0) return null;

  // 랜덤 단어 선택
  const vocab = lesson.vocabulary[Math.floor(Math.random() * lesson.vocabulary.length)];
  const correctAnswer = cleanWord(vocab.word);

  if (difficulty === 'easy') {
    // 4지선다
    const distractors = getDistractors(unitIndex, correctAnswer, 3);
    // 오답이 부족하면 타이핑으로 폴백
    if (distractors.length < 3) {
      return {
        q: `"${vocab.meaning}" 의 영어 단어는?`,
        a: correctAnswer,
      };
    }
    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
    return {
      q: `"${vocab.meaning}" 의 영어 단어는?`,
      a: correctAnswer,
      options,
    };
  }

  // normal / hard: 타이핑
  return {
    q: `"${vocab.meaning}" 의 영어 단어는?`,
    a: correctAnswer,
  };
}
