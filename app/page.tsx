"use client";

import { useQuizStore } from '@/store/useQuizStore';
import { LessonSelector } from '@/components/LessonSelector';
import { QuizView } from '@/components/QuizView';
import { ResultView } from '@/components/ResultView';
import { PreviewView } from '@/components/PreviewView';
import { StatsView } from '@/components/StatsView';
import { SettingsView } from '@/components/SettingsView';
import { TimeChallengeView } from '@/components/TimeChallengeView';
import { useEffect, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';

// View types for navigation
type ViewType = 'home' | 'stats' | 'settings' | 'game';

export default function Home() {
  const store = useQuizStore();
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  // Initialize notification scheduling at app level
  useNotification();

  // Avoid hydration mismatch with zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Render logic:
  // 1. Stats view -> StatsView
  // 2. Settings view -> SettingsView
  // 3. Game view -> TimeChallengeView
  // 4. Preview mode -> PreviewView
  // 5. Quiz active -> QuizView
  // 6. Quiz finished (questions exist but not active) -> ResultView
  // 7. Default (no questions) -> LessonSelector

  const renderContent = () => {
    // Handle special views first
    if (currentView === 'stats') {
      return <StatsView onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'settings') {
      return <SettingsView onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'game') {
      return <TimeChallengeView onBack={() => setCurrentView('home')} />;
    }

    // Handle quiz flow
    if (store.previewActive) {
      return <PreviewView />;
    }
    if (store.quizActive) {
      return <QuizView />;
    }
    if (store.questions.length > 0) {
      return <ResultView />;
    }
    return (
      <LessonSelector
        onNavigate={(view: ViewType) => setCurrentView(view)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {renderContent()}
      </div>
    </main>
  );
}
