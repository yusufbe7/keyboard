// ── Simplified keyboard: letter rows + space only ─────────────
const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p','[',']'],
  ['a','s','d','f','g','h','j','k','l',';',"'"],
  ['z','x','c','v','b','n','m',',','.','/'],
];

const HOME_KEYS = new Set(['f','j']);

function keyWidth(label) {
  if (label === ' ') return 240;
  return 40;
}

// Purple/lavender palette
const THEME = {
  containerBg: '#cbbdd4',
  keyBg:       '#c0b0ca',
  keyBorder:   '#b0a0ba',
  keyText:     '#7a6888',
  // active (pressed)
  activeBg:    '#5c3370',
  activeBorder:'#4a2558',
  activeText:  '#f0e8f8',
  // next expected key
  nextBg:      '#a890b8',
  nextBorder:  '#9070a8',
  nextText:    '#f5eeff',
  // space waiting (word complete)
  spaceBg:     '#9470a8',
  spaceBorder: '#7a58a0',
  spaceText:   '#f0e8ff',
  // space error
  spaceErrBg:  '#a04060',
  spaceErrBorder:'#c05070',
  spaceErrText:'#ffe0e8',
};

export default function Keyboard({ activeKey = '', nextKey = '', spaceWaiting = false, spaceError = false }) {
  const ak = activeKey.toLowerCase();
  const nk = nextKey ? nextKey.toLowerCase() : '';

  return (
    <div
      className="kb-keyboard-wrap"
      style={{
        display: 'inline-block',
        background: THEME.containerBg,
        borderRadius: 18,
        padding: '16px 16px 14px',
        boxShadow: '0 6px 24px rgba(80,40,100,0.18), 0 2px 6px rgba(80,40,100,0.12)',
        userSelect: 'none',
      }}
    >
      {/* Letter rows */}
      {ROWS.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', gap: 5, marginBottom: 5,
          paddingLeft: ri === 1 ? 20 : ri === 2 ? 40 : 0,
        }}>
          {row.map((label, ki) => {
            const isActive = ak === label;
            const isNext   = !isActive && nk === label;
            const isHome   = HOME_KEYS.has(label);

            let bg     = THEME.keyBg;
            let border = `1px solid ${THEME.keyBorder}`;
            let color  = THEME.keyText;
            let shadow = '0 2px 0 rgba(80,40,100,0.18)';
            let transform = 'translateY(0)';

            if (isActive) {
              bg     = THEME.activeBg;
              border = `1px solid ${THEME.activeBorder}`;
              color  = THEME.activeText;
              shadow = '0 1px 0 rgba(80,40,100,0.3)';
              transform = 'translateY(1px)';
            } else if (isNext) {
              bg     = THEME.nextBg;
              border = `1px solid ${THEME.nextBorder}`;
              color  = THEME.nextText;
              shadow = '0 2px 0 rgba(80,40,100,0.25), 0 0 8px rgba(160,130,200,0.35)';
            }

            return (
              <div
                key={ki}
                style={{
                  width: keyWidth(label),
                  height: 40,
                  flexShrink: 0,
                  background: bg,
                  border,
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color,
                  position: 'relative',
                  boxShadow: shadow,
                  transform,
                  transition: 'background 0.07s, box-shadow 0.07s, transform 0.07s',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {label}
                {isHome && (
                  <span style={{
                    position: 'absolute', bottom: 5,
                    width: 5, height: 2,
                    background: 'rgba(255,255,255,0.25)', borderRadius: 1,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Space bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}>
        {(() => {
          const isSpaceActive = ak === ' ';
          let bg     = spaceError  ? THEME.spaceErrBg
                     : isSpaceActive ? THEME.activeBg
                     : spaceWaiting ? THEME.spaceBg
                     : THEME.keyBg;
          let border = spaceError  ? `1px solid ${THEME.spaceErrBorder}`
                     : isSpaceActive ? `1px solid ${THEME.activeBorder}`
                     : spaceWaiting ? `1px solid ${THEME.spaceBorder}`
                     : `1px solid ${THEME.keyBorder}`;
          let color  = spaceError || spaceWaiting || isSpaceActive ? '#f0e8ff' : THEME.keyText;
          let shadow = isSpaceActive ? '0 1px 0 rgba(80,40,100,0.3)' : '0 2px 0 rgba(80,40,100,0.18)';
          if (spaceWaiting && !isSpaceActive && !spaceError) {
            shadow = '0 2px 0 rgba(80,40,100,0.25), 0 0 14px rgba(148,112,168,0.55)';
          }
          return (
            <div
              className={spaceWaiting && !isSpaceActive && !spaceError ? 'kb-space-waiting' : ''}
              style={{
                width: 240, height: 40,
                background: bg, border, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color,
                boxShadow: shadow,
                transform: isSpaceActive ? 'translateY(1px)' : 'translateY(0)',
                transition: 'background 0.1s, box-shadow 0.1s, transform 0.07s',
                letterSpacing: 1.5,
              }}
            >
              {spaceWaiting ? 'SPACE' : ''}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
