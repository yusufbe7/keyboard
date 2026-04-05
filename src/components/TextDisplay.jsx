export default function TextDisplay({ words, wordIndex, currentInput, wordResults }) {
  return (
    <div style={{
      fontSize: 22,
      lineHeight: 2.2,
      letterSpacing: 1,
      padding: '16px 24px',
      background: '#f9f9f9',
      borderRadius: 12,
      border: '1px solid #e0e0e0',
      marginBottom: 24,
      minHeight: 100,
    }}>
      {words.map((word, wi) => {
        const isDone = wi < wordIndex;
        const isCurrent = wi === wordIndex;
        const result = wordResults[wi];

        return (
          <span key={wi} style={{ marginRight: 14, display: 'inline-block' }}>
            {word.split('').map((char, ci) => {
              let color = '#bbb';
              let bg = 'transparent';

              if (isDone && result) {
                color = result[ci] ? '#16a34a' : '#dc2626';
              } else if (isCurrent) {
                const typedChar = currentInput[ci];
                if (typedChar === undefined) {
                  color = ci === currentInput.length ? '#111' : '#bbb';
                  if (ci === currentInput.length) bg = '#dbeafe'; // kursor
                } else {
                  color = typedChar === char ? '#16a34a' : '#dc2626';
                  if (typedChar !== char) bg = '#fee2e2';
                }
              }

              return (
                <span key={ci} style={{
                  color,
                  background: bg,
                  borderRadius: 3,
                  padding: '0 1px',
                  transition: 'color 0.1s',
                }}>
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