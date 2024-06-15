import { useEffect, useState } from 'react';
import { addToCart, getSpecials, searchForItem } from '../api';
import type { WoolworthsItem } from '../../interfaces';
import { ProductImage } from './productimage';

export const SpecialsList = () => {

  const [specialsList, setSpecialsList] = useState<WoolworthsItem[] | undefined>(undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setSpecialsList(await getSpecials());
        setHasError(false);
      } catch (e) {
        setHasError(true);
      }
    })();
  }, []);

  return <div className="specialslist">
    {specialsList === undefined ? <>
      {hasError ? <div>Error loading.</div> : <div>Loading...</div>}
    </> : <>
      <div className="itemlist">
        {specialsList.length === 0 ? <div className="item">No items found.</div> : null}
        {specialsList?.map(item => {
          return <div className="item">
            <div className="productName" onClick={() => searchForItem(item.displayName)}>{item.displayName}</div>
            <div className="price">${item.price.toFixed(2)}</div>
            <ProductImage item={item} addToCart={async () => addToCart(item.stockCode, item.quantityInTrolley || 1)} />
          </div>
        })}
      </div>
    </>}
  </div>
}
