import { create } from 'zustand';
import { getMonsterById } from '@/data/monsters';
import { Subject, Difficulty, getRandomQuestion, getRandomVocabQuestion } from '@/data/questions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { RaidRoomRow, RaidPlayer, RoomPhase } from '@/types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Helper to safely use supabase
const db = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export type { RoomPhase };
export type PlayerRole = 'host' | 'guest';

export interface PlayerConfig {
  subject: Subject;
  category: string;
  difficulty: Difficulty;
  ready: boolean;
  vocabUnit?: number;
  vocabLesson?: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  config: PlayerConfig | null;
  damageDealt: number;
  answersCorrect: number;
  answersWrong: number;
  isConnected: boolean;
}

export interface DamageEvent {
  playerId: string;
  damage: number;
  timestamp: number;
  isCombo: boolean;
}

export interface RaidRoom {
  code: string;
  monsterId: string;
  phase: RoomPhase;
  players: Player[];
  monsterCurrentHp: number;
  monsterMaxHp: number;
  damageLog: DamageEvent[];
  startedAt: number | null;
  endedAt: number | null;
  isVictory: boolean;
}

export interface CurrentQuestion {
  q: string;
  a: string;
  options?: string[];
  timeLimit: number;
  subject: Subject;
  category: string;
  difficulty: Difficulty;
}

interface RaidState {
  // Connection state
  isOnline: boolean;
  channel: RealtimeChannel | null;
  _pollInterval: number | null;

  // Room state
  room: RaidRoom | null;
  myPlayerId: string | null;
  phase: RoomPhase | 'lobby';
  soloMode: boolean;

  // Battle state
  currentQuestion: CurrentQuestion | null;
  answerResult: 'correct' | 'wrong' | null;
  lastDamage: number | null;
  comboCount: number;
  monsterShaking: boolean;
  questionStartedAt: number | null;

  // Actions
  createRoom: (playerName: string, monsterId: string) => Promise<string>;
  createSoloRoom: (playerName: string, monsterId: string) => string;
  joinRoom: (code: string, playerName: string) => Promise<boolean>;
  setPlayerConfig: (config: PlayerConfig) => Promise<void>;
  setPlayerReady: (ready: boolean) => Promise<void>;
  startBattle: () => Promise<void>;
  loadNextQuestion: () => void;
  submitAnswer: (answer: string) => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  resetRaid: () => void;
  setMonsterShaking: (v: boolean) => void;
  clearAnswerResult: () => void;
  subscribeToRoom: (code: string) => void;
  unsubscribeFromRoom: () => void;
}

function generateRoomCode(): string {
  // 헷갈리는 문자 제외: 0/O, 1/I/L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

// Convert DB row to local RaidRoom format
function dbRowToRoom(row: RaidRoomRow): RaidRoom {
  return {
    code: row.code,
    monsterId: row.monster_id,
    phase: row.phase,
    players: row.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.isHost ? 'host' : 'guest',
      config: p.config ? {
        subject: p.config.subject as Subject,
        category: p.config.category,
        difficulty: p.config.difficulty as Difficulty,
        ready: p.isReady,
      } : null,
      damageDealt: p.damageDealt,
      answersCorrect: p.correctAnswers,
      answersWrong: p.totalAnswers - p.correctAnswers,
      isConnected: true,
    })),
    monsterCurrentHp: row.monster_hp,
    monsterMaxHp: row.monster_max_hp,
    damageLog: row.damage_log.map((d) => ({
      playerId: d.playerId,
      damage: d.damage,
      timestamp: d.timestamp,
      isCombo: d.damage > 15,
    })),
    startedAt: row.start_time,
    endedAt: null,
    isVictory: row.monster_hp <= 0,
  };
}

// Convert local Player to DB RaidPlayer format
function playerToDbFormat(player: Player): RaidPlayer {
  return {
    id: player.id,
    name: player.name,
    isHost: player.role === 'host',
    isReady: player.config?.ready ?? false,
    config: player.config ? {
      subject: player.config.subject,
      category: player.config.category,
      difficulty: player.config.difficulty,
    } : null,
    damageDealt: player.damageDealt,
    correctAnswers: player.answersCorrect,
    totalAnswers: player.answersCorrect + player.answersWrong,
  };
}

