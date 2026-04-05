// Finger → keys mapping
const FINGER_MAP = {
  pinky_l:  ['`','1','q','a','z'],
  ring_l:   ['2','w','s','x'],
  middle_l: ['3','e','d','c'],
  index_l:  ['4','5','r','t','f','g','v','b'],
  index_r:  ['6','7','y','u','h','j','n','m'],
  middle_r: ['8','i','k',','],
  ring_r:   ['9','o','l','.'],
  pinky_r:  ['0','-','=','p','[',']','\\',';',"'",'/',],
  thumbs:   [' '],
};

// Dark-mode finger colors (muted, low-saturation tints)
const FINGER_COLORS = {
  pinky_l:  '#3a1f1f',
  ring_l:   '#2e2a16',
  middle_l: '#1c2e16',
  index_l:  '#162030',
  thumbs:   '#2a2a2a',
  index_r:  '#1e1c38',
  middle_r: '#122a22',
  ring_r:   '#2e1626',
  pinky_r:  '#321f14',
};

const ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['Caps','a','s','d','f','g','h','j','k','l',';',"'",'↵'],
  ['⇧','z','x','c','v','b','n','m',',','.','/','⇧'],
  ['Ctrl','Alt',' ','Alt','Ctrl'],
];

// Map display labels → real key values
const LABEL_KEY = {
  '⌫': 'backspace', '↵': 'enter', '⇧': 'shift',
  'Tab': 'tab', 'Caps': 'capslock', 'Ctrl': 'control', 'Alt': 'alt',
};

const HOME_KEYS = new Set(['f', 'j']);

function realKey(label) {
  return LABEL_KEY[label] ?? label.toLowerCase();
}

function fingerColor(key) {
  const k = key.toLowerCase();
  for (const [finger, keys] of Object.entries(FINGER_MAP)) {
    if (keys.includes(k)) return FINGER_COLORS[finger];
  }
  return '#252525';
}

function keyWidth(label) {
  if (label === ' ') return 260;
  if (['⌫', 'Tab', 'Caps', '↵'].includes(label)) return 68;
  if (label === '⇧') return 88;
  if (['Ctrl', 'Alt'].includes(label)) return 52;
  return 38;
}

export default function Keyboard({ activeKey = '' }) {
  const ak = activeKey.toLowerCase();

  return (
    <div style={{
      display: 'inline-block',
      background: '#111',
      borderRadius: 14,
      padding: '14px 14px 10px',
      border: '1px solid #2a2a2a',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      userSelect: 'none',
    }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', gap: 4, marginBottom: 4,
          justifyContent: ri === 4 ? 'center' : 'flex-start',
        }}>
          {row.map((label, ki) => {
            const rk = realKey(label);
            const isActive = ak === rk || ak === label.toLowerCase();
            const isHome = HOME_KEYS.has(rk);

            return (
              <div
                key={ki}
                style={{
                  width: keyWidth(label),
                  height: 38,
                  flexShrink: 0,
                  background: isActive ? '#facc15' : fingerColor(rk),
                  border: `1px solid ${isActive ? '#eab308' : '#1e1e1e'}`,
                  borderRadius: 5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 500,
                  color: isActive ? '#111' : '#666',
                  position: 'relative',
                  boxShadow: isActive
                    ? '0 0 12px rgba(250,204,20,0.4)'
                    : '0 2px 3px rgba(0,0,0,0.4)',
                  transition: 'background 0.07s, box-shadow 0.07s',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {label === ' ' ? '' : label}
                {isHome && (
                  <span style={{
                    position: 'absolute', bottom: 4,
                    width: 6, height: 2,
                    background: '#ffffff20', borderRadius: 1,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
