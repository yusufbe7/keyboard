const FINGER_MAP = {
  // Chap qo'l
  pinky_l:  ['`','1','q','a','z','tab','caps','shift'],
  ring_l:   ['2','w','s','x'],
  middle_l: ['3','e','d','c'],
  index_l:  ['4','5','r','t','f','g','v','b'],
  // O'ng qo'l
  index_r:  ['6','7','y','u','h','j','n','m'],
  middle_r: ['8','i','k',','],
  ring_r:   ['9','o','l','.'],
  pinky_r:  ['0','-','=','p','[',']','\\',';',"'",'/',  'enter','backspace','shift'],
  thumbs:   [' '],
};

const FINGER_COLORS = {
  pinky_l:  '#F7D4CC',
  ring_l:   '#FAEEDA',
  middle_l: '#C0DD97',
  index_l:  '#B5D4F4',
  thumbs:   '#D3D1C7',
  index_r:  '#CECBF6',
  middle_r: '#9FE1CB',
  ring_r:   '#F4C0D1',
  pinky_r:  '#F5C4B3',
};

const ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','backspace'],
  ['tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['caps','a','s','d','f','g','h','j','k','l',';',"'",'enter'],
  ['shift','z','x','c','v','b','n','m',',','.','/','shift'],
  ['ctrl','alt',' ','alt','ctrl'],
];

const HOME_KEYS = ['f', 'j'];

function getFingerColor(key) {
  for (const [finger, keys] of Object.entries(FINGER_MAP)) {
    if (keys.includes(key.toLowerCase())) {
      return FINGER_COLORS[finger];
    }
  }
  return '#e5e5e5';
}

function getKeyWidth(key) {
  const wide = { backspace: 80, tab: 70, caps: 80, enter: 80, shift: 95 };
  const space = { ' ': 300 };
  return space[key] || wide[key] || 40;
}

function getKeyLabel(key) {
  const labels = {
    backspace: '⌫', tab: 'Tab', caps: 'Caps',
    enter: '↵', shift: '⇧', ctrl: 'Ctrl', alt: 'Alt', ' ': '',
  };
  return labels[key] ?? key.toUpperCase();
}

export default function Keyboard({ activeKey = '' }) {
  return (
    <div style={{
      display: 'inline-block',
      background: '#f0f0f0',
      borderRadius: 12,
      padding: 16,
      userSelect: 'none',
    }}>
      {ROWS.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
          {row.map((key, j) => {
            const isActive = activeKey.toLowerCase() === key.toLowerCase();
            const isHome = HOME_KEYS.includes(key.toLowerCase());
            return (
              <div key={j} style={{
                width: getKeyWidth(key),
                height: 40,
                background: isActive ? '#facc15' : getFingerColor(key),
                border: isActive ? '2px solid #eab308' : '1px solid #ccc',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 500,
                position: 'relative',
                transition: 'background 0.1s',
                boxShadow: isActive ? '0 0 8px #facc1588' : 'none',
              }}>
                {getKeyLabel(key)}
                {isHome && (
                  <span style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 6,
                    height: 2,
                    background: '#00000040',
                    borderRadius: 1,
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