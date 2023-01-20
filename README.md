# Woolworths Shopping Extension

## Purpose
Google Assistant is capable of adding items to a Keep list (or shoppinglist.google.com). This is a Chrome Extension to pull from that list into the cart on the Woolworths website.

## Workflow

### Prerequisites
- A Google Workspace account/email
- A service client with domain delegation to said account
- A non-Google Workspace account/email
- A Woolworths account


### Setup
- Google Assistant/Home to Google Keep
  1. Create a list on the Workspace account and share it with the non-Workspace account
  2. Setup Google Assistant/Home on the non-Workspace account
  3. Grant domain wide delegation to the service client via Workspace
- Linking up the extension
  1. Download the Service client json and put in the required details for Keep access
  2. Create a list with all the items you usually buy in Woolworths and set the ID
  3. Add any transformations you'd like. Eg. milk to full cream milk


### Using It
1. "Ok Google, add milk to the shopping list"
2. Click the addon icon when on the Woolworths site.
3. You can add an item directly to cart if it's correct or search for it.
4. Click off items on the Keep list as you go through the cart.


## Architecture Decisions
- **Why Google Keep?** We use Keep extensively for lists. shoppinglist.google.com also does not have an API.
- **Why use a service account?** The [Google Keep API](https://developers.google.com/keep/api/reference/rest) is limited to Google Workspace accounts only. Fortunately this works for me.
- **Why a Chrome extension vs a service?** Woolworths have lots of anti-bot protection scripts so plain API calls won't work. Background syncs are not necessary vs the overheads of Puppeteer.
- **Why not use a Google client rather than the API directly?** The Google NodeJS client is not browser compatible.


## Project Structure
- `src/background/` - The background service worker for the extension.
- `src/options/` - The options page for the extension.
- `src/popup/` - The popup that appears when you click the extension.
