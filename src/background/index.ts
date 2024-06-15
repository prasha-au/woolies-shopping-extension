import { MessageInterfaces } from '../interfaces';
import { getKeepList } from './keep';
import { addToCart, getCartList, getListItems, getSpecials } from './woolworths';

console.log('Shopping list background script started');


async function messageHandler<A extends keyof MessageInterfaces>(request: MessageInterfaces[A]['request']): Promise<MessageInterfaces[A]['response']> {
  switch (request.action) {
    case 'addToCart': {
      await addToCart([{ stockcode: request.parameters.stockCode, quantity: request.parameters.quantity ?? 1 }]);
      return {};
    }
    case 'getKeepList':
      return await getKeepList() satisfies MessageInterfaces['getKeepList']['response'];
    case 'getWooliesList':
      return await getListItems() satisfies MessageInterfaces['getWooliesList']['response'];
    case 'getCartList':
      return await getCartList() satisfies MessageInterfaces['getCartList']['response'];
    case 'getSpecials':
      return await getSpecials() satisfies MessageInterfaces['getSpecials']['response'];
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
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((e: unknown) => console.error(e));
