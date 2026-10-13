// [warning, danger] limits. Change after real testing.
// Must match thresholds in the ESP32 code (values are CHANGE above clean-air baseline)
export const LIMITS = { pm25: [25, 70], pm10: [40, 112], gas: [60, 150] };
export const lvl = (k, v) => (v >= LIMITS[k][1] ? 2 : v >= LIMITS[k][0] ? 1 : 0);
// Live mode: trust the level decided by the ESP32 (r.lvl). Demo mode: compute from values.
export const overall = (r) =>
  r.lvl != null ? r.lvl : Math.max(lvl('pm25', r.pm25), lvl('pm10', r.pm10), lvl('gas', r.gas));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);

export const START = { pm25: 38, pm10: 62, gas: 260, temp: 31.2, hum: 52, battery: 78, t: Date.now() };

// Fake "sensor" tick used in Demo mode
export const next = (p, boost) => {
  const pm25 = Math.round(clamp(p.pm25 + rnd(-14, 14) + (boost ? 45 : p.pm25 > 70 ? -8 : 0), 12, 330));
  return {
    pm25,
    pm10: Math.round(pm25 * 1.6 + rnd(-8, 8)),
    gas: Math.round(clamp(p.gas + rnd(-45, 45) + (boost ? 90 : p.gas > 350 ? -20 : 0), 120, 950)),
    temp: +clamp(p.temp + rnd(-0.3, 0.3), 27, 38).toFixed(1),
    hum: Math.round(clamp(p.hum + rnd(-1.5, 1.5), 35, 70)),
    battery: Math.max(5, +(p.battery - 0.02).toFixed(2)),
    t: Date.now(),
  };
};

export const seedHistory = () =>
  Array.from({ length: 48 }, (_, i) => {
    const pm25 = Math.round(30 + 25 * Math.sin(i / 5) + (i > 28 && i < 36 ? 110 : 0) + Math.random() * 12);
    return { pm25, pm10: Math.round(pm25 * 1.6), gas: Math.round(250 + pm25 * 1.4), t: Date.now() - (48 - i) * 30 * 60000 };
  });

const ago = (m) => Date.now() - m * 60000;
export const seedAlerts = () => [
  { id: 1, level: 2, pm25: 182, t: ago(95) },
  { id: 2, level: 1, pm25: 88, t: ago(130) },
  { id: 3, level: 2, pm25: 164, t: ago(60 * 7) },
  { id: 4, level: 1, pm25: 71, t: ago(60 * 9) },
  { id: 5, level: 1, pm25: 64, t: ago(60 * 26) },
];
