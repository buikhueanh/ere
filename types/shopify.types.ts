export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
  price: Money;
  image: ShopifyImage | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export interface ShopifyProductMetafields {
  fabric: string | null;
  origin: string | null;
  careInstructions: string | null;
  fitNotes: string | null;
  measurements: string | null;
  sizeGuide: ShopifyImage | null;
}

// Lightweight shape for grid/listing cards — shop page, search results, collection pages.
// The full ShopifyProduct (gallery, variants, metafields) is only fetched on the PDP.
export interface ShopifyProductCard {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: {
    nodes: ShopifyImage[];
  };
  priceRange: {
    minVariantPrice: Money;
  };
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: Money;
  };
  images: {
    nodes: ShopifyImage[];
  };
  // Product-level option values, incl. Shopify's native swatch (set per
  // color in Admin) — separate from each variant's selectedOptions, which
  // only carry the plain name/value pair. See docs/decisions/002.
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      swatch: { color: string | null } | null;
    }>;
  }>;
  variants: {
    nodes: ShopifyVariant[];
  };
  collections: {
    nodes: Array<{
      handle: string;
      title: string;
    }>;
  };
  seo: {
    title: string;
    description: string;
  };
  metafields: ShopifyProductMetafields;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  image: ShopifyImage | null;
  products: {
    nodes: ShopifyProductCard[];
  };
}
