"use client";

import { useQuizStore } from '@/store/useQuizStore';
import { LessonSelector } from '@/components/LessonSelector';
import { QuizView } from '@/components/QuizView';
import { ResultView } from '@/components/ResultView';
import { useEffect, useState } from 'react';

export default function Home() {
  const store = useQuizStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Simple Conditional Rendering based on state */}
        {/* 1. Quiz Active? -> Show Quiz */}
        {/* 2. Quiz Finished (reached end)? -> Show Result (Should handle "finished" state explicitly or infer from index) */}

        {store.questions.length === 0 ? (
          <LessonSelector />
        ) : store.quizActive ? (
          <QuizView />
        ) : (
          <ResultView />
        )}

        {/* Logic Fix: ResultView shows when quizActive is false BUT we have results.
                My `resetQuiz` clears results.
                So `ResultView` should be shown when `quizActive` is false AND `questions.length > 0` (indicating a quiz just finished without reset).
                Let's refine the condition.
             */}

        {/* 
                State transitions:
                - Initial: active=false, questions=[], score=0
                - Start: active=true, questions=[...], score=0
                - End: active=false, questions=[...] (retained), score=X
                - Reset: active=false, questions=[], score=0
             */}
      </div>
    </main>
  );
}
