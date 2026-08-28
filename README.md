# NoReels 🚫🎥

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Multi-language](https://img.shields.io/badge/Languages-EN%20%7C%20ES%20%7C%20PT--BR%20%7C%20RU-green.svg)](#internationalization)

**NoReels** is a lightweight, zero-dependency browser extension built on Manifest V3. Designed to reclaim your focus and increase productivity, it blocks distracting short-form content and recommendations across popular social media platforms.

---

## 🚀 Key Features

- **YouTube Cleanup**:
  - Block "Shorts" shelf, video feeds, and navigation links.
  - Hide YouTube video comments.
  - Disable homepage grid feed recommendations (keep your homepage clean!).
  - Hide recommended sidebar videos and end-screen recommendations.
  - Automatically center and scale the video player when recommended columns are hidden.
- **Instagram Control**:
  - Block Reels links, tabs, and content elements.
- **Facebook Distraction-Free**:
  - Block Reels feeds and buttons.
  - Hide Facebook Stories.
- **Productivity Metrics**:
  - Track the number of items blocked.
  - View estimated saved time directly from the popup.
- **Multi-language Support (i18n)**: Automatically translates options to English, Spanish, Portuguese (BR), and Russian based on browser preferences.

---

## 📂 Project Structure

```text
clear-feed/
├── _locales/               # Multi-language translations
│   ├── en/messages.json    # English translations
│   ├── es/messages.json    # Spanish translations
│   ├── pt_BR/messages.json # Portuguese (Brazilian) translations
│   └── ru/messages.json    # Russian translations
├── images/                 # Extension asset assets
│   └── icon.png            # Extension logo
├── background.js           # Background service worker (on-install handler)
├── content.js              # Core inject script (observer and dynamic style rules)
├── manifest.json           # Manifest V3 metadata configuration
├── popup.html              # Clean dropdown toggle interface popup
├── popup.js                # Extension UI settings controller and metrics calculator
├── LICENSE                 # MIT License file
└── GEMINI.md               # Developer conventions and overview reference
```

---

## 🛠️ How It Works

1. **Non-Intrusive Styling**: Styles are injected at `document_start` to eliminate visual flicker.
2. **DOM Monitoring**: A `MutationObserver` ensures selectors targeting Reels, Shorts, and Stories stay hidden even as page content dynamically updates.
3. **No External Frameworks**: Written in pure JavaScript for minimal memory usage and zero CPU overhead.

---

## ⚙️ Building & Running Locally

### Development Mode

To load the extension into your browser manually:

1. Open a Chromium-based browser (e.g., **Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**).
2. Navigate to `chrome://extensions/`.
3. In the top-right corner, toggle the **Developer mode** switch to **ON**.
4. Click the **Load unpacked** button in the top-left.
5. Select the root directory containing this project (`clear-feed`).
6. Pin the extension to your toolbar to open the settings panel anytime!

### Production Packaging

To compile or submit to the Chrome Web Store:
1. Zip the root directory.
2. Exclude development-only files or folders (e.g., `.git`, `.gitignore`, `GEMINI.md`).

---

## 🤝 Contribution Guidelines

Contributions are welcome! Please keep these instructions in mind:
- **Be Specific with Selectors**: When adding or updating DOM selectors in `content.js`, make sure they target the specific elements without impacting core platform functionality.
- **Pure JavaScript Only**: Avoid adding heavy external libraries to keep the extension performant and lightweight.
- **Add i18n Keys**: If introducing new interactive options or features, remember to add corresponding keys in all `_locales/` files.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](file:///Users/matheuspedrosa/GIT/clear-feed/LICENSE) for more details.

---

*Developed with ❤️ by [Matheus Pedrosa](https://www.linkedin.com/in/matheus-pedrosa-custodio/)*
