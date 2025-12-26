# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pre-Build Up Voca is a Korean-English vocabulary learning application with gamification features. It provides interactive quizzes with four modes: Korean-to-English (multiple choice), English-to-Korean (multiple choice), Spelling (typing), and Speaking (voice recognition).

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand with persist middleware (localStorage)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (Latin) + Noto Sans KR (Korean)

## Architecture

### State Flow
```
LessonSelector → QuizView → ResultView → LessonSelector
     ↓              ↓           ↓
  startQuiz()   submitAnswer()  resetQuiz()
               → endQuiz()
```

### Core Files

**`store/useQuizStore.ts`** - Central state management
- Quiz state: questions, currentIndex, score, mode
- Gamification: XP, level, streak, badges
- Persisted state: history, wrongAnswers, XP, streak, badges
- Level calculation: 1000 XP per level
- Quiz modes: `korean_to_english | english_to_korean | spelling | speaking`

**`data/vocabulary.ts`** - Vocabulary data structure
- BookData → Unit[] → Lesson[] → Vocabulary[]
- Each Vocabulary: `{ word, definition, meaning }`

### Components

- **LessonSelector**: Unit/lesson grid with gamification dashboard (level, XP, streak, badges)
- **QuizView**: Quiz engine with combo/fever system, handles all four quiz modes
- **ResultView**: Score display with certificate animation for perfect scores

### Custom Hooks

- **useSound**: SFX playback (correct/wrong/click/levelUp) from `/public/media/sounds/`
- **useTTS**: Text-to-speech using Web Speech API (English)
- **useSpeechRecognition**: Voice input using Web Speech API for speaking mode

## Key Patterns

### Hydration Safety
The app uses Zustand persist, so `page.tsx` includes a mounted state check to prevent hydration mismatch:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### Quiz Answer Validation
Words may contain part-of-speech annotations like `(v.)`, `(adj.)`. These are stripped before comparison:
```tsx
const cleanTarget = word.replace(/\s*\(.*?\)/g, '').toLowerCase();
```

### Path Aliases
Uses `@/*` for root-relative imports (configured in `tsconfig.json`).

## Sound Assets

Sound files are located in `/public/media/sounds/`:
- `correct.mp3` - Correct answer feedback
- `wrong.ogg` - Wrong answer feedback
- `click.ogg` - Button click feedback
- `level_up.mp3` - Level up celebration
