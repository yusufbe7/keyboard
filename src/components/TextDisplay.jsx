import { useRef, useEffect, useState } from 'react';

const LINE_H     = 58;  // px per line (font 26px * lineHeight 2.2)
const VISIBLE    = 3;   // visible lines

export default function TextDisplay({ words, wordIndex, charIndex, charHasError, wordErrors }) {
  const wordRefs  = useRef([]);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const el = wordRefs.current[wordIndex];
    if (!el) return;
    const line = Math.floor(el.offsetTop / LINE_H);
    // keep current line as 2nd visible row (1 line of context above)
    const target = Math.max(0, line - 1) * LINE_H;
    setOffsetY(target);
  }, [wordIndex]);

  return (
    <div
      className="kb-text-display"
      style={{
        height: LINE_H * VISIBLE,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Roboto Mono', 'Consolas', 'Courier New', monospace",
        fontSize: 26,
        lineHeight: `${LINE_H}px`,
        letterSpacing: '0.02em',
        userSelect: 'none',
        cursor: 'text',
      }}
    >
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: LINE_H * 0.8,
        background: `linear-gradient(transparent, var(--bg))`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Scrolling wrapper */}
      <div style={{
        transform: `translateY(-${offsetY}px)`,
        transition: 'transform 0.2s ease',
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
                marginRight: '0.6em',
                display: 'inline-block',
              }}
            >
              {[...word].map((char, ci) => {
                let color  = 'var(--sub)';    // untyped / future
                let caretClass = '';

                if (isDone && result) {
                  color = result[ci] ? 'var(--correct)' : 'var(--error)';
                } else if (isCurrent) {
                  if (ci < charIndex) {
                    color = charHasError.has(ci) ? 'var(--error)' : 'var(--correct)';
                  } else if (ci === charIndex) {
                    // Cursor position
                    caretClass = charHasError.has(ci) ? 'kb-caret-error' : 'kb-caret';
                    color = charHasError.has(ci) ? 'var(--error)' : 'var(--sub)';
                  }
                }

                return (
                  <span
                    key={ci}
                    className={caretClass}
                    style={{ color, transition: 'color 0.07s' }}
                  >
                    {char}
                  </span>
                );
              })}
              {/* Caret at end of word (waiting for space) */}
              {isCurrent && charIndex === word.length && (
                <span
                  className="kb-caret"
                  style={{ display: 'inline-block', width: 0 }}
                />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
