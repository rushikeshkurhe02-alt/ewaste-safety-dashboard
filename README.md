# E-Waste Safety Monitor 🦺

> Real-time air-quality and safety alerts for e-waste workers.

🔗 **Live Demo:** [https://ewaste-safety-dashboard.vercel.app](https://ewaste-safety-dashboard.vercel.app)

A responsive alert website for an e-waste worker wearable. It tracks **PM2.5, PM10, gas, temperature, humidity and battery**, and warns when a reading crosses a safe limit, so workers and supervisors can act before exposure becomes dangerous.

---

## 🌐 Live Demo

Open **[ewaste-safety-dashboard.vercel.app](https://ewaste-safety-dashboard.vercel.app)**. The site runs in **Demo mode** with simulated sensor data, so it works instantly with no setup or hardware.

---

## ✨ Features

- 📊 Live readings for PM2.5, PM10, gas, temperature, humidity and battery
- 🚨 Two-level alerts (Warning and Danger) for every sensor
- 📱 Fully responsive, works on phone, tablet and desktop
- 🧪 Demo mode with fake data, no hardware needed
- 🔌 Ready for real hardware: ESP32 to Firebase Realtime Database
- ⚙️ Alert thresholds are easy to change

## 🛠️ Tech Stack

Vite · Firebase Realtime Database · ESP32 (wearable) · Vercel

---

## 🚀 Run Locally

```bash
npm install && npm run dev
```

## ☁️ Deploy (GitHub → Vercel)

1. Push this folder to GitHub.
2. Go to vercel.com → **Add New Project** → import the repo (Framework: `Vite`, Build: `npm run build`, Output: `dist`).
3. Click **Deploy**. The site works in Demo mode with no setup.

## 🔥 Go Live with Firebase (later)

1. In the Firebase console, create a **Realtime Database**. For testing only, use these rules:
```json
   { "rules": { ".read": true, ".write": true } }
```
   > ⚠️ These open rules are for testing only. Lock them down before real use.
2. Copy `.env.example` to `.env` and fill in the values. On Vercel, add the same variables under **Settings → Environment Variables**, then redeploy.
3. Have the ESP32 write JSON to `https://<db>.firebaseio.com/latest.json` using HTTP PUT:
```json
   {"pm25":42,"pm10":70,"gas":300,"temp":31.5,"hum":55,"battery":80,"t":1700000000000}
```
   (`t` is the Unix time in milliseconds.)

## ⚙️ Edit Alert Levels

Open `src/data.js` and change `LIMITS`. Each sensor has `[warning, danger]` values.

---

Built to keep e-waste workers safe. 🌍
