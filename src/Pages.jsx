import { LIMITS, lvl, overall } from './data.js';
const CLS = ['safe', 'warn', 'danger'];
const ICON = ['✅', '⚠️', '🚨'];
const fmt = (t) => new Date(t).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function Tile({ k, v, unit, t, big }) {
  const L = LIMITS[k] ? lvl(k, v) : -1;
  const pct = LIMITS[k] ? Math.min(100, (v / (LIMITS[k][1] * 1.4)) * 100) : null;
  return (
    <div className={'tile ' + (L >= 0 ? CLS[L] : '')}>
      <span className="tl">{t.m[k]}</span>
      <b>{v}<small> {unit}</small></b>
      {pct !== null && (<><div className="bar"><i style={{ width: pct + '%' }} /></div><em>{ICON[L]} {t.lv[L]}</em></>)}
      {k === 'battery' && <div className="bar"><i style={{ width: v + '%', background: v < 20 ? 'var(--danger)' : 'var(--ink)' }} /></div>}
    </div>
  );
}

export function Live({ r, t, boost, setBoost, demo, muted, setMuted }) {
  const L = overall(r);
  return (
    <>
      <section className={'hero ' + CLS[L]} role="status" aria-live="assertive">
        <div className="signal" aria-hidden="true">{[2, 1, 0].map((n) => <i key={n} className={n === L ? 'on ' + CLS[n] : ''} />)}</div>
        <div>
          <h1>{ICON[L]} {t.lv[L]}</h1>
          <p>{t.msg[L]}</p>
          <small>{t.upd}: {clock(r.t)}</small>
        </div>
      </section>
      <div className="grid">
        <Tile k="pm25" v={r.pm25} unit="µg/m³" t={t} />
        <Tile k="pm10" v={r.pm10} unit="µg/m³" t={t} />
        <Tile k="gas" v={r.gas} unit="idx" t={t} />
        <Tile k="temp" v={r.temp} unit="°C" t={t} />
        <Tile k="hum" v={r.hum} unit="%" t={t} />
        <Tile k="battery" v={Math.round(r.battery)} unit="%" t={t} />
      </div>
      <div className="actions">
        {demo && <button className={boost ? 'btn red' : 'btn'} onClick={() => setBoost(!boost)}>🔥 {boost ? t.stop : t.sim}</button>}
        <button className="btn ghost" onClick={() => setMuted(!muted)}>{muted ? '🔇 ' + t.off : '🔊 ' + t.on}</button>
      </div>
    </>
  );
}

export function Alerts({ alerts, t }) {
  return (
    <section className="card">
      <h2>{t.alerts}</h2>
      {!alerts.length && <p className="muted">{t.none}</p>}
      <ul className="list">
        {alerts.map((a) => (
          <li key={a.id} className={CLS[a.level]}>
            <span className="badge">{ICON[a.level]} {t.lv[a.level]}</span>
            <span>PM2.5 <b>{a.pm25 ?? 0}</b> · Gas <b>+{a.gas ?? 0}</b></span>
            <time>{fmt(a.t)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function History({ hist, t }) {
  const d = hist.slice(-48), max = Math.max(200, ...d.map((x) => x.pm25));
  if (d.length < 2) return (<section className="card"><h2>{t.hist} · PM2.5</h2><p className="muted">Waiting for data… (a point is saved every 30 sec)</p></section>);
  const X = (i) => (i / (d.length - 1)) * 300, Y = (v) => 100 - (v / max) * 96;
  const pts = d.map((x, i) => `${X(i).toFixed(1)},${Y(x.pm25).toFixed(1)}`).join(' ');
  const peak = Math.max(...d.map((x) => x.pm25)), avg = Math.round(d.reduce((s, x) => s + x.pm25, 0) / d.length);
  const dng = Math.round((d.filter((x) => x.pm25 >= LIMITS.pm25[1]).length / d.length) * 24 * 10) / 10;
  return (
    <section className="card">
      <h2>{t.hist} · PM2.5</h2>
      <svg viewBox="0 0 300 104" className="chart" role="img" aria-label="PM2.5 chart">
        <line x1="0" x2="300" y1={Y(LIMITS.pm25[1])} y2={Y(LIMITS.pm25[1])} className="lg d" />
        <line x1="0" x2="300" y1={Y(LIMITS.pm25[0])} y2={Y(LIMITS.pm25[0])} className="lg w" />
        <polyline points={`0,100 ${pts} 300,100`} className="area" />
        <polyline points={pts} className="ln" />
      </svg>
      <p className="legend"><span className="w">- - {t.warnL} ({LIMITS.pm25[0]})</span><span className="d">- - {t.dngL} ({LIMITS.pm25[1]})</span></p>
      <div className="grid three">
        <div className="tile"><span className="tl">{t.peak}</span><b>{peak}<small> µg/m³</small></b></div>
        <div className="tile"><span className="tl">{t.avg}</span><b>{avg}<small> µg/m³</small></b></div>
        <div className="tile"><span className="tl">{t.dng}</span><b>{dng}<small> h</small></b></div>
      </div>
    </section>
  );
}

export function About({ t }) {
  return (
    <section className="card">
      <h2>{t.how}</h2>
      <ol className="steps">{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      <h2>{t.lim}</h2>
      <table><tbody>
        {Object.keys(LIMITS).map((k) => (
          <tr key={k}><td>{t.m[k]}</td><td className="warn">⚠️ ≥ {LIMITS[k][0]}</td><td className="danger">🚨 ≥ {LIMITS[k][1]}</td></tr>
        ))}
      </tbody></table>
      <p className="note">ℹ️ {t.note}</p>
    </section>
  );
}
