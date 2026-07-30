// Secondary Color Palettes for Tag Pills
// High-brightness white overlay (78%) over 50% secondary color tint + backdrop blur
// Ensures secondary color text & border pop with maximum contrast and clarity
const TAG_COLOR_MAP = {
  BRANDING: {
    border: '#FD6D1E',
    color: '#D94B00',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(253, 109, 30, 0.50)',
  },
  IDENTITY: {
    border: '#2BA866',
    color: '#0F6133',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(151, 217, 175, 0.50)',
  },
  'UI/UX': {
    border: '#183165',
    color: '#183165',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(24, 49, 101, 0.50)',
  },
  'DIGITAL PRESENCE': {
    border: '#183165',
    color: '#183165',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(24, 49, 101, 0.50)',
  },
  SYSTEM: {
    border: '#E85BD3',
    color: '#9C1A8B',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(253, 181, 237, 0.50)',
  },
  STRATEGY: {
    border: '#E5AF00',
    color: '#8A6800',
    bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(255, 210, 33, 0.50)',
  },
};

const FALLBACK_PALETTES = [
  { border: '#FD6D1E', color: '#D94B00', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(253, 109, 30, 0.50)' },
  { border: '#2BA866', color: '#0F6133', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(151, 217, 175, 0.50)' },
  { border: '#183165', color: '#183165', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(24, 49, 101, 0.50)' },
  { border: '#E85BD3', color: '#9C1A8B', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(253, 181, 237, 0.50)' },
  { border: '#E5AF00', color: '#8A6800', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(255, 210, 33, 0.50)' },
  { border: '#92A71D', color: '#4F6103', bg: 'linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.78)), rgba(146, 167, 29, 0.50)' },
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
    background: palette.bg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };
};
