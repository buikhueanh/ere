// Color name → hex map for color swatches on the PDP.
// Shopify stores color as a plain string (e.g. "Black", "White").
// This maps those strings to a display hex. Unknown names render no swatch chip.
// See docs/decisions/002 for why this lives here vs a Shopify metafield.
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
};
