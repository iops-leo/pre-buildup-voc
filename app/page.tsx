"use client";

import { useQuizStore } from '@/store/useQuizStore';
import { LessonSelector } from '@/components/LessonSelector';
import { QuizView } from '@/components/QuizView';
import { ResultView } from '@/components/ResultView';
import { PreviewView } from '@/components/PreviewView';
import { useEffect, useState } from 'react';

export default function Home() {
  const store = useQuizStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Render logic:
  // 1. Preview mode -> PreviewView
  // 2. Quiz active -> QuizView
  // 3. Quiz finished (questions exist but not active) -> ResultView
  // 4. Default (no questions) -> LessonSelector

  const renderContent = () => {
    if (store.previewActive) {
      return <PreviewView />;
    }
    if (store.quizActive) {
      return <QuizView />;
    }
    if (store.questions.length > 0) {
      return <ResultView />;
    }
    return <LessonSelector />;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {renderContent()}
      </div>
    </main>
  );
}
