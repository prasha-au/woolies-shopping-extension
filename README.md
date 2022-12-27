# Woolworths Shopping Extension

## Purpose
Google Assistant is capable of adding items to a Keep list (or shoppinglist.google.com). This is a Chrome Extension to pull from that list into the cart on the Woolworths website.


## Architecture Decisions
- **Why Google Keep?** We use Keep extensively for lists. shoppinglist.google.com also does not have an API.
- **Why use a service account?** The [Google Keep API](https://developers.google.com/keep/api/reference/rest) is limited to GSuite service accounts only. Fortunately this works for me.
- **Why a Chrome extension vs a service?** Woolworths have lots of anti-bot protection scripts so plain API calls won't work. Background syncs are not necessary vs the overheads of Puppeteer.
- **Why not use a Google client rather than the API directly?** The Google NodeJS client is not browser compatible.
