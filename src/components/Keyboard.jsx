// ── Dark monkeytype-style keyboard ───────────────────────────
const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p','[',']'],
  ['a','s','d','f','g','h','j','k','l',';',"'"],
  ['z','x','c','v','b','n','m',',','.','/'],
];

const HOME_KEYS = new Set(['f','j']);

// Dark gray palette — matches #323437 background
const T = {
  bg:          '#2c2e31',   // container
  key:         '#404245',   // normal key
  keyBorder:   '#555759',
  keyText:     '#646669',
  keyShadow:   '0 3px 0 #1e2022',

  active:      '#e2b714',   // pressed key — yellow accent
  activeBorder:'#c9a10e',
  activeText:  '#111111',
  activeShadow:'0 1px 0 #a07e08',

  next:        '#3f4042',   // next expected key — subtle lift
  nextBorder:  '#e2b71455',
  nextText:    '#d1d0c5',
  nextShadow:  '0 3px 0 #1e2022, 0 0 8px rgba(226,183,20,0.20)',

  spaceWait:        '#353500',
  spaceWaitBorder:  '#e2b714',
  spaceWaitText:    '#e2b714',
  spaceWaitShadow:  '0 3px 0 #1e2022, 0 0 14px rgba(226,183,20,0.35)',

  spaceErr:         '#2e1417',
  spaceErrBorder:   '#ca4754',
  spaceErrText:     '#ca4754',
};

export default function Keyboard({ activeKey = '', nextKey = '', spaceWaiting = false, spaceError = false }) {
  const ak = activeKey.toLowerCase();
  const nk = nextKey ? nextKey.toLowerCase() : '';

  return (
    <div
      className="kb-keyboard-wrap"
      style={{
        display: 'inline-block',
        background: T.bg,
        borderRadius: 14,
        padding: '14px 14px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        userSelect: 'none',
      }}
    >
      {/* Letter rows */}
      {ROWS.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', gap: 5, marginBottom: 5,
          paddingLeft: ri === 1 ? 22 : ri === 2 ? 44 : 0,
        }}>
          {row.map((label, ki) => {
            const isActive = ak === label;
            const isNext   = !isActive && nk === label;
            const isHome   = HOME_KEYS.has(label);

            let bg     = T.key;
            let border = `1px solid ${T.keyBorder}`;
            let color  = T.keyText;
            let shadow = T.keyShadow;
            let ty     = '0px';

            if (isActive) {
              bg = T.active; border = `1px solid ${T.activeBorder}`;
              color = T.activeText; shadow = T.activeShadow; ty = '2px';
            } else if (isNext) {
              bg = T.next; border = `1px solid ${T.nextBorder}`;
              color = T.nextText; shadow = T.nextShadow;
            }

            return (
              <div key={ki} style={{
                width: 40, height: 38, flexShrink: 0,
                background: bg, border, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 500, color,
                position: 'relative', boxShadow: shadow,
                transform: `translateY(${ty})`,
                transition: 'background 0.07s, box-shadow 0.07s, transform 0.07s, color 0.07s',
                fontFamily: "'Roboto Mono', monospace",
              }}>
                {label}
                {isHome && (
                  <span style={{
                    position: 'absolute', bottom: 4,
                    width: 4, height: 2,
                    background: T.keyBorder, borderRadius: 1,
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
          const isActive = ak === ' ';
          let bg     = isActive ? T.active : spaceError ? T.spaceErr : spaceWaiting ? T.spaceWait : T.key;
          let border = `1px solid ${isActive ? T.activeBorder : spaceError ? T.spaceErrBorder : spaceWaiting ? T.spaceWaitBorder : T.keyBorder}`;
          let color  = isActive ? T.activeText : spaceError ? T.spaceErrText : spaceWaiting ? T.spaceWaitText : T.keyText;
          let shadow = isActive ? T.activeShadow : spaceWaiting && !spaceError ? T.spaceWaitShadow : T.keyShadow;
          return (
            <div
              className={spaceWaiting && !isActive && !spaceError ? 'kb-space-waiting' : ''}
              style={{
                width: 240, height: 38,
                background: bg, border, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color, boxShadow: shadow,
                transform: isActive ? 'translateY(2px)' : 'translateY(0)',
                transition: 'background 0.1s, box-shadow 0.1s, transform 0.07s, color 0.1s',
                letterSpacing: 2,
              }}
            >
              {spaceWaiting && !isActive ? 'SPACE' : ''}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
