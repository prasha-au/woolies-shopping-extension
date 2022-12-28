
export interface WoolworthsListItem {
  DisplayName: string,
  Stockcode: number;
  QuantityInTrolley: number;
}

export async function getListItems(): Promise<WoolworthsListItem[]> {
  const { woolworthsListId: listId } = await chrome.storage.sync.get('woolworthsListId');

  const items: WoolworthsListItem[] = [];
  let pageNumber = 1;
  let totalRecordCount = 0;
  do {
    const res = await fetch(`https://www.woolworths.com.au/apis/ui/mylists/${listId}/products?` + new URLSearchParams({
      PageNumber: pageNumber.toString(),
      SortType: 'Aisle',
      SortType2: '',
      isSpecial: 'false',
      PageSize: '50',
      UseV2Tags: 'true',
    }));

    const listContent = await res.json() as { Items: WoolworthsListItem[]; TotalRecordCount: number; };
    items.push(...listContent.Items);
    totalRecordCount = listContent.TotalRecordCount;
    pageNumber++;
  } while (items.length < totalRecordCount)

  return items;
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

