import { useRef, useEffect, useState } from 'react';

const LINE_H  = 44;
const VISIBLE = 3;

export default function TextDisplay({ words, wordIndex, charIndex, charHasError, wordErrors }) {
  const wordRefs  = useRef([]);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const el = wordRefs.current[wordIndex];
    if (!el) return;
    const line   = Math.floor(el.offsetTop / LINE_H);
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
        fontSize: 22,
        lineHeight: `${LINE_H}px`,
        letterSpacing: '0.04em',
        userSelect: 'none',
        cursor: 'text',
      }}
    >
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: LINE_H,
        background: 'linear-gradient(transparent, var(--bg))',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div style={{
        transform: `translateY(-${offsetY}px)`,
        transition: 'transform 0.2s ease',
      }}>
        {words.map((word, wi) => {
          const isDone    = wi < wordIndex;
          const isCurrent = wi === wordIndex;
          const result    = wordErrors[wi];
          const atEnd     = isCurrent && charIndex >= word.length;

          return (
            <span
              key={wi}
              ref={el => { wordRefs.current[wi] = el; }}
              style={{ marginRight: '0.55em' }}
            >
              {[...word].map((char, ci) => {
                const isCursor = isCurrent && ci === charIndex;
                const hasErr   = isCursor && charHasError.has(ci);

                let color = 'var(--sub)';
                if (isDone && result) {
                  color = result[ci] ? 'var(--correct)' : 'var(--error)';
                } else if (isCurrent && ci < charIndex) {
                  color = charHasError.has(ci) ? 'var(--error)' : 'var(--correct)';
                }

                return (
                  <span
                    key={ci}
                    className={isCursor ? (hasErr ? 'kb-caret-err-char' : 'kb-caret-char') : ''}
                    style={{ color, transition: 'color 0.07s' }}
                  >
                    {char}
                  </span>
                );
              })}

              {/* Caret after last char — waiting for space */}
              {atEnd && (
                <span
                  className="kb-caret-end"
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '0.85em',
                    background: 'var(--accent)',
                    verticalAlign: 'middle',
                    borderRadius: 1,
                    marginLeft: 1,
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