export const useRaidStore = create<RaidState>((set, get) => ({
  isOnline: isSupabaseConfigured(),
  channel: null,
  _pollInterval: null,
  room: null,
  myPlayerId: null,
  phase: 'lobby',
  soloMode: false,
  currentQuestion: null,
  answerResult: null,
  lastDamage: null,
  comboCount: 0,
  monsterShaking: false,
  questionStartedAt: null,

  createRoom: async (playerName: string, monsterId: string) => {
    const code = generateRoomCode();
    const playerId = generatePlayerId();
    const monster = getMonsterById(monsterId);

    console.log('[RaidStore] Creating room:', { code, playerId, monsterId });
    console.log('[RaidStore] Supabase configured:', isSupabaseConfigured());

    if (!monster) {
      console.error('[RaidStore] Monster not found:', monsterId);
      return '';
    }

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      role: 'host',
      config: null,
      damageDealt: 0,
      answersCorrect: 0,
      answersWrong: 0,
      isConnected: true,
    };

    const room: RaidRoom = {
      code,
      monsterId,
      phase: 'waiting',
      players: [hostPlayer],
      monsterCurrentHp: monster.hp,
      monsterMaxHp: monster.hp,
      damageLog: [],
      startedAt: null,
      endedAt: null,
      isVictory: false,
    };

    // Save to database (required for multiplayer)
    if (isSupabaseConfigured()) {
      try {
        const { error } = await db().from('raid_rooms').insert({
          code,
          host_id: playerId,
          monster_id: monsterId,
          phase: 'waiting',
          monster_hp: monster.hp,
          monster_max_hp: monster.hp,
          combo: 0,
          start_time: null,
          players: [playerToDbFormat(hostPlayer)],
          damage_log: [],
        });

        if (error) {
          console.error('[RaidStore] Failed to create room:', error.message, error.details, error.hint);
          return '';
        }

        console.log('[RaidStore] Room created successfully in Supabase:', code);
        get().subscribeToRoom(code);
      } catch (err) {
        console.error('[RaidStore] Network error creating room:', err);
        return '';
      }
    } else {
      console.error('[RaidStore] Supabase not configured');
      return '';
    }

    set({ room, myPlayerId: playerId, phase: 'waiting' });
    return code;
  },

  createSoloRoom: (playerName: string, monsterId: string) => {
    const code = generateRoomCode();
    const playerId = generatePlayerId();
    const monster = getMonsterById(monsterId);

    if (!monster) return '';

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      role: 'host',
      config: null,
      damageDealt: 0,
      answersCorrect: 0,
      answersWrong: 0,
      isConnected: true,
    };

    const room: RaidRoom = {
      code,
      monsterId,
      phase: 'waiting',
      players: [hostPlayer],
      monsterCurrentHp: monster.hp,
      monsterMaxHp: monster.hp,
      damageLog: [],
      startedAt: null,
      endedAt: null,
      isVictory: false,
    };

    set({ room, myPlayerId: playerId, phase: 'waiting', soloMode: true });
    return code;
  },

  joinRoom: async (code: string, playerName: string) => {
    const playerId = generatePlayerId();
    const normalizedCode = code.toUpperCase().trim();

    console.log('[RaidStore] Attempting to join room:', normalizedCode);
    console.log('[RaidStore] Supabase configured:', isSupabaseConfigured());

    if (!isSupabaseConfigured()) {
      console.error('[RaidStore] Supabase not configured');
      return false;
    }

    try {
      console.log('[RaidStore] Querying Supabase for room code:', normalizedCode);

      const { data: existingRoom, error: fetchError } = await db()
        .from('raid_rooms')
        .select('*')
        .eq('code', normalizedCode)
        .single();

      if (fetchError || !existingRoom) {
        console.error('[RaidStore] Room not found:', fetchError?.message, fetchError?.details, fetchError?.hint);
        return false;
      }

      if (existingRoom.players.length >= 2) {
        console.error('[RaidStore] Room is full');
        return false;
      }

      const guestPlayer: RaidPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        isReady: false,
        config: null,
        damageDealt: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      };

      const { error: updateError } = await db()
        .from('raid_rooms')
        .update({
          players: [...existingRoom.players, guestPlayer],
        })
        .eq('code', normalizedCode);

      if (updateError) {
        console.error('[RaidStore] Failed to join room:', updateError);
        return false;
      }

      // Subscribe to realtime updates
      get().subscribeToRoom(normalizedCode);

      const room = dbRowToRoom({
        ...existingRoom,
        players: [...existingRoom.players, guestPlayer],
      });

      console.log('[RaidStore] Successfully joined room:', room.code);
      set({ room, myPlayerId: playerId, phase: 'waiting' });
      return true;
    } catch (err) {
      console.error('[RaidStore] Network error joining room:', err);
      return false;
    }
  },

  setPlayerConfig: async (config: PlayerConfig) => {
    const { room, myPlayerId, soloMode } = get();
    if (!room || !myPlayerId) return;

    const updatedPlayers = room.players.map((p) =>
      p.id === myPlayerId ? { ...p, config } : p
    );

    // Update Supabase if configured (skip in solo mode)
    if (!soloMode && isSupabaseConfigured()) {
      await db()
        .from('raid_rooms')
        .update({
          players: updatedPlayers.map(playerToDbFormat),
        })
        .eq('code', room.code);
    }

    set((state) => ({
      room: state.room ? { ...state.room, players: updatedPlayers } : null,
    }));
  },

  setPlayerReady: async (ready: boolean) => {
    const { room, myPlayerId, soloMode } = get();
    if (!room || !myPlayerId) return;

    const updatedPlayers = room.players.map((p) =>
      p.id === myPlayerId
        ? { ...p, config: p.config ? { ...p.config, ready } : null }
        : p
    );

    // Update Supabase if configured (skip in solo mode)
    if (!soloMode && isSupabaseConfigured()) {
      await db()
        .from('raid_rooms')
        .update({
          players: updatedPlayers.map(playerToDbFormat),
        })
        .eq('code', room.code);
    }

    set((state) => ({
      room: state.room ? { ...state.room, players: updatedPlayers } : null,
    }));
  },

  startBattle: async () => {
    const { room, soloMode } = get();
    if (!room) return;

    const startTime = Date.now();

    // Update Supabase if configured (skip in solo mode)
    if (!soloMode && isSupabaseConfigured()) {
      await db()
        .from('raid_rooms')
        .update({
          phase: 'battle',
          start_time: startTime,
        })
        .eq('code', room.code);
    }

    set((state) => ({
      room: state.room
        ? { ...state.room, phase: 'battle', startedAt: startTime }
        : null,
      phase: 'battle',
    }));
    get().loadNextQuestion();
  },

  loadNextQuestion: () => {
    const { room, myPlayerId } = get();
    if (!room || !myPlayerId) return;

    const me = room.players.find((p) => p.id === myPlayerId);
    if (!me?.config) return;

    const { subject, category, difficulty } = me.config;

    let q;
    if (subject === 'english') {
      const vocabUnit = me.config.vocabUnit ?? 1;
      const vocabLesson = me.config.vocabLesson ?? 1;
      q = getRandomVocabQuestion(vocabUnit, vocabLesson, difficulty);
    } else {
      q = getRandomQuestion(subject, category, difficulty);
    }
    if (!q) return;

    set({
      currentQuestion: {
        ...q,
        timeLimit: difficulty === 'easy' ? 15 : difficulty === 'normal' ? 10 : 7,
        subject,
        category,
        difficulty,
      },
      answerResult: null,
      questionStartedAt: Date.now(),
    });
  },

  submitAnswer: async (answer: string) => {
    const { room, currentQuestion, myPlayerId, comboCount, soloMode } = get();
    if (!room || !currentQuestion || !myPlayerId) return;

    // 영어 단어: "/"로 구분된 형태 중 하나라도 맞으면 정답
    let isCorrect: boolean;
    if (currentQuestion.subject === 'english') {
      const userAnswer = answer.trim().toLowerCase();
      const acceptableAnswers = currentQuestion.a.toLowerCase().split('/').map((s) => s.trim());
      isCorrect = acceptableAnswers.some((a) => a === userAnswer);
    } else {
      isCorrect = answer.trim().toLowerCase() === currentQuestion.a.trim().toLowerCase();
    }

    const me = room.players.find((p) => p.id === myPlayerId);
    const baseDamage = me?.config
      ? ({ easy: 10, normal: 15, hard: 25 } as Record<Difficulty, number>)[
          me.config.difficulty
        ]
      : 10;

    const newCombo = isCorrect ? comboCount + 1 : 0;
    const comboMultiplier = newCombo >= 5 ? 2.0 : newCombo >= 3 ? 1.5 : 1.0;
    const damage = isCorrect ? Math.round(baseDamage * comboMultiplier) : 0;

    if (isCorrect && room.phase === 'battle') {
      const newHp = Math.max(0, room.monsterCurrentHp - damage);
      const isVictory = newHp === 0;

      const damageEvent: DamageEvent = {
        playerId: myPlayerId,
        damage,
        timestamp: Date.now(),
        isCombo: newCombo >= 3,
      };

      const updatedPlayers = room.players.map((p) =>
        p.id === myPlayerId
          ? {
              ...p,
              damageDealt: p.damageDealt + damage,
              answersCorrect: p.answersCorrect + 1,
            }
          : p
      );

      // Update Supabase if configured (skip in solo mode)
      if (!soloMode && isSupabaseConfigured()) {
        await db()
          .from('raid_rooms')
          .update({
            monster_hp: newHp,
            phase: isVictory ? 'result' : room.phase,
            combo: newCombo,
            players: updatedPlayers.map(playerToDbFormat),
            damage_log: [...room.damageLog, {
              playerId: damageEvent.playerId,
              damage: damageEvent.damage,
              timestamp: damageEvent.timestamp,
            }],
          })
          .eq('code', room.code);
      }

      set((state) => ({
        room: state.room
          ? {
              ...state.room,
              monsterCurrentHp: newHp,
              phase: isVictory ? 'result' : state.room.phase,
              isVictory,
              endedAt: isVictory ? Date.now() : state.room.endedAt,
              damageLog: [...state.room.damageLog, damageEvent],
              players: updatedPlayers,
            }
          : null,
        answerResult: 'correct',
        lastDamage: damage,
        comboCount: newCombo,
        monsterShaking: true,
        phase: isVictory ? 'result' : state.phase,
      }));
    } else {
      const updatedPlayers = room.players.map((p) =>
        p.id === myPlayerId
          ? { ...p, answersWrong: p.answersWrong + 1 }
          : p
      );

      // Update Supabase if configured (skip in solo mode)
      if (!soloMode && isSupabaseConfigured()) {
        await db()
          .from('raid_rooms')
          .update({
            combo: 0,
            players: updatedPlayers.map(playerToDbFormat),
          })
          .eq('code', room.code);
      }

      set((state) => ({
        room: state.room
          ? {
              ...state.room,
              players: updatedPlayers,
            }
          : null,
        answerResult: 'wrong',
        lastDamage: 0,
        comboCount: 0,
      }));
    }
  },

  subscribeToRoom: (code: string) => {
    if (!isSupabaseConfigured()) return;

    // Unsubscribe from previous channel
    get().unsubscribeFromRoom();

    // Helper: fetch the full row from DB (realtime payload may omit JSONB columns)
    const fetchFullRoom = async () => {
      const { data, error } = await db()
        .from('raid_rooms')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) return;

      const room = dbRowToRoom(data as RaidRoomRow);
      set((state) => ({
        room,
        phase: room.phase,
      }));
    };

    const channel = db()
      .channel(`raid_room_${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raid_rooms',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          console.log('[RaidStore] Realtime event:', payload.eventType);
          if (payload.eventType === 'UPDATE') {
            fetchFullRoom();
          } else if (payload.eventType === 'DELETE') {
            get().resetRaid();
          }
        }
      )
      .subscribe((status) => {
        console.log('[RaidStore] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          // Fetch latest state once subscription is confirmed
          fetchFullRoom();
        }
      });

    // Polling fallback: periodically fetch room state during waiting phase
    const pollInterval = setInterval(() => {
      const currentRoom = get().room;
      if (!currentRoom || currentRoom.phase !== 'waiting') {
        clearInterval(pollInterval);
        return;
      }
      fetchFullRoom();
    }, 3000);

    set({ channel, _pollInterval: pollInterval as unknown as number });
  },

  unsubscribeFromRoom: () => {
    const { channel, _pollInterval } = get();
    if (_pollInterval) {
      clearInterval(_pollInterval);
    }
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    set({ channel: null, _pollInterval: null });
  },

  kickPlayer: async (playerId: string) => {
    const { room, myPlayerId } = get();
    if (!room || !myPlayerId) return;

    // 방장만 내보내기 가능
    const me = room.players.find((p) => p.id === myPlayerId);
    if (me?.role !== 'host') return;

    const updatedPlayers = room.players.filter((p) => p.id !== playerId);

    if (isSupabaseConfigured()) {
      await db()
        .from('raid_rooms')
        .update({
          players: updatedPlayers.map(playerToDbFormat),
        })
        .eq('code', room.code);
    }

    set((state) => ({
      room: state.room ? { ...state.room, players: updatedPlayers } : null,
    }));
  },

  setMonsterShaking: (v: boolean) => set({ monsterShaking: v }),

  clearAnswerResult: () => set({ answerResult: null, lastDamage: null }),

  resetRaid: () => {
    get().unsubscribeFromRoom();
    set({
      room: null,
      myPlayerId: null,
      phase: 'lobby',
      soloMode: false,
      currentQuestion: null,
      answerResult: null,
      lastDamage: null,
      comboCount: 0,
      monsterShaking: false,
      questionStartedAt: null,
      channel: null,
      _pollInterval: null,
    });
  },
}));
