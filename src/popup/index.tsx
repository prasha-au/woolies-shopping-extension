import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface WoolworthsListItem {
  DisplayName: string,
  Stockcode: number;
  QuantityInTrolley: number;
  ImageFile: string;
}


interface KeepListItem {
  searchTerm: any;
  originalTerm: string;
}



type ListItem = {
  search: string;
  item: null;
  inCart: boolean;
} | {
  search: string;
  item: WoolworthsListItem;
  inCart: boolean;
};

async function runAction<T>(action: string, parameters?: Record<string, unknown>): Promise<T> {
  const result = await Promise.race([
    chrome.runtime.sendMessage<{ action: string; parameters?: Record<string, unknown> }, { success: true, result: T } | { success: false; error: string }>({ action, parameters }),
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


async function addToCart(stockCode: number, quantity?: number) {
  await runAction('addToCart', { stockCode, quantity });
  await chrome.tabs.reload(await getWooliesTabId());
}


async function searchForItem(search: string) {
  await chrome.tabs.update(await getWooliesTabId(), { url: `https://www.woolworths.com.au/shop/search/products?searchTerm=${search}` });
}



async function withCachedItem<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cacheKey = `uicache_${key}`;
  const cachedResult = await chrome.storage.local.get(cacheKey);
  if (!cachedResult[cacheKey]) {
    const data = await fn();
    chrome.storage.local.set({ [cacheKey]: data });
    return data;
  } else {
    void fn().then(data => {
      chrome.storage.local.set({ [cacheKey]: data });
    });
    return cachedResult[cacheKey];
  }
}



async function getSavedList(): Promise<WoolworthsListItem[]> {
  const items = await withCachedItem('woolieslist', () => runAction<WoolworthsListItem[]>('getWooliesList'));
  return items.map(v => ({ ...v, QuantityInTrolley: 0 }));
}


async function getKeepList(): Promise<KeepListItem[]> {
  return await runAction<KeepListItem[]>('getKeepList');
}


async function getCartList(): Promise<WoolworthsListItem[]> {
  return await runAction<WoolworthsListItem[]>('getCartList');
}



function generateList(keepList: KeepListItem[], searchIndex?: Fuse<WoolworthsListItem>, cartSearchIndex?: Fuse<WoolworthsListItem>): ListItem[] {
  return keepList.map(listItem => {
    const result = searchIndex ? searchIndex.search(listItem.searchTerm) : [];
    if (!result.length) {
      return { search: listItem.originalTerm, item: null, inCart: false };
    }
    const item = result[0].item;
    return { search: listItem.originalTerm, item, inCart: item.QuantityInTrolley > 0 };
  });
}


function App() {

  const [keepList, setKeepList] = useState<KeepListItem[] | undefined>(undefined);
  const [savedList, setSavedList] = useState<WoolworthsListItem[] | undefined>(undefined);
  const [cartList, setCartList] = useState<WoolworthsListItem[] | undefined>(undefined);

  const [hasError, setHasError] = useState(false);

  async function refreshLists() {
    await Promise.all([
      (async () => setKeepList(await getKeepList()))(),
      (async () => setSavedList(await getSavedList()))(),
      (async () => setCartList(await getCartList()))(),
    ]).catch(() => setHasError(true));
  }


  const searchIndex = useMemo(() => {
    return new Fuse([...(cartList ?? []), ...(savedList ?? [])], {
      keys: ['DisplayName'] as (keyof WoolworthsListItem)[],
      ignoreLocation: true,
      shouldSort: true,
      includeScore: true,
    });
  }, [cartList, savedList]);


  const matchingItems = useMemo(() => {
    if (searchIndex && keepList) {
      return generateList(keepList, searchIndex);
    }
  }, [keepList, searchIndex]);


  useEffect(() => {
    refreshLists();
    const refresher = setInterval(async () => {
      setCartList(await getCartList());
    }, 5000);
    return () => clearInterval(refresher);
  }, []);


  return <>
    {matchingItems === undefined ? <>
      {hasError ? <div>Error loading.</div> : <div>Loading...</div>}
    </> : <>
      <div className="itemlist">
        {matchingItems.length === 0 ? <div className="item">No items found.</div> : null}
        {matchingItems?.map(item => {
          return <div className="item">
            <div className="searchText" onClick={() => searchForItem(item.search)}>{item.search}</div>
            {item.item && <>
              <div className={`image ${item.item.QuantityInTrolley > 0 ? 'incart' : 'canadd'}`}>
                <img src={item.item.ImageFile} alt="" />
                <div className="status" title={item.item.DisplayName}  onClick={async () => {
                  if (item.item.QuantityInTrolley < 1) {
                    await addToCart(item.item.Stockcode, item.item.QuantityInTrolley || 1);
                    setCartList(await getCartList());
                  }
                }}>
                  {item.item.QuantityInTrolley > 0 ? <>&#10003;</> : '+'}
                </div>
              </div>
            </>}
          </div>
        })}
      </div>
    </>}
  </>;
}


const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
