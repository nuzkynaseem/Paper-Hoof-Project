// Mock data for Paper Hoof landing page

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const projects = [
  {
    id: 1,
    name: 'Burger Hot',
    category: 'Food Chain',
    description: 'A bold rebrand for a fast-casual chain — an appetite-forward identity spanning packaging and the ordering experience.',
    tags: ['BRANDING', 'IDENTITY', 'UI/UX'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&h=900&fit=crop'
    ]
  },
  {
    id: 2,
    name: 'Odera',
    category: 'Supermarket',
    description: 'A retail identity system built for clarity across thousands of everyday touchpoints.',
    tags: ['BRANDING', 'IDENTITY'],
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=1000&fit=crop'
  },
  {
    id: 3,
    name: 'Yaloo',
    category: 'Tourism',
    description: 'Destination branding and digital presence for an emerging travel brand.',
    tags: ['BRANDING', 'DIGITAL PRESENCE'],
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&h=1000&fit=crop'
  },
  {
    id: 4,
    name: 'Woodland Publishing',
    category: 'Publishing',
    description: 'An editorial identity and book-design language for an independent publisher.',
    tags: ['BRANDING', 'IDENTITY'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=900&fit=crop'
  },
  {
    id: 5,
    name: 'Burrowed',
    category: 'Magazine',
    description: 'Art direction and digital experience for an independent literary magazine.',
    tags: ['BRANDING', 'IDENTITY', 'DIGITAL PRESENCE'],
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&h=750&fit=crop'
  },
  {
    id: 6,
    name: 'DHCH',
    category: 'Institution',
    description: 'A considered identity system for a cultural institution.',
    tags: ['BRANDING', 'SYSTEM'],
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=750&fit=crop'
  }
];

export const showreelSlides = [
  {
    id: 1,
    title: 'BURROWED',
    subtitle: 'a literary magazine',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=583&fit=crop'
  },
  {
    id: 2,
    title: 'CREATIVE',
    subtitle: 'design excellence',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=583&fit=crop'
  },
  {
    id: 3,
    title: 'PAPER HOOF',
    subtitle: 'editorial design',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&h=583&fit=crop'
  }
];

export const designCategories = [
  'BRANDING',
  'IDENTITY',
  'FOOD CHAIN',
  'INSTITUTION',
  'SYSTEM',
  'SPORTS',
  'SOCIAL MEDIA',
  'VEHICLE',
  'CINEMA',
  'AUTOMOTIVE',
  'DIGITAL PRESENCE',
  'UI/UX'
];

export const navigationLinks = [
  { label: 'Work', path: '/work' },
  { label: 'Brand Review', path: '/brand-review' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact Us', path: '/contact' }
];

export const socialLinks = [
  { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
  { platform: 'TikTok', url: 'https://tiktok.com', icon: 'Music' },
  { platform: 'WhatsApp', url: 'https://whatsapp.com', icon: 'MessageCircle' },
  { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' }
];

export const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM'
];