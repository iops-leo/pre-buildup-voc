'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRaidStore } from '@/store/useRaidStore';
import { monsterWorlds, Monster } from '@/data/monsters';
import { useRouter } from 'next/navigation';
import { Swords, Users, ChevronRight, ArrowLeft, User, Loader2 } from 'lucide-react';

type LobbyMode = 'main' | 'create' | 'join' | 'solo';

export function RaidLobby() {
  const router = useRouter();
  const { createRoom, createSoloRoom, joinRoom } = useRaidStore();
  const [mode, setMode] = useState<LobbyMode>('main');
  const [playerName, setPlayerName] = useState('');
  const [selectedMonsterId, setSelectedMonsterId] = useState('green_slime');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // localStorage에서 이름 복원
  useEffect(() => {
    const saved = localStorage.getItem('raid_player_name');
    if (saved) setPlayerName(saved);
  }, []);

  function updatePlayerName(name: string) {
    setPlayerName(name);
    setError('');
    if (name.trim()) localStorage.setItem('raid_player_name', name.trim());
  }

  const allMonsters: Monster[] = monsterWorlds.flatMap((w) => w.monsters);

  async function handleCreate() {
    if (!playerName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const code = await createRoom(playerName.trim(), selectedMonsterId);
      if (code) {
        router.push(`/raid/${code}`);
      } else {
        setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setLoading(false);
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!playerName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (joinCode.trim().length !== 6) {
      setError('6자리 방 코드를 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await joinRoom(joinCode.trim().toUpperCase(), playerName.trim());
      if (success) {
        router.push(`/raid/${joinCode.trim().toUpperCase()}`);
      } else {
        setError('방을 찾을 수 없거나 이미 가득 찼습니다. 코드를 확인해주세요.');
        setLoading(false);
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
      setLoading(false);
    }
  }

  function handleSoloCreate() {
    if (!playerName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    setError('');
    const code = createSoloRoom(playerName.trim(), selectedMonsterId);
    if (code) {
      router.push(`/raid/${code}`);
    } else {
      setError('방 생성에 실패했습니다.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-3">⚔️</div>
          <h1 className="text-4xl font-black text-white mb-1">몬스터 레이드</h1>
          <p className="text-slate-400 text-sm">친구와 함께 몬스터를 물리치자!</p>
        </motion.div>

        {mode === 'main' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => setMode('create')}
              className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-purple-900/80 to-violet-900/80 border border-purple-700 hover:border-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-700 flex items-center justify-center text-2xl">
                  🏰
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-lg">방 만들기</div>
                  <div className="text-purple-300 text-sm">몬스터를 선택하고 친구를 초대</div>
                </div>
              </div>
              <ChevronRight className="text-purple-400 group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            <button
              onClick={() => setMode('join')}
              className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-900/80 to-cyan-900/80 border border-blue-700 hover:border-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-2xl">
                  🚪
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-lg">방 참가하기</div>
                  <div className="text-blue-300 text-sm">6자리 코드로 친구 방에 입장</div>
                </div>
              </div>
              <ChevronRight className="text-blue-400 group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            <button
              onClick={() => setMode('solo')}
              className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-green-900/80 border border-emerald-700 hover:border-emerald-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-2xl">
                  🗡️
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-lg">혼자하기</div>
                  <div className="text-emerald-300 text-sm">솔로 레이드로 몬스터에 도전</div>
                </div>
              </div>
              <ChevronRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl text-slate-500 hover:text-slate-300 transition-colors mt-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">홈으로 돌아가기</span>
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => { setMode('main'); setError(''); }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">뒤로</span>
            </button>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🏰</span> 방 만들기
              </h2>

              {/* Player name */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">내 이름</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => updatePlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Monster selection */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">몬스터 선택</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {allMonsters.map((monster) => (
                    <button
                      key={monster.id}
                      onClick={() => setSelectedMonsterId(monster.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        selectedMonsterId === monster.id
                          ? 'border-purple-500 bg-purple-900/30 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{monster.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{monster.name}</div>
                        <div className="text-xs text-slate-500">HP {monster.hp}</div>
                      </div>
                      {monster.isBoss && (
                        <span className="ml-auto text-xs text-yellow-400 font-bold shrink-0">BOSS</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-black text-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> 방 만들기 중...</> : '방 만들기 ⚔️'}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'solo' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => { setMode('main'); setError(''); }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">뒤로</span>
            </button>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🗡️</span> 혼자하기
              </h2>

              {/* Player name */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">내 이름</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => updatePlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Monster selection */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">몬스터 선택</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {allMonsters.map((monster) => (
                    <button
                      key={monster.id}
                      onClick={() => setSelectedMonsterId(monster.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        selectedMonsterId === monster.id
                          ? 'border-emerald-500 bg-emerald-900/30 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{monster.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{monster.name}</div>
                        <div className="text-xs text-slate-500">HP {monster.hp}</div>
                      </div>
                      {monster.isBoss && (
                        <span className="ml-auto text-xs text-yellow-400 font-bold shrink-0">BOSS</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleSoloCreate}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                솔로 레이드 시작 🗡️
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => { setMode('main'); setError(''); }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">뒤로</span>
            </button>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🚪</span> 방 참가하기
              </h2>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">내 이름</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => updatePlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">방 코드 (6자리)</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="예: AB1C2D"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-lg tracking-widest text-center"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-black text-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> 입장 중...</> : '입장하기 🚀'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
