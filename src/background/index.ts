import { getKeepList } from './keep';
import { addToCart, getCartList, getListItems } from './woolworths';

console.log('Shopping list background script started');


async function messageHandler(request: { action: string; parameters?: Record<string, unknown>; }) {
  switch (request.action) {
    case 'addToCart': {
      await addToCart([{ stockcode: request.parameters?.stockCode as number, quantity: request.parameters?.quantity as number ?? 1 }]);
      return null;
    }
    case 'getKeepList':
      return await getKeepList();
    case 'getWooliesList':
      return await getListItems();
    case 'getCartList':
      return await getCartList();
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

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((e: unknown) => console.error(e));
