import { useRef, useEffect, useState } from 'react';

const APPROX_LINE_H = 54; // 22px font * ~2.45 rendered line-height
const VISIBLE_LINES = 3;

export default function TextDisplay({ words, wordIndex, charIndex, charHasError, wordErrors }) {
  const wordRefs   = useRef([]);
  const [offsetY, setOffsetY] = useState(0);

  // Smooth-scroll so current word's line is always at top of container
  useEffect(() => {
    const el = wordRefs.current[wordIndex];
    if (!el) return;
    const line = Math.floor(el.offsetTop / APPROX_LINE_H);
    setOffsetY(line * APPROX_LINE_H);
  }, [wordIndex]);

  return (
    <div
      className="kb-text-display"
      style={{
        height: APPROX_LINE_H * VISIBLE_LINES,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Consolas', 'Courier New', monospace",
        fontSize: 22,
        lineHeight: `${APPROX_LINE_H}px`,
        letterSpacing: '0.04em',
        padding: '0 32px',
        background: '#1a1a1a',
        borderRadius: 12,
        border: '1px solid #2a2a2a',
        marginBottom: 8,
        userSelect: 'none',
        wordSpacing: '0.3em',
      }}
    >
      {/* Fade-out gradient at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
        background: 'linear-gradient(transparent, #1a1a1a)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Scrolling words wrapper */}
      <div style={{
        transform: `translateY(-${offsetY}px)`,
        transition: 'transform 0.22s ease',
        paddingTop: 4,
      }}>
        {words.map((word, wi) => {
          const isDone    = wi < wordIndex;
          const isCurrent = wi === wordIndex;
          const result    = wordErrors[wi];

          return (
            <span
              key={wi}
              ref={el => { wordRefs.current[wi] = el; }}
              style={{
                marginRight: '0.45em',
                display: 'inline-block',
                opacity: isDone ? 0.38 : 1,
                transition: 'opacity 0.12s',
              }}
            >
              {[...word].map((char, ci) => {
                // ── Determine style for this character ──────────
                let color = '#2e2e2e';      // default: untyped / future word
                let bg    = 'transparent';
                let outline = 'none';
                let cls   = '';

                if (isDone && result) {
                  color = result[ci] ? '#4ade80' : '#f87171';
                  if (!result[ci]) bg = 'rgba(248,113,113,0.07)';

                } else if (isCurrent) {
                  if (ci < charIndex) {
                    const hadErr = charHasError.has(ci);
                    color = hadErr ? '#f87171' : '#4ade80';
                    if (hadErr) bg = 'rgba(248,113,113,0.07)';

                  } else if (ci === charIndex) {
                    if (charHasError.has(ci)) {
                      // Wrong key held — red blinking cursor
                      color   = '#f87171';
                      bg      = 'rgba(248,113,113,0.30)';
                      outline = '1px solid #f87171';
                      cls     = 'kb-cursor-error';
                    } else {
                      // Normal blinking cursor
                      color   = '#e8e8e8';
                      bg      = '#264f78';
                      outline = '1px solid #569cd6';
                      cls     = 'kb-cursor';
                    }
                  }
                }

                return (
                  <span
                    key={ci}
                    className={cls}
                    style={{
                      color, background: bg, outline,
                      borderRadius: 2,
                      padding: '0 1px',
                      transition: 'color 0.07s',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
}
