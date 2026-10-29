import { useEffect, useMemo, useState } from 'react';
import { LIVE, fetchReadings } from './fb.js';
import { LIMITS } from './data.js';

const M = { gas: ['Gas rise', 'idx'], pm25: ['Dust', 'µg/m³'], temp: ['Temperature', '°C'], hum: ['Humidity', '%'] };
const DAY = 86400000;
const dkey = (t) => new Date(t).toLocaleDateString('en-CA');
const startOf = (s) => new Date(s + 'T00:00:00').getTime();
const fmt = (t) => new Date(t).toLocaleString([], { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const r1 = (v) => Math.round(v * 10) / 10;
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;

// Fake history for Demo mode
function demo(from, to) {
  const a = [];
  for (let t = from; t <= to; t += 1800000) {
    const h = new Date(t).getHours(), s = Math.sin(t / 3.2e6);
    const burst = Math.floor(t / DAY) % 4 === 0 && h >= 11 && h <= 14 ? 1 : 0;
    a.push({ t, temp: r1(30 + 4 * Math.sin(t / 1.4e7) + 2 * s), hum: Math.round(50 + 10 * s), gas: Math.round(20 + 15 * s + burst * 180), pm25: Math.round(12 + 8 * s + burst * 90) });
  }
  return a;
}

function bucket(rows, ms) {
  if (!ms) return rows;
  const m = new Map();
  rows.forEach((r) => { const k = Math.floor(r.t / ms); if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, g]) => {
    const o = { t: k * ms + ms / 2 };
    Object.keys(M).forEach((f) => (o[f] = avg(g.map((x) => x[f] || 0))));
    return o;
  });
}

export default function HistoryPanel() {
  const [range, setRange] = useState('day');
  const [day, setDay] = useState(dkey(Date.now()));
  const [metric, setMetric] = useState('gas');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [hover, setHover] = useState(null);

  const [from, to] = useMemo(() => {
    if (range === 'day') { const s = startOf(day); return [s, s + DAY - 1]; }
    const n = Date.now();
    return [n - (range === 'week' ? 7 : 30) * DAY, n];
  }, [range, day]);

  useEffect(() => {
    let ok = true;
    setBusy(true); setErr('');
    (LIVE ? fetchReadings(from, to) : Promise.resolve(demo(from, to)))
      .then((r) => ok && setRows(r))
      .catch(() => ok && setErr('Could not load data. Check Firebase rules.'))
      .finally(() => ok && setBusy(false));
    return () => { ok = false; };
  }, [from, to]);

  useEffect(() => setHover(null), [rows, metric]);

  const pts = bucket(rows, range === 'week' ? 3600000 : range === 'month' ? 21600000 : 0);
  const vals = pts.map((p) => p[metric] || 0);
  const lim = LIMITS[metric];
  const isEnv = metric === 'temp' || metric === 'hum';
  const vmax = vals.length ? Math.max(...vals) : 0;
  const lo = isEnv && vals.length ? Math.floor(Math.min(...vals) - 2) : 0;
  const hi = Math.max(isEnv ? vmax + 2 : Math.max(vmax, (lim ? lim[1] : 0) * 1.1), lo + 5);
  const X = (t) => 10 + ((t - from) / (to - from)) * 300;
  const Y = (v) => 120 - ((v - lo) / (hi - lo)) * 110;
  const line = pts.map((p) => `${X(p.t).toFixed(1)},${Y(p[metric] || 0).toFixed(1)}`).join(' ');

  const raw = rows.map((x) => x[metric] || 0);
  const st = raw.length ? { min: Math.min(...raw), avg: avg(raw), max: Math.max(...raw) } : null;

  const days = useMemo(() => {
    const m = {};
    rows.forEach((r) => { (m[dkey(r.t)] = m[dkey(r.t)] || []).push(r); });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0])).map(([k, g]) => ({
      k, temp: avg(g.map((x) => x.temp || 0)), hum: avg(g.map((x) => x.hum || 0)),
      gas: Math.max(...g.map((x) => x.gas || 0)), pm25: Math.max(...g.map((x) => x.pm25 || 0)),
    }));
  }, [rows]);

  const move = (e) => {
    if (!pts.length) return;
    const b = e.currentTarget.getBoundingClientRect();
    const t = from + ((((e.clientX - b.left) / b.width) * 320 - 10) / 300) * (to - from);
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(p.t - t) < Math.abs(pts[best].t - t)) best = i; });
    setHover(pts[best]);
  };

  return (
    <section className="card hp">
      <h2>📊 History</h2>
      <div className="chips">
        {[['day', 'Day'], ['week', '7 days'], ['month', '30 days']].map(([k, l]) => (
          <button key={k} className={'chip' + (range === k ? ' on' : '')} onClick={() => setRange(k)}>{l}</button>
        ))}
        {range === 'day' && <input type="date" value={day} max={dkey(Date.now())} onChange={(e) => e.target.value && setDay(e.target.value)} />}
      </div>
      <div className="chips">
        {Object.entries(M).map(([k, [l]]) => (
          <button key={k} className={'chip' + (metric === k ? ' on' : '')} onClick={() => setMetric(k)}>{l}</button>
        ))}
      </div>

      <p className="tip">
        {hover ? `${fmt(hover.t)} · ${M[metric][0]} ${r1(hover[metric] || 0)} ${M[metric][1]}` : busy ? 'Loading…' : err || (pts.length ? 'Touch the graph to see exact values' : 'No data for this period')}
      </p>

      <svg viewBox="0 0 320 130" className="chart" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)} style={{ touchAction: 'pan-y' }}>
        {lim && !isEnv && <line x1="10" x2="310" y1={Y(lim[1])} y2={Y(lim[1])} className="lg d" />}
        {lim && !isEnv && <line x1="10" x2="310" y1={Y(lim[0])} y2={Y(lim[0])} className="lg w" />}
        {pts.length > 1 && <polygon points={`${X(pts[0].t)},120 ${line} ${X(pts[pts.length - 1].t)},120`} className="area" />}
        {pts.length > 1 && <polyline points={line} className="ln" />}
        {pts.length === 1 && <circle cx={X(pts[0].t)} cy={Y(vals[0])} r="3" fill="var(--ink)" />}
        {hover && <circle cx={X(hover.t)} cy={Y(hover[metric] || 0)} r="4" fill="var(--danger)" />}
      </svg>

      {st && (
        <div className="grid three">
          {[['Lowest', st.min], ['Average', st.avg], ['Highest', st.max]].map(([l, v]) => (
            <div key={l} className="tile"><span className="tl">{l}</span><b>{r1(v)}<small> {M[metric][1]}</small></b></div>
          ))}
        </div>
      )}

      {range !== 'day' && days.length > 0 && (
        <>
          <h2>Daily summary <small className="muted">(tap a day)</small></h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th align="left">Date</th><th>Temp</th><th>Hum</th><th>Gas max</th><th>Dust max</th></tr></thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.k} className="click" onClick={() => { setDay(d.k); setRange('day'); }}>
                    <td>{new Date(d.k + 'T00:00').toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                    <td align="center">{r1(d.temp)}°</td><td align="center">{Math.round(d.hum)}%</td>
                    <td align="center">{d.gas}</td><td align="center">{d.pm25}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
