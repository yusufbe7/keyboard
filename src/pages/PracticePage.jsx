import { useState, useEffect, useCallback, useRef } from 'react';
import Keyboard    from '../components/Keyboard';
import TextDisplay from '../components/TextDisplay';
import WpmChart    from '../components/WpmChart';
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
];

const ALL_WORDS_UZ = [
  'an','in','air','ran','inn','rain','earn','near','real','liar','rail','liner',
  'uy','non','suv','ona','ota','bola','yosh','tosh','bosh',
  'kun','yil','oy','ana','nan','nari','rani',
  'kino','stol','stul','ovoz','obod','atlas',
  'kitob','qalam','maktab','deraza','oila','xona','dars',
  'ovqat','radio','kalit','shahar','inson',
];

function getAvailableWords(unlocked, lang) {
  const src = lang === 'en' ? ALL_WORDS_EN : ALL_WORDS_UZ;
  const set = new Set(unlocked);
  return src.filter(w => [...w].every(c => set.has(c)));
}
function genWords(unlocked, lang, count = 30) {
  const pool = getAvailableWords(unlocked, lang);
  const fb = ['an','in','air','ran','rain','earn','near'];
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
  const [lang, setLang]   = useState('en');
  const [mode, setMode]   = useState('practice');
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem('typeflow-sound') !== 'false'; } catch { return true; }
  });
  const [unlockedCount, setUnlockedCount] = useState(() => getUnlockedCount(5));
  const [letterStats,   setLetterStats]   = useState(() => getLetterStats(UNLOCK_ORDER));
  const [dailyTime,     setDailyTime]     = useState(() => getDailyTime());

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

  const audioRef       = useRef(null);
  const wpmRef         = useRef(0);
  const tickRef        = useRef(0);
  const testStartedRef = useRef(false);

  const unlockedLetters = UNLOCK_ORDER.slice(0, unlockedCount);

  useEffect(() => { saveLetterStats(letterStats); }, [letterStats]);
  useEffect(() => { saveUnlockedCount(unlockedCount); }, [unlockedCount]);
  useEffect(() => { try { localStorage.setItem('typeflow-sound',''+soundOn); } catch {} }, [soundOn]);

  useEffect(() => {
    const h = (e) => setCapsLock(!!e.getModifierState?.('CapsLock'));
    window.addEventListener('keydown', h);
    window.addEventListener('keyup',   h);
    return () => { window.removeEventListener('keydown',h); window.removeEventListener('keyup',h); };
  }, []);

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

  useEffect(() => {
    const limit = MODE_LIMIT[mode];
    if (!limit || !started || finished) return;
    if (time >= limit) finishLesson();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, mode, started, finished]);

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
  const isTest      = mode !== 'practice';
  const spaceWaiting = !finished && !!currentWord && charIndex >= currentWord.length;

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
          setStreak(0); setJustUnlocked(true); setRecentlyUnlocked(newLetter);
          setTimeout(() => setRecentlyUnlocked(null), 3000);
        } else { setStreak(ns); setJustUnlocked(false); }
      } else { setStreak(0); setJustUnlocked(false); }
    }
  }

  const handleKey = useCallback((e) => {
    if (e.key === 'Tab') { e.preventDefault(); doRestart(); return; }
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 150);
    if (finished) return;

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
      const exp = expected;
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

  return (
    <div
      onKeyDown={handleKey} tabIndex={0} autoFocus
      style={{ outline:'none', minHeight:'calc(100vh - 52px)', display:'flex', flexDirection:'column', alignItems:'center' }}
    >
      {/* ── Toolbar ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        marginTop: 40, marginBottom: 32,
        color:'var(--sub)', fontSize:13,
        flexWrap:'wrap', justifyContent:'center',
      }}>
        {/* Mode pills */}
        {[['practice','practice'],['test60','1 min'],['test120','2 min']].map(([m,label])=>(
          <button key={m} onClick={()=>switchMode(m)} style={{
            background:'none', border:'none', padding:'4px 10px',
            borderRadius:6, fontSize:13, cursor:'pointer',
            color: mode===m ? 'var(--accent)' : 'var(--sub)',
            fontWeight: mode===m ? 700 : 400,
          }}>{label}</button>
        ))}

        <span style={{ width:1, height:16, background:'var(--sub-alt)', margin:'0 4px' }} />

        {/* Sound */}
        <button onClick={()=>setSoundOn(v=>!v)} style={{
          background:'none', border:'none', fontSize:14, cursor:'pointer',
          color: soundOn ? 'var(--sub)' : 'var(--sub-alt)', padding:'4px 6px',
        }} title="Toggle sound">{soundOn?'♪':'♪̶'}</button>

        {/* Lang */}
        <button onClick={switchLang} style={{
          background:'none', border:'none', padding:'4px 8px',
          color:'var(--sub)', fontSize:12, cursor:'pointer', fontWeight:600,
        }}>{lang==='en'?'EN':'UZ'}</button>

        <span style={{ width:1, height:16, background:'var(--sub-alt)', margin:'0 4px' }} />

        {/* Tab hint */}
        <span style={{ fontSize:12, color:'var(--sub-alt)' }}>
          <kbd style={{ background:'var(--sub-alt)', borderRadius:3, padding:'1px 5px', fontSize:11, color:'var(--sub)' }}>tab</kbd>
          {' '}restart
        </span>
      </div>

      {/* ── Main area ── */}
      <div style={{ width:'100%', maxWidth:780, padding:'0 32px' }}>

        {capsLock && (
          <div className="kb-caps-warning" style={{ marginBottom:16 }}>
            ⚠️ Caps Lock is on!
          </div>
        )}

        {/* Live counter row — above text */}
        {started && !finished && (
          <div style={{
            display:'flex', alignItems:'baseline', gap:20, marginBottom:10,
          }}>
            {isTest && timeLeft !== null ? (
              <span style={{ fontSize:44, fontWeight:700, color:'var(--accent)', letterSpacing:-1, lineHeight:1 }}>
                {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
              </span>
            ) : (
              wpm > 0 && (
                <span style={{ fontSize:32, fontWeight:700, color:'var(--accent)', lineHeight:1 }}>
                  {wpm.toFixed(0)}
                  <span style={{ fontSize:13, color:'var(--sub)', marginLeft:4, fontWeight:400 }}>wpm</span>
                </span>
              )
            )}
            {wpm > 0 && (
              <span style={{ fontSize:14, color:'var(--sub)' }}>
                {accuracy.toFixed(0)}<span style={{ fontSize:11, marginLeft:2 }}>%</span>
              </span>
            )}
          </div>
        )}

        {/* Text or results */}
        {finished ? (
          <FinishScreen
            wpm={prevMetrics.wpm} accuracy={prevMetrics.accuracy} score={prevMetrics.score}
            streak={streak} unlockedCount={unlockedCount}
            justUnlocked={justUnlocked} mode={mode}
            wpmHistory={wpmHistory}
            letterStats={letterStats}
            recentlyUnlocked={recentlyUnlocked}
            onRestart={()=>doRestart()}
          />
        ) : (
          <TextDisplay
            words={words} wordIndex={wordIndex}
            charIndex={charIndex} charHasError={charHasError}
            wordErrors={wordErrors}
          />
        )}

        {/* Sub-hint row */}
        {!finished && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginTop:16, color:'var(--sub-alt)', fontSize:12,
          }}>
            <span>
              {mode==='practice'
                ? `${wordIndex} / ${words.length} words`
                : isTest && !started ? 'start typing…' : ''}
            </span>
            {/* Letter unlock mini-bar (practice) */}
            {mode === 'practice' && (
              <div style={{ display:'flex', gap:3 }}>
                {UNLOCK_ORDER.map((letter, i) => {
                  const unlocked  = i < unlockedCount;
                  const isCurrent = i === unlockedCount - 1;
                  const isNew     = recentlyUnlocked === letter;
                  return (
                    <div key={letter}
                      className={isNew ? 'kb-unlock-pop' : ''}
                      title={`${letter.toUpperCase()} — ${unlocked?'unlocked':'locked'}`}
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize: 9, fontWeight: 700,
                        background: unlocked
                          ? (isCurrent ? 'rgba(226,183,20,0.15)' : 'rgba(209,208,197,0.07)')
                          : 'transparent',
                        border: `1px solid ${isCurrent ? 'var(--accent)' : unlocked ? '#444' : '#2a2a2a'}`,
                        color: unlocked ? (isCurrent ? 'var(--accent)' : 'var(--sub)') : '#2a2a2a',
                        transition:'all 0.3s',
                      }}>
                      {letter.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Keyboard ── */}
      {!finished && (
        <div style={{ marginTop:48, marginBottom:32 }}>
          <Keyboard
            activeKey={activeKey}
            nextKey={currentChar || ''}
            spaceWaiting={spaceWaiting}
            spaceError={spaceError}
          />
        </div>
      )}
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────
function FinishScreen({ wpm, accuracy, score, streak, unlockedCount, justUnlocked, mode, wpmHistory, letterStats, recentlyUnlocked, onRestart }) {
  const good          = accuracy >= 90;
  const newlyUnlocked = justUnlocked ? UNLOCK_ORDER[unlockedCount-1]?.toUpperCase() : null;
  const nextLetter    = UNLOCK_ORDER[unlockedCount]?.toUpperCase();

  return (
    <div style={{ textAlign:'center' }}>
      {/* Big stats */}
      <div style={{ display:'flex', gap:48, justifyContent:'center', marginBottom:8, flexWrap:'wrap' }}>
        <BigStat label="wpm"      value={wpm.toFixed(0)}       color="var(--accent)" />
        <BigStat label="accuracy" value={accuracy.toFixed(1)+'%'} color="var(--main)"   />
        <BigStat label="score"    value={Math.round(score)+'pts'} color="var(--sub)"    />
      </div>

      {/* WPM Chart */}
      {wpmHistory.length >= 2 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:'var(--sub)', marginBottom:6, textTransform:'uppercase', letterSpacing:1.5 }}>
            speed over time
          </div>
          <WpmChart data={wpmHistory} />
        </div>
      )}

      {/* Unlock / streak info */}
      {mode === 'practice' && (
        <div style={{ color:'var(--sub)', fontSize:13, marginBottom:24, lineHeight:1.8 }}>
          {justUnlocked
            ? <span style={{ color:'var(--accent)', fontWeight:600 }}>🔓 New letter unlocked: "{newlyUnlocked}"!</span>
            : good
              ? streak >= 1
                ? `${streak}/2 lessons done — one more to unlock "${nextLetter||'🏆'}"`
                : `Complete 2 lessons ≥90% to unlock "${nextLetter||'🏆'}"`
              : <span style={{ color:'var(--error)' }}>Accuracy below 90% — slow down and focus</span>
          }
          {good && !justUnlocked && (
            <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:10 }}>
              {[0,1].map(i=>(
                <div key={i} style={{
                  width:8,height:8,borderRadius:'50%',
                  background: i<streak ? 'var(--accent)' : 'var(--sub-alt)',
                }}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restart button */}
      <button onClick={onRestart} style={{
        padding:'10px 40px', background:'var(--sub-alt)', color:'var(--main)',
        border:'none', borderRadius:8, fontSize:14, fontWeight:600,
        cursor:'pointer', letterSpacing:0.5,
      }}>
        {mode==='practice' ? 'next lesson' : 'play again'}
      </button>
    </div>
  );
}

function BigStat({ label, value, color }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:11, color:'var(--sub)', textTransform:'lowercase', letterSpacing:1.5, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:52, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    </div>
  );
}
