import { useState, useEffect, useCallback } from 'react';
import Keyboard from './components/Keyboard';
import TextDisplay from './components/TextDisplay';
import InfoPanel from './components/InfoPanel';
import { UNLOCK_ORDER, DAILY_GOAL_SECS } from './constants';

// ── Word lists ────────────────────────────────────────────────
const ALL_WORDS_EN = [
  'an','in','on','no','or','us','go','he','we','me','be','so',
  'air','ran','ear','are','era','inn','nil','oil','lot','let',
  'net','ten','art','ant','tan','rat','tar','lie','lit','tin',
  'one','toe','ore','son','sun','run','old','tip','sir','sit',
  'see','set','sue','tie','too','top','row','own','our','out',
  'rain','rein','earn','near','nine','rani','aria','rune',
  'real','lean','line','liar','rail','nail','lain','elan',
  'late','rate','tile','tale','note','tone','role','lone',
  'lion','loin','loan','toil','oral','iron','root','roll',
  'toll','rose','nose','lose','sole','sore','lore','rote',
  'lute','tune','lure','unit','iris','trio','arid',
  'also','able','area','away','base','body','case','city',
  'come','data','days','done','door','down','draw','else',
  'even','face','fact','fall','fast','feel','fine','fire',
  'free','full','give','goes','gone','good','grow','half',
  'hand','hard','head','help','here','high','hold','home',
  'hope','hour','idea','into','keep','kind','knew','know',
  'land','last','left','less','life','like','list','live',
  'long','look','lost','love','made','make','many','mean',
  'meet','mind','miss','most','move','much','name','need',
  'next','nice','none','open','part','past','path','pick',
  'plan','play','post','pull','push','read','room','rule',
  'same','seen','self','send','show','side','sign','size',
  'slow','sort','stay','step','stop','take','talk','task',
  'term','test','text','tree','true','turn','type','used',
  'vast','very','view','walk','week','went','wide','wind',
  'wise','wish','word','work','year','zero',
  'arena','inner','liner','alien','trail','trial','train',
  'later','alert','alter','elite','inlet','liter','title',
  'atone','orient','ratio','ornate','elation',
  'snore','store','stone','stole','toner','oiler',
  'route','outer','unite','ruins','round','sound','union',
  'dusty','study','style','rusty',
  'grand','young','groan','grain','going','doing','along',
  'night','light','right','might','sight','thing','short',
  'plant','print','plain','place','point','stand','price',
  'water','world','write','power','words','throw','brown',
  'build','brand','bring','burst','brain','blend',
  'think','drink','track','break','brick','blank','brink',
  'floor','front','frost','draft','shift','swift','drift',
  'could','color','clear','count','court','coast','clock',
  'voice','value','visit','drive','brave','alive','stove',
  'dream','steam','storm','cream','bloom','claim','gleam',
  'which','about','would','there','their','small','large',
  'where','after','think','again','while','those','right',
  'every','found','still','since','never','quite','often',
  'house','under','water','cause','state','great','first',
  'being','early','three','force','north','south','earth',
  'heart','learn','share','until','trust','cross','field',
  'event','score','stage','smart','speak','upper','usual',
  'whole','works','given','these','taken','among','bring',
  'carry','start','close','begin','reach','focus','grant',
  'input','local','major','minor','moral','novel','order',
  'other','paint','press','prime','proof','proud','quite',
  'radio','raise','range','rapid','ratio','reach','react',
  'ready','refer','reply','river','robot','rough','royal',
  'scale','scene','scope','serve','share','sharp','shift',
  'shore','shout','skill','sleep','slide','slope','smile',
  'solve','space','spare','spend','sport','staff','stake',
  'stark','stays','steam','steel','steep','steer','stern',
  'stick','stiff','stock','stood','storm','story','straw',
  'strip','stuck','stuff','super','surge','swear','sweet',
  'swept','swing','sword','teach','tense','thick','tired',
  'today','token','touch','tough','tower','towns','trade',
  'trans','treat','trend','tribe','tried','troop','truck',
  'truly','truth','tumor','ultra','unity','urban','usage',
  'utter','valid','vault','video','viral','vital','voter',
  'wagon','watch','waste',
  'talent','rental','entail','retail','tinsel','antler',
  'listen','silent','enlist','stolen','lonely','nation',
  'garden','hidden','golden','burden','wooden','warden',
  'height','weight','flight','friend','people','simple',
  'planet','ground','around','bridge','change','chance',
  'mother','father','strong','street','breath','spread',
  'nature','future','number','winter','system','spring',
  'center','mental','dental','gentle','travel','silver',
  'driver','better','letter','corner','border','target',
  'market','basket','battle','castle','handle','candle',
  'inside','island','itself','launch','leader','lights',
  'looked','lovely','making','master','matter','member',
  'method','middle','minute','mirror','mobile','modern',
  'moment','motion','muscle','mutual','nearby','needed',
  'normal','notice','object','online','opened','option',
  'output','palace','parent','passed','period','placed',
  'player','pocket','police','portal','posted','pretty',
  'proven','public','pulled','pushed','raised','rather',
  'reason','record','remain','report','result','return',
  'review','rights','rising','robust','broken',
];

