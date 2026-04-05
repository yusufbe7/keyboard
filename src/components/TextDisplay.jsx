export default function TextDisplay({ words, wordIndex, currentInput, wordResults }) {
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
        const isDone = wi < wordIndex;
        const isCurrent = wi === wordIndex;
        const result = wordResults[wi];

        return (
          <span
            key={wi}
            style={{
              marginRight: '0.5em',
              display: 'inline-block',
              opacity: isDone ? 0.55 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {[...word].map((char, ci) => {
              let color = '#3a3a3a';
              let bg = 'transparent';
              let outline = 'none';

              if (isDone && result) {
                color = result[ci] ? '#4ade80' : '#f87171';
              } else if (isCurrent) {
                const typed = currentInput[ci];
                if (typed === undefined) {
                  if (ci === currentInput.length) {
                    // cursor position
                    color = '#e0e0e0';
                    bg = '#264f78';
                    outline = '1px solid #569cd6';
                  } else {
                    color = '#3a3a3a';
                  }
                } else {
                  color = typed === char ? '#4ade80' : '#f87171';
                  if (typed !== char) bg = 'rgba(248,113,113,0.12)';
                }
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
                    transition: 'color 0.08s',
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
