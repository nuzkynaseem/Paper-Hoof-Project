// Paper Hoof studio colour tokens, mirroring the custom properties in
// styles/globals.css.
//
// Held as literal hex values on purpose: these get written into project documents
// (a quote block stores its own bgColor), and a stored `var(--phthalo-green)` would
// only resolve inside CSS — it would break the admin colour input, any contrast
// maths, and anything that reads the value back out of the database.
export const BRAND_COLORS = [
  { name: "Phthalo Green", hex: "#123524" },
  { name: "Forest Bramble", hex: "#275C24" },
  { name: "Mint Sprig", hex: "#97D9AF" },
  { name: "Olive Bramble", hex: "#92A71D" },
  { name: "Midnight Harbor", hex: "#183165" },
  { name: "Mane Orange", hex: "#FD6D1E" },
  { name: "Golden Straw", hex: "#FFD221" },
  { name: "Barn Red", hex: "#D92B24" },
  { name: "Bubblegum Bloom", hex: "#FDB5ED" },
  { name: "Sandy Reed", hex: "#D9D5B0" },
  { name: "Antler Cream", hex: "#FFF6E9" },
  { name: "Birch Mist", hex: "#F5F5F5" },
  { name: "Dark Soot", hex: "#222220" },
  { name: "White", hex: "#FFFFFF" },
];

/** True for a full 6-digit hex, the only form <input type="color"> accepts. */
export const isHexColor = (value) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());

/** Nearest brand token name for a hex, or null when it is a custom colour. */
export const brandColorName = (value) => {
  if (!value) return null;
  const hex = value.trim().toLowerCase();
  const match = BRAND_COLORS.find((c) => c.hex.toLowerCase() === hex);
  return match ? match.name : null;
};
