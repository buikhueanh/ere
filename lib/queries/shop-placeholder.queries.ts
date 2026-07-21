// shop_placeholder metaobjects (decision 011 §4). The Storefront API's
// `metaobjects` connection has no server-side field filter — we fetch all
// entries and filter/scope by the `page` field client-side in
// lib/shopify/shop.ts.
export const GET_SHOP_PLACEHOLDERS_QUERY = `
  query GetShopPlaceholders($first: Int!) {
    metaobjects(type: "shop_placeholder", first: $first) {
      nodes {
        id
        image: field(key: "image") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
        position: field(key: "position") {
          value
        }
        page: field(key: "page") {
          value
        }
      }
    }
  }
`;
