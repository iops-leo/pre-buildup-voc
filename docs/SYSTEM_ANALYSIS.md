# Pre-Build Up Voca - 시스템 분석 문서

> 분석 일자: 2026-02-18
> 분석 버전: Next.js 16.1.0 / React 19.2.3 / Zustand 5.0.9

## 1. 개요

Pre-Build Up Voca는 게이미피케이션 기능이 포함된 한국어-영어 어휘 학습 앱입니다. 4가지 퀴즈 모드(한→영, 영→한, 스펠링, 스피킹)를 제공하며, XP/레벨/스트릭/배지 시스템으로 학습 동기를 부여합니다.

---

## 2. 아키텍처 다이어그램

### 2.1 전체 구조

```
app/layout.tsx
    └── app/page.tsx (뷰 라우터)
            ├── store/useQuizStore.ts (전역 상태)
            │       └── data/vocabulary.ts (어휘 데이터)
            │
            ├── components/LessonSelector.tsx  (quizActive=false, questions=[], previewActive=false)
            │       └── useSound
            │
            ├── components/PreviewView.tsx     (previewActive=true)
            │       ├── useTTS
            │       └── useSound
            │
            ├── components/QuizView.tsx        (quizActive=true)
            │       ├── useTTS
            │       ├── useSound
            │       └── useSpeechRecognition
            │
            └── components/ResultView.tsx      (quizActive=false, questions.length > 0)
                    ├── useTTS
                    └── useSound
```

### 2.2 상태 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────────────┐
│                         [LessonSelector]                            │
│   • 게이미피케이션 대시보드 (레벨, XP, 스트릭, 배지)                    │
│   • 레슨 그리드 + 4가지 모드 버튼                                     │
│   • 오답 복습 버튼 (조건부)                                          │
└─────────────────────────────────────────────────────────────────────┘
        │                                       │
        │ startPreview(unit, lesson)           │ startQuiz(unit, lesson, mode)
        ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────────────────┐
│   [PreviewView]     │               │         [QuizView]              │
│  • 단어 목록 표시    │  startQuiz()  │  • 4가지 모드별 입력 UI         │
│  • TTS 재생 버튼    │ ────────────► │  • 콤보/피버 시스템             │
│  • 바로 퀴즈 시작   │               │  • 키보드 단축키                │
└─────────────────────┘               │  • 음성 인식 자동 채점          │
                                      └─────────────────────────────────┘
                                                │
                                                │ endQuiz()
                                                │ (quizActive=false, questions 유지)
                                                ▼
                                      ┌─────────────────────────────────┐
                                      │       [ResultView]              │
                                      │  • 도넛 차트 점수 표시          │
                                      │  • 100점 인증서 애니메이션      │
                                      │  • 오답 목록 + TTS              │
                                      │  • XP 획득량 표시               │
                                      └─────────────────────────────────┘
                                                │
                                                │ resetQuiz()
                                                │ (questions=[])
                                                ▼
                                      ┌─────────────────────────────────┐
                                      │      [LessonSelector]           │
                                      └─────────────────────────────────┘
