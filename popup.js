// popup.js

const badge     = document.getElementById("badge");
const badgeText = document.getElementById("badge-text");
const runBtn    = document.getElementById("run");
const btnIcon   = document.getElementById("btn-icon");
const btnText   = document.getElementById("btn-text");
const progressWrap = document.getElementById("progress-wrap");
const progressBar  = document.getElementById("progress-bar");
const result    = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const resultStats = document.getElementById("result-stats");

const stepEls = {
  expand:  document.getElementById("step-expand"),
  open:    document.getElementById("step-open"),
  resolve: document.getElementById("step-resolve"),
};

const countEls = {
  expand:  document.getElementById("count-expand"),
  open:    document.getElementById("count-open"),
  resolve: document.getElementById("count-resolve"),
};

const SPINNER_SVG = `<svg class="spinner" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
const PLAY_SVG    = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const CHECK_SVG   = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

let isRunning = false;
let activeTab = null;

// ── Init ────────────────────────────────────────────────────────────────────
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  const isPR = tab?.url?.match(/https:\/\/github\.com\/.+\/.+\/pull\//);

  if (isPR) {
    badge.className = "badge on-pr";
    badgeText.textContent = "GitHub PR detected";
    runBtn.disabled = false;
  } else {
    badge.className = "badge off-pr";
    badgeText.textContent = "Not on a PR page";
    runBtn.disabled = true;
  }
}

// ── Progress messages from content script ───────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "PROGRESS") return;
  const { step, count } = msg.payload;

  const keyMap = { expand: "expand", open: "open", resolve: "resolve" };
  const key = keyMap[step];
  if (!key) return;

  // Mark previous steps done, current active
  const keys = Object.keys(stepEls);
  const idx = keys.indexOf(key);
  keys.forEach((k, i) => {
    if (i < idx)      stepEls[k].className = "step done";
    else if (i === idx) stepEls[k].className = "step active";
    else              stepEls[k].className = "step";
  });

  countEls[key].textContent = count;

  // Animate progress bar across 3 phases
  const phaseProgress = { expand: 10, open: 40, resolve: 90 };
  progressBar.style.width = (phaseProgress[key] ?? 0) + "%";
});

// ── Run ─────────────────────────────────────────────────────────────────────
runBtn.addEventListener("click", async () => {
  if (isRunning || !activeTab) return;
  isRunning = true;

  // Reset UI
  result.className = "result";
  Object.values(stepEls).forEach(el => el.className = "step");
  Object.values(countEls).forEach(el => el.textContent = "—");
  progressWrap.classList.add("visible");
  progressBar.style.width = "5%";

  btnIcon.innerHTML = SPINNER_SVG;
  btnText.textContent = "Running…";
  runBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { action: "START_RESOLVE" });

    progressBar.style.width = "100%";

    // Mark all done
    Object.values(stepEls).forEach(el => el.className = "step done");
    if (response.resolved !== undefined) countEls.resolve.textContent = response.resolved;
    if (response.opened   !== undefined) countEls.open.textContent    = response.opened;
    if (response.expanded !== undefined) countEls.expand.textContent  = response.expanded;

    if (response.ok) {
      showResult("success", `✓ Done — ${response.resolved} resolved`, [
        ["Expanded",  response.expanded ?? 0],
        ["Opened",    response.opened   ?? 0],
        ["Resolved",  response.resolved ?? 0],
        ["Skipped",   response.skipped  ?? 0],
      ]);
    } else {
      showResult("error", "✕ Error", [["Message", response.error]]);
    }
  } catch (err) {
    showResult("error", "✕ Could not connect", [["Tip", "Reload the PR tab and try again."]]);
  }

  btnIcon.innerHTML = CHECK_SVG;
  btnText.textContent = "Run again";
  runBtn.disabled = false;
  isRunning = false;
});

function showResult(type, title, stats) {
  result.className = `result visible ${type}`;
  resultTitle.textContent = title;
  resultStats.innerHTML = stats
    .map(([label, val]) => `<span class="stat"><strong>${val}</strong> ${label}</span>`)
    .join("");
}

init();
