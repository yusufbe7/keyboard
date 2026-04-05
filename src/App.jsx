import { useState, useEffect, useCallback } from 'react';
import Keyboard from './components/Keyboard';
import TextDisplay from './components/TextDisplay';
import Stats from './components/Stats';

const UNLOCK_ORDER = [
  'a','n','i','r','e','l','t','o','s','u',
  'd','y','g','h','p','w','b','k','f','c',
  'v','m','x','z','q','j',
];

// ── Word lists ────────────────────────────────────────────────
const ALL_WORDS_EN = [
  // 2–3 letters
  'an','in','on','no','or','us','go','he','we','me','be','so',
  'air','ran','ear','are','era','inn','nil','oil','lot','let',
  'net','ten','art','ant','tan','rat','tar','lie','lit','tin',
  'one','toe','ore','son','sun','run','old','tip','sir','sit',
  'see','set','son','sue','tie','too','top','try','use','war',
  'win','own','odd','off','oil','our','out','pay','put','row',
  // 4 letters
  'rain','rein','earn','near','nine','rani','aria','rune',
  'real','lean','line','liar','rail','nail','lain','elan',
  'late','rate','tile','tale','note','tone','role','lone',
  'lion','loin','loan','toil','oral','iron','root','roll',
  'toll','rose','nose','lose','sole','sore','lore','rote',
  'lute','tune','rune','lure','unit','iris','trio','arid',
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
  // 5 letters
  'arena','inner','liner','alien','trail','trial','train',
  'later','alert','alter','elite','inlet','liter','title',
  'atone','lotion','ratio','ornate','orient','elation',
  'snore','store','stone','stole','toner','oiler','noise',
  'route','outer','unite','ruins','round','sound','union',
  'dusty','study','style','rusty','lusty','dusty',
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
  'might','month','model','music','magic','basic','topic',
  // 5–6 letter common words
  'which','about','would','there','their','small','large',
  'where','after','think','again','while','those','right',
  'every','found','still','since','never','quite','often',
  'house','under','water','cause','state','great','first',
  'being','early','three','force','north','south','earth',
  'heart','learn','share','until','trust','cross','field',
  'event','score','stage','smart','speak','upper','usual',
  'whole','works','given','these','those','taken','among',
  'bring','carry','start','close','begin','reach','build',
  'serve','above','below','front','worth','since','death',
  'focus','grant','input','local','major','minor','moral',
  'novel','order','other','paint','press','prime','proof',
  'proud','queen','quite','quote','radio','raise','range',
  'rapid','ratio','reach','react','ready','refer','reply',
  'river','robot','rough','royal','scale','scene','scope',
  'serve','share','sharp','shift','shore','short','shout',
  'skill','sleep','slide','slope','smile','solve','space',
  'spare','spend','spoke','spoon','sport','staff','stake',
  'stand','stark','start','state','stays','steam','steel',
  'steep','steer','stern','stick','stiff','still','stock',
  'stone','stood','store','storm','story','stove','straw',
  'stress','strip','stuck','study','stuff','style','super',
  'surge','swear','sweet','swept','swift','swing','sword',
  'taken','teach','tense','thick','those','throw','tired',
  'title','today','token','touch','tough','tower','towns',
  'track','trade','trail','train','trans','treat','trend',
  'tribe','tried','troop','truck','truly','trust','truth',
  'tumor','ultra','under','unity','until','upper','urban',
  'usage','usual','utter','valid','value','vault','video',
  'viral','vital','vivid','voter','wagon','watch','waste',
  // 6+ letters
  'talent','rental','entail','retail','tinsel','antler',
  'listen','silent','enlist','stolen','lonely','nation',
  'garden','hidden','golden','burden','wooden','warden',
  'height','weight','flight','friend','people','simple',
  'planet','ground','around','bridge','change','chance',
  'mother','father','strong','street','breath','spread',
  'nature','future','number','winter','system','spring',
  'center','mental','dental','gentle','travel','silver',
  'driver','river','better','letter','corner','border',
  'target','market','basket','battle','castle','handle',
  'inside','island','itself','joined','jungle','kicked',
  'launch','leader','letter','lights','linked','listen',
  'looked','lovely','making','market','master','matter',
  'member','mental','method','middle','minute','mirror',
  'mobile','modern','moment','motion','muscle','mutual',
  'nearby','needed','normal','notice','object','online',
  'opened','option','output','owners','palace','parent',
  'passed','people','period','placed','player','pocket',
  'police','portal','posted','pretty','proven','public',
  'pulled','pushed','raised','rather','reason','record',
  'remain','report','result','return','review','rights',
  'rising','robust','broken',
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
  const [currentInput, setCurrentInput] = useState('');
  const [wordResults, setWordResults] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lessonCount, setLessonCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const unlockedLetters = UNLOCK_ORDER.slice(0, unlockedCount);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  // Stats
  const totalTyped = wordResults.reduce((s, w) => s + w.length, 0) + currentInput.length;
  const totalCorrect = wordResults.reduce((s, w) => s + w.filter(Boolean).length, 0);
  const wpm = time > 0 ? Math.round((totalCorrect / 5) / (time / 60)) : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  const score = Math.round(wpm * (accuracy / 100) * 10);

  const handleKey = useCallback((e) => {
    // Tab = restart
    if (e.key === 'Tab') {
      e.preventDefault();
      setWords(genWords(UNLOCK_ORDER.slice(0, unlockedCount), lang));
      setWordIndex(0); setCurrentInput(''); setWordResults([]);
      setStarted(false); setTime(0); setFinished(false); setJustUnlocked(false);
      return;
    }

    // Highlight key
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 150);

    if (finished) return;
    if (!started && e.key.length === 1) setStarted(true);

    if (e.key === 'Backspace') {
      setCurrentInput(i => i.slice(0, -1));
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      const word = words[wordIndex];
      const result = [...word].map((ch, ci) => currentInput[ci] === ch);
      setWordResults(r => [...r, result]);
      setCurrentInput('');

      const nextIdx = wordIndex + 1;
      if (nextIdx >= words.length) {
        // Lesson done
        setFinished(true);
        setLessonCount(n => n + 1);
        if (accuracy >= 90) {
          const newStreak = streak + 1;
          if (newStreak >= 2 && unlockedCount < UNLOCK_ORDER.length) {
            setUnlockedCount(c => c + 1);
            setStreak(0);
            setJustUnlocked(true);
          } else {
            setStreak(newStreak);
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

    if (e.key.length === 1) setCurrentInput(i => i + e.key);
  }, [finished, started, words, wordIndex, currentInput, accuracy, streak, unlockedCount, lang]);

  const restart = () => {
    setWords(genWords(unlockedLetters, lang));
    setWordIndex(0); setCurrentInput(''); setWordResults([]);
    setStarted(false); setTime(0); setFinished(false); setJustUnlocked(false);
  };

  const switchLang = () => {
    const nl = lang === 'en' ? 'uz' : 'en';
    setLang(nl);
    setWords(genWords(unlockedLetters, nl));
    setWordIndex(0); setCurrentInput(''); setWordResults([]);
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
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {lang === 'en' ? '🇺🇿 UZ' : '🇬🇧 EN'}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '36px 32px', width: '100%' }}>

        {/* Stats */}
        <Stats wpm={wpm} accuracy={accuracy} time={time} score={score} />

        {/* Letter progress */}
        <div style={{
          display: 'flex', gap: 5, marginBottom: 28,
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {UNLOCK_ORDER.map((letter, i) => {
            const unlocked = i < unlockedCount;
            const isCurrent = i === unlockedCount - 1;
            return (
              <div
                key={letter}
                title={unlocked ? `"${letter.toUpperCase()}" — unlocked` : `"${letter.toUpperCase()}" — locked`}
                style={{
                  width: 30, height: 30, borderRadius: 5,
                  background: unlocked
                    ? (isCurrent ? 'rgba(250,204,20,0.12)' : 'rgba(74,222,128,0.08)')
                    : 'transparent',
                  border: `1px solid ${isCurrent ? '#facc14' : unlocked ? '#2d5a2d' : '#2a2a2a'}`,
                  color: unlocked ? (isCurrent ? '#facc14' : '#4ade80') : '#333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12,
                  transition: 'all 0.3s',
                  userSelect: 'none',
                }}
              >
                {letter.toUpperCase()}
              </div>
            );
          })}
        </div>

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
            currentInput={currentInput}
            wordResults={wordResults}
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
      borderRadius: 12, padding: '40px 48px',
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

      {/* Result stats */}
      <div style={{ display: 'flex', gap: 36, justifyContent: 'center', marginBottom: 20 }}>
        <StatItem label="Speed" value={wpm} unit="wpm" color="#569cd6" />
        <StatItem label="Accuracy" value={accuracy} unit="%" color={good ? '#4ade80' : '#f87171'} />
        <StatItem label="Score" value={score} unit="pts" color="#c084fc" />
      </div>

      {/* Progress message */}
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        {justUnlocked
          ? `You can now practice with "${newlyUnlocked}" in your lessons! Next goal: unlock "${nextLetter || '🏆'}".`
          : good
            ? streak >= 1
              ? `${streak}/2 lessons done! One more with 90%+ accuracy to unlock "${nextLetter || '🏆'}".`
              : `Complete 2 consecutive lessons with 90%+ accuracy to unlock "${nextLetter || '🏆'}".`
            : 'Accuracy below 90%. Slow down and focus on correctness — then try again!'
        }
      </p>

      {/* Streak indicator */}
      {!justUnlocked && good && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < streak ? '#4ade80' : '#2a2a2a',
              border: '1px solid #3a3a3a',
              transition: 'background 0.3s',
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
          letterSpacing: 0.3,
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
