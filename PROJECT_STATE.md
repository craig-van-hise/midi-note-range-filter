# Project State: MIDI Note Range Filter

## 1. Architecture

```
/Users/vv2024/Documents/Repos - vv2024/MIDI/WebApps/midi-note-range-filter
├── README.md
├── index.html
├── metadata.json
├── package-lock.json
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── Piano128.tsx
│   │   └── RangeSlider.tsx
│   ├── hooks
│   │   └── useMidi.ts
│   ├── index.css
│   ├── lib
│   │   └── midiProcessing.ts
│   └── main.tsx
├── tsconfig.json
└── vite.config.ts
```

## 2. Tech Stack

- **Core:** React 19, Vite, TypeScript
- **Styling & Icons:** Tailwind CSS, Radix UI (`@radix-ui/react-slider`, `@radix-ui/react-tooltip`), Lucide React
- **Animation:** Motion (`motion`)
- **Hardware Integration:** WebMIDI API (`@types/webmidi`)

## 3. Current System Capabilities

### MIDI Hardware Bridging (`useMidi.ts`)
- Automatically detects and enumerates available MIDI input ports.
- Subscribes to incoming MIDI messages (`noteon`, `noteoff`, control changes) and provides real-time event updates to the application lifecycle.

### Range Filtering & Processing Engine (`midiProcessing.ts`)
- Implements four distinct out-of-bounds note mapping algorithms:
  - **Block:** Suppresses notes outside the defined window.
  - **Octave Wrap:** Transposes out-of-bounds notes by octave increments/decrements into the active window.
  - **Wrap:** Uses strict modular wrapping to remap notes.
  - **Limit:** Hard clamps notes to the min/max boundaries.

### Interactive UI & Visualizer (`App.tsx`, `Piano128.tsx`, `RangeSlider.tsx`)
- Provides a dual-thumb slider for setting the active MIDI note range between 0 and 127.
- Visualizes note events across a complete 128-key piano interface, color-coding active notes, remapped targets, blocked notes, and bypass states.
- Includes channel selection filtering (Channels 1–16) and a global MIDI Panic function.

## 4. Recent Evolution

- **AI Studio Export Integration & Cleanup:** Unpacked raw AI Studio export assets into the project root directory, establishing a clean workspace hierarchy.
- **Documentation Overhaul:** Replaced generic AI Studio boilerplate with a comprehensive `README.md` and `PROJECT_STATE.md` detailing the actual MIDI filtering capabilities and technical architecture.
- **Automated Deployment Preparation:** Configured Vite base paths and prepared GitHub Actions workflow for autonomous deployment to GitHub Pages.
