// Homepage settings live in a singleton Shopify metaobject (decision 010 §5)
// so a non-technical person can swap the seasonal hero image + label in
// Shopify Admin. Queried by type (first entry) rather than handle, so the
// auto-generated entry handle doesn't matter.
export const GET_HOMEPAGE_SETTINGS_QUERY = /* GraphQL */ `
  query getHomepageSettings {
    metaobjects(type: "homepage_settings", first: 1) {
      nodes {
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
        seasonLabel: field(key: "season_label") {
          value
        }
      }
    }
  }
`;
