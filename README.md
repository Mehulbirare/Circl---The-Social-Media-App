# Circl

**Your circle, your city.**

A location-based community app built with React Native. Discover what's happening nearby, connect with people in your neighbourhood, and share local posts and events in real time.

---

## Screenshots

| Welcome | Home | Profile |
|---------|------|---------|
| ![Welcome](./docs/screenshots/welcome.png) | ![Home](./docs/screenshots/home.png) | ![Profile](./docs/screenshots/profile.png) |

---

## Features

### Auth
- Animated welcome carousel on first launch ([`WelcomeScreen.jsx`](src/screens/auth/WelcomeScreen.jsx))
- Email/password login ([`LoginScreen.jsx`](src/screens/auth/LoginScreen.jsx))
- New account signup ([`SignupScreen.jsx`](src/screens/auth/SignupScreen.jsx))

### Main Tabs
- **Home** — local feed of posts and events from nearby users
- **Explore** — map-based discovery of people and activity in your area
- **Create** — compose and publish a new local post or event
- **Notifications** — activity alerts and updates
- **Profile** — view your own posts, stats, and account details

### Profile Editing
- Pick or capture an avatar via camera or photo library (`react-native-image-picker`)
- Edit display name
- Date of birth picker (`@react-native-community/datetimepicker`)
- Gender selection
- Contact information fields

### Post Detail
- Full post view with author info, body, and interaction controls

### Location Services
- Device location via `@react-native-community/geolocation`
- Map rendering with `react-native-maps`
- Location state managed globally via `useLocationStore`

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.85, React 19 |
| Navigation | `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs` |
| State | Zustand 5 |
| Maps | `react-native-maps` |
| Location | `@react-native-community/geolocation` |
| Image picker | `react-native-image-picker` |
| Date picker | `@react-native-community/datetimepicker` |
| Gradients | `react-native-linear-gradient` |
| Icons | `react-native-vector-icons` |
| Animation | `react-native-reanimated`, `react-native-worklets` |
| Gestures | `react-native-gesture-handler` |
| Safe area | `react-native-safe-area-context` |
| Storage | `@react-native-async-storage/async-storage` |
| Language | TypeScript 5 |

---

## Project Structure

```text
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Shared UI components used across screens
├── constants/       # App-wide constant values (routes, keys, etc.)
├── navigation/      # Stack and tab navigator definitions
│   └── AppNavigator.jsx
├── screens/         # Screen-level components grouped by feature
│   ├── auth/        # WelcomeScreen, LoginScreen, SignupScreen
│   ├── home/        # Home feed screen
│   ├── explore/     # Map/discovery screen
│   ├── create/      # Post creation screen
│   ├── notifications/ # Notifications screen
│   └── profile/     # Profile view and edit screens
├── store/           # Zustand stores (auth, location)
└── theme/           # Colors, spacing, and typography tokens
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 22.11.0 |
| JDK | 17 |
| Android Studio | Latest stable |
| Android SDK | API 33+ recommended |

You also need either:
- A physical Android device with **USB debugging** enabled, or
- An Android emulator created in Android Studio's AVD Manager.

### Install dependencies

```bash
npm install
```

### Start Metro bundler

```bash
npm start
```

### Run on Android

```powershell
npm run android
```

> **iOS:** Requires macOS, Xcode, and running `pod install` inside the `ios/` directory. iOS is **not currently configured** for this project (developed on Windows).

---

## Available Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `start` | `react-native start` | Starts the Metro JavaScript bundler |
| `android` | `react-native run-android` | Builds and launches the app on a connected Android device or emulator |
| `ios` | `react-native run-ios` | Builds and launches on iOS simulator (macOS + Xcode required) |
| `lint` | `eslint .` | Runs ESLint across the entire project |
| `test` | `jest` | Runs the Jest test suite |

---

## State Management

Circl uses [Zustand 5](https://zustand.docs.pmnd.rs/) for global state. There are two stores:

**`useAuthStore`** (`src/store/`) holds the current user object along with `login`, `logout`, and `updateUser` actions. On login, user data is written into the store; on logout, it is cleared.

**`useLocationStore`** (`src/store/`) holds the device's current coordinates and exposes actions to update them as the user moves.

Neither store currently persists to disk between app launches — see [Roadmap](#roadmap).

---

## Theme

Design tokens live in `src/theme/`. Import from there rather than hard-coding values in components.

- **Primary colour:** `#1D9E75` (brand green)
- `src/theme/colors.js` — full colour palette including background, text, and accent values
- Spacing scale and typography definitions are co-located in the same folder

The root `App.jsx` reads `colors.background` from this theme to set the `StatusBar` background.

---

## Troubleshooting

**Native module errors after `npm install`**
Any package with native code (maps, image picker, reanimated, etc.) requires a full rebuild:
```bash
npm run android
```
If errors persist, clean the build first:
```powershell
cd android && ./gradlew clean && cd ..
npm run android
```

**`adb devices` returns empty**
- Ensure USB debugging is enabled on the device (Developer Options).
- Try a different USB cable or port.
- Run `adb kill-server && adb start-server`, then replug the device.

**Metro port 8081 already in use**
Start Metro on a different port:
```bash
npm start -- --port 8082
```
Then in a second terminal:
```bash
npm run android -- --port 8082
```

**Gradle is slow on first build**
Expected — Gradle downloads dependencies and compiles native code on the first run. Subsequent builds are significantly faster. Ensure you have a stable internet connection for the first build.

**`react-native-vector-icons` icons not showing**
Add the fonts to `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```
Then rebuild.

---

## Roadmap

- Auth persistence across sessions using `@react-native-async-storage/async-storage` (dependency already installed)
- iOS project setup (requires macOS build machine)
- Real backend integration (API, WebSockets for live local feed)
- Push notifications
- Post interactions (likes, comments, shares)
- User discovery and follow system

---

## License

MIT — see [LICENSE](./LICENSE) for details.