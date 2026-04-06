import { useRef, useEffect, useState } from 'react';

const LINE_H  = 58;
const VISIBLE = 3;

function Caret({ error = false }) {
  return (
    <span
      className={error ? 'kb-caret-err' : 'kb-caret'}
      style={{
        display: 'inline-block',
        width: 2,
        height: '1.15em',
        background: error ? 'var(--error)' : 'var(--accent)',
        verticalAlign: 'text-bottom',
        borderRadius: 1,
        marginRight: 1,
        flexShrink: 0,
      }}
    />
  );
}

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

  const hasError = charHasError.size > 0 && charHasError.has(charIndex);

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
        position: 'absolute', bottom: 0, left: 0, right: 0, height: LINE_H * 0.7,
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

          return (
            <span
              key={wi}
              ref={el => { wordRefs.current[wi] = el; }}
              style={{ marginRight: '0.6em', display: 'inline' }}
            >
              {[...word].map((char, ci) => {
                // Insert caret before current char
                const showCaret = isCurrent && ci === charIndex;

                let color = 'var(--sub)';
                if (isDone && result) {
                  color = result[ci] ? 'var(--correct)' : 'var(--error)';
                } else if (isCurrent && ci < charIndex) {
                  color = charHasError.has(ci) ? 'var(--error)' : 'var(--correct)';
                }

                return (
                  <span key={ci} style={{ display: 'inline' }}>
                    {showCaret && <Caret error={hasError} />}
                    <span style={{ color, transition: 'color 0.07s' }}>{char}</span>
                  </span>
                );
              })}

              {/* Caret after last char when word is done, waiting for space */}
              {isCurrent && charIndex >= word.length && (
                <Caret error={false} />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
