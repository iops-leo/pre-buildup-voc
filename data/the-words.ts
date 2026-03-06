export interface TheWord {
  word: string;
  koreanHint: string;
  vowelSound: boolean; // true = "디" (thee), false = "더" (thuh)
  note?: string;
}

export const THE_WORDS: TheWord[] = [
  // ===== VOWEL SOUND ("디" thee) =====
  { word: "apple", koreanHint: "사과", vowelSound: true },
  { word: "egg", koreanHint: "달걀", vowelSound: true },
  { word: "ice cream", koreanHint: "아이스크림", vowelSound: true },
  { word: "orange", koreanHint: "오렌지", vowelSound: true },
  { word: "umbrella", koreanHint: "우산", vowelSound: true },
  { word: "elephant", koreanHint: "코끼리", vowelSound: true },
  { word: "uncle", koreanHint: "삼촌", vowelSound: true },
  { word: "airplane", koreanHint: "비행기", vowelSound: true },
  { word: "ocean", koreanHint: "바다", vowelSound: true },
  { word: "animal", koreanHint: "동물", vowelSound: true },
  { word: "ant", koreanHint: "개미", vowelSound: true },
  { word: "earth", koreanHint: "지구", vowelSound: true },
  { word: "island", koreanHint: "섬", vowelSound: true },
  { word: "eraser", koreanHint: "지우개", vowelSound: true },
  { word: "arm", koreanHint: "팔", vowelSound: true },
  { word: "eye", koreanHint: "눈", vowelSound: true },
  { word: "ear", koreanHint: "귀", vowelSound: true },
  { word: "evening", koreanHint: "저녁", vowelSound: true },
  { word: "old man", koreanHint: "노인", vowelSound: true },
  // Exceptions: consonant letter but vowel SOUND
  { word: "hour", koreanHint: "시간", vowelSound: true, note: "h가 묵음! '아워'로 발음해요" },
  { word: "honest person", koreanHint: "정직한 사람", vowelSound: true, note: "h가 묵음! '아니스트'로 발음해요" },
  { word: "honor", koreanHint: "명예", vowelSound: true, note: "h가 묵음! '아너'로 발음해요" },
  { word: "heir", koreanHint: "상속인", vowelSound: true, note: "h가 묵음! '에어'로 발음해요" },

  // ===== CONSONANT SOUND ("더" thuh) =====
  { word: "dog", koreanHint: "강아지", vowelSound: false },
  { word: "cat", koreanHint: "고양이", vowelSound: false },
  { word: "book", koreanHint: "책", vowelSound: false },
  { word: "school", koreanHint: "학교", vowelSound: false },
  { word: "teacher", koreanHint: "선생님", vowelSound: false },
  { word: "sun", koreanHint: "태양", vowelSound: false },
  { word: "moon", koreanHint: "달", vowelSound: false },
  { word: "star", koreanHint: "별", vowelSound: false },
  { word: "table", koreanHint: "탁자", vowelSound: false },
  { word: "window", koreanHint: "창문", vowelSound: false },
  { word: "flower", koreanHint: "꽃", vowelSound: false },
  { word: "house", koreanHint: "집", vowelSound: false },
  { word: "park", koreanHint: "공원", vowelSound: false },
  { word: "mountain", koreanHint: "산", vowelSound: false },
  { word: "river", koreanHint: "강", vowelSound: false },
  { word: "baby", koreanHint: "아기", vowelSound: false },
  // Exceptions: vowel letter but consonant SOUND
  { word: "university", koreanHint: "대학교", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
  { word: "uniform", koreanHint: "교복", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
  { word: "one", koreanHint: "하나", vowelSound: false, note: "'원'으로 시작하는 자음 소리예요!" },
  { word: "European country", koreanHint: "유럽 나라", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
  { word: "unicorn", koreanHint: "유니콘", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
  { word: "useful tool", koreanHint: "유용한 도구", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
  { word: "united team", koreanHint: "연합팀", vowelSound: false, note: "'유'로 시작하는 자음 소리예요!" },
];
