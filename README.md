# GitHub Resolve Outdated — Chrome Extension

> A Chrome extension that automatically resolves all **Outdated** review conversations on GitHub Pull Requests with a single click.

---

## ✨ Features

- 🔍 Auto-detects when you're on a GitHub PR page
- 📄 Expands paginated "Read more" content before processing
- 📂 Opens all collapsed outdated threads
- ✅ Resolves every outdated conversation automatically
- 📊 Live step-by-step progress UI with counters
- 🎨 Dark-themed popup matching GitHub's aesthetic

---

## 📦 Installation (Developer Mode)

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/resolve-outdated-extension.git
   ```

2. Open **Chrome** and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **"Load unpacked"** and select the cloned folder

5. The extension icon will appear in your toolbar 🎉

---

## 🚀 Usage

1. Navigate to any GitHub Pull Request (e.g. `https://github.com/org/repo/pull/123`)
2. Click the **Resolve Outdated** extension icon in your toolbar
3. Click the **▶ Run on this PR** button
4. Watch the three steps execute live — the popup shows counts in real time
5. Done! All outdated review conversations are now resolved

---

## 🗂 Project Structure

```
resolve-outdated-extension/
├── manifest.json     # Extension manifest (MV3)
├── content.js        # Injected into GitHub PR pages — core logic
├── popup.html        # Extension popup UI
├── popup.js          # Popup state management & messaging
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🔧 How It Works

The extension runs in **three sequential steps**:

| Step | Action |
|------|--------|
| 1️⃣ Expand | Clicks all `ajax-pagination-btn` "Read more" buttons until none remain |
| 2️⃣ Open   | Finds every `<span>` with text `"Outdated"` and opens its parent `<details>` |
| 3️⃣ Resolve | Finds the resolve button inside each outdated thread's comment form and clicks it |

Each step has a small `sleep()` delay between clicks to allow GitHub's AJAX calls to settle.

---

## 🛠 Selectors Used

| Purpose | Selector |
|---------|----------|
| Read more / paginate | `form > div > div > button.ajax-pagination-btn...` |
| Outdated flag text | `details-collapsible > details-toggle > details > summary > div > span > span` |
| Resolve button | `div.js-inline-comments-container > form > div > button` |

> **Note:** GitHub's markup may change over time. If the extension stops working, open an issue and the selectors can be updated.

---

## 🔒 Permissions

| Permission | Reason |
|------------|--------|
| `activeTab` | Read the current tab's URL to verify it's a GitHub PR |
| `scripting` | Inject and communicate with the content script |
| `host_permissions: github.com/*` | Limit activity to GitHub only |

No data is collected or sent anywhere. Everything runs locally in your browser.

---

## 📄 License

MIT — free to use, modify, and distribute.
