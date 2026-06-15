import type { Money, ShopifyImage } from './shopify.types';

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    image: ShopifyImage | null;
    price: Money;
    selectedOptions: Array<{ name: string; value: string }>;
    product: {
      handle: string;
      title: string;
      vendor: string;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    nodes: CartLine[];
  };
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
}