const ALL_WORDS_UZ = [
  'an','in','air','ran','inn',
  'rain','earn','near','real','liar','rail','liner',
  'uy','non','suv','ona','ota','bola','yosh','tosh','bosh',
  'kun','yil','oy','ana','nan','nari','rani',
  'kino','stol','stul','ovoz','obod','atlas',
  'kitob','qalam','maktab','deraza','oila','xona','dars',
  'ovqat','radio','kalit','shahar','inson',
];

// ── Helpers ───────────────────────────────────────────────────
function getAvailableWords(unlocked, lang) {
  const src = lang === 'en' ? ALL_WORDS_EN : ALL_WORDS_UZ;
  const set = new Set(unlocked);
  return src.filter(w => [...w].every(c => set.has(c)));
}

function genWords(unlocked, lang, count = 25) {
  const pool = getAvailableWords(unlocked, lang);
  const fallback = lang === 'en'
    ? ['an','in','air','ran','rain','earn','near']
    : ['ana','nari','uy','ran','air'];
  const src = pool.length >= 4 ? pool : fallback;
  const words = [];
  let prev = '';
  for (let i = 0; i < count; i++) {
    let w, tries = 0;
    do { w = src[Math.floor(Math.random() * src.length)]; tries++; }
    while (w === prev && src.length > 1 && tries < 10);
    words.push(w);
    prev = w;
  }
  return words;
}

