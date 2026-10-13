import { useEffect, useRef, useState } from 'react';
import { START, next, overall, seedHistory, seedAlerts } from './data.js';
import { T } from './i18n.js';
import { Live, Alerts, History, About } from './Pages.jsx';

const env = import.meta.env;
const LIVE = !!env.VITE_FIREBASE_DATABASE_URL;
const TABS = [['live', '📟'], ['alerts', '🔔'], ['history', '📈'], ['about', 'ℹ️']];

const beep = (L) => {
  try {
    const c = new AudioContext(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = L > 1 ? 880 : 520; g.gain.value = 0.15;
    o.start(); o.stop(c.currentTime + (L > 1 ? 0.7 : 0.3));
  } catch { /* sound blocked until user taps */ }
};

export default function App() {
  const [page, setPage] = useState(location.hash.slice(1) || 'live');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [r, setR] = useState(START);
  const [hist, setHist] = useState(() => (LIVE ? [] : seedHistory()));
  const [alerts, setAlerts] = useState(() => (LIVE ? [] : seedAlerts()));
  const [now, setNow] = useState(Date.now());
  const [boost, setBoost] = useState(false);
  const [muted, setMuted] = useState(false);
  const bRef = useRef(false), prev = useRef(overall(START));
  bRef.current = boost;
  const t = T[lang];

  useEffect(() => {
    const h = () => setPage(location.hash.slice(1) || 'live');
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, []);

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(i); }, []);

  useEffect(() => { document.documentElement.lang = lang; localStorage.setItem('lang', lang); }, [lang]);

  // Data source: Firebase (if env set) else Demo simulator
  useEffect(() => {
    if (LIVE) {
      let offs = [];
      (async () => {
        const [{ initializeApp }, d] = await Promise.all([import('firebase/app'), import('firebase/database')]);
        const db = d.getDatabase(initializeApp({ apiKey: env.VITE_FIREBASE_API_KEY, databaseURL: env.VITE_FIREBASE_DATABASE_URL, projectId: env.VITE_FIREBASE_PROJECT_ID }));
        offs = [
          d.onValue(d.ref(db, 'latest'), (s) => s.val() && setR({ ...s.val(), t: s.val().t || Date.now() })),
          d.onValue(d.query(d.ref(db, 'alerts'), d.limitToLast(50)), (s) => {
            const v = s.val() || {};
            setAlerts(Object.entries(v).map(([id, a]) => ({ id, ...a })).sort((a, b) => b.t - a.t));
          }),
          d.onValue(d.query(d.ref(db, 'readings'), d.limitToLast(96)), (s) => {
            const v = s.val(); if (v) setHist(Object.values(v));
          }),
        ];
      })();
      return () => offs.forEach((f) => f());
    }
    const id = setInterval(() => setR((p) => next(p, bRef.current)), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const L = overall(r);
    if (!LIVE) {
      setHist((h) => [...h.slice(-95), r]);
      if (L > prev.current) setAlerts((a) => [{ id: r.t, level: L, pm25: r.pm25, gas: 0, t: r.t }, ...a].slice(0, 50));
    }
    if (L > prev.current && !muted) beep(L);
    prev.current = L;
  }, [r]);

  const L = overall(r);
  return (
    <div className={'app s' + L}>
      <header>
        <div className="brand"><span className="logo">🛡️</span><div><strong>{t.app}</strong><small>{t.tag}</small></div></div>
        <nav>
          {TABS.map(([k, i]) => (
            <a key={k} href={'#' + k} className={page === k ? 'act' : ''}><span>{i}</span>{t.nav[k]}{k === 'alerts' && L > 0 && <i className="dot" />}</a>
          ))}
        </nav>
        <div className="tools">
          <span className="pill">{LIVE ? (now - r.t > 20000 ? '🔴 Offline' : '🟢 ' + t.live) : '🧪 ' + t.demo}</span>
          <button className="btn ghost sm" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} aria-label="Language">{lang === 'en' ? 'हिंदी' : 'EN'}</button>
        </div>
      </header>
      <main>
        {page === 'alerts' ? <Alerts alerts={alerts} t={t} />
          : page === 'history' ? <History hist={hist} t={t} />
          : page === 'about' ? <About t={t} />
          : <Live r={r} t={t} boost={boost} setBoost={setBoost} demo={!LIVE} muted={muted} setMuted={setMuted} />}
      </main>
    </div>
  );
}
