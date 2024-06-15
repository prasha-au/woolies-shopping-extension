
export interface WoolworthsItem {
  displayName: string,
  stockCode: number;
  quantityInTrolley: number;
  imageFile: string;
  price: number;
  wasPrice: number;
}


export interface KeepListItem {
  searchTerm: string;
  originalTerm: string;
}


type CreateMessageInterfaces<Route extends String, Parameters extends object, Response extends object> = {
  request: { action: Route; parameters: Parameters }
  response: Response;
};


export interface MessageInterfaces {
  addToCart: CreateMessageInterfaces<'addToCart', { stockCode: number, quantity?: number }, {}>
  getKeepList: CreateMessageInterfaces<'getKeepList', {}, KeepListItem[]>
  getWooliesList: CreateMessageInterfaces<'getWooliesList', {}, WoolworthsItem[]>
  getCartList: CreateMessageInterfaces<'getCartList', {}, WoolworthsItem[]>
  getSpecials: CreateMessageInterfaces<'getSpecials', {}, WoolworthsItem[]>;
}
