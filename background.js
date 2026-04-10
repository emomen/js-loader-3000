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
    new Function(code)();
  } catch (error) {
    console.error(`Custom JS execution failed for pattern ${pattern}:`, error);
  }
}

function injectCustomScripts(tabId, url) {
  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    const entries = data[STORAGE_KEY] || [];
    for (const entry of entries) {
      if (entry.urlPattern && entry.code && urlMatchesPattern(entry.urlPattern, url)) {
        chrome.scripting.executeScript({
          target: { tabId },
          func: runCustomCode,
          args: [entry.code, entry.urlPattern],
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('ExecuteScript error:', chrome.runtime.lastError.message);
          }
        });
      }
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && /^https?:\/\//.test(tab.url)) {
    injectCustomScripts(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && /^https?:\/\//.test(tab.url)) {
      injectCustomScripts(tab.id, tab.url);
    }
  });
});
