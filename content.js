const STORAGE_KEY = 'customJsSites';

function urlMatchesPattern(pattern, url) {
  if (!pattern || !url) return false;

  if (pattern.startsWith('regexp:')) {
    const regexText = pattern.slice(7);
    try {
      const regex = new RegExp(regexText);
      return regex.test(url);
    } catch (error) {
      console.error('Invalid regexp pattern:', regexText, error);
      return false;
    }
  }

  let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  escaped = escaped.replace(/\*/g, '.*');
  const regex = new RegExp(`^${escaped}$`);
  return regex.test(url);
}

function runCustomCode(code, pattern) {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.dataset.code = code;
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    console.error(`Custom JS execution failed for pattern ${pattern}:`, error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const url = window.location.href;
  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    const entries = data[STORAGE_KEY] || [];
    for (const entry of entries) {
      if (entry.urlPattern && entry.code && urlMatchesPattern(entry.urlPattern, url)) {
        runCustomCode(entry.code, entry.urlPattern);
      }
    }
  });
});