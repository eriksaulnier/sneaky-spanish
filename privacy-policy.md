# Sneaky Spanish — Privacy Policy

**Last updated:** 2026-03-31

## Data Collection

Sneaky Spanish does **not** collect, transmit, or store any personal data. All processing happens entirely within your browser.

## What the extension accesses

- **Web page content** — The extension reads text on web pages to identify English words that can be replaced with Spanish equivalents. This processing happens locally in your browser. No page content is sent to any server.
- **Extension settings** — Your preferences (CEFR level, highlight mode, excluded sites, enabled state) are stored using `chrome.storage.sync`, which syncs settings across your signed-in browser instances via your browser account. No third-party server is involved.

## What the extension does NOT do

- Does not collect analytics or usage data
- Does not track browsing history
- Does not transmit any data to external servers
- Does not use cookies
- Does not inject advertisements
- Does not access or modify form data, passwords, or authentication tokens

## Dictionary

The Spanish vocabulary dictionary is bundled with the extension and loaded locally. No network requests are made to look up translations.

## Permissions

- **`storage`** — Save your settings (level, exclusions, enabled state)
- **`activeTab`** — Communicate with the active tab to apply/remove translations when settings change
- **`<all_urls>` (host permission)** — Required to run the content script that replaces words on any webpage you visit

## Contact

For questions about this privacy policy, open an issue on the project's GitHub repository.
