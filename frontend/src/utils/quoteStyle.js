// Presentation defaults for a case study quote block.
//
// Shared by the editor, its live preview and the public case study so an unset
// colour looks identical in all three — the admin preview used to hard-code its own
// green and mint, which meant it never showed the colours actually chosen.

export const QUOTE_DEFAULTS = {
  bgColor: "#123524", // Phthalo Green
  textColor: "#FFFFFF", // White
  authorColor: "#97D9AF", // Mint Sprig
};

// The site typeface. Every --font-* token in styles/globals.css resolves to
// Svatopluk, so there is nothing to branch on: the old `quoteFont` toggle chose
// between --font-primary and --font-heading, which are the same family.
export const QUOTE_FONT = "var(--font-heading)";

/** Resolves a quote component's colours, falling back per field. */
export const quoteColors = (comp = {}) => ({
  bg: comp.bgColor || QUOTE_DEFAULTS.bgColor,
  text: comp.textColor || QUOTE_DEFAULTS.textColor,
  // Author falls back to the quote colour before the mint default, so setting only
  // a text colour keeps the attribution legible against the same background.
  author: comp.authorColor || comp.textColor || QUOTE_DEFAULTS.authorColor,
});
