import { PRODUCT_CARD_FRAGMENT } from './product.queries';

// Reuses ProductCard so collection listings get the same fields as the
// main product grid (incl. images(first: 2) for the hover-swap) — the
// original version of this query duplicated a subset of fields and was
// missing `images`, which would have broken ProductCard's hover state.
export const GET_COLLECTION_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
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
          ...ProductCard
        }
      }
    }
  }
`;