```

---

## 3. 핵심 컴포넌트 분석

### 3.1 `app/page.tsx` - 뷰 라우터

**역할**: 단일 페이지 앱의 핵심 라우팅 로직

**렌더링 우선순위**:
```tsx
if (previewActive) → PreviewView
if (quizActive)    → QuizView
if (questions.length > 0) → ResultView  // 퀴즈 종료 후
else               → LessonSelector     // 기본 홈
```

**하이드레이션 안전 패턴**:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

### 3.2 `store/useQuizStore.ts` - 상태 관리

**Zustand Store 구조**:

#### 영속화 상태 (localStorage `"quiz-storage"`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `persistentWrongAnswers` | `Vocabulary[]` | 오답 누적 목록 (정답 시 자동 제거) |
| `quizHistory` | `QuizHistoryEntry[]` | 최근 50개 퀴즈 기록 |
| `xp` | `number` | 누적 경험치 |
| `level` | `number` | `Math.floor(xp / 1000) + 1` |
| `streak` | `number` | 연속 학습일 |
| `lastStudyDate` | `string` | ISO 날짜 문자열 |
| `earnedBadges` | `string[]` | 획득 배지 ID 목록 |
| `lessonProgress` | `Record<string, LessonProgress>` | 레슨별 최고점수 (`"1-3"` 키 형식) |

#### 세션 상태 (비영속)

| 필드 | 타입 | 설명 |
|------|------|------|
| `currentUnit` | `number` | 현재 유닛 번호 |
| `currentLesson` | `number` | 현재 레슨 번호 |
| `quizActive` | `boolean` | 퀴즈 진행 중 여부 |
| `previewActive` | `boolean` | 미리보기 활성화 여부 |
| `mode` | `QuizMode` | 퀴즈 모드 |
| `questions` | `Vocabulary[]` | 셔플된 문제 목록 |
| `currentQuestionIndex` | `number` | 현재 문제 인덱스 |
| `score` | `number` | 현재 점수 |
| `correctAnswers` | `number` | 정답 수 |
| `wrongAnswers` | `Vocabulary[]` | 이번 퀴즈의 오답 목록 |
| `startTime` | `number \| null` | 퀴즈 시작 시간 |

#### 핵심 액션

```typescript
startQuiz(unit, lesson, mode)  // 어휘 셔플 → quizActive=true
submitAnswer(isCorrect)        // correctAnswers++, persistentWrongAnswers 업데이트
endQuiz()                      // XP 계산, 히스토리 추가, 스트릭 갱신
checkAchievements()            // 배지 조건 검사
resetQuiz()                    // 초기 상태로 복원
```

#### XP 계산 공식

```typescript
baseXp = correctAnswers * 10
bonusXp = 100% → +50, 80%+ → +20, else → 0
totalXp = baseXp + bonusXp
```

#### 스트릭 로직

- 전날 학습 → streak + 1
- 2일 이상 공백 → 1로 리셋
- 오늘 학습 완료 → 유지

---

### 3.3 `components/QuizView.tsx` - 퀴즈 엔진

**가장 복잡한 컴포넌트**

#### 퀴즈 모드별 동작

| 모드 | 표시 | 입력 방식 | 채점 |
|------|------|----------|------|
| `korean_to_english` | 한국어 meaning | 단어/구 여부에 따라 타이핑 또는 객관식 | 정확 ��치 (`/` 분리 허용) |
| `english_to_korean` | 영어 word (TTS 자동 재생) | 객관식 4지선다 | 정확 일치 |
| `spelling` | 한국어 meaning | 타이핑 항상 강제 | 정확 일치 (`/` 분리 허용) |
| `speaking` | 한국어 meaning + "Speak the English word!" | 마이크 버튼 → 음성 입력 | transcript에 정답 포함 여부 |

#### 콤보/피버 시스템

```
2연속 정답 → 콤보 팝업 표시
5연속 정답 → 피버 모드 활성화
  - 배경: bg-slate-950 → bg-indigo-950
  - 진행바: bg-blue-600 → bg-rose-500 (glow effect)
  - 버튼 hover: rose 계열
```

#### 키보드 단축키

| 키 | 기능 |
|----|------|
| 1, 2, 3, 4 | 객관식 보기 선택 |
| Enter, Space | 다음 문제 / 제출 |
| Escape | 퀴즈 종료 |

---

### 3.4 `components/LessonSelector.tsx` - 홈 대시보드

**구성 요소**:

1. **게이미피케이션 대시보드**
   - 레벨 카드: 진화 아이콘 + XP 진행 바
   - 스트릭 카드: 연속 학습일 표시
   - 배지 목록: 획득한 배지 아이콘

2. **오답 복습 버튼**
   - `persistentWrongAnswers.length > 0`일 때만 표시

3. **레슨 그리드**
   - 각 레슨 카드에 4개 모드 버튼 + 미리보기 버튼
   - 최고 점수 배지: 90%+ 금색, 70%+ 파란색, 미도전 별표시

---

### 3.5 `components/ResultView.tsx` - 결과 화면

**기능**:
- SVG 도넛 차트 애니메이션 (Framer Motion pathLength)
- 100점 달성 시 인증서 모달 (1.5초 딜레이)
- 오답 목록 + TTS 재청취 기능
- Retry / Dashboard 버튼

---

### 3.6 `components/PreviewView.tsx` - 단어 미리보기

**기능**:
- 레슨의 모든 단어를 word / meaning / definition 순으로 표시
- 각 단어별 TTS 버튼
- 하단 고정 푸터에서 4가지 모드로 바로 퀴즈 시작

---

## 4. 커스텀 훅 분석

### 4.1 `useSound.ts`

```typescript
// 지원하는 사운드
type SoundType = 'correct' | 'wrong' | 'click' | 'levelUp';

