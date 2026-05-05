# Focus Loop

![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.74-20232a?logo=react&logoColor=61DAFB)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Focus Loop is a beginner-friendly mobile app built with React Native + Expo.

It is designed for ADHD/ADD-friendly focus sessions by reducing overwhelm:
- One active task at a time
- A calm countdown timer
- Gentle refocus prompts
- Optional background sounds

The app is intentionally simple (V1): no backend, no auth, no database.

## Screenshots

Add portfolio screenshots in `assets/screenshots/` and reference them here:

- `assets/screenshots/home.png`
- `assets/screenshots/timer-running.png`
- `assets/screenshots/session-complete.png`

> Tip: On Expo Go, take 3 clean screenshots (task set, timer running, completion flow) for stronger GitHub portfolio impact.

---

## Features

1. One Active Task
- Input prompt: "What are you focusing on?"
- Save one current task
- Display: `Right now: [task]`
- No long task list

2. Timer
- Presets: 5 min, 15 min, 25 min, 45 min
- Start / Pause / Reset controls
- Countdown format: MM:SS

3. Gentle Refocus
- Button: `I got distracted`
- Calm message: `No problem. Return to: [current task]`

4. Focus Sounds
- Modes: Lofi, Rain, Brown Noise, Silence
- Uses local files from `assets/audio/`
- Friendly fallback if audio is missing/unplayable

5. Completion Flow
When timer reaches zero:
- Shows: `Focus session complete`
- Increments `Sessions completed today`
- Buttons:
  - Done (clear task + reset timer)
  - Continue (restart same timer/task)
  - Switch Task (clear task and enter a new one)

6. Calm UI
- Dark theme
- Large readable text
- Rounded controls
- Spacious layout
- Encouraging tone

---

## Project Structure

focus-loop/
- App.js
- package.json
- README.md
- assets/
  - audio/
    - lofi.mp3
    - rain.mp3
    - brown-noise.mp3

---

## Install Dependencies

From the project folder:

```bash
npm install
```

---

## Run with Expo

```bash
npx expo start
```

Optional targets:

```bash
npm run android
npm run ios
npm run web
```

---

## Test on Phone with Expo Go

1. Install **Expo Go** on your phone (Android/iOS).
2. Run:
   ```bash
   npx expo start
   ```
3. Scan the QR code shown in terminal/browser using Expo Go.
4. The app will open on your phone.

If your phone cannot connect:
- Ensure phone and computer are on same Wi-Fi.
- In Expo Dev Tools, switch connection mode (LAN/Tunnel).

---

## Audio File Placement

Place these files exactly here:

- `assets/audio/lofi.mp3`
- `assets/audio/rain.mp3`
- `assets/audio/brown-noise.mp3`

If files are missing or broken, the app will continue running and display a friendly message instead of crashing during playback.

For a quick guide on replacing placeholder audio and verifying file sizes, see:
- `AUDIO_SETUP.md`

---

## GitHub Portfolio Explanation

This project is a good portfolio piece because it shows:
- Product thinking for a focused niche (ADHD/ADD-friendly UX)
- Clean React Native state management (no backend needed)
- Practical Expo integration (`expo-av` audio)
- Clear, calm UI design with accessible text and spacing
- Beginner-readable code with comments and simple structure

Suggested repo description:

> Focus Loop — a calm, one-task-at-a-time React Native focus timer for ADHD-friendly productivity, built with Expo and local-only state.

---

## Future Improvements

- Persist task/sessions with AsyncStorage
- Daily reset logic for "Sessions completed today"
- Gentle vibration/haptics at session end
- Optional short break timer mode
- Custom timer presets
- Better audio controls (volume slider, fade in/out)
- Basic accessibility improvements (screen reader labels)

---

## Notes for Beginners

- Start in `App.js`.
- Look for clearly labeled state sections: task, timer, refocus, sounds.
- Buttons call small handler functions (easy to trace).
- Keep V1 simple before adding more features.
