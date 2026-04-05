import { useState, useEffect, useCallback } from 'react';
import Keyboard from './components/Keyboard';
import TextDisplay from './components/TextDisplay';
import Stats from './components/Stats';

const ALL_WORDS = [
  'uy', 'non', 'suv', 'kitob', 'qalam', 'maktab',
  'ona', 'ota', 'bola', 'kino', 'ovqat', 'deraza',
  'stol', 'stul', 'qosh', 'yosh', 'tosh', 'bosh',
  'qosh', 'liar', 'rail', 'near', 'earn', 'real',
];

// Faqat shu harflardan iborat so'zlarni filter qilish
function getAvailableWords(unlockedLetters) {
  const letterSet = new Set(unlockedLetters.map(l => l.toLowerCase()));
  letterSet.add(' ');
  return ALL_WORDS.filter(word =>
    word.split('').every(ch => letterSet.has(ch))
  );
}

function getWords(unlockedLetters, count = 20) {
  const available = getAvailableWords(unlockedLetters);
  if (available.length === 0) return ['ana', 'rana', 'nari'];
  return Array.from({ length: count }, () =>
    available[Math.floor(Math.random() * available.length)]
  );
}

// Keybr.com kabi harf ochilish tartibi
const UNLOCK_ORDER = ['a','n','i','r','e','l','t','o','s','u','d','y','g','h','p','w','b','k','f','c','v','m','x','z','q','j'];

export default function App() {
  const [unlockedCount, setUnlockedCount] = useState(3); // a, n, i dan boshlash
  const unlockedLetters = UNLOCK_ORDER.slice(0, unlockedCount);

  const [words, setWords] = useState(() => getWords(UNLOCK_ORDER.slice(0, 3)));
  const [wordIndex, setWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [wordResults, setWordResults] = useState([]); // har so'z uchun to'g'ri/xato

  const [activeKey, setActiveKey] = useState('');
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);

  // Harf statistikasi (ochilish uchun)
  const [lessonCount, setLessonCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);

  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  // Stats hisoblash
  const totalTyped = wordResults.reduce((a, w) => a + w.length, 0) + currentInput.length;
  const totalCorrect = wordResults.reduce((a, w) => a + w.filter(Boolean).length, 0);
  const wpm = time > 0 ? Math.round((totalCorrect / 5) / (time / 60)) : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  const handleKey = useCallback((e) => {
    if (finished) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }

    setActiveKey(e.key === ' ' ? ' ' : e.key);
    setTimeout(() => setActiveKey(''), 150);

    if (!started && e.key.length === 1) setStarted(true);

    // Backspace
    if (e.key === 'Backspace') {
      setCurrentInput(inp => inp.slice(0, -1));
      return;
    }

    // Space — so'zni tasdiqlash
    if (e.key === ' ') {
      const currentWord = words[wordIndex];
      const result = currentWord.split('').map((ch, i) => currentInput[i] === ch);
      setWordResults(r => [...r, result]);
      setCurrentInput('');

      const nextIndex = wordIndex + 1;
      if (nextIndex >= words.length) {
        setFinished(true);
        // Dars tugadi — aniqlik yaxshi bo'lsa harf och
        const newLesson = lessonCount + 1;
        setLessonCount(newLesson);
        if (accuracy >= 95 && newLesson >= 3) {
          setCorrectStreak(s => s + 1);
          if (correctStreak + 1 >= 2 && unlockedCount < UNLOCK_ORDER.length) {
            setUnlockedCount(c => c + 1);
          }
        } else {
          setCorrectStreak(0);
        }
      } else {
        setWordIndex(nextIndex);
      }
      return;
    }

    if (e.key.length === 1) {
      setCurrentInput(inp => inp + e.key);
    }
  }, [finished, started, words, wordIndex, currentInput, accuracy, lessonCount, correctStreak, unlockedCount]);

  const restart = () => {
    const newWords = getWords(unlockedLetters);
    setWords(newWords);
    setWordIndex(0);
    setCurrentInput('');
    setWordResults([]);
    setStarted(false);
    setTime(0);
    setFinished(false);
  };

  return (
    <div
      onKeyDown={handleKey}
      tabIndex={0}
      autoFocus
      style={{
        outline: 'none',
        padding: 40,
        maxWidth: 820,
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>⌨️ Typing UZ</h1>

      {/* Ochilgan harflar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {UNLOCK_ORDER.map((letter, i) => (
          <div key={letter} style={{
            width: 32, height: 32,
            borderRadius: 6,
            background: i < unlockedCount ? '#16a34a' : '#e5e5e5',
            color: i < unlockedCount ? '#fff' : '#aaa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 13,
            border: i === unlockedCount - 1 ? '2px solid #facc15' : 'none',
          }}>
            {letter.toUpperCase()}
          </div>
        ))}
      </div>

      <Stats wpm={wpm} accuracy={accuracy} time={time} />

      {finished ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <h2>🎉 Tugadi!</h2>
          <p>Tezlik: <b>{wpm} wpm</b> | Aniqlik: <b>{accuracy}%</b></p>
          {accuracy >= 95
            ? <p style={{ color: '#16a34a' }}>✅ Yaxshi! Yangi harf tez orada ochiladi.</p>
            : <p style={{ color: '#dc2626' }}>⚠️ Aniqlik 95% dan past. Sekinroq yozing!</p>
          }
          <button onClick={restart} style={{
            marginTop: 16, padding: '10px 24px',
            background: '#16a34a', color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 16, cursor: 'pointer',
          }}>
            Qaytadan
          </button>
        </div>
      ) : (
        <TextDisplay
          words={words}
          wordIndex={wordIndex}
          currentInput={currentInput}
          wordResults={wordResults}
        />
      )}

      <Keyboard activeKey={activeKey} />
    </div>
  );
}