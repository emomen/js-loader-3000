# Custom JS on Page Visit

A simple Chrome extension that stores site-specific JavaScript snippets and runs them when matching pages load.

## Install
1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `chrome-custom-js-on-visit` folder.

## Usage
- Open the extension options page to add a URL pattern and custom JS code.
- Use wildcards like `https://example.com/*` or `regexp:^https://(www\\.)?example\\.com/`.
- The code runs automatically when a matching page finishes loading.

## Notes
- The extension uses `chrome.storage.sync` so entries can sync across signed-in Chrome browsers.
- Custom JavaScript runs directly in the page context. Use it carefully.