// 사용법
const { playSound } = useSound();
playSound('correct');
```

**구현 특징**:
- `useRef`로 Audio 객체 관리 (GC 방지)
- `typeof window !== 'undefined'`로 클라이언트 사이드에서만 초기화
- `audio.currentTime = 0` 리셋으로 연속 재생 지원
- 브라우저 자동재생 정책 오류 catch 처리

---

### 4.2 `useTTS.ts`

```typescript
// 반환값
{
  speak: (text: string) => void,
  stop: () => void,
  isSpeaking: boolean,
  isSupported: boolean
}
```

**구현 특징**:
- `window.speechSynthesis.cancel()` 선 호출로 중첩 발화 방지
- `/(.*?)/g` 정규식으로 괄호 내용 제거 후 발화
- 발화 속도: 0.9 (약간 느리게)
- 언어: 'en-US'

---

### 4.3 `useSpeechRecognition.ts`

```typescript
// 반환값
{
  transcript: string,
  isListening: boolean,
  startListening: () => void,
  stopListening: () => void,
  resetTranscript: () => void,
  isSupported: boolean
}
```

**구현 특징**:
- `webkitSpeechRecognition` 폴백으로 Safari/Chrome 지원
- `continuous: true` + `interimResults: true`로 실시간 자막
- `recognitionRef`로 단일 인스턴스 유지
- transcript 누적 방식: `prev + ' ' + finalTrans`

---

## 5. 데이터 구조

### 5.1 타입 정의

```typescript
interface Vocabulary {
  word: string;       // 예: "feel/felt (v.)"
  definition: string; // 영어 정의
  meaning: string;    // 한국어 의미
}

interface Lesson {
  title: string;
  vocabulary: Vocabulary[];
}

interface Unit {
  title: string;
  lessons: Lesson[];
}

interface BookData {
  title: string;
  units: Unit[];
}
```

### 5.2 현재 데이터 현황

| Unit | 레슨 수 | 테마 | 단어 수/레슨 |
|------|--------|------|-------------|
| Unit 1 | 9 | 감정, 집안일 | 12-14 |
| Unit 2 | 9 | 취미, 스포츠, 안전 | 12-13 |

**총 단어**: ~230+ 항목 (일부 중복 포함)

---

## 6. 스타일링 및 UI/UX

### 6.1 디자인 시스템

- **테마**: 다크 모드 전용 (`bg-slate-950`)
- **배경**: `radial-gradient` + grainy 노이즈 텍스처
- **폰트**: Inter (Latin) + Noto Sans KR (Korean)
- **아이콘**: Lucide React

### 6.2 Tailwind 패턴

```css
/* 3D 버튼 프레스 효과 */
border-b-[4px] active:border-b-0 active:translate-y-[4px]

/* 모바일 터치 딜레이 제거 */
touch-manipulation

