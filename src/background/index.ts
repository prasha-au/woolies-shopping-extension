import { getKeepList } from './keep';
import Fuse from 'fuse.js';
import { WoolworthsListItem, addToCart, getListItems } from './woolworths';

console.log('Shopping list background script started');

async function getSearchIndex() {
  return new Fuse(await getListItems(), {
    keys: ['DisplayName'] as (keyof WoolworthsListItem)[],
    ignoreLocation: true,
    shouldSort: true,
    includeScore: true,
  });
}


async function populateCart() {
  const keepList = await getKeepList();

  const searchIndex = await getSearchIndex();

  const itemsToAdd = [];
  for (const search of keepList) {
    const result = searchIndex.search(search);

    if (!result.length) {
      console.log(`Unable to find an item for ${search}`);
    }

    const item = result[0].item;
    itemsToAdd.push({ stockcode: item.Stockcode, quantity: item.QuantityInTrolley || 1 });
  }

  await addToCart(itemsToAdd);
}

async function messageHandler(request: { action: string; }) {
  switch (request.action) {
    case 'importFromKeep': {
      await populateCart();
      return null;
    }
    default:
      throw Error('Invalid action.');
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    messageHandler(request)
    .then((res) => {
      sendResponse({ success: true, result: res })
    })
    .catch(e => {
      sendResponse({ success: false, error: e.message })
    });
    return true;
  }
)
