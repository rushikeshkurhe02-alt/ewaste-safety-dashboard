const env = import.meta.env;
export const LIVE = !!env.VITE_FIREBASE_DATABASE_URL;
let dbp;
const getDb = () => (dbp ||= (async () => {
  const [{ initializeApp, getApps, getApp }, d] = await Promise.all([import('firebase/app'), import('firebase/database')]);
  const app = getApps().length ? getApp() : initializeApp({ apiKey: env.VITE_FIREBASE_API_KEY, databaseURL: env.VITE_FIREBASE_DATABASE_URL, projectId: env.VITE_FIREBASE_PROJECT_ID });
  return { db: d.getDatabase(app), d };
})());

// Fetch stored readings between two timestamps (ms)
export async function fetchReadings(from, to) {
  const { db, d } = await getDb();
  const snap = await d.get(d.query(d.ref(db, 'readings'), d.orderByChild('t'), d.startAt(from), d.endAt(to)));
  return Object.values(snap.val() || {}).filter((x) => x.t).sort((a, b) => a.t - b.t);
}
