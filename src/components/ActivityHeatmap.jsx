// GitHub/monkeytype-style contribution heatmap
// Props: activity = { 'YYYY-MM-DD': { count, time } }

const COLORS = ['#1e1e1e','#3d3200','#6b5800','#9e8000','#d4a800'];
const DAY_LABELS = ['','Mon','','Wed','','Fri',''];

function getColor(count) {
  if (!count || count === 0) return COLORS[0];
  if (count <= 1)  return COLORS[1];
  if (count <= 3)  return COLORS[2];
  if (count <= 6)  return COLORS[3];
  return COLORS[4];
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function getIntensity(count) {
  if (!count || count === 0) return 0;
  if (count <= 1)  return 1;
  if (count <= 3)  return 2;
  if (count <= 6)  return 3;
  return 4;
}

export default function ActivityHeatmap({ activity = {} }) {
  // Build 52-week grid ending today
  const today = new Date();
  today.setHours(0,0,0,0);

  // Start from ~53 weeks ago, snapped to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 52*7);
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

  // Build weeks array: weeks[wi][di] = Date
  const weeks = [];
  const d = new Date(start);
  while (d <= today) {
    const week = [];
    for (let di = 0; di < 7; di++) {
      week.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels: find which week is the first of each month
  const monthLabels = {};
  weeks.forEach((week, wi) => {
    week.forEach(day => {
      if (day.getDate() <= 7 && !monthLabels[wi]) {
        monthLabels[wi] = day.toLocaleString('en', { month: 'short' });
      }
    });
  });

  const CELL = 11;
  const GAP  = 2;
  const STEP = CELL + GAP;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0 }}>

        {/* Month row */}
        <div style={{ display: 'flex', marginLeft: 32, marginBottom: 4 }}>
          {weeks.map((_, wi) => (
            <div key={wi} style={{
              width: STEP, fontSize: 10, color: '#555', textAlign: 'left',
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              {monthLabels[wi] || ''}
            </div>
          ))}
        </div>

        {/* Grid with day labels */}
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: 4 }}>
            {DAY_LABELS.map((label, di) => (
              <div key={di} style={{
                height: CELL, marginBottom: GAP,
                fontSize: 10, color: '#555', lineHeight: `${CELL}px`,
                minWidth: 24, textAlign: 'right', paddingRight: 4,
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: GAP }}>
              {week.map((day, di) => {
                const key   = toDateStr(day);
                const data  = activity[key];
                const count = typeof data === 'number' ? data : (data?.count || 0);
                const isFuture = day > today;
                return (
                  <div
                    key={di}
                    title={isFuture ? '' : `${key}: ${count} test${count!==1?'s':''}`}
                    style={{
                      width: CELL, height: CELL, borderRadius: 2,
                      background: isFuture ? 'transparent' : getColor(count),
                      cursor: count > 0 ? 'default' : 'default',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end', marginLeft: 32 }}>
          <span style={{ fontSize: 10, color: '#555' }}>less</span>
          {COLORS.map((c, i) => (
            <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: c }} />
          ))}
          <span style={{ fontSize: 10, color: '#555' }}>more</span>
        </div>
      </div>
    </div>
  );
}
