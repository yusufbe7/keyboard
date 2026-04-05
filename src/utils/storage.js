// ── Keys ─────────────────────────────────────────────────────
const K = {
  PROFILE:  'typeflow-profile',
  STATS:    'typeflow-global-stats',
  ACTIVITY: 'typeflow-activity',
  LETTER:   'typeflow-letter-stats',
  DAILY:    'typeflow-daily',
  UNLOCKED: 'typeflow-unlocked',
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Profile ───────────────────────────────────────────────────
export function getProfile() {
  return load(K.PROFILE, {
    username: 'Player',
    joinDate: new Date().toISOString().split('T')[0],
  });
}
export function saveProfile(data) { save(K.PROFILE, data); }

// ── Global stats ──────────────────────────────────────────────
const DEFAULT_STATS = {
  testsStarted: 0,
  testsCompleted: 0,
  totalTimeSecs: 0,
  bestWpm: 0,
  totalScore: 0,
  streak: 0,
  lastActiveDate: null,
  bestScores: {},       // { practice: {wpm,acc}, test60: {wpm,acc}, test120: {wpm,acc} }
};
export function getGlobalStats()     { return { ...DEFAULT_STATS, ...load(K.STATS, {}) }; }
export function saveGlobalStats(d)   { save(K.STATS, d); }

// ── Activity (heatmap) ────────────────────────────────────────
// shape: { 'YYYY-MM-DD': { count, time } }
export function getActivity()        { return load(K.ACTIVITY, {}); }
export function saveActivity(d)      { save(K.ACTIVITY, d); }

export function recordActivity(date, count = 1, time = 0) {
  const act = getActivity();
  const prev = act[date] || { count: 0, time: 0 };
  act[date] = { count: prev.count + count, time: prev.time + time };
  saveActivity(act);
}

// ── Letter stats ──────────────────────────────────────────────
export function getLetterStats(order) {
  const saved = load(K.LETTER, {});
  return Object.fromEntries(order.map(l => [l, saved[l] || { attempts: 0, errors: 0 }]));
}
export function saveLetterStats(d)   { save(K.LETTER, d); }

// ── Unlocked count ────────────────────────────────────────────
export function getUnlockedCount(def = 5) {
  const v = parseInt(localStorage.getItem(K.UNLOCKED) ?? '', 10);
  return isNaN(v) ? def : v;
}
export function saveUnlockedCount(n) { localStorage.setItem(K.UNLOCKED, String(n)); }

// ── Daily time ────────────────────────────────────────────────
export function getDailyTime() {
  const today = new Date().toDateString();
  const d = load(K.DAILY, {});
  return d.date === today ? (d.time || 0) : 0;
}
export function saveDailyTime(t) {
  save(K.DAILY, { date: new Date().toDateString(), time: t });
}

// ── Streak helpers ────────────────────────────────────────────
export function calcStreak(stats) {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  if (stats.lastActiveDate === today)      return { streak: stats.streak, date: today };
  if (stats.lastActiveDate === yesterday)  return { streak: stats.streak + 1, date: today };
  return { streak: 1, date: today };
}

// ── Record completed lesson ───────────────────────────────────
export function recordLesson({ mode, wpm, accuracy, timeSecs }) {
  const stats  = getGlobalStats();
  const { streak, date } = calcStreak(stats);
  const score  = Math.round(wpm * (accuracy / 100) * 10);

  const bestScores = { ...stats.bestScores };
  const key = mode === 'practice' ? 'practice' : mode === 'test60' ? 'test60' : 'test120';
  if (!bestScores[key] || wpm > bestScores[key].wpm) {
    bestScores[key] = { wpm, acc: accuracy, date };
  }

  saveGlobalStats({
    ...stats,
    testsCompleted: stats.testsCompleted + 1,
    totalTimeSecs:  stats.totalTimeSecs  + timeSecs,
    bestWpm:        Math.max(stats.bestWpm, wpm),
    totalScore:     stats.totalScore + score,
    streak,
    lastActiveDate: date,
    bestScores,
  });

  recordActivity(date, 1, timeSecs);
}

export function recordTestStart() {
  const s = getGlobalStats();
  saveGlobalStats({ ...s, testsStarted: s.testsStarted + 1 });
}

// ── Level system ──────────────────────────────────────────────
const XP_PER_LEVEL = 500;
export function getLevel(totalScore) {
  const score = totalScore || 0;
  return {
    level:   Math.floor(score / XP_PER_LEVEL) + 1,
    current: score % XP_PER_LEVEL,
    max:     XP_PER_LEVEL,
  };
}
