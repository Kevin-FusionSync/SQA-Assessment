# FreshCart

FreshCart is an online grocery store with a **web app**, an **iOS/Android mobile app**, and a shared **REST API**.

| Part | Tech | Folder | Default URL |
|------|------|--------|-------------|
| API | Node.js + Express (in-memory data) | `backend/` | http://localhost:4000 |
| Web | React 19 + Vite + TypeScript | `web/` | http://localhost:5173 |
| Mobile | Expo SDK 57 (React Native) + Expo Router | `mobile/` | Expo Go / simulator |

> **Assessment candidates:** start with [`docs/CANDIDATE_BRIEF.md`](docs/CANDIDATE_BRIEF.md). The expected behaviour of the product is defined in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

---

## Prerequisites

- Node.js 20 or newer (`node -v`)
- For mobile, one of:
  - **Expo Go** (latest, SDK 57) on a physical iPhone/Android phone on the same Wi-Fi as your computer, or
  - Xcode iOS Simulator (macOS), or
  - Android Studio emulator

## 1. Start the API

```bash
cd backend
npm install
npm start
```

You should see `FreshCart API running on http://localhost:4000`. Check it with http://localhost:4000/api/health.

All data is in memory. **Restarting the API resets every user, cart, order and stock level to the original seed data.** Restart it whenever you want a clean state.

## 2. Start the web app

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173. To point the web app at a different API, set `VITE_API_URL`, e.g. `VITE_API_URL=http://192.168.1.10:4000 npm run dev`.

## 3. Start the mobile app

```bash
cd mobile
npm install
npx expo start
```

- **Physical phone:** scan the QR code with the camera (iOS) or the Expo Go app (Android). The app connects to the API on the same machine that runs Metro automatically.
- **iOS Simulator:** press `i`. **Android emulator:** press `a`.
- If the app can't reach the API, set the URL explicitly: `EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:4000 npx expo start -c`.

## Test accounts

| Name | Email | Password |
|------|-------|----------|
| Demo User | `demo@freshcart.com` | `Demo1234` |
| Jane Carter | `jane@freshcart.com` | `Jane1234` |

You can also register new accounts.

## Coupon codes

| Code | Behaviour |
|------|-----------|
| `SAVE10` | 10% off the subtotal, orders of $50.00 or more |
| `FREESHIP` | Free delivery on any order |
| `EXPIRED20` | A 20% promotion that ended on 31 Dec 2025 |

## Project layout

```
freshcart/
├── backend/        REST API (src/server.js, seed data in src/data.js)
├── web/            React web app (src/pages, src/components)
├── mobile/         Expo app (src/app = screens/routes, src/lib, src/components)
└── docs/
    ├── REQUIREMENTS.md     Product requirements & acceptance criteria
    └── CANDIDATE_BRIEF.md  QA assessment instructions and report templates
```
