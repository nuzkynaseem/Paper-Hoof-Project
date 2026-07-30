// Secondary Color Palettes for Tag Pills
// Text color & Border color match secondary palette color, with 50% opacity background & blur
const TAG_COLOR_MAP = {
  BRANDING: {
    border: '#FD6D1E',
    color: '#D94B00',
    bg: 'rgba(253, 109, 30, 0.50)',
  },
  IDENTITY: {
    border: '#3FA971',
    color: '#0F4D2A',
    bg: 'rgba(151, 217, 175, 0.50)',
  },
  'UI/UX': {
    border: '#183165',
    color: '#183165',
    bg: 'rgba(24, 49, 101, 0.50)',
  },
  'DIGITAL PRESENCE': {
    border: '#183165',
    color: '#183165',
    bg: 'rgba(24, 49, 101, 0.50)',
  },
  SYSTEM: {
    border: '#E85BD3',
    color: '#801370',
    bg: 'rgba(253, 181, 237, 0.50)',
  },
  STRATEGY: {
    border: '#E5AF00',
    color: '#6E5200',
    bg: 'rgba(255, 210, 33, 0.50)',
  },
};

const FALLBACK_PALETTES = [
  { border: '#FD6D1E', color: '#D94B00', bg: 'rgba(253, 109, 30, 0.50)' },
  { border: '#3FA971', color: '#0F4D2A', bg: 'rgba(151, 217, 175, 0.50)' },
  { border: '#183165', color: '#183165', bg: 'rgba(24, 49, 101, 0.50)' },
  { border: '#E85BD3', color: '#801370', bg: 'rgba(253, 181, 237, 0.50)' },
  { border: '#E5AF00', color: '#6E5200', bg: 'rgba(255, 210, 33, 0.50)' },
  { border: '#92A71D', color: '#445203', bg: 'rgba(146, 167, 29, 0.50)' },
];

export const getTagStyle = (tag) => {
  if (!tag) return {};
  const normalized = String(tag).toUpperCase().trim();

  let palette = TAG_COLOR_MAP[normalized];

  if (!palette) {
    if (normalized.includes('BRAND')) palette = TAG_COLOR_MAP['BRANDING'];
    else if (normalized.includes('IDENT')) palette = TAG_COLOR_MAP['IDENTITY'];
    else if (normalized.includes('DIGITAL') || normalized.includes('UI') || normalized.includes('UX')) palette = TAG_COLOR_MAP['DIGITAL PRESENCE'];
    else if (normalized.includes('SYS')) palette = TAG_COLOR_MAP['SYSTEM'];
    else {
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
      }
      palette = FALLBACK_PALETTES[Math.abs(hash) % FALLBACK_PALETTES.length];
    }
  }

  return {
    color: palette.color,
    borderColor: palette.border,
    backgroundColor: palette.bg,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
};
