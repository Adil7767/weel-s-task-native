# Frontend App (Expo React Native)

Expo SDK 54 project implementing the Task Delivery preference flow (Login → Delivery Preference → Summary) with state persistence and API integration.

## 1. Prerequisites

- Node.js ≥ 20
- npm (with Expo CLI bundled)
- Optional: Android Studio / Xcode for native simulators
- Docker (only if you want to run entire stack via Compose)

## 2. Project Bootstrap (from scratch)

```bash
git clone <repo-url>
cd Task/frontend
cp .env.example .env
npm install
```

Ensure `.env` contains `EXPO_PUBLIC_API_URL` pointing at the backend (`http://localhost:4000` when running locally, or `http://backend:4000` inside Docker).

## 3. Running the App

```bash
npm start
```

Expo CLI opens an interactive menu:

- press `w` to open the web build (default)
- press `a` to launch Android emulator
- press `i` to launch iOS simulator (macOS)

If you want to run the Expo web server inside Docker, use the root `docker-compose.yml` (`docker compose up frontend backend db`).
> Docker already runs `npm install` during the image build, so you only need to install dependencies manually when developing outside of containers.

## 4. Available Scripts

```bash
npm start        # start Expo dev server (default web)
npm run android  # Expo start for Android
npm run ios      # Expo start for iOS
npm run web      # Expo start for web
npm test         # Jest (RTNL setup ready; add tests under src/__tests__)
npm run lint     # ESLint
```

## 5. App Structure

- `App.tsx` – loads Satoshi font, wraps app with `AuthProvider`, Safe Area, Navigator
- `src/navigation/AppNavigator.tsx` – stack navigator with auth guarding
- `src/context/AuthContext.tsx` – token persistence and user fetching
- `src/screens/` – `LoginScreen`, `DeliveryPreferenceScreen`, `SummaryScreen`
- `src/api/` – Axios client + auth/orders API wrappers
- `src/storage/` – AsyncStorage helpers for auth, drafts, order ID
- `assets/fonts/` – Satoshi-Regular

## 6. Flow Summary

1. **Login** – Validates email/password, calls `/auth/login`, saves token & user.
2. **Delivery Preference** – Inline validation for conditional fields, future datetime enforcement, auto-save drafts, create/update order.
3. **Summary** – Displays stored order, supports refresh, edit (stores draft & navigates back), sign-out.

## 7. Testing Notes

Jest + React Native Testing Library are configured. Add specs under `src/__tests__/` and run `npm test`.

## 8. Environment Variables

- `EXPO_PUBLIC_API_URL` – Base URL for backend API.

## 9. Troubleshooting

- If API calls fail with 401, ensure backend is running and `.env` matches the backend host.
- Clear AsyncStorage during development by uninstalling the Expo Go app or using the dev menu (`Debug -> Clear AsyncStorage`).


# weel-s-task-native
