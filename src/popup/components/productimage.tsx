import type { WoolworthsItem } from '../../interfaces';

interface ProductImageProps {
  item: WoolworthsItem;
  addToCart: () => void;
}

export const ProductImage = ({ item, addToCart }: ProductImageProps) => {
  return             <div className={`image ${item.quantityInTrolley > 0 ? 'incart' : 'canadd'}`}>
  <img src={item.imageFile} alt="" />
  <div className="status" title={item.displayName} onClick={async () => {
    if (item.quantityInTrolley < 1) {
      await addToCart();
    }
  }}>
    {item.quantityInTrolley > 0 ? <>&#10003;</> : '+'}
  </div>
</div>;
}
