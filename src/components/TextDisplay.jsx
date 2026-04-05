// Props:
//   words       — string[]
//   wordIndex   — current word index
//   charIndex   — cursor position in current word
//   charHasError — Set of char indices that had a wrong press (current word only)
//   wordErrors  — bool[][] for completed words (true = typed correctly)

export default function TextDisplay({ words, wordIndex, charIndex, charHasError, wordErrors }) {
  return (
    <div style={{
      fontFamily: "'Consolas', 'Courier New', monospace",
      fontSize: 22,
      lineHeight: 2.4,
      letterSpacing: '0.04em',
      padding: '24px 32px',
      background: '#1a1a1a',
      borderRadius: 12,
      border: '1px solid #2a2a2a',
      marginBottom: 20,
      minHeight: 140,
      wordSpacing: '0.35em',
      userSelect: 'none',
    }}>
      {words.map((word, wi) => {
        const isDone    = wi < wordIndex;
        const isCurrent = wi === wordIndex;
        const result    = wordErrors[wi]; // bool[] | undefined

        return (
          <span
            key={wi}
            style={{
              marginRight: '0.5em',
              display: 'inline-block',
              opacity: isDone ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {[...word].map((char, ci) => {
              let color = '#333';        // untyped / future word
              let bg    = 'transparent';
              let outline = 'none';

              if (isDone && result) {
                // ── Completed word ──
                color = result[ci] ? '#4ade80' : '#f87171';
                if (!result[ci]) bg = 'rgba(248,113,113,0.06)';

              } else if (isCurrent) {
                if (ci < charIndex) {
                  // ── Already typed in current word ──
                  const hadError = charHasError.has(ci);
                  color = hadError ? '#f87171' : '#4ade80';
                  if (hadError) bg = 'rgba(248,113,113,0.07)';

                } else if (ci === charIndex) {
                  // ── Cursor position ──
                  const hasError = charHasError.has(ci);
                  if (hasError) {
                    // Wrong key was pressed here — show red cursor
                    color   = '#f87171';
                    bg      = 'rgba(248,113,113,0.25)';
                    outline = '1px solid #f87171';
                  } else {
                    // Normal cursor
                    color   = '#e0e0e0';
                    bg      = '#264f78';
                    outline = '1px solid #569cd6';
                  }
                }
                // ci > charIndex → untyped (gray, handled by default)
              }

              return (
                <span
                  key={ci}
                  style={{
                    color,
                    background: bg,
                    outline,
                    borderRadius: 2,
                    padding: '0 1px',
                    transition: 'color 0.07s, background 0.07s',
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
  );
}
