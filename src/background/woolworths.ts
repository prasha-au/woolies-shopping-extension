import type { WoolworthsItem } from '../interfaces';

interface WoolworthsRawItem {
  Barcode: string;
  Brand: string;
  DisplayName: string;
  ImageFile?: string;
  InstorePrice?: number;
  Price?: number;
  QuantityInTrolley: number;
  SmallImageFile?: string;
  Stockcode: number;
  UrlFriendlyName: string;
  WasPrice: number;
}


function pickValues(v: WoolworthsRawItem): WoolworthsItem {
  return {
    displayName: v.DisplayName,
    stockCode: v.Stockcode,
    quantityInTrolley: v.QuantityInTrolley,
    imageFile: v.ImageFile ?? v.SmallImageFile ?? '',
    price: v.Price ?? v.InstorePrice ?? 0,
    wasPrice: v.WasPrice,
  };
}


async function getAllListItems(listId: string, options: { isSpecial: boolean }): Promise<WoolworthsItem[]> {
  const items: WoolworthsItem[] = [];
  let pageNumber = 1;
  let totalRecordCount = 0;
  do {
    const res = await fetch(`https://www.woolworths.com.au/apis/ui/mylists/${listId}/products?` + new URLSearchParams({
      PageNumber: pageNumber.toString(),
      SortType: 'Aisle',
      SortType2: '',
      isSpecial: options.isSpecial ? 'true' : 'false',
      PageSize: '50',
      UseV2Tags: 'true',
    }));

    const listContent = await res.json() as { Items: WoolworthsRawItem[]; TotalRecordCount: number; };
    items.push(...listContent.Items.map(v => pickValues(v)));
    totalRecordCount = listContent.TotalRecordCount;
    pageNumber++;
  } while (items.length < totalRecordCount)
  return items;
}

export async function getSpecials() {
  const { woolworthsListId } = await chrome.storage.sync.get('woolworthsListId');
  return await getAllListItems(woolworthsListId, { isSpecial: true });
}

export async function getListItems(): Promise<WoolworthsItem[]> {
  const { woolworthsListId } = await chrome.storage.sync.get('woolworthsListId');
  return await getAllListItems(woolworthsListId, { isSpecial: false });
}


export async function addToCart(items: { stockcode: number, quantity: number }[]): Promise<void> {
  const res = await fetch('https://www.woolworths.com.au/api/v3/ui/trolley/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items })
  });
  await res.json();
}


export async function getCartList(): Promise<WoolworthsItem[]> {
  const res = await fetch('https://www.woolworths.com.au/apis/ui/Checkout');
  const data = await res.json();
  return data.Model.Order.Products.map(pickValues);
}
