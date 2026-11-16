# E-Waste Worker Safety Monitor

A low-cost wearable warning system for e-waste workers. It senses smoke, dust, gas, temperature and humidity, warns the worker on the device with a buzzer and OLED, and sends live data and alerts to a responsive website.

**Live demo:** https://ewaste-safety-dashboard.vercel.app/

## Problem

In places like Moradabad and Seelampur (India) and Agbogbloshie (Ghana), workers burn old wires and circuit boards to recover metal. The smoke contains harmful particles and gases, and most workers have no affordable way to know when the air becomes dangerous. Industrial monitors are too costly for them.

## Our solution

A cheap ESP32-based wearable that:

- Measures dust/smoke, harmful gas, temperature and humidity.
- Compares readings with a clean-air baseline and decides **SAFE / CAUTION / DANGER**.
- Warns the worker instantly with a buzzer and OLED (works even without internet).
- Uploads data to the cloud so supervisors can watch alerts live on a website.

> **Note:** The sensors give a smoke and gas exposure warning. They do **not** measure lead or cadmium directly, and the dust value is a relative indicator, not a calibrated PM2.5 reading.

## Features

- Live dashboard with a SAFE / CAUTION / DANGER status and sensor tiles
- Alerts page with alert history
- History graph: Day, 7 days, 30 days, with a date picker and exact values on touch
- Hindi / English toggle
- Responsive design for phone and laptop
- Demo mode with fake data when Firebase is not configured
- Offline indicator when the device stops sending data

## System overview

```
Sensors (DHT22, MQ-135, GP2Y1010) -> ESP32 -> Wi-Fi -> Firebase Realtime Database -> Website (Vercel)
                                       |
                                  Buzzer + OLED (on-device alert)
```

## Hardware

| Part | Use |
|---|---|
| ESP32 | Main controller and Wi-Fi |
| DHT22 | Temperature and humidity |
| MQ-135 | Harmful gas (VOC / smoke gases) |
| GP2Y1010 | Dust / smoke density |
| Buzzer | Sound alert |
| OLED 0.96" (SSD1306) | Live status on the device |

## Tech stack

- **Frontend:** React, Vite, plain CSS
- **Cloud:** Firebase Realtime Database
- **Hosting:** Vercel
- **Firmware:** Arduino (C++) for ESP32

## Database paths

| Path | Written by | When | Used for |
|---|---|---|---|
| `/latest` | ESP32 (PUT) | Every 5 s | Live tiles and status |
| `/alerts` | ESP32 (POST) | When the level goes up | Alerts page |
| `/readings` | ESP32 (POST) | Every 5 minutes | History graph |

Example `/latest` record:

```json
{ "pm25": 12, "pm10": 19, "gas": 4, "temp": 31.6, "hum": 27, "lvl": 0, "t": 1794477973195 }
```

`lvl` is the alert level (0 SAFE, 1 CAUTION, 2 DANGER). Gas and dust values are the rise above the clean-air baseline.

## Run locally

```bash
npm install
npm run dev
```

Open the link shown in the terminal (usually http://localhost:5173). With no `.env` file the site runs in Demo mode.

## Connect Firebase (Live mode)

1. Copy `.env.example` to `.env` and fill in:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
```

2. In Firebase, set the Realtime Database rules (testing rules shown below):

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "readings": { ".indexOn": ["t"] },
    "alerts": { ".indexOn": ["t"] }
  }
}
```

3. Restart `npm run dev`. The header should show **Live**.

## Deploy

1. Push the code to GitHub.
2. Import the repo in Vercel (Framework: Vite, build command `npm run build`, output `dist`).
3. Add the three `VITE_FIREBASE_...` variables in Vercel, then redeploy.

## Alert levels

Limits are set in `src/data.js` (`LIMITS`) for the website and in the firmware for the device. Gas and dust limits are measured as the rise above the clean-air baseline. Tune them after real tests.

## Project structure

```
src/
  App.jsx           data source, alerts logic, layout
  Pages.jsx         Live, Alerts and About pages
  HistoryPanel.jsx  history graph (Day / 7 / 30 days)
  fb.js             Firebase history fetch
  data.js           alert limits and demo data
  i18n.js           English / Hindi text
```

## Limitations

- Database rules are open for testing. Add authentication before real use.
- The ESP32 uses `setInsecure()` for HTTPS (no certificate check).
- The dust sensor (GP2Y1010) cannot give true PM2.5 or PM10 values.
- Battery level on the dashboard is a placeholder.

## Team

| Member | Role |
|---|---|
| Rushikesh | Hardware and all wiring |
| Aishwarya | Software / frontend |
| Anushka | Integration: Firebase with website |
| Atharv | Documentation, research, patent and paper |
