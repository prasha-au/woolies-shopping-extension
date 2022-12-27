

export interface WoolworthsListItem {
  name: string;
  stockcode: string;
}

// {
//   stockcode: 829630,
//   quantity: 1,
// }

// This does not appear to be necessary
async function makeCallInWoolworthsTab<T>(func: () => Promise<T>) {
  const [tab] = await chrome.tabs.query({ url: 'https://www.woolworths.com.au/*' })

  if (!tab.id) {
    throw new Error('Cannot find tab');
  }

  const [execution] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func
  });
  return execution.result;
}

export async function getListItems() {
  const { woolworthsListId: listId } = await chrome.storage.sync.get('woolworthsListId');

  const res = await fetch(`https://www.woolworths.com.au/apis/ui/mylists/${listId}/products?` + new URLSearchParams({
    PageNumber: '1',
    SortType: 'Aisle',
    SortType2: '',
    isSpecial: 'false',
    PageSize: '200',
    UseV2Tags: 'true',
  }));

  const listContent = await res.json();
  return listContent.Items.map((v: { DisplayName: string, Stockcode: string }) => ({
    name: v.DisplayName,
    stockcode: v.Stockcode,
  }));
}


export async function addToCart(items: { stockcode: number, quantity: number }[]) {
  const res = await fetch('https://www.woolworths.com.au/api/v3/ui/trolley/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items })
  });
  return await res.json();
}