const INIT = 5; // start with a, n, i, r, e

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('en');
  const [unlockedCount, setUnlockedCount] = useState(INIT);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [words, setWords] = useState(() => genWords(UNLOCK_ORDER.slice(0, INIT), 'en'));
  const [wordIndex, setWordIndex] = useState(0);

  // New typing state — cursor + per-char errors
  const [charIndex, setCharIndex] = useState(0);
  const [charHasError, setCharHasError] = useState(new Set());
  const [wordErrors, setWordErrors] = useState([]); // bool[] per completed word

  const [activeKey, setActiveKey] = useState('');
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  // Per-letter stats { attempts, errors }
  const [letterStats, setLetterStats] = useState(() =>
    Object.fromEntries(UNLOCK_ORDER.map(l => [l, { attempts: 0, errors: 0 }]))
  );

  // Previous lesson metrics for trend arrows
  const [prevMetrics, setPrevMetrics] = useState({ wpm: 0, accuracy: 100, score: 0 });

  // Daily time (persisted to localStorage)
  const [dailyTime, setDailyTime] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = JSON.parse(localStorage.getItem('typeflow-daily') || '{}');
      return saved.date === today ? (saved.time || 0) : 0;
    } catch { return 0; }
  });

  const unlockedLetters = UNLOCK_ORDER.slice(0, unlockedCount);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      setTime(t => t + 1);
      setDailyTime(d => {
        const nd = d + 1;
        try {
          localStorage.setItem('typeflow-daily', JSON.stringify({
            date: new Date().toDateString(), time: nd,
          }));
        } catch {}
        return nd;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  // ── Live stats ────────────────────────────────────────────
  const completedCorrect = wordErrors.reduce((s, w) => s + w.filter(Boolean).length, 0);
  const completedTotal   = wordErrors.reduce((s, w) => s + w.length, 0);
  const currentErrors    = [...charHasError].filter(i => i < charIndex).length;
  const totalCorrect     = completedCorrect + (charIndex - currentErrors);
  const totalTyped       = completedTotal + charIndex;
  const wpm      = time > 0 ? Math.round((totalCorrect / 5) / (time / 60) * 10) / 10 : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 10000) / 100 : 100;
  const score    = Math.round(wpm * (accuracy / 100) * 10);

  // Current expected character
  const currentWord = !finished && words[wordIndex] ? words[wordIndex] : null;
  const currentChar = currentWord ? (currentWord[charIndex] ?? null) : null;

  // ── Key handler ────────────────────────────────────────────
  const handleKey = useCallback((e) => {
    // Tab = restart
    if (e.key === 'Tab') {
      e.preventDefault();
      setWords(genWords(UNLOCK_ORDER.slice(0, unlockedCount), lang));
      setWordIndex(0); setCharIndex(0); setCharHasError(new Set()); setWordErrors([]);
      setStarted(false); setTime(0); setFinished(false); setJustUnlocked(false);
      return;
    }

    // Highlight pressed key on keyboard visual
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 150);

    if (finished) return;
    if (!started && e.key.length === 1) setStarted(true);

    const word = words[wordIndex];
    const expected = word?.[charIndex];

    // Backspace — go back one position
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (charIndex > 0) setCharIndex(i => i - 1);
      return;
    }

    // Space — only advances word if word is fully typed
    if (e.key === ' ') {
      e.preventDefault();
      if (!word || charIndex < word.length) return; // word not done yet — ignore space
      // Word fully typed — commit and move on
      const result = [...word].map((_, ci) => !charHasError.has(ci));

      // Compute final lesson stats before resetting
      const allWordErrors = [...wordErrors, result];
      const fc = allWordErrors.reduce((s, w) => s + w.filter(Boolean).length, 0);
      const ft = allWordErrors.reduce((s, w) => s + w.length, 0);
      const fwpm = time > 0 ? Math.round((fc / 5) / (time / 60) * 10) / 10 : 0;
      const facc = ft > 0 ? Math.round((fc / ft) * 10000) / 100 : 100;
      const fscore = Math.round(fwpm * (facc / 100) * 10);

      setWordErrors(r => [...r, result]);
      setCharIndex(0);
      setCharHasError(new Set());

      const nextIdx = wordIndex + 1;
      if (nextIdx >= words.length) {
        // Lesson finished
        setFinished(true);
        setPrevMetrics({ wpm: fwpm, accuracy: facc, score: fscore });
        if (facc >= 90) {
          const ns = streak + 1;
          if (ns >= 2 && unlockedCount < UNLOCK_ORDER.length) {
            setUnlockedCount(c => c + 1);
            setStreak(0);
            setJustUnlocked(true);
          } else {
            setStreak(ns);
            setJustUnlocked(false);
          }
        } else {
          setStreak(0);
          setJustUnlocked(false);
        }
      } else {
        setWordIndex(nextIdx);
      }
      return;
    }

    // Regular character key
    if (!expected || e.key.length !== 1) return;

    if (e.key === expected) {
      // ✅ Correct key — advance cursor and record stat
      const hadError = charHasError.has(charIndex);
      const ci = charIndex;
      setLetterStats(prev => {
        const s = prev[expected] || { attempts: 0, errors: 0 };
        return { ...prev, [expected]: { attempts: s.attempts + 1, errors: s.errors + (hadError ? 1 : 0) } };
      });
      setCharIndex(i => i + 1);
    } else {
      // ❌ Wrong key — mark error at current position, DO NOT advance
      const ci = charIndex;
      setCharHasError(prev => { const n = new Set(prev); n.add(ci); return n; });
    }
  }, [finished, started, words, wordIndex, charIndex, charHasError, wordErrors, wpm, accuracy, score, streak, unlockedCount, lang, time]);

  const restart = () => {
    setWords(genWords(unlockedLetters, lang));
    setWordIndex(0); setCharIndex(0); setCharHasError(new Set()); setWordErrors([]);
    setStarted(false); setTime(0); setFinished(false); setJustUnlocked(false);
  };

  const switchLang = () => {
    const nl = lang === 'en' ? 'uz' : 'en';
    setLang(nl);
    setWords(genWords(unlockedLetters, nl));
    setWordIndex(0); setCharIndex(0); setCharHasError(new Set()); setWordErrors([]);
    setStarted(false); setTime(0); setFinished(false); setJustUnlocked(false);
  };

  return (
    <div onKeyDown={handleKey} tabIndex={0} autoFocus style={{ outline: 'none', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 60,
        background: '#161616', borderBottom: '1px solid #2a2a2a',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⌨️</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#e0e0e0', letterSpacing: -0.5 }}>
            TypeFlow
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 12, color: '#555' }}>
            Press{' '}
            <kbd style={{
              background: '#2a2a2a', border: '1px solid #444', borderRadius: 4,
              padding: '2px 7px', fontSize: 11, color: '#aaa',
            }}>Tab</kbd>
            {' '}to restart
          </span>
          <button
            onClick={switchLang}
            style={{
              background: '#2a2a2a', border: '1px solid #444', borderRadius: 6,
              padding: '6px 14px', color: '#d4d4d4', fontSize: 13, fontWeight: 600,
            }}
          >
            {lang === 'en' ? '🇺🇿 UZ' : '🇬🇧 EN'}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '28px 32px', width: '100%' }}>

        {/* keybr-style info panel */}
        <InfoPanel
          wpm={wpm}
          accuracy={accuracy}
          score={score}
          prevMetrics={prevMetrics}
          unlockedCount={unlockedCount}
          letterStats={letterStats}
          currentChar={currentChar}
          streak={streak}
          dailyTime={dailyTime}
          dailyGoal={DAILY_GOAL_SECS}
        />

        {/* Typing area or finish screen */}
        {finished ? (
          <FinishScreen
            wpm={wpm}
            accuracy={accuracy}
            score={score}
            streak={streak}
            unlockedCount={unlockedCount}
            justUnlocked={justUnlocked}
            onRestart={restart}
          />
        ) : (
          <TextDisplay
            words={words}
            wordIndex={wordIndex}
            charIndex={charIndex}
            charHasError={charHasError}
            wordErrors={wordErrors}
          />
        )}

        {/* Keyboard */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Keyboard activeKey={activeKey} />
        </div>
      </main>
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────
function FinishScreen({ wpm, accuracy, score, streak, unlockedCount, justUnlocked, onRestart }) {
  const good = accuracy >= 90;
  const newlyUnlocked = justUnlocked ? UNLOCK_ORDER[unlockedCount - 1]?.toUpperCase() : null;
  const nextLetter = UNLOCK_ORDER[unlockedCount]?.toUpperCase();

  return (
    <div style={{
      background: '#1a1a1a',
      border: `1px solid ${justUnlocked ? '#78350f' : good ? '#14532d' : '#7f1d1d'}`,
      borderRadius: 12, padding: '36px 48px',
      textAlign: 'center', marginBottom: 20,
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>
        {justUnlocked ? '🔓' : good ? '✅' : '⚠️'}
      </div>
      <h2 style={{ marginBottom: 20, fontSize: 22, color: '#e0e0e0' }}>
        {justUnlocked
          ? `New letter unlocked: "${newlyUnlocked}"!`
          : good ? 'Great work!' : 'Keep practicing!'}
      </h2>

      <div style={{ display: 'flex', gap: 36, justifyContent: 'center', marginBottom: 20 }}>
        <StatItem label="Speed"    value={wpm.toFixed(1)}      unit="wpm" color="#569cd6" />
        <StatItem label="Accuracy" value={accuracy.toFixed(2)} unit="%"   color={good ? '#4ade80' : '#f87171'} />
        <StatItem label="Score"    value={Math.round(score)}   unit="pts" color="#c084fc" />
      </div>

      <p style={{ color: '#666', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
        {justUnlocked
          ? `You can now practice with "${newlyUnlocked}"! Next goal: unlock "${nextLetter || '🏆'}".`
          : good
            ? streak >= 1
              ? `${streak}/2 lessons done! One more with 90%+ accuracy to unlock "${nextLetter || '🏆'}".`
              : `Complete 2 consecutive lessons at 90%+ accuracy to unlock "${nextLetter || '🏆'}".`
            : 'Accuracy below 90%. Slow down and focus — correctness over speed!'
        }
      </p>

      {!justUnlocked && good && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < streak ? '#4ade80' : '#2a2a2a',
              border: '1px solid #3a3a3a', transition: 'background 0.3s',
            }} />
          ))}
          <span style={{ fontSize: 12, color: '#555', marginLeft: 4 }}>streak</span>
        </div>
      )}

      <button
        onClick={onRestart}
        style={{
          padding: '12px 40px', background: '#1d4ed8', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
        }}
      >
        Next Lesson →
      </button>
    </div>
  );
}

function StatItem({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: '#444', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}
