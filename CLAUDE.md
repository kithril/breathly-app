# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start          # Start Expo dev server
yarn ios            # Run on iOS simulator
yarn android        # Run on Android emulator
yarn web            # Run in browser
yarn typecheck      # TypeScript type checking (no emit)
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn format         # Prettier on TS/TSX/JSON/MD files
```

There is no automated test suite — the app is tested manually and via EAS builds.

## Architecture

Breathly is an Expo (managed workflow) React Native app that guides users through breathing exercises. Users select a breathing pattern, optionally configure audio guidance, and perform timed sessions.

### Navigation

Two nested stacks via `@react-navigation/native-stack`:
- **RootStack**: `Home` → `Exercise` → `Settings` (iOS: formSheet modal)
- **SettingsStack**: `SettingsRoot` → `SettingsPatternPicker`

Entry point: [App.tsx](App.tsx) → [src/core/entry-point.tsx](src/core/entry-point.tsx) → [src/core/navigator.tsx](src/core/navigator.tsx)

### State Management

Single Zustand store in [src/stores/settings.ts](src/stores/settings.ts), persisted via `AsyncStorage`. Manages: breathing pattern selection (preset or custom 4-step tuple), guided voice, time limit, theme, vibration. Uses a custom `useHydration()` hook to delay splash screen hide until store is rehydrated.

### Exercise Screen

The most complex part of the app lives in [src/screens/exercise-screen/](src/screens/exercise-screen/). Key files:

- **`use-exercise-loop.tsx`** — drives the step sequencing animation cycle (inhale → hold → exhale → hold), using a custom `loopAnimations()` utility (see below)
- **`use-exercise-audio.tsx`** — loads and plays `expo-audio` cues per step
- **`use-exercise-haptics.tsx`** — triggers `expo-haptics` per step
- **`breathing-animation.tsx`** — animated circle that scales/fades with each phase

The screen has three states: `interlude` (countdown), `running` (exercise), `complete` (congratulations).

### Known Quirks

- **Animation loop workaround**: `Animated.sequence` + `Animated.loop` with the native driver doesn't work reliably on Android. [src/utils/loop-animations.ts](src/utils/loop-animations.ts) implements a custom recursive loop instead.
- **NativeWind patch**: A `patch-package` patch exists for `nativewind@2.0.11` to fix stale `useColorScheme` data (fixed in NativeWind v3, but the app uses v2).
- **Android nav bar**: Must use `rgba(0,0,0,0.002)` instead of fully transparent; flashes on foreground transition and requires manual `AppState` tracking.

### Path Aliases

TypeScript and Babel are configured with `@breathly/*` → `src/*`. Use this alias for all imports within `src/`.

### Platform-Specific UI

Settings UI has separate platform implementations: [settings-ui.ios.tsx](src/screens/settings-screen/settings-ui.ios.tsx) and [settings-ui.android.tsx](src/screens/settings-screen/settings-ui.android.tsx).
