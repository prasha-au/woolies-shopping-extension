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

  const remappedKeepList = keepList.map(item => {
    return item.replace(/^test\s/gi, '');
  })
  console.log(remappedKeepList);



  const searchIndex = await getSearchIndex();
  console.log('generated search index');

  const itemsToAdd = [];
  for (const search of remappedKeepList) {
    console.log(`finding and adding ${search}...`);
    const result = searchIndex.search(search);

    if (!result.length) {
      console.log(`Unable to find an item for ${search}`);
    }

    console.log(result, result[0]?.item.DisplayName, result[0]?.score)

    const item = result[0].item;
    itemsToAdd.push({ stockcode: item.Stockcode, quantity: item.QuantityInTrolley || 1 });
  }

  await addToCart(itemsToAdd);
}


chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    switch (request.action) {
      case 'importFromKeep': {
        await populateCart();
        sendResponse({ success: true });
      }
      default:
        sendResponse({ success: false });
        break;
    }

  }
)


// @ts-ignore
global['getKeepList'] = getKeepList;
// @ts-ignore
global['woolies'] = {
  addToCart,
  getListItems,
  getSearchIndex,
};

// @ts-ignore
global['ext'] = {
  populateCart
}
