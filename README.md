# E-Waste Safety Monitor (website)

Responsive live dashboard for the e-waste worker wearable: live tiles, alerts, and a Day / 7-day / 30-day history graph.

## Run in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Open the terminal (Ctrl + `) and run:
   npm install
   npm run dev
3. Open the link shown (usually http://localhost:5173).

No setup needed: with no `.env` file it runs in Demo mode (fake data).

## Live mode (Firebase)
Copy `.env.example` to `.env` and fill the 3 values (API key, database URL, project ID), then restart `npm run dev`.

## Deploy
Push to GitHub. Vercel redeploys automatically. Add the same 3 values in Vercel > Settings > Environment Variables.

## Files
- src/App.jsx: data source, alerts logic, layout
- src/Pages.jsx: Live, Alerts, About pages
- src/HistoryPanel.jsx: history graph (Day / 7 days / 30 days)
- src/fb.js: Firebase history fetch
- src/data.js: alert limits (LIMITS)
- src/i18n.js: English / Hindi text
