
export interface WoolworthsListItem {
  DisplayName: string,
  Stockcode: number;
  QuantityInTrolley: number;
}

export async function getListItems(): Promise<WoolworthsListItem[]> {
  const { woolworthsListId: listId } = await chrome.storage.sync.get('woolworthsListId');

  const res = await fetch(`https://www.woolworths.com.au/apis/ui/mylists/${listId}/products?` + new URLSearchParams({
    PageNumber: '1',
    SortType: 'Aisle',
    SortType2: '',
    isSpecial: 'false',
    PageSize: '200',
    UseV2Tags: 'true',
  }));

  const listContent = await res.json() as { Items: WoolworthsListItem[] };
  return listContent.Items;
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

