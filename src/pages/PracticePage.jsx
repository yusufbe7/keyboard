import { useState, useEffect, useCallback, useRef } from 'react';
import Keyboard   from '../components/Keyboard';
import TextDisplay from '../components/TextDisplay';
import InfoPanel  from '../components/InfoPanel';
import WpmChart   from '../components/WpmChart';
import { UNLOCK_ORDER, DAILY_GOAL_SECS } from '../constants';
import {
  getLetterStats, saveLetterStats,
  getUnlockedCount, saveUnlockedCount,
  getDailyTime, saveDailyTime,
  recordLesson, recordTestStart,
} from '../utils/storage';

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
  'treat','trend','tribe','tried','troop','truck','truly',
  'truth','tumor','ultra','unity','urban','usage','utter',
  'valid','vault','video','viral','vital','voter','wagon',
  'watch','waste',
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
  const fb = lang === 'en' ? ['an','in','air','ran','rain','earn','near'] : ['ana','nari','uy'];
  const src = pool.length >= 4 ? pool : fb;
  const words = []; let prev = '';
  for (let i = 0; i < count; i++) {
    let w, t = 0;
    do { w = src[Math.floor(Math.random() * src.length)]; t++; }
    while (w === prev && src.length > 1 && t < 10);
    words.push(w); prev = w;
  }
  return words;
}
function genTestWords(count = 150) {
  const pool = ALL_WORDS_EN.filter(w => w.length >= 3 && w.length <= 8);
  const words = []; let prev = '';
  for (let i = 0; i < count; i++) {
    let w, t = 0;
    do { w = pool[Math.floor(Math.random() * pool.length)]; t++; }
    while (w === prev && t < 10);
    words.push(w); prev = w;
  }
  return words;
}

const MODE_LIMIT = { practice: null, test60: 60, test120: 120 };

