import { getKeepList } from './keep';
import Fuse from 'fuse.js';
import { WoolworthsListItem, addToCart, getListItems } from './woolworths';

console.log('Shopping list background script started');




let searchIndex: Fuse<WoolworthsListItem>;



async function getSearchIndex(search: string) {
  if (!searchIndex) {
    searchIndex = new Fuse(await getListItems(), {
      keys: ['name']
    });
  }
  return searchIndex;
}


// @ts-ignore
global['getKeepList'] = getKeepList;
// @ts-ignore
global['woolies'] = {
  addToCart,
  getListItems,
  getSearchIndex,
};


// DisplayName
// Stockcode