/* 한국어 단어 단위 줄바꿈 */
break-keep
```

### 6.3 Framer Motion 활용

| 용도 | 애니메이션 |
|------|-----------|
| 퀴즈 질문 전환 | `AnimatePresence mode="wait"` 페이드 |
| 결과 도넛 차트 | `motion.circle` pathLength |
| 콤보 팝업 | scale + rotate 등장/퇴장 |
| StatBox 등장 | 스태거 delay |
| XP 바 | `initial={false}` 마운트 시 생략 |

### 6.4 피버 모드 UI

```
5콤보 달성 시:
- 배경: bg-slate-950 → bg-indigo-950
- 진행바: bg-blue-600 → bg-rose-500 shadow-[0_0_15px_...]
- 버튼 hover: rose 계열
```

---

## 7. 알려진 이슈 및 개선점

### 7.1 버그 및 로직 이슈

| 우선순위 | 이슈 | 위치 | 설명 |
|---------|------|------|------|
| 🔴 High | ResultView 훅 순서 | ResultView.tsx:34 | `useTTS`가 조건부 return 이후에 호출됨 (React hooks 규칙 위반 가능성) |
| 🟡 Medium | XP 레벨 계산 불일치 | useQuizStore.ts | `xpForNextLevel = level * 1000` vs 실제 레벨업 조건 간 미세한 불일치 |
| 🟡 Medium | 음성 채점 관대함 | QuizView.tsx | `transcript.includes(target)` 방식으로 부분 일치도 정답 처리 |
| 🟢 Low | `any` 타입 사용 | useSpeechRecognition.ts | 더 정확한 타이핑 가능 (`SpeechRecognition` 타입) |

### 7.2 아키텍처 개선점

| 항목 | 현재 상태 | 권장 사항 |
|------|----------|----------|
| 외부 URL 의존 | `grainy-gradients.vercel.app` | `public/` 폴더에 로컬 파일로 포함 |
| 단어 중복 | 일부 레슨 간 동일 단어 존재 | 의도적 복습용인지 데이터 오류인지 확인 필요 |
| 이중 렌더링 | `endQuiz()`에서 `addXp()` + `checkAchievements()` 분리 호출 | 단일 `set()` 호출로 통합 |

### 7.3 기능 확장 가능 지점

1. **배지 시스템 확장**: 더 다양한 배지 조건 추가
2. **Unit 데이터 추가**: Unit 3, 4 등 콘텐츠 확장
3. **음성 채점 개선**: 정확한 발음 일치 검사
4. **오프라인 지원**: Service Worker 추가
5. **통계 대시보드**: 학습 패턴 분석 차트

---

## 8. 파일별 라인 수 및 복잡도

| 파일 | 라인 수 | 복잡도 | 주요 책임 |
|------|--------|--------|----------|
| `useQuizStore.ts` | ~350 | ⬛⬛⬛⬛⬛ | 전역 상태, 게이미피케이션 로직 |
| `QuizView.tsx` | ~400 | ⬛⬛⬛⬛⬛ | 4가지 모드 UI, 콤보 시스템 |
| `LessonSelector.tsx` | ~300 | ⬛⬛⬛⬛ | 대시보드, 레슨 그리드 |
| `ResultView.tsx` | ~200 | ⬛⬛⬛ | 결과 표시, 차트 애니메이션 |
| `PreviewView.tsx` | ~150 | ⬛⬛ | 단어 목록 표시 |
| `vocabulary.ts` | ~800 | ⬛ | 데이터 정의 (반복적) |
| `page.tsx` | ~50 | ⬛ | 뷰 라우팅 |

---

## 9. 테스트 권장 사항

### 9.1 단위 테스트

- `useQuizStore`: XP 계산, 스트릭 로직, 배지 조건
- 정답 검증 함수: 품사 표기 제거, `/` 분리 처리

### 9.2 통합 테스트

- 퀴즈 플로우: 시작 → 답변 → 종료 → 결과 표시
- 상태 영속화: localStorage 저장/복원

### 9.3 E2E 테스트

- 4가지 퀴즈 모드 완료
- 레벨업 시나리오
- 스트릭 유지/리셋

---

## 10. 결론

Pre-Build Up Voca는 잘 구조화된 Next.js 앱으로, Zustand를 활용한 상태 관리와 Web Speech API를 활용한 음성 기능이 특징입니다. 주요 개선 포인트는 훅 순서 문제 수정, 외부 의존성 제거, 음성 채점 정확도 향상입니다.
