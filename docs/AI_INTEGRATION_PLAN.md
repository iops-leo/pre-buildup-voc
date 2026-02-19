# AI 기능 도입 계획서

> **프로젝트**: Pre-Build Up Voca
> **대상 사용자**: 한국 초등학생
> **AI 백엔드**: OpenRouter API
> **작성일**: 2026-02-20
> **문서 버전**: 1.0

---

## 목차

1. [현재 앱 분석 요약](#1-현재-앱-분석-요약)
2. [기술 아키텍처](#2-기술-아키텍처)
3. [AI 기능 상세 설계](#3-ai-기능-상세-설계)
4. [구현 로드맵](#4-구현-로드맵)
5. [파일 변경 매트릭스](#5-파일-변경-매트릭스)
6. [비용 예측](#6-비용-예측)
7. [보안 고려사항](#7-보안-고려사항)
8. [테스트 전략](#8-테스트-전략)
9. [향후 확장 가능성](#9-향후-확장-가능성)

---

## 1. 현재 앱 분석 요약

### 1.1 앱 구조

| 카테고리 | 상세 |
|----------|------|
| **프레임워크** | Next.js 16.1.0 (App Router) + TypeScript strict |
| **상태 관리** | Zustand 5.0.9 + persist (localStorage 키: `quiz-storage`, `settings-storage`) |
| **스타일링** | Tailwind CSS 3.4.17 + Framer Motion 12.23.26 |
| **데이터베이스** | Supabase (레이드 멀티플레이 전용), localStorage (학습 데이터) |
| **폰트** | Inter (Latin) + Noto Sans KR (한국어) |

### 1.2 주요 기능 현황

**메인 학습 시스템** (5가지 퀴즈 모드):

| 모드 | 표시 | 입력 방식 | 파일 위치 |
|------|------|-----------|-----------|
| `korean_to_english` | 한국어 뜻 | 타이핑 또는 객관식 (단어 길이 기반) | `components/QuizView.tsx:41` |
| `english_to_korean` | 영어 단어 (TTS 자동 재생) | 객관식 4지선다 | `components/QuizView.tsx:61-67` |
| `spelling` | 한국어 뜻 | 항상 타이핑 | `components/QuizView.tsx:41` |
| `speaking` | 한국어 뜻 + "Speak the English word!" | 마이크 음성 입력 | `components/QuizView.tsx:432-468` |
| `writing` | 한국어 뜻 | 종이에 쓴 후 정답 확인 + 자기 평가 | `components/QuizView.tsx:345-431` |

**몬스터 레이드** (솔로/멀티 퀴즈 배틀):
- 4개 월드 (숲속 마을, 얼음 동굴, 화산 지대, 유령의 성) + 히든 몬스터 5종
- 총 25개 몬스터 (`data/monsters.ts`)
- 8가지 특성 정의: `poison`, `freeze`, `burn`, `evade`, `drain`, `rage`, `invisible`, `revive` (`data/monsters.ts:5`)
- 5개 과목: 수학, 국어, 사회, 과학, 영어 단어 (`data/questions/index.ts:17`)
- 3단계 난이도: easy(15초), normal(10초), hard(7초) (`data/questions/index.ts:81-100`)

**게이미피케이션 시스템**:
- XP: 정답당 10점, 보너스 (100%=+50, 80%+=+20) (`store/useQuizStore.ts:956-959`)
- 레벨: `Math.floor(xp / 1000) + 1` (`store/useQuizStore.ts:1042`)
- 진화 시스템: 9단계 (Baby Egg -> God of Words) (`store/useQuizStore.ts:26-36`)
- 스트릭: 연속 학습일 추적 (`store/useQuizStore.ts:974-989`)
- 뱃지: 83개 (일반 62개 + 레이드 22개) (`store/useQuizStore.ts:50-759`)
- 타임챌린지: 시간 제한 퀴즈 (`components/TimeChallengeView.tsx`)
- 콤보/피버 시스템: 2+ 연속 정답 = 콤보, 5+ = 피버 모드 (`components/QuizView.tsx:241-242`)

**데이터 규모**:
- 단어: 2유닛 x 9레슨 = 229개 단어 (`data/vocabulary.ts`)
- 레이드 문제: 603개+ (수학 223, 사회 139, 국어 125, 과학 116) (`data/questions/`)
- 몬스터: 20+5(히든) = 25마리 (`data/monsters.ts`)

### 1.3 현재 UX 개선점 (AI로 해결 가능)

| # | 문제점 | 현재 상태 | 코드 위치 | AI 해결안 |
|---|--------|-----------|-----------|-----------|
| 1 | 오답 리뷰가 단순함 | 단어/뜻만 표시 + TTS 버튼 | `components/ResultView.tsx:200-222` | AI가 왜 틀렸는지 설명, 기억법 제공 |
| 2 | 복습 모드가 스펠링 고정 | `startReviewQuiz('spelling')` 하드코딩 | `components/LessonSelector.tsx:71` | AI가 단어별 최적 모드 선택 |
| 3 | 간격 반복(SRS) 없음 | 정답 시 `persistentWrongAnswers`에서 즉시 제거 | `store/useQuizStore.ts:928-932` | AI 기반 망각 곡선 스케줄링 |
| 4 | 단어 미리보기가 빈약 | word/meaning/definition 3줄만 표시 | `components/PreviewView.tsx:60-76` | 예문, 기억법, 관련어 생성 |
| 5 | 몬스터 특성 미구현 | 8가지 특성 타입 정의만 존재, 전투 로직 없음 | `data/monsters.ts:5`, `store/useRaidStore.ts:479-591` | AI로 특성 기반 문제 변형/힌트 생성 |
| 6 | 학습 인사이트 없음 | 숫자 통계만 표시 (총 퀴즈, 평균 점수 등) | `components/StatsView.tsx:34-90` | AI가 자연어로 학습 패턴 분석 |
| 7 | 레이드 결과 해설 없음 | 데미지/정확도 숫자만 표시 | `components/raid/RaidResult.tsx:134-339` | AI가 전투를 재미있게 스토리텔링 |
| 8 | 대시보드 추천 없음 | 레슨 목록만 나열 | `components/LessonSelector.tsx:229-252` | AI가 오늘의 학습 추천 |

### 1.4 뷰 흐름 현황

```
[LessonSelector] ──┬── startQuiz() ──→ [QuizView] ──→ endQuiz() ──→ [ResultView] ──→ resetQuiz() ──→ [LessonSelector]
                   ├── startPreview() → [PreviewView] ──→ startQuiz() ──→ [QuizView]
                   ├── onNavigate('stats') → [StatsView]
                   ├── onNavigate('settings') → [SettingsView]
                   ├── onNavigate('game') → [TimeChallengeView]
                   └── Link('/raid') → [RaidLobby] → [RaidWaitingRoom] → [RaidBattle] → [RaidResult]
```

뷰 라우팅 로직: `app/page.tsx:41-68` (조건 기반 렌더링)

---

## 2. 기술 아키텍처

### 2.1 OpenRouter 연동 구조

```
┌──────────────────────────────────────────────────────────────────┐
│                        브라우저 (클라이언트)                       │
├──────────────────────────────────────────────────────────────────┤
│  hooks/useAI.ts                                                  │
│    ├── ask(type, context) → POST /api/ai                         │
│    ├── isLoading: boolean                                        │
│    ├── error: string | null                                      │
│    └── 캐시 관리 (localStorage, 24시간 TTL)                       │
├──────────────────────────────────────────────────────────────────┤
│                              │                                    │
│                     fetch('/api/ai')                               │
│                              │                                    │
├──────────────────────────────▼───────────────────────────────────┤
│                    Next.js API Route                               │
│                    app/api/ai/route.ts                              │
├──────────────────────────────────────────────────────────────────┤
│  1. 요청 타입 검증 (type, context)                                │
│  2. 시스템 프롬프트 조합 (타입별 분기)                              │
│  3. Rate limiting 체크 (분당 10회)                                │
│  4. OpenRouter API 호출                                           │
│  5. 응답 정제 + 안전성 필터링                                      │
│  6. JSON 응답 반환                                                │
├──────────────────────────────────────────────────────────────────┤
│                              │                                    │
│              POST https://openrouter.ai/api/v1/chat/completions   │
│                              │                                    │
├──────────────────────────────▼───────────────────────────────────┤
│                      OpenRouter API                                │
│              모델: upstage/solar-pro-3:free                        │
│              (3월 2일까지 무료)                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 API 라우트 설계

#### `app/api/ai/route.ts` (신규, 메인 AI 엔드포인트)

```typescript
// 요청 인터페이스
interface AIRequest {
  type: AIRequestType;
  context: AIContext;
}

type AIRequestType =
  | 'explain_wrong'      // 오답 설명
  | 'memory_hint'        // 기억법 생성
  | 'example_sentence'   // 예문 생성
  | 'study_tip'          // 학습 조언
  | 'quiz_feedback'      // 퀴즈 결과 분석
  | 'word_compare'       // 유사 단어 비교
  | 'encourage'          // 격려 메시지
  | 'raid_commentary'    // 레이드 결과 해설
  | 'daily_recommend'    // 오늘의 추천
  | 'chat';              // 자유 채팅

interface AIContext {
  // 공통
  studentLevel?: number;
  studentXp?: number;
  streak?: number;

  // 단어 관련
  word?: string;
  meaning?: string;
  definition?: string;
  userAnswer?: string;

  // 퀴즈 결과
  correctWords?: string[];
  wrongWords?: { word: string; meaning: string; userAnswer?: string }[];
  percentage?: number;
  mode?: string;
  duration?: number;

  // 학습 통계
  weakWords?: string[];
  recentLessons?: string[];
  totalQuizzes?: number;
  avgScore?: number;

  // 레이드
  monsterName?: string;
  isVictory?: boolean;
  teamDamage?: number;
  myDamage?: number;
  comboMax?: number;
  raidDuration?: number;

  // 채팅
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
  userMessage?: string;
}

// 응답 인터페이스
interface AIResponse {
  success: boolean;
  data: string | object;
  cached?: boolean;
}
```

**핵심 구현 사항**:
- 환경변수: `OPENROUTER_API_KEY` (서버 전용, `.env.local`)
- 기본 모델: `upstage/solar-pro-3:free` (3월 2일까지 무료!)
- 무료 기간 종료 후 대안: `google/gemini-2.0-flash-001` (가성비 최고)
- 최대 응답 토큰: 300 (비용 절약, 채팅만 500)
- 시스템 프롬프트에 반드시 포함:
  - "한국 초등학생을 대상으로 쉽고 친근하게 한국어로 답변해줘."
  - "이모지를 적절히 사용해줘."
  - "영어 학습 관련 질문에만 답변해. 다른 주제는 거절해."
- HTTP 헤더: `HTTP-Referer`, `X-Title` 필수 (OpenRouter 정책)

#### Rate Limiting 구현

```typescript
// app/api/ai/route.ts 내부
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 분당 최대 호출
const RATE_WINDOW = 60 * 1000; // 1분

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
```

### 2.3 클라이언트 훅 설계

#### `hooks/useAI.ts` (신규)

```typescript
import { useState, useCallback, useRef } from 'react';

// 캐시 키 생성
function getCacheKey(type: AIRequestType, context: AIContext): string {
  // 단어 관련 요청만 캐시 (결과가 동일한 입력에 대해 동일)
  if (['memory_hint', 'example_sentence'].includes(type) && context.word) {
    return `ai_cache_${type}_${context.word}`;
  }
  return ''; // 캐시 안 함
}

// 캐시 유효 시간: 24시간
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getFromCache(key: string): string | null {
  if (!key) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const { data, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > CACHE_TTL) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
}

function setToCache(key: string, data: string): void {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

export interface UseAIReturn {
  ask: (type: AIRequestType, context: AIContext) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(async (type: AIRequestType, context: AIContext): Promise<string> => {
    // 1. 캐시 확인
    const cacheKey = getCacheKey(type, context);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // 2. 이전 요청 취소
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI 요청 실패 (${res.status})`);
      }

      const json: AIResponse = await res.json();
      const result = typeof json.data === 'string' ? json.data : JSON.stringify(json.data);

      // 3. 캐시 저장
      setToCache(cacheKey, result);

      return result;
    } catch (err: any) {
      if (err.name === 'AbortError') return '';
      const message = err.message || 'AI 요청 중 오류 발생';
      setError(message);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { ask, isLoading, error, clearError };
}
```

### 2.4 비용 관리 전략

| 전략 | 구현 방식 | 절감 효과 |
|------|-----------|-----------|
| **클라이언트 캐싱** | 동일 단어 설명은 localStorage에 24시간 캐시 | ~40% 호출 감소 |
| **Rate Limiting** | 서버 측 IP 기반 분당 10회 제한 | 남용 방지 |
| **토큰 제한** | `max_tokens: 300` (채팅만 500) | 응답당 비용 제한 |
| **배치 처리** | 미리보기 시 여러 단어를 한 번에 요청 | ~60% 호출 감소 |
| **조건부 호출** | 오답 2개 이상일 때만 퀴즈 분석 AI 호출 | 불필요 호출 제거 |
| **일 1회 제한** | 대시보드 추천은 날짜 기반 캐시 | 반복 호출 방지 |

---

## 3. AI 기능 상세 설계

### 기능 1: 오답 AI 해설

**우선순위**: ★★★★★ (가장 임팩트 큼)
**난이도**: 쉬움
**예상 개발 시간**: 3-4시간

**위치**: `components/ResultView.tsx` - 오답 리뷰 섹션 (라인 200-222)

**현재 코드** (`ResultView.tsx:200-219`):
```tsx
{result.totalQuestions - result.correctAnswers > 0 && (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-300 px-2 flex items-center gap-2">
            <RefreshCw size={18} className="text-orange-400" /> Review Incorrect Answers
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 shadow-sm">
            {store.wrongAnswers.map((word, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between group hover:bg-slate-800 transition-colors">
                    <div>
                        <div className="text-lg font-bold text-slate-200">{word.word}</div>
                        <div className="text-sm text-slate-500">{word.meaning}</div>
                    </div>
                    <button onClick={() => speak(word.word)} ...>
                        <Volume2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    </div>
)}
```

**변경 계획**:
- 각 오답 단어 옆에 "AI 해설" 토글 버튼 추가
- 클릭 시 `useAI().ask('explain_wrong', ...)` 호출
- 말풍선(tooltip) 형태로 해설 표시
- 로딩 중 스켈레톤 애니메이션

**트리거**: 퀴즈 종료 후 틀린 단어 아이템 클릭 또는 "AI 해설" 버튼 탭

**프롬프트 설계**:
```
시스템: 너는 한국 초등학생의 영어 선생님이야. 쉽고 재미있게 설명해줘. 이모지를 사용해. 2-3줄로 간결하게 답해.

유저:
학생이 "${meaning}"의 영어 단어를 묻는 문제에서 "${userAnswer}"라고 답했어요.
정답은 "${word}"이에요.
왜 헷갈릴 수 있는지, 어떻게 외우면 좋을지 설명해주세요.
```

**예상 AI 응답**:
> "worried"와 "worried"는 비슷하게 들리지만 다른 뜻이에요! "worried"는 "걱정스러운"이라는 뜻이에요. "worry"에서 왔어요. 걱정하는 친구가 이마를 찌푸리는 모습을 상상해보세요! 😟

**UI 와이어프레임**:
```
┌──────────────────────────────────────────┐
│  worried (adj.)                    🔊 💡 │  ← 💡 = AI 해설 버튼
│  걱정스러운                               │
│  ┌────────────────────────────────────┐   │
│  │ 🤖 AI 선생님:                      │   │  ← 토글로 열림/닫힘
│  │ "worried"는 "worry(걱정하다)"에서   │   │
│  │ 왔어요! 걱정하는 친구의 찡그린     │   │
│  │ 표정을 떠올려보세요! 😟             │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

### 기능 2: 단어 미리보기 강화

**우선순위**: ★★★★☆
**난이도**: 쉬움
**예상 개발 시간**: 3-4시간

**위치**: `components/PreviewView.tsx` - 단어 카드 (라인 53-91)

**현재 코드** (`PreviewView.tsx:60-76`):
```tsx
<div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
            {idx + 1}
        </span>
        <h3 className="text-lg md:text-xl font-bold text-white break-keep">
            {word.word}
        </h3>
    </div>
    <p className="text-base md:text-lg text-blue-400 font-medium mb-2 break-keep">
        {word.meaning}
    </p>
    <p className="text-sm text-slate-500 leading-relaxed">
        {word.definition}
    </p>
</div>
```

**변경 계획**:
- 각 단어 카드에 확장 가능한 "AI 도우미" 섹션 추가
- "예문 보기" / "기억법" 버튼
- 배치 요청: 레슨 진입 시 전체 단어에 대해 한 번에 AI 요청 (선택적)

**프롬프트 설계** (배치 - 단어 3-5개씩):
```
시스템: 한국 초등학생의 영어 선생님. JSON 형식으로만 답변.

유저:
다음 영어 단어들에 대해 각각 예문 2개(영어+한국어)와 기억법 1개를 만들어줘.

단어:
1. "feel/felt" (느끼다)
2. "bored" (지루한)
3. "worried" (걱정스러운)

JSON 형식:
[
  {
    "word": "feel/felt",
    "examples": [
      { "en": "I feel happy today.", "ko": "나는 오늘 행복해." },
      { "en": "She felt cold.", "ko": "그녀는 추웠어." }
    ],
    "memoryTip": "feel은 '필'로 읽어요. 피부로 '필'링(feeling)하는 거예요!"
  },
  ...
]
```

**UI 와이어프레임**:
```
┌──────────────────────────────────────────┐
│  1  feel/felt (v.)                  🔊   │
│     느끼다                                │
│     to sense or be aware of              │
│  ┌────────────────────────────────────┐   │
│  │ 📝 예문:                           │   │  ← 확장 시 표시
│  │   • I feel happy today.           │   │
│  │     (나는 오늘 행복해.)             │   │
│  │   • She felt cold.                │   │
│  │     (그녀는 추웠어.)               │   │
│  │ 💡 기억법:                         │   │
│  │   feel은 '필'로 읽어요. 피부로     │   │
│  │   '필'링(feeling)하는 거예요!      │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

### 기능 3: 퀴즈 결과 AI 분석

**우선순위**: ★★★★☆
**난이도**: 보통
**예상 개발 시간**: 4-5시간

**위치**: `components/ResultView.tsx` - 상단 결과 요약 영역 (라인 112-197 사이에 추가)

**트리거**: 퀴즈 종료 시 자동 호출 (조건: 오답 2개 이상)

**데이터 수집** (`store/useQuizStore.ts:951-1020`에서 가져올 수 있는 정보):
- `correctAnswers`: 맞은 개수
- `wrongAnswers[]`: 틀린 단어 목록 (Vocabulary[])
- `questions[]`: 전체 문제 목록
- `mode`: 퀴즈 모드
- `startTime` / 종료 시간: 소요 시간
- `quizHistory[]`: 최근 50개 기록
- `streak`: 연속 학습일

**프롬프트 설계**:
```
시스템: 한국 초등학생의 영어 선생님. 학습 분석가. 격려하면서도 구체적인 조언을 해줘. 3-4줄로 답변.

유저:
학생의 퀴즈 결과를 분석해줘.

모드: ${mode}
점수: ${percentage}% (${correctAnswers}/${totalQuestions})
소요 시간: ${durationSeconds}초
맞은 단어: ${correctWords.join(', ')}
틀린 단어: ${wrongWords.map(w => `${w.word}(${w.meaning})`).join(', ')}
연속 학습일: ${streak}일
최근 5회 평균: ${recentAvg}%

패턴 분석과 다음 학습 추천을 해줘.
```

**예상 AI 응답**:
> 🎯 오늘 80%를 맞았어요! 감정 관련 단어(worried, afraid)에서 좀 헷갈렸네요. 이 단어들은 비슷한 느낌이라 구분이 어려울 수 있어요. 다음에는 Lesson 1을 영→한 모드로 복습하면 확실히 외울 수 있을 거예요! 3일 연속 공부 중이라 대단해요! 🔥

**UI**: 결과 카드 아래, 오답 리뷰 위에 보라색 그라데이션 배경 카드로 표시

---

### 기능 4: AI 학습 대시보드

**우선순위**: ★★★☆☆
**난이도**: 보통
**예상 개발 시간**: 4-5시간

**위치**: `components/LessonSelector.tsx` - 헤더(`77-84`) 아래, 게이미피케이션 대시보드(`87-143`) 위에 추가

**트리거**: 앱 첫 진입 시 (하루 1회, 날짜 기반 캐시)

**캐시 전략**:
```typescript
const cacheKey = `ai_daily_${new Date().toISOString().split('T')[0]}`;
// localStorage에 날짜별로 저장, 다음 날 자동 갱신
```

**데이터 수집** (`store/useQuizStore.ts`에서):
- `level`, `xp`, `streak` (라인 779-782)
- `persistentWrongAnswers` (라인 773): 약한 단어
- `quizHistory` (라인 775): 최근 학습 기록
- `lessonProgress` (라인 776): 레슨별 최고 점수
- `earnedBadges` (라인 783): 뱃지 수

**프롬프트 설계**:
```
시스템: 한국 초등학생의 영어 학습 코치. 친근하고 격려하는 톤. 2-3줄.

유저:
학생 정보:
- 레벨 ${level} (${getLevelTitle(level).title}), XP: ${xp}
- 연속 학습: ${streak}일
- 뱃지: ${earnedBadges.length}/${BADGES.length}개
- 약한 단어 ${persistentWrongAnswers.length}개: ${weakWordsPreview}
- 최근 학습: ${recentLessonsPreview}
- 안 한지 오래된 레슨: ${staleLessons}
- 평균 점수: ${avgScore}%

오늘의 학습 추천과 짧은 격려 메시지를 만들어줘.
추천은 구체적으로 (어떤 유닛의 어떤 레슨을 어떤 모드로) 알려줘.
```

**예상 AI 응답**:
> 좋은 아침이에요! 🌟 3일 연속 공부 중이라 멋져요! 오늘은 **Unit 1 Lesson 4**를 스펠링 모드로 도전해보는 건 어때요? 2주 동안 안 했거든요. 복습 단어 5개도 잊지 마세요! 화이팅! 💪

**UI 와이어프레임**:
```
┌──────────────────────────────────────────┐
│  🤖 AI 코치의 오늘의 추천                  │
│  ──────────────────────────────────────── │
│  좋은 아침이에요! 🌟 3일 연속 공부 중이라    │
│  멋져요! 오늘은 Unit 1 Lesson 4를 스펠링   │
│  모드로 도전해보는 건 어때요?               │
│                                          │
│  [바로 시작하기 →]                         │  ← 추천 레슨으로 바로 이동
│                              [닫기]       │
└──────────────────────────────────────────┘
```

---

### 기능 5: AI 채팅 튜터

**우선순위**: ★★★☆☆
**난이도**: 보통~어려움
**예상 개발 시간**: 6-8시간

**위치**: 새로운 뷰 `components/AIChatView.tsx` (신규 파일)

**접근 경로**:
- `components/LessonSelector.tsx` 내비게이션 메뉴 (라인 170-208)에 "AI 선생님" 버튼 추가
- `app/page.tsx` 뷰 라우터에 `'ai-chat'` 뷰 타입 추가 (라인 15, 41-68)

**시스템 프롬프트**:
```
너는 한국 초등학생의 영어 단어 선생님 "보카봇"이야.

규칙:
1. 항상 한국어로 답해 (영어 단어나 예문은 영어로).
2. 초등학생이 이해할 수 있게 쉽고 짧게 설명해.
3. 영어 단어 학습에 관련된 질문에만 답해.
4. 관련 없는 질문 (게임, 유튜브, 개인정보 등)에는 "나는 영어 단어 선생님이라 그건 잘 모르겠어! 😅 영어 단어에 대해 물어봐!"라고 답해.
5. 이모지를 적절히 사용해.
6. 답변은 5줄 이내로 해.

현재 학생이 배우고 있는 단어 목록:
${vocabularyContext}
```

**기능 범위 (허용 질문 예시)**:
- "feel이랑 think 차이가 뭐야?"
- "scared를 사용한 문장 만들어줘"
- "Unit 1에서 가장 어려운 단어가 뭐야?"
- "이 단어를 어떻게 발음해?"
- "bored랑 boring 차이는?"
- "숙제라는 뜻의 영어 단어가 뭐야?"

**차단할 질문**:
- 개인정보 (이름, 학교, 주소)
- 학습 무관 (게임, 유튜브, 음식)
- 부적절한 내용

**대화 히스토리 관리**:
- 세션 내 최대 20개 메시지 유지
- 페이지 이탈 시 초기화 (localStorage에 저장하지 않음)
- 메모리 절약을 위해 오래된 메시지는 요약 후 제거

**UI 디자인 상세**:

```
┌──────────────────────────────────────────┐
│  ← 뒤로          AI 영어 선생님 🤖       │  ← 헤더
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────┐             │
│  │ 🤖 안녕! 나는 보카봇이야!│             │  ← AI 메시지 (보라 배경)
│  │ 영어 단어에 대해 뭐든    │             │
│  │ 물어봐!                  │             │
│  └─────────────────────────┘             │
│                                          │
│             ┌────────────────────────┐    │
│             │ feel이랑 think         │    │  ← 사용자 메시지 (파랑 배경)
│             │ 차이가 뭐야?           │    │
│             └────────────────────────┘    │
│                                          │
│  ┌─────────────────────────┐             │
│  │ 🤖 좋은 질문이야! 😊     │             │
│  │ feel = 느끼다 (감정/감각) │             │
│  │ think = 생각하다 (머리로) │             │
│  │                         │             │
│  │ "I feel sad" = 슬퍼      │             │
│  │ "I think it's good"     │             │
│  │ = 좋다고 생각해          │             │
│  └─────────────────────────┘             │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ [예문 요청] [단어 비교] [발음 듣기]│    │  ← 빠른 질문 버튼
│  └──────────────────────────────────┘    │
│  ┌────────────────────────────┐ [전송]   │  ← 입력창
│  │ 메시지를 입력하세요...      │          │
│  └────────────────────────────┘          │
└──────────────────────────────────────────┘
```

**빠른 질문 버튼** (프리셋):
1. "예문 만들어줘" - 마지막 대화의 단어로 예문 생성
2. "비슷한 단어" - 마지막 단어와 유사어 비교
3. "발음 도와줘" - 마지막 단어의 발음 가이드

**컴포넌트 구조**:
```typescript
// components/AIChatView.tsx

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatViewProps {
  onBack: () => void;
}

export const AIChatView = ({ onBack }: AIChatViewProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const { ask, isLoading } = useAI();
  // ...
};
```

---

### 기능 6: 스마트 복습 시스템 (SRS)

**우선순위**: ★★☆☆☆
**난이도**: 어려움
**예상 개발 시간**: 8-12시간

**위치**: `store/useQuizStore.ts` + 새로운 뷰 `components/SmartReviewView.tsx`

**현재 문제** (`store/useQuizStore.ts:918-939`):
```typescript
submitAnswer: (isCorrect, word) => {
    set((state) => {
        // ...
        // 정답 시 persistentWrongAnswers에서 해당 단어 제거 (즉시!)
        if (isCorrect) {
            finalPersistent = uniquePersistent.filter(w => w.word !== word.word);
        }
        return { persistentWrongAnswers: finalPersistent };
    });
},
```

한 번 맞추면 바로 복습 목록에서 사라지므로, 장기 기억으로 전이되지 않음.

**새 데이터 모델** (`store/useQuizStore.ts`에 추가):
```typescript
interface WordLearningState {
  wordKey: string;           // "feel/felt" (고유 식별자)
  unitLesson: string;        // "1-1" (유닛-레슨)
  correctCount: number;      // 누적 정답 횟수
  wrongCount: number;        // 누적 오답 횟수
  lastStudiedAt: string;     // ISO date
  nextReviewAt: string;      // ISO date (SRS 간격 계산)
  interval: number;          // 현재 복습 간격 (일 단위)
  easeFactor: number;        // 2.5 기본, 난이도에 따라 조정
  difficultyScore: number;   // 0-1 (0=매우 쉬움, 1=매우 어려움)
  bestMode: QuizMode | null; // AI가 추천한 최적 모드
}
```

**SRS 알고리즘 (SM-2 변형, 초등학생용 단순화)**:
```typescript
function calculateNextReview(
  isCorrect: boolean,
  currentInterval: number,
  easeFactor: number
): { nextInterval: number; newEaseFactor: number } {
  if (isCorrect) {
    const nextInterval = currentInterval === 0
      ? 1    // 첫 정답: 1일 후
      : currentInterval === 1
        ? 3    // 두 번째 정답: 3일 후
        : Math.round(currentInterval * easeFactor); // 그 이후: 간격 * 난이도 계수
    return {
      nextInterval: Math.min(nextInterval, 30), // 최대 30일
      newEaseFactor: Math.min(easeFactor + 0.1, 3.0),
    };
  } else {
    return {
      nextInterval: 0, // 오답: 즉시 복습 대기
      newEaseFactor: Math.max(easeFactor - 0.2, 1.3),
    };
  }
}
```

**AI 역할**: 단어별 최적 학습 모드 추천
```
시스템: 학습 분석가. JSON으로만 답변.

유저:
학생의 단어별 학습 데이터를 보고 각 단어에 가장 적합한 퀴즈 모드를 추천해줘.

단어 데이터:
${words.map(w => `${w.wordKey}: 정답 ${w.correctCount}회, 오답 ${w.wrongCount}회, 난이도 ${w.difficultyScore}`).join('\n')}

모드 옵션: korean_to_english, english_to_korean, spelling, speaking, writing

응답 형식: [{ "word": "feel/felt", "recommendedMode": "spelling", "reason": "스펠링 오답이 많음" }]
```

**Zustand 스토어 변경** (`store/useQuizStore.ts`):
```typescript
// 새로운 persisted state 추가
wordLearningStates: Record<string, WordLearningState>;

// 새로운 액션
updateWordLearning: (wordKey: string, isCorrect: boolean) => void;
getDueReviewWords: () => WordLearningState[];
startSmartReview: () => void;
```

---

### 기능 7: 레이드 AI 해설자

**우선순위**: ★★☆☆☆
**난이도**: 쉬움
**예상 개발 시간**: 2-3시간

**위치**: `components/raid/RaidResult.tsx` (라인 144-169 뒤에 추가)

**현재 코드** (`RaidResult.tsx:146-169`):
```tsx
<motion.div ... className="text-center">
    <motion.div className="text-8xl mb-4">
        {isVictory ? '🏆' : '💀'}
    </motion.div>
    <h1 className={`text-5xl font-black mb-2 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
        {isVictory ? '승리!' : '패배...'}
    </h1>
    <p className="text-slate-400 text-sm">
        {isVictory
            ? `${monster?.name}을(를) 물리쳤습니다!`
            : `${monster?.name}에게 패배했습니다.`}
    </p>
</motion.div>
```

**변경 계획**: 승리/패배 텍스트 아래에 AI 해설 카드 추가

**프롬프트 설계**:
```
시스템: 초등학생을 위한 재미있는 게임 실황 해설자. 흥분된 톤으로 해설. 이모지 많이 사용. 3-4줄.

유저:
레이드 결과를 재미있게 해설해줘!

몬스터: ${monsterName} (${monsterEmoji})
결과: ${isVictory ? '승리' : '패배'}
내 데미지: ${myDamage}
팀 정확도: ${teamAccuracy}%
최대 콤보: ${maxCombo}
클리어 시간: ${durationText}
남은 HP: ${remainingHp}/${maxHp}
```

**예상 AI 응답 (승리)**:
> 🔥 화염왕과의 대결에서 멋진 승리! 정확도 85%로 총 데미지 2,340을 뽑아냈어! 특히 10콤보 연속은 정말 대단했어! ⚡ 화염왕도 깜짝 놀랐을 거야! 다음 보스도 이렇게 해치우자! 🏆

**예상 AI 응답 (패배)**:
> 😤 아쉬워! 얼음 여왕한테 지긴 했지만, 7콤보까지 갔잖아! 정확도 65%는 조금만 더 연습하면 올릴 수 있어! 다음에는 국어 맞춤법을 좀 더 연습하고 다시 도전하자! 💪

---

## 4. 구현 로드맵

### Phase 1: 기반 구축 (1일)

| # | 작업 | 파일 | 상세 |
|---|------|------|------|
| 1-1 | OpenRouter API 라우트 생성 | `app/api/ai/route.ts` (신규) | POST 핸들러, 타입별 프롬프트 분기, rate limiting |
| 1-2 | AI 타입 정의 | `types/ai.ts` (신규) | AIRequestType, AIContext, AIResponse 인터페이스 |
| 1-3 | AI 훅 생성 | `hooks/useAI.ts` (신규) | fetch 래퍼, 캐싱, 에러 핸들링, 로딩 상태 |
| 1-4 | 환경변수 설정 | `.env.local` (수정) | `OPENROUTER_API_KEY` 추가 |
| 1-5 | 프롬프트 템플릿 | `lib/ai-prompts.ts` (신규) | 타입별 시스템/유저 프롬프트 관리 |
| 1-6 | 캐싱 유틸리티 | `lib/ai-cache.ts` (신규) | localStorage 기반 TTL 캐시 |

### Phase 2: 핵심 기능 (2-3일)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 2-1 | 오답 AI 해설 UI | `components/ResultView.tsx` (수정) | Phase 1 완료 |
| 2-2 | 단어 미리보기 강화 | `components/PreviewView.tsx` (수정) | Phase 1 완료 |
| 2-3 | 퀴즈 결과 AI 분석 | `components/ResultView.tsx` (수정) | Phase 1 완료 |
| 2-4 | AI 로딩 컴포넌트 | `components/AIBubble.tsx` (신규) | 재사용 가능한 AI 응답 말풍선 |

### Phase 3: 대화형 기능 (2-3일)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 3-1 | AI 채팅 튜터 뷰 생성 | `components/AIChatView.tsx` (신규) | Phase 1 완료 |
| 3-2 | 뷰 라우터에 채팅 추가 | `app/page.tsx` (수정) | 3-1 완료 |
| 3-3 | 내비게이션에 AI 버튼 | `components/LessonSelector.tsx` (수정) | 3-1 완료 |
| 3-4 | 학습 대시보드 AI 추천 | `components/LessonSelector.tsx` (수정) | Phase 1 완료 |
| 3-5 | 레이드 AI 해설 | `components/raid/RaidResult.tsx` (수정) | Phase 1 완료 |

### Phase 4: 고급 기능 (3-5일)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 4-1 | WordLearningState 모델 추가 | `store/useQuizStore.ts` (수정) | - |
| 4-2 | SRS 알고리즘 구현 | `lib/srs.ts` (신규) | 4-1 완료 |
| 4-3 | 스마트 복습 뷰 | `components/SmartReviewView.tsx` (신규) | 4-1, 4-2 완료 |
| 4-4 | AI 최적 모드 추천 | `hooks/useAI.ts` (확장) | Phase 1 + 4-1 완료 |
| 4-5 | 복습 알림 연동 | `hooks/useNotification.ts` (수정) | 4-1 완료 |
| 4-6 | 적응형 난이도 조절 | `store/useQuizStore.ts` (수정) | 4-1, 4-2 완료 |

### 전체 타임라인

```
Week 1:
  Day 1: Phase 1 (기반 구축) ─────────────────────── ✅
  Day 2-3: Phase 2 (오답 해설, 미리보기, 결과 분석) ── ✅
  Day 4-5: Phase 3 (채팅 튜터, 대시보드, 레이드 해설) ─ ✅

Week 2:
  Day 6-10: Phase 4 (SRS, 적응형 난이도) ───────────── ✅
```

**총 예상 개발 기간**: 8-12일

---

## 5. 파일 변경 매트릭스

### 신규 파일

| 파일 | Phase | 설명 | 예상 라인 수 |
|------|-------|------|-------------|
| `app/api/ai/route.ts` | 1 | OpenRouter API 연동 메인 라우트 | ~200 |
| `types/ai.ts` | 1 | AI 관련 타입 정의 | ~80 |
| `hooks/useAI.ts` | 1 | AI 호출 커스텀 훅 | ~120 |
| `lib/ai-prompts.ts` | 1 | 프롬프트 템플릿 관리 | ~150 |
| `lib/ai-cache.ts` | 1 | 캐시 유틸리티 | ~50 |
| `components/AIBubble.tsx` | 2 | AI 응답 말풍선 컴포넌트 | ~80 |
| `components/AIChatView.tsx` | 3 | AI 채팅 튜터 뷰 | ~300 |
| `components/SmartReviewView.tsx` | 4 | 스마트 복습 뷰 | ~250 |
| `lib/srs.ts` | 4 | SRS 알고리즘 | ~100 |

### 수정 파일

| 파일 | Phase | 변경 사항 | 영향 범위 |
|------|-------|-----------|-----------|
| `.env.local` | 1 | `OPENROUTER_API_KEY` 환경변수 추가 | 환경 설정 |
| `components/ResultView.tsx` | 2 | 오답 AI 해설 + 퀴즈 결과 분석 추가 | 라인 200-222 주변 수정, 112-197 사이 추가 |
| `components/PreviewView.tsx` | 2 | 단어 카드에 AI 예문/기억법 확장 섹션 | 라인 53-91 주변 수정 |
| `components/LessonSelector.tsx` | 3 | AI 대시보드 추천 카드 + AI 선생님 네비 버튼 | 라인 77-84 사이 추가, 170-208 수정 |
| `components/raid/RaidResult.tsx` | 3 | AI 전투 해설 카드 추가 | 라인 169 이후 추가 |
| `app/page.tsx` | 3 | `ViewType`에 `'ai-chat'` 추가, 렌더링 분기 | 라인 15, 41-68 수정 |
| `store/useQuizStore.ts` | 4 | `WordLearningState` 모델, SRS 액션 추가 | 라인 761-822 인터페이스 확장, persist 섹션 수정 |
| `hooks/useNotification.ts` | 4 | SRS 복습 알림 트리거 추가 | 기존 로직에 조건 추가 |

### Phase별 변경 요약

| 파일 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|:-------:|:-------:|:-------:|:-------:|
| `app/api/ai/route.ts` | 신규 | 확장 | 확장 | 확장 |
| `types/ai.ts` | 신규 | - | 확장 | 확장 |
| `hooks/useAI.ts` | 신규 | - | - | 확장 |
| `lib/ai-prompts.ts` | 신규 | 확장 | 확장 | 확장 |
| `lib/ai-cache.ts` | 신규 | - | - | - |
| `components/AIBubble.tsx` | - | 신규 | - | - |
| `components/ResultView.tsx` | - | 수정 | - | - |
| `components/PreviewView.tsx` | - | 수정 | - | - |
| `components/AIChatView.tsx` | - | - | 신규 | - |
| `components/LessonSelector.tsx` | - | - | 수정 | - |
| `components/raid/RaidResult.tsx` | - | - | 수정 | - |
| `app/page.tsx` | - | - | 수정 | 수정 |
| `store/useQuizStore.ts` | - | - | - | 수정 |
| `components/SmartReviewView.tsx` | - | - | - | 신규 |
| `lib/srs.ts` | - | - | - | 신규 |
| `hooks/useNotification.ts` | - | - | - | 수정 |
| `.env.local` | 수정 | - | - | - |

---

## 6. 비용 예측

### 6.1 사용 모델

**`upstage/solar-pro-3:free`** - 3월 2일까지 무료!

| 항목 | 상세 |
|------|------|
| 모델 | Upstage Solar Pro 3 |
| 비용 | **무료** (2026년 3월 2일까지) |
| 한국어 품질 | ★★★★★ (한국 회사, 한국어 특화) |
| 응답 속도 | 빠름 |
| 적합도 | 초등학생 영어 학습 앱에 최적 |

> Solar Pro 3는 한국 AI 기업 Upstage가 만든 모델로, 한국어 이해도가 매우 높아서 초등학생 대상 학습 앱에 적합합니다.

**무료 기간 종료 후 대안 모델**:

| 모델 | 입력 비용 (/1M 토큰) | 출력 비용 (/1M 토큰) | 한국어 품질 | 비고 |
|------|---------------------|---------------------|-----------|------|
| `google/gemini-2.0-flash-001` | $0.10 | $0.40 | ★★★★☆ | 가성비 최고 |
| `openai/gpt-4o-mini` | $0.15 | $0.60 | ★★★★☆ | 안정적 |
| `meta-llama/llama-3.1-8b-instruct` | $0.05 | $0.08 | ★★★☆☆ | 최저가 |

### 6.2 비용 요약

**현재 (~ 3월 2일)**: 모든 기능 **완전 무료** (Solar Pro 3 free tier)

**3월 2일 이후 (유료 전환 시)**: `gemini-2.0-flash-001` 기준

| 사용 수준 | 일 호출 수 | 월 비용 |
|-----------|-----------|---------|
| 가벼운 사용 (하루 1회 학습) | ~6회 | ~$0.02 (약 25원) |
| 적극적 사용 (하루 3회 + 채팅) | ~27회 | ~$0.40 (약 530원) |
| 헤비 사용 (하루 5회 + 채팅 많이) | ~50회 | ~$0.78 (약 1,040원) |
| **학생 50명 (적극적)** | - | **~$20/월 (약 26,600원)** |

> 무료 기간 동안 충분히 테스트하고, 3월 2일 이후 사용량 기반으로 최적 유료 모델을 결정합니다.
| 학생 100명 | $40.0 (약 53,200원) | $480 (약 640,000원) |

> **결론**: 채팅 기능을 Haiku 대신 Flash로 전환하면 비용이 약 90% 절감됨.
> Flash 전용 구성 시 50명 기준 월 $6 미만으로 운영 가능.

### 6.5 비용 최적화 추가 전략

| 전략 | 절감 효과 | 구현 난이도 |
|------|-----------|------------|
| 채팅도 Flash 모델 사용 | ~90% 절감 (채팅 부분) | 즉시 적용 |
| 응답 캐싱 확대 (72시간) | ~20% 추가 절감 | 쉬움 |
| 오프라인 기억법 데이터 사전 생성 | ~30% 절감 (미리보기) | 보통 (1회 작업) |
| 채팅 무료 할당량 제한 (일 5회) | 비용 상한 설정 | 쉬움 |
| Llama 3.1 8B로 단순 기능 분리 | ~50% 절감 (격려/기억법) | 보통 |

---

## 7. 보안 고려사항

### 7.1 API 키 보안

| 항목 | 구현 방법 |
|------|-----------|
| API 키 저장 | `.env.local` 서버 전용 (절대 `NEXT_PUBLIC_` 접두사 사용 금지) |
| 클라이언트 노출 | 불가능 (API Route를 통해서만 접근) |
| Git 보호 | `.gitignore`에 `.env.local` 포함 확인 |
| 프로덕션 환경 | Vercel 환경변수 또는 배포 플랫폼의 시크릿 매니저 사용 |

### 7.2 초등학생 안전성

이 앱은 **초등학생**을 대상으로 하므로 AI 안전성이 특히 중요함.

**시스템 프롬프트 안전 가드레일**:
```
절대 지켜야 할 규칙:
1. 영어 단어 학습에 관련된 질문에만 답변해.
2. 폭력적, 성적, 혐오적 내용을 절대 포함하지 마.
3. 개인정보(이름, 학교, 주소, 전화번호)를 물어보거나 답변에 포함하지 마.
4. 다른 웹사이트, 앱, 게임으로 유도하지 마.
5. 학생이 위험한 질문을 하면 "선생님이나 부모님께 이야기해보세요!"라고 답해.
6. 항상 긍정적이고 격려하는 톤을 유지해.
```

**서버 측 필터링** (`app/api/ai/route.ts`):
```typescript
// 입력 검증
function sanitizeInput(text: string): string {
  // 개인정보 패턴 제거
  return text
    .replace(/\d{3}[-.]?\d{3,4}[-.]?\d{4}/g, '[번호 삭제됨]')  // 전화번호
    .replace(/\d{6}[-]?\d{7}/g, '[번호 삭제됨]')                 // 주민번호
    .slice(0, 500);  // 최대 500자 제한
}

// 출력 검증
function validateResponse(response: string): string {
  const blockedPatterns = [
    /https?:\/\/[^\s]+/g,      // URL 차단
    /\d{3}[-.]?\d{3,4}[-.]?\d{4}/g,  // 전화번호
  ];

  let cleaned = response;
  blockedPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '[내용 삭제됨]');
  });
  return cleaned;
}
```

### 7.3 Rate Limiting & 남용 방지

| 제한 | 값 | 구현 위치 |
|------|------|-----------|
| 분당 호출 제한 | 10회/IP | `app/api/ai/route.ts` |
| 일일 채팅 제한 | 50메시지/사용자 | `components/AIChatView.tsx` (localStorage 카운터) |
| 입력 길이 제한 | 500자 | 서버 + 클라이언트 양쪽 검증 |
| 출력 토큰 제한 | 300 (채팅 500) | OpenRouter API 파라미터 |

### 7.4 에러 핸들링

```typescript
// app/api/ai/route.ts
export async function POST(request: Request) {
  try {
    // 1. API 키 확인
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'AI 서비스가 설정되지 않았어요.' },
        { status: 503 }
      );
    }

    // 2. Rate limit 확인
    // 3. 입력 검증
    // 4. OpenRouter 호출
    // 5. 타임아웃 처리 (10초)
    // 6. 응답 검증 + 필터링

  } catch (error) {
    // 사용자에게 기술적 세부사항 노출 금지
    console.error('[AI Route Error]', error);
    return Response.json(
      { success: false, error: '잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
```

---

## 8. 테스트 전략

### 8.1 단위 테스트 (`vitest`)

| 테스트 파일 | 테스트 대상 | 주요 테스트 케이스 |
|------------|-----------|-------------------|
| `hooks/useAI.test.ts` | `useAI` 훅 | 캐시 히트/미스, 에러 핸들링, 취소 처리, rate limit |
| `lib/ai-cache.test.ts` | 캐시 유틸 | TTL 만료, 키 생성, 용량 관리 |
| `lib/srs.test.ts` | SRS 알고리즘 | 간격 계산 정확성, 난이도 조정 |
| `lib/ai-prompts.test.ts` | 프롬프트 생성 | 각 타입별 프롬프트 형식 검증 |

### 8.2 API 라우트 테스트

```typescript
// app/api/ai/route.test.ts
describe('AI API Route', () => {
  it('API 키 없으면 503 반환', async () => { ... });
  it('잘못된 type이면 400 반환', async () => { ... });
  it('rate limit 초과 시 429 반환', async () => { ... });
  it('정상 요청 시 AI 응답 반환', async () => { ... });
  it('입력에서 개인정보 패턴 제거', async () => { ... });
  it('타임아웃 시 적절한 에러 반환', async () => { ... });
});
```

### 8.3 통합 테스트

| 시나리오 | 검증 항목 |
|----------|-----------|
| 퀴즈 완료 후 오답 해설 | ResultView에서 AI 버튼 클릭 -> 해설 표시 |
| 미리보기에서 AI 예문 | PreviewView에서 AI 도우미 확장 -> 예문 로드 |
| 채팅 대화 | AIChatView에서 메시지 전송 -> 응답 수신 -> 히스토리 유지 |
| 캐시 동작 | 동일 요청 2회 -> 두 번째는 캐시에서 즉시 반환 |

### 8.4 수동 테스트 체크리스트

- [ ] API 키 없이 앱 실행 시 AI 기능 graceful degradation (에러 없이 숨김)
- [ ] 네트워크 오프라인에서 캐시된 AI 응답 표시
- [ ] 빠른 연속 클릭 시 중복 요청 방지
- [ ] 긴 AI 응답이 UI를 깨뜨리지 않는지 확인
- [ ] 모바일(터치) 환경에서 AI 말풍선 정상 표시
- [ ] AI 채팅에서 학습 무관 질문 차단 동작 확인

---

## 9. 향후 확장 가능성

### 9.1 단기 확장 (Phase 5)

| 기능 | 설명 | 난이도 |
|------|------|--------|
| **음성 AI 튜터** | TTS + AI 응답으로 음성 대화 | 보통 |
| **몬스터 특성 AI 구현** | 특성에 따라 AI가 문제 힌트를 가리거나 변형 | 보통 |
| **학부모 리포트** | AI가 주간 학습 리포트를 자연어로 생성 | 쉬움 |
| **AI 퀴즈 생성** | 기존 단어로 새로운 형태의 문제 자동 생성 | 보통 |

### 9.2 중기 확장

| 기능 | 설명 |
|------|------|
| **멀티모달 학습** | 이미지 기반 단어 학습 (AI 이미지 생성) |
| **적응형 학습 경로** | AI가 학생별 커리큘럼 자동 설계 |
| **피어 매칭** | 비슷한 수준의 학생끼리 AI가 매칭하여 대전 |
| **AI 스토리 모드** | 단어를 활용한 AI 생성 이야기로 학습 |

### 9.3 모델 업그레이드 경로

현재 `upstage/solar-pro-3:free`로 시작 (3월 2일까지 무료), 이후:
1. **가성비 전환**: `google/gemini-2.0-flash-001`
2. **비용 절감 필요**: `meta-llama/llama-3.1-8b-instruct`
3. **최고 품질 필요**: `anthropic/claude-3.5-sonnet` (분석/리포트용)

OpenRouter를 사용하므로 코드 변경 없이 모델만 교체 가능 (환경변수 또는 config).

---

## 부록: 환경 설정 가이드

### `.env.local` 설정

```bash
# AI 기능 (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 선택: 모델 오버라이드 (기본값: upstage/solar-pro-3:free)
# AI_MODEL=google/gemini-2.0-flash-001

# 선택: AI 기능 비활성화 (테스트용)
# AI_ENABLED=false
```

### OpenRouter 계정 설정

1. https://openrouter.ai 가입
2. API Keys 페이지에서 키 생성
3. 크레딧 충전 ($5면 약 1-2개월 운영 가능, 50명 기준)
4. Usage 페이지에서 비용 모니터링

### 개발 환경 테스트

```bash
# API 연결 테스트
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "upstage/solar-pro-3:free",
    "messages": [{"role": "user", "content": "안녕? 테스트야!"}],
    "max_tokens": 50
  }'
```
