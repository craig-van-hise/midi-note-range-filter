# MIDI Note Range Filter

An interactive, web-based MIDI filter component and testing sandbox designed to manage out-of-bounds note mapping across a full 128-key physical keyboard view. Built with React 19, Vite, Tailwind CSS, and WebMIDI API.

## Features

- **Dynamic Range Filtering:** Visually select and clamp active MIDI note ranges (0–127) using an intuitive dual-thumb range slider.
- **Multi-Mode Note Processing:**
  - **Block:** Mutes incoming notes that fall outside the active range.
  - **Octave Wrap:** Folds out-of-range notes by shifting them up or down by octaves until they fit within the active bounds.
  - **Wrap:** Folds out-of-range notes back into the range directly via modular arithmetic.
  - **Limit:** Clamps out-of-range notes to the nearest active edge (minimum or maximum).
- **Full 128-Key Visualizer:** Real-time visual feedback across all 128 MIDI notes, indicating active notes, remapped targets, blocked notes, and bypass states.
- **Hardware Integration:** Connects directly to hardware MIDI input devices via the WebMIDI API with channel filtering support (Channels 1–16).
- **MIDI Panic & Bypass:** Dedicated controls to instantly send All Notes Off / Reset All Controllers messages or completely bypass the processing chain.

## Quick Start

### Prerequisites
- Node.js (v20 or higher recommended)
- A WebMIDI-compatible browser (e.g., Chrome, Edge, Opera)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the local server URL provided in the terminal.

## Architecture & Tech Stack

- **Frontend Framework:** React 19, Vite
- **Styling & UI:** Tailwind CSS, Radix UI (Tooltip, Slider), Lucide React (Icons)
- **MIDI Processing:** WebMIDI API integration with custom hook-based event bridging (`useMidi.ts`).

## License

This project is licensed under the MIT License.
