# E-Waste Safety Monitor
Responsive alert website for the e-waste worker wearable (PM2.5, PM10, gas, temp, humidity, battery).

## Run
npm install && npm run dev

## Deploy (GitHub → Vercel)
1. Push this folder to GitHub.
2. vercel.com → Add New Project → import repo (Framework: Vite, Build: `npm run build`, Output: `dist`).
3. Deploy. Site works in Demo mode (fake data) with no setup.

## Go live with Firebase (later)
1. Firebase console → Realtime Database → create. Rules (testing only): `{ "rules": { ".read": true, ".write": true } }`
2. Copy `.env.example` to `.env`, fill values. On Vercel add same variables (Settings → Environment Variables) and redeploy.
3. ESP32 writes JSON to `https://<db>.firebaseio.com/latest.json` (HTTP PUT):
   `{"pm25":42,"pm10":70,"gas":300,"temp":31.5,"hum":55,"battery":80,"t":<unix ms>}`

## Edit alert levels
`src/data.js` → `LIMITS` = [warning, danger] for each sensor.
