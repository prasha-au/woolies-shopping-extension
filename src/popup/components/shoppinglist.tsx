import Fuse from 'fuse.js';
import { useEffect, useMemo } from 'react';
import type { KeepListItem, WoolworthsItem } from '../../interfaces';
import { addToCart, getCartList, getKeepList, getSavedList, searchForItem } from '../api';
import { ProductImage } from './productimage';
import { withCachedValue } from '../hooks';


type ListItem = {
  search: string;
  item: null;
  inCart: boolean;
} | {
  search: string;
  item: WoolworthsItem;
  inCart: boolean;
};

function generateList(keepList: KeepListItem[], searchIndex: Fuse<WoolworthsItem>): ListItem[] {
  return keepList.map(listItem => {
    const result = searchIndex.search(listItem.searchTerm);
    if (!result.length) {
      return { search: listItem.originalTerm, item: null, inCart: false };
    }
    const item = result[0].item;
    return { search: listItem.originalTerm, item, inCart: item.quantityInTrolley > 0 };
  });
}


export const ShoppingList = () => {
  const [savedList, savedListError] = withCachedValue('wooliesItems', getSavedList);
  const [keepList, keepListError, refreshKeepList] = withCachedValue('keepList', getKeepList);
  const [cartList, cartListError, refreshCartItems] = withCachedValue('cartItems', getCartList);

  const fetchError = cartListError ?? keepListError ?? savedListError;

  const searchIndex = useMemo(() => {
    if (!cartList || !savedList) {
      return undefined;
    }
    return new Fuse([...savedList, ...cartList], {
      keys: ['displayName'] satisfies (keyof WoolworthsItem)[],
      ignoreLocation: true,
      shouldSort: true,
      includeScore: true,
    });
  }, [savedList, cartList]);


  const matchingItems = useMemo(() => {
    if (searchIndex && keepList) {
      return generateList(keepList, searchIndex);
    }
  }, [keepList, searchIndex]);

  useEffect(() => {
    const refresher = setInterval(async () => {
      refreshKeepList();
      refreshCartItems();
    }, 5000);
    return () => clearInterval(refresher);
  }, []);


  return matchingItems === undefined ? <>
    {fetchError ? <div>Error loading.</div> : <div>Loading...</div>}
  </> : <>
    <div className="itemlist">
      {matchingItems.length === 0 ? <div className="item">No items found.</div> : null}
      {matchingItems?.map(item => {
        return <div className="item">
          <div className="searchText" onClick={() => searchForItem(item.search)}>{item.search}</div>
          {item.item && <>
            <ProductImage item={item.item} addToCart={async () => {
              addToCart(item.item.stockCode, item.item.quantityInTrolley || 1);
              refreshCartItems();
            }} />
          </>}
        </div>
      })}
    </div>
  </>;
}