// ── Main component ────────────────────────────────────────────
export default function PracticePage() {
  // ── Persisted initial state ──
  const [lang, setLang] = useState('en');
  const [mode, setMode] = useState('practice');
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem('typeflow-sound') !== 'false'; } catch { return true; }
  });
  const [unlockedCount, setUnlockedCount] = useState(() => getUnlockedCount(5));
  const [letterStats,   setLetterStats]   = useState(() => getLetterStats(UNLOCK_ORDER));
  const [dailyTime,     setDailyTime]     = useState(() => getDailyTime());

  // ── Typing state ──
  const [words,        setWords]        = useState(() => genWords(UNLOCK_ORDER.slice(0,5),'en'));
  const [wordIndex,    setWordIndex]    = useState(0);
  const [charIndex,    setCharIndex]    = useState(0);
  const [charHasError, setCharHasError] = useState(new Set());
  const [wordErrors,   setWordErrors]   = useState([]);
  const [activeKey,    setActiveKey]    = useState('');
  const [started,      setStarted]      = useState(false);
  const [time,         setTime]         = useState(0);
  const [finished,     setFinished]     = useState(false);
  const [streak,       setStreak]       = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(null);
  const [prevMetrics,  setPrevMetrics]  = useState({ wpm: 0, accuracy: 100, score: 0 });
  const [wpmHistory,   setWpmHistory]   = useState([]);
  const [capsLock,     setCapsLock]     = useState(false);
  const [spaceError,   setSpaceError]   = useState(false);

  // ── Refs ──
  const audioRef       = useRef(null);
  const wpmRef         = useRef(0);
  const tickRef        = useRef(0);
  const testStartedRef = useRef(false);

  const unlockedLetters = UNLOCK_ORDER.slice(0, unlockedCount);

  // ── Persist settings ──
  useEffect(() => { saveLetterStats(letterStats); }, [letterStats]);
  useEffect(() => { saveUnlockedCount(unlockedCount); }, [unlockedCount]);
  useEffect(() => { try { localStorage.setItem('typeflow-sound',''+soundOn); } catch {} }, [soundOn]);

  // ── CapsLock detection ──
  useEffect(() => {
    const h = (e) => setCapsLock(!!e.getModifierState?.('CapsLock'));
    window.addEventListener('keydown', h);
    window.addEventListener('keyup',   h);
    return () => { window.removeEventListener('keydown',h); window.removeEventListener('keyup',h); };
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (!started || finished) return;
    tickRef.current = 0;
    const id = setInterval(() => {
      tickRef.current++;
      setTime(t => t + 1);
      if (tickRef.current % 5 === 0) setWpmHistory(h => [...h, wpmRef.current]);
      setDailyTime(d => { const nd = d+1; saveDailyTime(nd); return nd; });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  // ── Auto-finish for test modes ──
  useEffect(() => {
    const limit = MODE_LIMIT[mode];
    if (!limit || !started || finished) return;
    if (time >= limit) finishLesson();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, mode, started, finished]);

  // ── Live stats ──
  const completedCorrect = wordErrors.reduce((s,w)=>s+w.filter(Boolean).length,0);
  const completedTotal   = wordErrors.reduce((s,w)=>s+w.length,0);
  const curErrors        = [...charHasError].filter(i=>i<charIndex).length;
  const totalCorrect     = completedCorrect + charIndex - curErrors;
  const totalTyped       = completedTotal   + charIndex;
  const wpm      = time>0 ? Math.round((totalCorrect/5)/(time/60)*10)/10 : 0;
  const accuracy = totalTyped>0 ? Math.round((totalCorrect/totalTyped)*10000)/100 : 100;
  const score    = Math.round(wpm*(accuracy/100)*10);
  wpmRef.current = wpm;

  const currentWord = !finished && words[wordIndex] ? words[wordIndex] : null;
  const currentChar = currentWord ? (currentWord[charIndex] ?? null) : null;
  const timeLimit   = MODE_LIMIT[mode];
  const timeLeft    = timeLimit ? Math.max(0, timeLimit - time) : null;

  // ── Sound ──
  function playSound(correct) {
    if (!soundOn) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext||window.webkitAudioContext)();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = correct ? 880 : 200;
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.06);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.06);
    } catch {}
  }

  // ── Finish lesson ──
  function finishLesson(extraWordResult) {
    const allWE = extraWordResult ? [...wordErrors, extraWordResult] : wordErrors;
    const fc = allWE.reduce((s,w)=>s+w.filter(Boolean).length,0);
    const ft = allWE.reduce((s,w)=>s+w.length,0);
    const fwpm = time>0 ? Math.round((fc/5)/(time/60)*10)/10 : 0;
    const facc = ft>0 ? Math.round((fc/ft)*10000)/100 : 100;
    const fsco = Math.round(fwpm*(facc/100)*10);

    setFinished(true);
    setPrevMetrics({ wpm: fwpm, accuracy: facc, score: fsco });
    recordLesson({ mode, wpm: fwpm, accuracy: facc, timeSecs: time });

    if (mode === 'practice') {
      if (facc >= 90) {
        const ns = streak + 1;
        if (ns >= 2 && unlockedCount < UNLOCK_ORDER.length) {
          const newLetter = UNLOCK_ORDER[unlockedCount];
          setUnlockedCount(c => c+1);
          setStreak(0);
          setJustUnlocked(true);
          setRecentlyUnlocked(newLetter);
          setTimeout(() => setRecentlyUnlocked(null), 3000);
        } else { setStreak(ns); setJustUnlocked(false); }
      } else { setStreak(0); setJustUnlocked(false); }
    }
  }

  // ── Key handler ──
  const handleKey = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault(); doRestart(); return;
    }
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 150);
    if (finished) return;

    // Track test start
    if (!started && e.key.length === 1) {
      setStarted(true);
      if (!testStartedRef.current) { testStartedRef.current = true; recordTestStart(); }
    }

    const word     = words[wordIndex];
    const expected = word?.[charIndex];

    if (e.key === 'Backspace') { e.preventDefault(); if (charIndex>0) setCharIndex(i=>i-1); return; }

    if (e.key === ' ') {
      e.preventDefault();
      if (!word || charIndex < word.length) return;
      setSpaceError(false);
      const result = [...word].map((_,ci) => !charHasError.has(ci));
      setWordErrors(r => [...r, result]);
      setCharIndex(0); setCharHasError(new Set());
      const nextIdx = wordIndex + 1;
      if (nextIdx >= words.length) { finishLesson(result); }
      else setWordIndex(nextIdx);
      return;
    }

    // Word complete but user pressed a non-space key — error, must press space
    if (word && charIndex >= word.length && e.key.length === 1) {
      playSound(false);
      setSpaceError(true);
      setTimeout(() => setSpaceError(false), 400);
      return;
    }

    if (!expected || e.key.length !== 1) return;
    if (e.key === expected) {
      playSound(true);
      const hadErr = charHasError.has(charIndex);
      const exp    = expected;
      const ci     = charIndex;
      setLetterStats(prev => {
        const s = prev[exp] || { attempts:0, errors:0 };
        return { ...prev, [exp]: { attempts: s.attempts+1, errors: s.errors+(hadErr?1:0) } };
      });
      setCharIndex(i => i+1);
    } else {
      playSound(false);
      const ci = charIndex;
      setCharHasError(prev => { const n=new Set(prev); n.add(ci); return n; });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, started, words, wordIndex, charIndex, charHasError, wordErrors, streak, unlockedCount, soundOn]);

  function doRestart(newMode, newLang) {
    const m = newMode ?? mode; const l = newLang ?? lang;
    const w = m==='practice' ? genWords(UNLOCK_ORDER.slice(0,unlockedCount), l) : genTestWords();
    setWords(w); setWordIndex(0); setCharIndex(0); setCharHasError(new Set());
    setWordErrors([]); setStarted(false); setTime(0); setFinished(false);
    setJustUnlocked(false); setWpmHistory([]); testStartedRef.current = false;
  }
  function switchMode(m)  { setMode(m);  doRestart(m, lang); }
  function switchLang()   { const nl=lang==='en'?'uz':'en'; setLang(nl); doRestart(mode, nl); }

  // ── Render ────────────────────────────────────────────────
  return (
    <div onKeyDown={handleKey} tabIndex={0} autoFocus style={{ outline:'none' }}>

      {/* Sub-toolbar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 48px', borderBottom:'1px solid #1e1e1e', background:'#161616',
        flexWrap:'wrap', gap:8,
      }}>
        {/* Mode buttons */}
        <div style={{ display:'flex', gap:4 }}>
          {[['practice','Practice'],['test60','1 min'],['test120','2 min']].map(([m,label])=>(
            <button key={m} onClick={()=>switchMode(m)} style={{
              padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:600,
              background: mode===m ? '#569cd6' : '#252525',
              color:       mode===m ? '#fff'    : '#666',
            }}>{label}</button>
          ))}
        </div>
        {/* Right controls */}
        <div className="kb-header-right" style={{ display:'flex', alignItems:'center', gap:12 }}>
          {timeLeft !== null && (
            <span style={{ fontSize:14, fontWeight:700, color: timeLeft<=10?'#f87171':'#fbbf24' }}>
              {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
            </span>
          )}
          <button onClick={()=>setSoundOn(v=>!v)} style={{
            background:'none', border:'none', fontSize:16, cursor:'pointer', color:'#666',
            padding:'4px',
          }}>{soundOn ? '🔊' : '🔇'}</button>
          <button onClick={switchLang} style={{
            background:'#252525', border:'1px solid #333', borderRadius:6,
            padding:'4px 10px', color:'#aaa', fontSize:12, fontWeight:600,
          }}>{lang==='en'?'🇺🇿 UZ':'🇬🇧 EN'}</button>
          <span style={{ fontSize:11, color:'#444' }}>
            <kbd style={{ background:'#252525', border:'1px solid #333', borderRadius:3, padding:'1px 5px', color:'#666', fontFamily:'monospace' }}>Tab</kbd>
            {' '}restart
          </span>
        </div>
      </div>

      <main className="kb-main" style={{ maxWidth:980, margin:'0 auto', padding:'24px 32px', width:'100%' }}>

        {/* CapsLock warning */}
        {capsLock && (
          <div className="kb-caps-warning">
            ⚠️ Caps Lock is on! Turn it off to type correctly.
          </div>
        )}

        {/* Info panel */}
        <InfoPanel
          wpm={wpm} accuracy={accuracy} score={score}
          prevMetrics={prevMetrics}
          unlockedCount={unlockedCount}
          letterStats={letterStats}
          currentChar={currentChar}
          streak={streak}
          dailyTime={dailyTime}
          dailyGoal={DAILY_GOAL_SECS}
          mode={mode}
          wordIndex={wordIndex}
          wordCount={words.length}
          recentlyUnlocked={recentlyUnlocked}
        />

        {/* Letter progress (practice mode only) */}
        {mode === 'practice' && (
          <div style={{ display:'flex', gap:4, marginBottom:20, justifyContent:'center', flexWrap:'wrap' }}>
            {UNLOCK_ORDER.map((letter, i) => {
              const unlocked  = i < unlockedCount;
              const isCurrent = i === unlockedCount - 1;
              const isNew     = recentlyUnlocked === letter;
              return (
                <div key={letter}
                  className={isNew ? 'kb-unlock-pop' : ''}
                  title={unlocked ? `"${letter.toUpperCase()}" — unlocked` : `"${letter.toUpperCase()}" — locked`}
                  style={{
                    width:30, height:30, borderRadius:5, userSelect:'none',
                    background: unlocked ? (isCurrent?'rgba(250,204,20,0.12)':'rgba(74,222,128,0.07)') : 'transparent',
                    border:`1px solid ${isCurrent?'#facc14':unlocked?'#2d5a2d':'#252525'}`,
                    color: unlocked ? (isCurrent?'#facc14':'#4ade80') : '#2a2a2a',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:700, fontSize:12, transition:'all 0.3s',
                  }}>
                  {letter.toUpperCase()}
                </div>
              );
            })}
          </div>
        )}

        {/* Typing area */}
        {finished ? (
          <FinishScreen
            wpm={wpm} accuracy={accuracy} score={score}
            streak={streak} unlockedCount={unlockedCount}
            justUnlocked={justUnlocked} mode={mode}
            wpmHistory={wpmHistory}
            onRestart={()=>doRestart()}
          />
        ) : (
          <TextDisplay
            words={words} wordIndex={wordIndex}
            charIndex={charIndex} charHasError={charHasError}
            wordErrors={wordErrors}
          />
        )}

        {/* Keyboard */}
        <div style={{ display:'flex', justifyContent:'center', marginTop:16 }}>
          <Keyboard
            activeKey={activeKey}
            nextKey={currentChar || ''}
            spaceWaiting={!finished && !!currentWord && charIndex >= currentWord.length}
            spaceError={spaceError}
          />
        </div>
      </main>
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────
function FinishScreen({ wpm, accuracy, score, streak, unlockedCount, justUnlocked, mode, wpmHistory, onRestart }) {
  const good          = accuracy >= 90;
  const newlyUnlocked = justUnlocked ? UNLOCK_ORDER[unlockedCount-1]?.toUpperCase() : null;
  const nextLetter    = UNLOCK_ORDER[unlockedCount]?.toUpperCase();

  return (
    <div style={{
      background:'#1a1a1a',
      border:`1px solid ${justUnlocked?'#78350f':good?'#14532d':'#7f1d1d'}`,
      borderRadius:12, padding:'32px 40px', textAlign:'center', marginBottom:16,
    }}>
      <div style={{ fontSize:36, marginBottom:10 }}>
        {justUnlocked?'🔓':good?'✅':'⚠️'}
      </div>
      <h2 style={{ marginBottom:16, fontSize:20, color:'#e0e0e0' }}>
        {justUnlocked ? `New letter unlocked: "${newlyUnlocked}"!`
          : good ? 'Great work!' : 'Keep practicing!'}
      </h2>

      <div style={{ display:'flex', gap:28, justifyContent:'center', marginBottom:16 }}>
        <StatItem label="Speed"    value={wpm.toFixed(1)}      unit="wpm" color="#569cd6" />
        <StatItem label="Accuracy" value={accuracy.toFixed(2)} unit="%"   color={good?'#4ade80':'#f87171'} />
        <StatItem label="Score"    value={Math.round(score)}   unit="pts" color="#c084fc" />
      </div>

      {wpmHistory.length >= 2 && <WpmChart data={wpmHistory} />}

      {mode === 'practice' && !justUnlocked && (
        <>
          <p style={{ color:'#666', fontSize:13, marginTop:12, marginBottom:12, lineHeight:1.7 }}>
            {good
              ? streak>=1 ? `${streak}/2 lessons done! One more to unlock "${nextLetter||'🏆'}".`
                          : `Complete 2 lessons at 90%+ accuracy to unlock "${nextLetter||'🏆'}".`
              : 'Accuracy below 90%. Slow down and focus on correctness!'}
          </p>
          {good && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12 }}>
              {[0,1].map(i=>(
                <div key={i} style={{
                  width:10,height:10,borderRadius:'50%',
                  background:i<streak?'#4ade80':'#252525',
                  border:'1px solid #333',
                }}/>
              ))}
              <span style={{ fontSize:11, color:'#555', marginLeft:4 }}>streak</span>
            </div>
          )}
        </>
      )}

      <button onClick={onRestart} style={{
        marginTop:8, padding:'11px 36px', background:'#1d4ed8', color:'#fff',
        border:'none', borderRadius:8, fontSize:14, fontWeight:600,
      }}>
        {mode==='practice' ? 'Next Lesson →' : 'Play Again →'}
      </button>
    </div>
  );
}

function StatItem({ label, value, unit, color }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:10, color:'#555', marginBottom:3, textTransform:'uppercase', letterSpacing:1.2 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color }}>
        {value}<span style={{ fontSize:12, fontWeight:400, color:'#444', marginLeft:2 }}>{unit}</span>
      </div>
    </div>
  );
}
