export const GET_COLLECTION_QUERY = `
  query GetCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      image {
        url
        altText
      }
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
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
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
