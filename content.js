// content.js — injected on GitHub PR pages

const sleep = ms => new Promise(res => setTimeout(res, ms));

const SELECTORS = {
  readMore:
    "form > div > div > button.ajax-pagination-btn.no-underline.pb-1.pt-0.tmp-px-4.mt-0.mb-1.color-bg-default.border-0",
  outdatedFlag:
    "details-collapsible > details-toggle > details > summary > div > span > span",
  resolveBtn:
    "div.js-inline-comments-container > form > div > button",
};

async function expandPaginatedContent(onProgress) {
  let total = 0;
  let found = true;
  while (found) {
    const btns = document.querySelectorAll(SELECTORS.readMore);
    found = btns.length > 0;
    for (const btn of btns) {
      btn.click();
      total++;
      onProgress?.({ step: "expand", count: total });
      await sleep(900);
    }
  }
  return total;
}

async function openOutdatedThreads(onProgress) {
  const flags = document.querySelectorAll(SELECTORS.outdatedFlag);
  let opened = 0;
  for (const flag of flags) {
    if (flag.textContent.trim().toLowerCase() === "outdated") {
      const details = flag.closest("details");
      if (details && !details.open) {
        details.open = true;
        opened++;
        onProgress?.({ step: "open", count: opened });
        await sleep(300);
      }
    }
  }
  return opened;
}

async function resolveOutdatedThreads(onProgress) {
  const flags = document.querySelectorAll(SELECTORS.outdatedFlag);
  let resolved = 0;
  let skipped = 0;
  for (const flag of flags) {
    if (flag.textContent.trim().toLowerCase() === "outdated") {
      const details = flag.closest("details");
      if (!details) continue;
      const btn = details.querySelector(SELECTORS.resolveBtn);
      if (btn) {
        btn.click();
        resolved++;
        onProgress?.({ step: "resolve", count: resolved });
        await sleep(900);
      } else {
        skipped++;
      }
    }
  }
  return { resolved, skipped };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== "START_RESOLVE") return;

  (async () => {
    try {
      const expanded = await expandPaginatedContent(p =>
        chrome.runtime.sendMessage({ type: "PROGRESS", payload: p })
      );

      const opened = await openOutdatedThreads(p =>
        chrome.runtime.sendMessage({ type: "PROGRESS", payload: p })
      );

      const { resolved, skipped } = await resolveOutdatedThreads(p =>
        chrome.runtime.sendMessage({ type: "PROGRESS", payload: p })
      );

      sendResponse({ ok: true, expanded, opened, resolved, skipped });
    } catch (err) {
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true; // keep channel open for async sendResponse
});
