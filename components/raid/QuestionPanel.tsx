'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRaidStore } from '@/store/useRaidStore';
import { subjectInfo, difficultyInfo } from '@/data/questions';

export function QuestionPanel() {
  const {
    currentQuestion,
    answerResult,
    submitAnswer,
    loadNextQuestion,
    clearAnswerResult,
    room,
  } = useRaidStore();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset per question
  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedOption(null);
    setTextAnswer('');
    setTimeLeft(currentQuestion.timeLimit);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (!currentQuestion.options) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion?.q]);

  // Time up => wrong
  useEffect(() => {
    if (timeLeft === 0 && !answerResult) {
      submitAnswer('__time_up__').catch(console.error);
    }
  }, [timeLeft, answerResult]);

  // Auto advance after showing result
  useEffect(() => {
    if (answerResult && room?.phase === 'battle') {
      const timer = setTimeout(() => {
        clearAnswerResult();
        loadNextQuestion();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [answerResult]);

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500 text-sm">문제를 불러오는 중...</div>
      </div>
    );
  }

  const hasOptions = currentQuestion.options && currentQuestion.options.length > 0;
  const subjectLabel = subjectInfo[currentQuestion.subject]?.name ?? currentQuestion.subject;
  const diffInfo = difficultyInfo[currentQuestion.difficulty];
  const timerPercent = (timeLeft / currentQuestion.timeLimit) * 100;
  const timerColor = timerPercent > 50 ? 'bg-green-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  async function handleOptionSelect(opt: string) {
    if (answerResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(opt);
    await submitAnswer(opt);
  }

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answerResult || !textAnswer.trim()) return;
    if (timerRef.current) clearInterval(timerRef.current);
    await submitAnswer(textAnswer.trim());
  }

  function getOptionClass(opt: string): string {
    const base =
      'w-full text-left px-4 py-3 rounded-xl border font-medium transition-all duration-200 ';
    if (!answerResult || !currentQuestion) {
      return (
        base +
        'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-500 active:scale-95'
      );
    }
    if (opt === currentQuestion.a) {
      return base + 'bg-green-900/60 border-green-500 text-green-300';
    }
    if (opt === selectedOption && opt !== currentQuestion.a) {
      return base + 'bg-red-900/60 border-red-500 text-red-300';
    }
    return base + 'bg-slate-800/40 border-slate-700/40 text-slate-500';
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{subjectInfo[currentQuestion.subject]?.emoji}</span>
          <span className="text-sm text-slate-400">{subjectLabel}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{diffInfo.emoji} {diffInfo.name}</span>
        </div>
        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-lg ${timeLeft <= 3 ? 'text-red-400' : 'text-slate-200'}`}>
            {timeLeft}
          </span>
          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timerColor}`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="px-5 py-5">
        <motion.p
          key={currentQuestion.q}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white text-center mb-5"
        >
          {currentQuestion.q}
        </motion.p>

        {/* Answer area */}
        <AnimatePresence mode="wait">
          {hasOptions ? (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-2"
            >
              {currentQuestion.options!.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={!!answerResult}
                  className={getOptionClass(opt)}
                >
                  {opt}
                  {answerResult && opt === currentQuestion.a && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.form
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleTextSubmit}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={!!answerResult}
                placeholder="답을 입력하세요..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!!answerResult || !textAnswer.trim()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-40 transition-colors"
              >
                확인
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Result overlay */}
        <AnimatePresence>
          {answerResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`mt-4 rounded-xl py-3 text-center font-black text-lg ${
                answerResult === 'correct'
                  ? 'bg-green-900/60 text-green-300 border border-green-700'
                  : 'bg-red-900/60 text-red-300 border border-red-700'
              }`}
            >
              {answerResult === 'correct' ? '🎯 정답!' : `❌ 오답! 정답: ${currentQuestion.a}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
