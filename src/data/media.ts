export interface PortfolioImage {
  base: string;
  width: number;
  height: number;
  variants: number[];
  alt: string;
  caption?: string;
  kind?: 'photo' | 'screenshot';
  framing?: { ratio: string; position: string };
}

export const portraits = {
  profile: {
    base: 'yogesh-portrait', width: 730, height: 953, variants: [360, 730],
    alt: 'Black-and-white portrait of Yogesh Berwal, smiling and wearing glasses.',
    framing: { ratio: '4 / 5', position: '50% 35%' },
  },
  about: {
    base: 'yogesh-candid', width: 3024, height: 4032, variants: [480, 960],
    alt: 'Yogesh smiling outdoors in the evening.',
    framing: { ratio: '4 / 5', position: '50% 55%' },
  },
  education: {
    base: 'iit-mandi', width: 2317, height: 3670, variants: [480, 960],
    alt: 'Yogesh at IIT Mandi, wearing an academic stole and holding a folder.',
    caption: 'IIT Mandi · M.Tech, Computer Science & Engineering',
    // Keep the full-length subject and institute sign; trim only excess sky.
    framing: { ratio: '2 / 3', position: '50% 100%' },
  },
} satisfies Record<string, PortfolioImage>;

export const hockeyPhotos: PortfolioImage[] = [
  {
    base: 'hockey-medals', width: 4480, height: 3287, variants: [640, 1280],
    alt: 'The IIT Mandi hockey team with trophies and medals at IIT Ropar.',
    caption: 'The medals, the trophies, and the team. Aarohan, IIT Ropar · 2026.',
    framing: { ratio: '4 / 3', position: '50% 50%' },
  },
  {
    base: 'hockey-final', width: 2788, height: 4026, variants: [640, 1280],
    alt: 'The IIT Mandi hockey team together on the field after winning the final at IIT Ropar.',
    caption: 'Just after the final whistle. A gold-medal finish at IIT Ropar.',
    // The team sits in the lower half of this portrait-oriented original.
    framing: { ratio: '4 / 3', position: '50% 66%' },
  },
];

export const outdoorPhotos: PortfolioImage[] = [
  {
    base: 'trekking', width: 3024, height: 4032, variants: [640, 1280],
    alt: 'Yogesh taking a break on a trek, looking out across green hills.',
    caption: 'A pause on the trail. A different pace from the working week.',
    framing: { ratio: '3 / 4', position: '50% 50%' },
  },
  {
    base: 'travel-window', width: 1670, height: 2969, variants: [480, 960],
    alt: 'Yogesh looking through a window toward a mountain landscape.',
    caption: 'Somewhere new, with a view worth stopping for.',
    framing: { ratio: '3 / 4', position: '50% 45%' },
  },
];

export const projectImages: Record<string, PortfolioImage[]> = {
  flowboard: [
    {
      base: 'flowboard-habits', width: 3825, height: 1853, variants: [640, 1200, 1800],
      alt: 'FlowBoard habits screen showing a colorful radial tracker for October 2026.',
      caption: 'The radial habit tracker—part of the app I use every day.',
      kind: 'screenshot',
    },
    {
      base: 'flowboard-planner', width: 3832, height: 1860, variants: [640, 1200, 1800],
      alt: 'The full FlowBoard planner showing task columns, task details, and the completed section.',
      caption: 'The full planner workspace, exactly as supplied—no columns cropped out.',
      kind: 'screenshot',
    },
  ],
  'vehicle-parking': [
    {
      base: 'vehicle-parking', width: 3801, height: 1848, variants: [640, 1200, 1800],
      alt: 'Vehicle Parking App administrator overview with parking-lot capacity and availability.',
      caption: 'The administrator overview. All visible figures are fictional demo data, not customer-usage metrics.',
      kind: 'screenshot',
    },
  ],
  'sanskrit-pitch': [
    {
      base: 'pitch-presentation', width: 3853, height: 2737, variants: [640, 1200, 1800],
      alt: 'Yogesh presenting Vedic Sanskrit pitch-accent restoration research beside a slide explaining the background and objective.',
      caption: 'Presenting the Vedic Sanskrit pitch-accent restoration research.',
      kind: 'photo',
    },
  ],
};
