import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore, QuizMode, BADGES, getLevelTitle, LEVEL_TITLES } from '../store/useQuizStore';
import { Unit, Lesson, Vocabulary } from '../data/vocabulary';

// Mock data
const mockVocabulary: Vocabulary[] = [
  { word: 'happy', definition: 'feeling pleasure', meaning: '행복한' },
  { word: 'sad', definition: 'feeling sorrow', meaning: '슬픈' },
  { word: 'angry', definition: 'feeling anger', meaning: '화난' },
  { word: 'tired', definition: 'feeling exhausted', meaning: '피곤한' },
];

const mockLesson: Lesson = {
  lesson: 1,
  title: 'Emotions',
  vocabulary: mockVocabulary,
};

const mockUnit: Unit = {
  unit: 1,
  title: 'Feelings',
  lessons: [mockLesson],
};

describe('useQuizStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useQuizStore.setState({
      currentUnit: null,
      currentLesson: null,
      quizActive: false,
      previewActive: false,
      mode: 'korean_to_english',
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: [],
      persistentWrongAnswers: [],
      startTime: 0,
      quizHistory: [],
      lessonProgress: {},
      xp: 0,
      level: 1,
      streak: 0,
      lastStudyDate: null,
      earnedBadges: [],
    });
  });

  describe('startQuiz', () => {
    it('should start a quiz with correct initial state', () => {
      const { startQuiz } = useQuizStore.getState();

      startQuiz(mockUnit, mockLesson, 'korean_to_english');

      const state = useQuizStore.getState();
      expect(state.quizActive).toBe(true);
      expect(state.currentUnit).toEqual(mockUnit);
      expect(state.currentLesson).toEqual(mockLesson);
      expect(state.mode).toBe('korean_to_english');
      expect(state.questions.length).toBe(4);
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.correctAnswers).toBe(0);
      expect(state.wrongAnswers).toEqual([]);
    });

    it('should shuffle questions', () => {
      const { startQuiz } = useQuizStore.getState();

      // Run multiple times to ensure shuffling occurs
      const orderSeen: string[] = [];
      for (let i = 0; i < 10; i++) {
        startQuiz(mockUnit, mockLesson, 'korean_to_english');
        const state = useQuizStore.getState();
        orderSeen.push(state.questions.map(q => q.word).join(','));
      }

      // Check that not all orders are the same (shuffling works)
      const uniqueOrders = new Set(orderSeen);
      expect(uniqueOrders.size).toBeGreaterThan(1);
    });

    it('should work with all quiz modes', () => {
      const modes: QuizMode[] = ['korean_to_english', 'english_to_korean', 'spelling', 'speaking', 'writing'];

      modes.forEach(mode => {
        const { startQuiz } = useQuizStore.getState();
        startQuiz(mockUnit, mockLesson, mode);

        const state = useQuizStore.getState();
        expect(state.mode).toBe(mode);
        expect(state.quizActive).toBe(true);
      });
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      const { startQuiz } = useQuizStore.getState();
      startQuiz(mockUnit, mockLesson, 'korean_to_english');
    });

    it('should increment correctAnswers on correct answer', () => {
      const { submitAnswer, questions } = useQuizStore.getState();
      const currentWord = questions[0];

      submitAnswer(true, currentWord);

      const state = useQuizStore.getState();
      expect(state.correctAnswers).toBe(1);
      expect(state.wrongAnswers).toEqual([]);
    });

    it('should add to wrongAnswers on incorrect answer', () => {
      const { submitAnswer, questions } = useQuizStore.getState();
      const currentWord = questions[0];

      submitAnswer(false, currentWord);

      const state = useQuizStore.getState();
      expect(state.correctAnswers).toBe(0);
      expect(state.wrongAnswers).toContain(currentWord);
    });

    it('should add to persistentWrongAnswers on incorrect answer', () => {
      const { submitAnswer, questions } = useQuizStore.getState();
      const currentWord = questions[0];

      submitAnswer(false, currentWord);

      const state = useQuizStore.getState();
      expect(state.persistentWrongAnswers).toContainEqual(currentWord);
    });

    it('should remove from persistentWrongAnswers on correct answer', () => {
      const { submitAnswer, questions } = useQuizStore.getState();
      const currentWord = questions[0];

      // First, add to persistent wrong answers
      submitAnswer(false, currentWord);
      let state = useQuizStore.getState();
      expect(state.persistentWrongAnswers).toContainEqual(currentWord);

      // Then, get it correct
      submitAnswer(true, currentWord);
      state = useQuizStore.getState();
      expect(state.persistentWrongAnswers).not.toContainEqual(currentWord);
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      const { startQuiz } = useQuizStore.getState();
      startQuiz(mockUnit, mockLesson, 'korean_to_english');
    });

    it('should increment currentQuestionIndex', () => {
      const { nextQuestion } = useQuizStore.getState();

      nextQuestion();

      const state = useQuizStore.getState();
      expect(state.currentQuestionIndex).toBe(1);
    });

    it('should set quizActive to false on last question', () => {
      useQuizStore.setState({ currentQuestionIndex: 3 }); // Last question (0-indexed)
      const { nextQuestion } = useQuizStore.getState();

      nextQuestion();

      const state = useQuizStore.getState();
      expect(state.quizActive).toBe(false);
    });
  });

  describe('XP and Level System', () => {
    it('should calculate level correctly based on XP', () => {
      const { addXp } = useQuizStore.getState();

      // Level 1: 0-999 XP
      expect(useQuizStore.getState().level).toBe(1);

      // Add 1000 XP -> Level 2
      addXp(1000);
      expect(useQuizStore.getState().level).toBe(2);

      // Add 1000 more XP -> Level 3
      addXp(1000);
      expect(useQuizStore.getState().level).toBe(3);
    });

    it('should accumulate XP correctly', () => {
      const { addXp } = useQuizStore.getState();

      addXp(100);
      expect(useQuizStore.getState().xp).toBe(100);

      addXp(150);
      expect(useQuizStore.getState().xp).toBe(250);
    });
  });

  describe('endQuiz', () => {
    beforeEach(() => {
      const { startQuiz } = useQuizStore.getState();
      startQuiz(mockUnit, mockLesson, 'korean_to_english');
    });

    it('should add history entry on end', () => {
      useQuizStore.setState({ correctAnswers: 3 });
      const { endQuiz } = useQuizStore.getState();

      endQuiz();

      const state = useQuizStore.getState();
      expect(state.quizHistory.length).toBe(1);
      expect(state.quizHistory[0].correctAnswers).toBe(3);
      expect(state.quizHistory[0].totalQuestions).toBe(4);
    });

    it('should calculate correct percentage', () => {
      useQuizStore.setState({ correctAnswers: 2 }); // 2/4 = 50%
      const { endQuiz } = useQuizStore.getState();

      endQuiz();

      const state = useQuizStore.getState();
      expect(state.quizHistory[0].percentage).toBe(50);
    });

    it('should award XP based on performance', () => {
      useQuizStore.setState({ correctAnswers: 4 }); // 100% = base 40 + bonus 50 = 90 XP
      const { endQuiz } = useQuizStore.getState();

      endQuiz();

      const state = useQuizStore.getState();
      expect(state.xp).toBe(90); // 4 * 10 + 50 bonus
    });

    it('should update lessonProgress with best score', () => {
      useQuizStore.setState({ correctAnswers: 3 }); // 75%
      const { endQuiz } = useQuizStore.getState();

      endQuiz();

      const state = useQuizStore.getState();
      const key = '1-1';
      expect(state.lessonProgress[key]).toBeDefined();
      expect(state.lessonProgress[key].bestScore).toBe(75);
    });
  });

  describe('resetQuiz', () => {
    it('should reset quiz state', () => {
      const { startQuiz, resetQuiz } = useQuizStore.getState();

      startQuiz(mockUnit, mockLesson, 'korean_to_english');
      resetQuiz();

      const state = useQuizStore.getState();
      expect(state.quizActive).toBe(false);
      expect(state.previewActive).toBe(false);
      expect(state.questions).toEqual([]);
      expect(state.currentUnit).toBeNull();
      expect(state.currentLesson).toBeNull();
    });
  });

  describe('startPreview', () => {
    it('should start preview mode', () => {
      const { startPreview } = useQuizStore.getState();

      startPreview(mockUnit, mockLesson);

      const state = useQuizStore.getState();
      expect(state.previewActive).toBe(true);
      expect(state.quizActive).toBe(false);
      expect(state.questions).toEqual(mockLesson.vocabulary);
    });
  });

  describe('startReviewQuiz', () => {
    it('should start review quiz with persistent wrong answers', () => {
      useQuizStore.setState({
        persistentWrongAnswers: [mockVocabulary[0], mockVocabulary[1]],
      });

      const { startReviewQuiz } = useQuizStore.getState();
      startReviewQuiz('spelling');

      const state = useQuizStore.getState();
      expect(state.quizActive).toBe(true);
      expect(state.questions.length).toBe(2);
      expect(state.mode).toBe('spelling');
    });

    it('should not start if no wrong answers', () => {
      const { startReviewQuiz } = useQuizStore.getState();
      startReviewQuiz('spelling');

      const state = useQuizStore.getState();
      expect(state.quizActive).toBe(false);
    });
  });
});

describe('getLevelTitle', () => {
  it('should return correct title for level 1', () => {
    const title = getLevelTitle(1);
    expect(title.title).toBe('Baby Egg');
    expect(title.icon).toBe('🥚');
  });

  it('should return correct title for level 5', () => {
    const title = getLevelTitle(5);
    expect(title.title).toBe('Smart Owl');
    expect(title.icon).toBe('🦉');
  });

  it('should return highest applicable title', () => {
    const title = getLevelTitle(100);
    expect(title.title).toBe('God of Words');
    expect(title.icon).toBe('🌟');
  });

  it('should return correct title for boundary levels', () => {
    expect(getLevelTitle(9).title).toBe('Smart Owl');
    expect(getLevelTitle(10).title).toBe('Fast Eagle');
  });
});

describe('BADGES', () => {
  it('should have unique IDs', () => {
    const ids = BADGES.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have condition functions', () => {
    BADGES.forEach(badge => {
      expect(typeof badge.condition).toBe('function');
    });
  });
});
