import type { KeepListItem, MessageInterfaces, WoolworthsItem } from '../interfaces';


async function runAction<R extends keyof MessageInterfaces>(action: R, parameters: MessageInterfaces[R]['request']['parameters']): Promise<MessageInterfaces[R]['response']> {
  const result = await Promise.race([
    chrome.runtime.sendMessage({ action, parameters }),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
  ]);
  if (result?.success) {
    return result.result;
  } else {
    throw new Error(result?.error ?? 'Unknown error.');
  }
}


async function getWooliesTabId(): Promise<number> {
  const tab = await chrome.tabs.query({ active: true });
  return tab[0].id ?? 0;
}


export async function addToCart(stockCode: number, quantity?: number) {
  await runAction('addToCart', { stockCode, quantity });
  await chrome.tabs.reload(await getWooliesTabId());
}


export async function searchForItem(search: string) {
  await chrome.tabs.update(await getWooliesTabId(), { url: `https://www.woolworths.com.au/shop/search/products?searchTerm=${search}` });
}


export async function getSavedList(): Promise<WoolworthsItem[]> {
  return runAction('getWooliesList', {});
}


export async function getKeepList(): Promise<KeepListItem[]> {
  return await runAction('getKeepList', {});
}


export async function getCartList(): Promise<WoolworthsItem[]> {
  return await runAction('getCartList', {});
}

export async function getSpecials(): Promise<WoolworthsItem[]> {
  return await runAction('getSpecials', {});
}
