export {};
  import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface WoolworthsListItem {
  DisplayName: string,
  Stockcode: number;
  QuantityInTrolley: number;
  SmallImageFile: string;
}


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


async function addToCart(stockCode: number, quantity?: number) {
  await runAction('addToCart', { stockCode, quantity });
  await chrome.tabs.reload();
}


async function searchForItem(search: string) {
  await chrome.tabs.update(undefined as unknown as number, { url: `https://www.woolworths.com.au/shop/search/products?searchTerm=${search}` });
}


function App() {

  const [matchingItems, setMatchingItems] = useState<{ search: string; item: WoolworthsListItem }[] | undefined>(undefined);
  const [hasError, setHasError] = useState(false);


  const fetchMatching = useCallback(() => {
    runAction<{ search: string; item: WoolworthsListItem; inCart: boolean }[]>('getMatchingItems')
    .then((res) => {
      setMatchingItems(res);
    })
    .catch(e => {
      setHasError(true);
    });
  }, []);

  useEffect(() => {
    fetchMatching();
  }, []);

  return <>
    {matchingItems === undefined ? <div>Loading...</div> : <>
      {hasError ? <div>Error loading.</div> : <>
        <div className="itemlist">
          {matchingItems.map(item => {
            return <div className="item">
              <div className="searchText">{item.search}</div>
              {item.item.QuantityInTrolley > 0 ? <div className="image incart">
                <img src={item.item.SmallImageFile} alt="" />
                <div className="status">Y</div>
              </div> : <div className="image canadd" onClick={async () => {
                await addToCart(item.item.Stockcode, item.item.QuantityInTrolley || 1);
                fetchMatching();
              }}>
                <img src={item.item.SmallImageFile} alt="" />
                <div className="status" title={item.item.DisplayName}>+</div>
              </div>}
              <div className="searchAction">
                <button className="searchButton" onClick={() => searchForItem(item.search)}>Search</button>
              </div>
            </div>
          })}
        </div>
      </>}
    </>}
  </>;
}



const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);