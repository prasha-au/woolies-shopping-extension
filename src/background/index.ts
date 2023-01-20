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


async function getMatchingItems() {
  const keepList = await getKeepList();
  const searchIndex = await getSearchIndex();
  return keepList.map(search => {
    const result = searchIndex.search(search);
    if (!result.length) {
      return { search, item: null, inCart: false };
    }
    const item = result[0].item;
    return { search, item, inCart: item.QuantityInTrolley > 0 };
  });
}

async function populateCart() {
  const matchingItems = await getMatchingItems();
  const itemsToAdd = matchingItems
  .filter(v => !v.inCart && !!v.item)
  .map(v => ({ stockcode: v.item!.Stockcode, quantity: 1 }));
  if (itemsToAdd.length > 0) {
    await addToCart(itemsToAdd);
  }
}

async function messageHandler(request: { action: string; parameters?: Record<string, unknown>; }) {
  switch (request.action) {
    case 'importFromKeep': {
      await populateCart();
      return null;
    }
    case 'addToCart': {
      await addToCart([{ stockcode: request.parameters?.stockCode as number, quantity: request.parameters?.quantity as number ?? 1 }]);
      return null;
    }
    case 'getMatchingItems': {
      return await getMatchingItems();
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
