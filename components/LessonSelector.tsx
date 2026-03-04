import React, { useState } from 'react';
import { VOCABULARY_DATA, Unit, Lesson, BookData } from '@/data/vocabulary';
import { BUILD_UP_1_DATA } from '@/data/vocabulary-buildup';
import { useQuizStore, QuizHistoryEntry, BADGES, getLevelTitle, Badge } from '@/store/useQuizStore';
import { BookOpen, Star, RefreshCw, Trophy, ChevronRight, GraduationCap, Flame, Medal, Mic, PenTool, BarChart3, Settings, Timer, Swords } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useSound } from '@/hooks/useSound';
import { BadgeModal, BadgeGrid } from './BadgeModal';

// View types for navigation
type ViewType = 'home' | 'stats' | 'settings' | 'game';

interface LessonSelectorProps {
    onNavigate?: (view: ViewType) => void;
}

export const LessonSelector = ({ onNavigate }: LessonSelectorProps) => {
    const {
        startQuiz,
        startReviewQuiz,
        startPreview,
        persistentWrongAnswers,
        quizHistory,
        level,
        xp,
        streak,
        earnedBadges,
        lessonProgress
    } = useQuizStore();

    // SFX
    const { playClick } = useSound();

    // Badge modal state
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [badgeModalOpen, setBadgeModalOpen] = useState(false);

    // Book Selection State (Tabs)
    const books: BookData[] = [BUILD_UP_1_DATA, VOCABULARY_DATA];
    const [activeBookIndex, setActiveBookIndex] = useState(0);
    const currentBook = books[activeBookIndex];

    const handleBadgeClick = (badge: Badge) => {
        playClick();
        setSelectedBadge(badge);
        setBadgeModalOpen(true);
    };

    // Get current title based on level
    const currentTitle = getLevelTitle(level);

    // Get best score for a specific unit/lesson
    const getBestScore = (bookTitle: string, unitNum: number, lessonNum: number): number | null => {
        // For backward compatibility, "Pre-Build Up" uses old key format
        const key = bookTitle === "Pre-Build Up"
            ? `${unitNum}-${lessonNum}`
            : `${bookTitle}-${unitNum}-${lessonNum}`;

        return lessonProgress[key]?.bestScore ?? null;
    };

    // Calculate XP progress for next level
    const xpForNextLevel = level * 1000;
    const currentLevelXp = xp - ((level - 1) * 1000);
    const xpProgress = Math.min((currentLevelXp / 1000) * 100, 100);

    const handleModeSelect = (bookTitle: string, unit: Unit, lesson: Lesson, mode: 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking' | 'writing') => {
        playClick();
        startQuiz(bookTitle, unit, lesson, mode);
    };

    const handlePreview = (bookTitle: string, unit: Unit, lesson: Lesson) => {
        playClick();
        startPreview(bookTitle, unit, lesson);
    };

    const handleReviewClick = () => {
        playClick();
        startReviewQuiz('spelling');
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-3 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Main Header */}
            <header className="text-center space-y-3 pt-2 md:pt-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-display">
                    VOCA CHALLENGE
                </h1>

                {/* Book Selection Tabs */}
                <div className="flex justify-center mt-4">
                    <div className="bg-slate-900 border border-slate-700/50 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner relative">
                        {books.map((book, idx) => (
                            <button
                                key={idx}
                                onClick={() => { playClick(); setActiveBookIndex(idx); }}
                                className={clsx(
                                    "relative px-4 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all duration-300 z-10 touch-manipulation",
                                    activeBookIndex === idx
                                        ? "text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {activeBookIndex === idx && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-slate-700 rounded-xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-20">{book.book_title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Gamification Dashboard - Compact for Mobile/Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Profile / Level Card */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-6 relative overflow-hidden flex items-center gap-4 shadow-sm">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <span className="text-9xl">{currentTitle.icon}</span>
                    </div>

                    {/* Avatar Circle */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-slate-800 flex flex-col items-center justify-center border-4 border-slate-700 z-10 shadow-lg">
                        <div className="text-3xl md:text-4xl animate-bounce-slow">{currentTitle.icon}</div>
                        <div className="absolute -bottom-2 bg-slate-900 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full border border-slate-700 text-white">
                            LV.{level}
                        </div>
                    </div>

                    {/* Stats Info */}
                    <div className="flex-1 space-y-1.5 md:space-y-2 z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className={clsx("text-lg md:text-xl font-black", currentTitle.color)}>
                                    {currentTitle.title}
                                </h2>
                                <p className="text-slate-400 text-xs font-medium">계속 성장 중!</p>
                            </div>
                            <span className="text-xs md:text-sm font-mono text-blue-400 font-bold">{Math.floor(xp)} XP</span>
                        </div>
                        <div className="w-full h-2.5 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <motion.div
                                initial={false}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                            />
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 text-right">
                            {1000 - Math.floor(currentLevelXp)} XP 다음 레벨까지
                        </p>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center justify-between md:justify-center relative overflow-hidden group shadow-sm">
                    <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
                    <div className="flex items-center gap-4 md:flex-col md:items-center md:justify-center md:gap-2 z-10 w-full">
                        <div className={clsx(
                            "p-3 md:p-4 rounded-full transition-all duration-300 shrink-0",
                            streak > 0 ? "bg-orange-500/20 text-orange-500 shadow-sm" : "bg-slate-800 text-slate-600"
                        )}>
                            <Flame size={24} className="w-6 h-6 md:w-8 md:h-8" fill={streak > 0 ? "currentColor" : "none"} />
                        </div>
                        <div className="text-left md:text-center">
                            <div className="text-2xl md:text-3xl font-black text-white leading-none">{streak}</div>
                            <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">연속 학습</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Button */}
            {persistentWrongAnswers.length > 0 && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReviewClick}
                    className="w-full relative overflow-hidden group bg-orange-600 overflow-hidden border-b-[4px] border-orange-800 active:border-b-0 active:translate-y-[4px] p-4 rounded-xl flex items-center justify-between transition-all shadow-md active:shadow-none"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 z-10 w-full">
                        <div className="p-2.5 bg-black/20 rounded-lg text-white">
                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div className="text-left text-white flex-1">
                            <h3 className="text-base md:text-lg font-bold">복습 대기</h3>
                            <p className="opacity-90 text-xs md:text-sm">
                                <span className="font-extrabold mr-1 bg-white text-orange-600 px-1.5 rounded-md">{persistentWrongAnswers.length}</span>
                                단어 · 스펠링 모드
                            </p>
                        </div>
                        <ChevronRight size={18} className="text-white z-10" />
                    </div>
                </motion.button>
            )}

            {/* Navigation Menu */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                    onClick={() => { playClick(); onNavigate?.('stats'); }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors group touch-manipulation"
                >
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <BarChart3 size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">학습 통계</span>
                </button>
                <button
                    onClick={() => { playClick(); onNavigate?.('game'); }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors group touch-manipulation"
                >
                    <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                        <Timer size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">타이머 챌린지</span>
                </button>
                <Link
                    href="/raid"
                    onClick={() => playClick()}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors group touch-manipulation"
                >
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <Swords size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">몬스터 레이드</span>
                </Link>
                <button
                    onClick={() => { playClick(); onNavigate?.('settings'); }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors group touch-manipulation md:col-span-1 col-span-2"
                >
                    <div className="p-3 rounded-full bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20 transition-colors">
                        <Settings size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">설정</span>
                </button>
            </div>

            {/* Badges Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-400">
                        뱃지 컬렉션 ({earnedBadges.length}/{BADGES.length})
                    </h3>
                </div>
                <BadgeGrid earnedBadges={earnedBadges} onBadgeClick={handleBadgeClick} collapsed />
            </div>

            {/* Badge Modal */}
            <BadgeModal
                badge={selectedBadge}
                isOpen={badgeModalOpen}
                onClose={() => setBadgeModalOpen(false)}
                isEarned={selectedBadge ? earnedBadges.includes(selectedBadge.id) : false}
            />

            {/* Lesson Grid */}
            <div className="space-y-6 md:space-y-8 pb-10">
                <motion.div
                    key={activeBookIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentBook.units.map((unit) => (
                        <div key={unit.unit} className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-px flex-1 bg-slate-800" />
                                <h2 className="text-base md:text-lg font-bold text-slate-300">Unit {unit.unit}</h2>
                                <div className="h-px flex-1 bg-slate-800" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                                {unit.lessons.map((lesson) => (
                                    <LessonCard
                                        key={lesson.lesson}
                                        unit={unit}
                                        lesson={lesson}
                                        bestScore={getBestScore(currentBook.book_title, unit.unit, lesson.lesson)}
                                        onSelect={(mode) => handleModeSelect(currentBook.book_title, unit, lesson, mode)}
                                        onPreview={() => handlePreview(currentBook.book_title, unit, lesson)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="h-6" /> {/* Bottom spacer for scrolling */}
        </div>
    );
};

interface LessonCardProps {
    unit: Unit;
    lesson: Lesson;
    bestScore: number | null;
    onSelect: (mode: 'korean_to_english' | 'english_to_korean' | 'spelling' | 'speaking' | 'writing') => void;
    onPreview: () => void;
}

const LessonCard = ({ unit, lesson, bestScore, onSelect, onPreview }: LessonCardProps) => {
    const previewWords = lesson.vocabulary
        .slice(0, 3)
        .map(v => v.word.length > 12 ? v.word.slice(0, 12) + '…' : v.word)
        .join(', ');

    return (
        <div className="group relative flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:bg-slate-800 transition-colors duration-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        Lesson {lesson.lesson}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">{lesson.vocabulary.length} 단어</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">{previewWords}...</p>
                </div>
                {bestScore !== null ? (
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] md:text-xs font-bold border",
                        bestScore >= 90 ? "bg-amber-900/40 text-amber-400 border-amber-500/20" :
                            bestScore >= 70 ? "bg-blue-900/40 text-blue-400 border-blue-500/20" :
                                "bg-slate-800/80 text-slate-400 border-slate-700"
                    )}>
                        <Trophy size={11} className={bestScore >= 90 ? "fill-amber-400" : ""} />
                        {bestScore}%
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <Star size={14} />
                    </div>
                )}
            </div>

            {/* Preview Button */}
            <button
                onClick={onPreview}
                className="w-full mb-3 py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.98] touch-manipulation"
            >
                <BookOpen size={16} />
                단어 미리보기
            </button>

            <div className="grid grid-cols-2 gap-2">
                <ModeButton
                    label="한→영"
                    subLabel="객관식"
                    color="blue"
                    onClick={() => onSelect('korean_to_english')}
                />
                <ModeButton
                    label="영→한"
                    subLabel="객관식"
                    color="purple"
                    onClick={() => onSelect('english_to_korean')}
                />
                <ModeButton
                    label="스펠링"
                    subLabel="타이핑"
                    color="green"
                    onClick={() => onSelect('spelling')}
                />
                <ModeButton
                    label="말하기"
                    subLabel="발음"
                    color="rose"
                    icon={<Mic size={13} />}
                    onClick={() => onSelect('speaking')}
                />
            </div>
            {/* Self-Test (Writing) Mode - Full Width */}
            <div className="mt-2">
                <ModeButton
                    label="셀프시험"
                    subLabel="노트에 쓰기"
                    color="amber"
                    icon={<PenTool size={13} />}
                    onClick={() => onSelect('writing')}
                    fullWidth
                />
            </div>
        </div>
    );
};

const ModeButton = ({ label, subLabel, color, icon, onClick, fullWidth }: { label: string, subLabel: string, color: 'blue' | 'purple' | 'green' | 'rose' | 'amber', icon?: React.ReactNode, onClick: () => void, fullWidth?: boolean }) => {
    const colorStyles = {
        blue: "bg-blue-600 border-blue-800 hover:bg-blue-500 text-white",
        purple: "bg-purple-600 border-purple-800 hover:bg-purple-500 text-white",
        green: "bg-emerald-600 border-emerald-800 hover:bg-emerald-500 text-white",
        rose: "bg-rose-600 border-rose-800 hover:bg-rose-500 text-white",
        amber: "bg-amber-600 border-amber-800 hover:bg-amber-500 text-white"
    };

    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border-b-[4px] transition-all duration-150 active:border-b-0 active:translate-y-[4px] active:shadow-none touch-manipulation",
                colorStyles[color],
                fullWidth && "w-full"
            )}
        >
            <span className="text-xs md:text-sm font-bold flex items-center gap-1 drop-shadow-sm">
                {icon}
                {label}
            </span>
            <span className="text-[11px] md:text-xs opacity-90 mt-px font-medium">{subLabel}</span>
        </button>
    );
};
