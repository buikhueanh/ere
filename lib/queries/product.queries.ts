// Card fields — shop grid, search results, collection listings.
export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      url
      altText
    }
    images(first: 2) {
      nodes {
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

// Metafield identifiers must match the definitions in Shopify Admin
// (Settings → Custom data → Products). See docs/decisions/006.
const PRODUCT_METAFIELD_IDENTIFIERS = `[
  { namespace: "custom", key: "fabric" },
  { namespace: "custom", key: "origin" },
  { namespace: "custom", key: "care_instructions" },
  { namespace: "custom", key: "fit_notes" },
  { namespace: "custom", key: "measurements" },
  { namespace: "custom", key: "size_guide" }
]`;

export const GET_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      vendor
      productType
      tags
      availableForSale
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 20) {
        nodes {
          url
          altText
        }
      }
      options {
        name
        optionValues {
          name
          swatch {
            color
          }
        }
      }
      variants(first: 100) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
          selectedOptions {
            name
            value
          }
        }
      }
      collections(first: 5) {
        nodes {
          handle
          title
        }
      }
      seo {
        title
        description
      }
      metafields(identifiers: ${PRODUCT_METAFIELD_IDENTIFIERS}) {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
`;
