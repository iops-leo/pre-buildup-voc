# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pre-Build Up Voca is a Korean-English vocabulary learning application with gamification features. It provides interactive quizzes with four modes: Korean-to-English (multiple choice or typing), English-to-Korean (multiple choice), Spelling (typing), and Speaking (voice recognition).

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.0 |
| Language | TypeScript (strict) | ^5 |
| Runtime | React | 19.2.3 |
| State Management | Zustand + persist | ^5.0.9 |
| Styling | Tailwind CSS | ^3.4.17 |
| Animations | Framer Motion | ^12.23.26 |
| Icons | Lucide React | ^0.562.0 |
| Fonts | Inter (Latin) + Noto Sans KR (Korean) | - |
| Web APIs | Speech Synthesis, Speech Recognition, HTML Audio | Browser built-in |

## Architecture

### Project Structure

```
pre-buildup-voc/
├── app/
│   ├── page.tsx          # Entry point + view router (4 views)
│   ├── layout.tsx        # Root layout, fonts, background
│   └── globals.css       # Tailwind + CSS variables
├── components/
│   ├── LessonSelector.tsx  # Main dashboard
│   ├── QuizView.tsx        # Quiz engine (most complex)
│   ├── ResultView.tsx      # Result screen
│   └── PreviewView.tsx     # Word preview
├── store/
│   └── useQuizStore.ts   # Global state (Zustand)
├── data/
│   └── vocabulary.ts     # Vocabulary data + types
├── hooks/
│   ├── useSound.ts         # SFX playback
│   ├── useTTS.ts           # Text-to-speech
│   └── useSpeechRecognition.ts  # Voice input
└── public/
    └── media/sounds/     # correct.mp3, wrong.ogg, click.ogg, level_up.mp3
```

### View Flow

```
[LessonSelector]
    ↓ startQuiz(unit, lesson, mode) or startPreview(unit, lesson)

[PreviewView]  ←→  [QuizView]
    ↓ startQuiz()        ↓ submitAnswer() + nextQuestion()
                         ↓ endQuiz() (quizActive=false, questions kept)

                   [ResultView]
                         ↓ resetQuiz() (questions=[])

                   [LessonSelector]
```

### Data Structure

```
BookData
  └── units: Unit[]
        └── lessons: Lesson[]
              └── vocabulary: Vocabulary[]
                    ├── word: string          (e.g., "feel/felt (v.)")
                    ├── definition: string    (English definition)
                    └── meaning: string       (Korean meaning)
```

**Current Data**: 2 Units, 18 Lessons, ~230+ vocabulary items

### Core Files

**`app/page.tsx`** - View Router
- Single page app routing based on store state
- Render priority: `previewActive` → `quizActive` → `questions.length > 0` → default
- Hydration safety pattern with `mounted` state

**`store/useQuizStore.ts`** - Central State Management

Persisted state (localStorage key: `"quiz-storage"`):
| Field | Type | Description |
|-------|------|-------------|
| `persistentWrongAnswers` | `Vocabulary[]` | Cumulative wrong answers (auto-removed on correct) |
| `quizHistory` | `QuizHistoryEntry[]` | Last 50 quiz records |
| `xp` | `number` | Cumulative experience points |
| `level` | `number` | `Math.floor(xp / 1000) + 1` |
| `streak` | `number` | Consecutive study days |
| `lastStudyDate` | `string` | ISO date string |
| `earnedBadges` | `string[]` | Earned badge IDs |
| `lessonProgress` | `Record<string, LessonProgress>` | Best scores per lesson (`"1-3"` key format) |

Session state (non-persisted):
- `currentUnit`, `currentLesson`, `quizActive`, `previewActive`
- `mode`, `questions`, `currentQuestionIndex`
- `score`, `correctAnswers`, `wrongAnswers`, `startTime`

**`components/QuizView.tsx`** - Quiz Engine
- 4 mode-specific input UI handling
- Combo/Fever system: 2+ streak → combo popup, 5+ → fever mode (indigo background)
- Keyboard shortcuts: 1-4 for options, Enter/Space for next, Escape to quit
- Voice recognition auto-grading

**`components/LessonSelector.tsx`** - Home Dashboard
- Gamification dashboard: level card (evolution icon + XP bar), streak, badges
- Review wrong answers button (conditional)
- Lesson grid with 4 mode buttons + preview button per lesson
- High score badge: gold (90%+), blue (70%+), star (untried)

**`data/vocabulary.ts`** - Vocabulary Data
- Types: `BookData`, `Unit`, `Lesson`, `Vocabulary`
- Unit 1: 9 lessons (emotions, chores theme)
- Unit 2: 9 lessons (hobbies, sports, safety theme)

### Custom Hooks

**`useSound.ts`**
- `useRef` for Audio objects to prevent GC
- Client-side only initialization
- Supports: correct, wrong, click, levelUp

**`useTTS.ts`**
- Web Speech API wrapper
- Removes parenthetical content before speaking
- Rate: 0.9 (slightly slower)
- Returns: `{ speak, stop, isSpeaking, isSupported }`

**`useSpeechRecognition.ts`**
- webkit fallback for Safari/Chrome
- `continuous: true` + `interimResults: true` for real-time transcript
- Returns: `{ transcript, isListening, startListening, stopListening, resetTranscript, isSupported }`

## Key Patterns

### Hydration Safety
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### Quiz Answer Validation
Words may contain part-of-speech annotations and multiple forms:
```tsx
// Remove annotations: "feel/felt (v.)" → "feel/felt"
const cleanTarget = word.replace(/\s*\(.*?\)/g, '').toLowerCase();
// Split on "/" for multiple acceptable answers
const acceptableAnswers = cleanTarget.split('/');
```

### XP Calculation
```tsx
baseXp = correctAnswers * 10
bonusXp = 100% → +50, 80%+ → +20, else → 0
totalXp = baseXp + bonusXp
```

### Streak Logic
- Previous day study → streak + 1
- 2+ days gap → reset to 1
- Same day study → maintain

### Path Aliases
Uses `@/*` for root-relative imports (configured in `tsconfig.json`).

## Quiz Modes

| Mode | Display | Input | Grading |
|------|---------|-------|---------|
| `korean_to_english` | Korean meaning | Typing or multiple choice (based on word length) | Exact match (/ split allowed) |
| `english_to_korean` | English word (TTS auto-play) | Multiple choice 4 options | Exact match |
| `spelling` | Korean meaning | Always typing | Exact match (/ split allowed) |
| `speaking` | Korean meaning + "Speak the English word!" | Microphone → voice input | Transcript contains target |
| `writing` | Korean meaning | Write on paper → reveal answer → self-grade | User self-assessment (correct/incorrect) |

## Styling

- Dark mode only: `bg-slate-950` base
- `radial-gradient` background with grainy texture (external URL dependency)
- Framer Motion: page transitions, donut chart animation, combo popups
- Fever mode: background → `bg-indigo-950`, progress bar → rose glow

## Sound Assets

Located in `/public/media/sounds/`:
- `correct.mp3` - Correct answer feedback
- `wrong.ogg` - Wrong answer feedback
- `click.ogg` - Button click feedback
- `level_up.mp3` - Level up celebration

## Known Issues & Considerations

1. **External URL dependency**: `grainy-gradients.vercel.app` for noise texture
2. **Speech recognition grading**: Lenient - accepts if target word is contained in transcript
3. **Duplicate vocabulary**: Some words appear in multiple lessons (may be intentional for review)
4. **XP bar calculation**: Minor display inconsistency between level calculation and XP bar progress
