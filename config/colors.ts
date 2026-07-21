// Fallback color name → hex map, used only when a product's Color option
// value has no native Shopify swatch set (see resolveColorHex in
// ProductDetail.tsx). New products should set a real swatch in Shopify
// Admin instead of relying on this map. See docs/decisions/002.
export const colorHexMap: Record<string, string> = {
  Black: '#0a0a0a',
  White: '#f5f3f0',
  Ivory: '#f5f0e8',
  Cream: '#f0ead6',
  Beige: '#d4c5b0',
  Camel: '#c19a6b',
  Taupe: '#a89880',
  Grey: '#9e9e9e',
  Gray: '#9e9e9e',
  Navy: '#1f2a44',
  Brown: '#6b4c3b',
  Ecru: '#ede8d8',
  Red: '#b3261e',
};
