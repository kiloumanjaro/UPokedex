import type { Variants } from 'framer-motion';

// Timing constants
export const BOOK_OPEN_DURATION = 0.8;
export const BOOK_CLOSE_DURATION = 1.8;
export const PAGE_FLIP_DURATION = 0.6;

// Easing presets
export const easeOutCubic = [0.33, 1, 0.68, 1] as const;
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const;
export const easeInCubic = [0.4, 0, 1, 1] as const; // Accelerates at the end

// Book container - no animations, just holds perspective
export const bookContainerVariants: Variants = {
  closed: {},
  opening: {},
  open: {},
  closing: {},
};

// Left cover (hinged on RIGHT edge, swings open to the LEFT)
// Starts flat (0deg), opens by rotating -180deg around right edge
export const coverLeftVariants: Variants = {
  closed: {
    rotateY: 0,
    zIndex: 30,
  },
  opening: {
    rotateY: -180,
    zIndex: 10,
    transition: {
      duration: BOOK_OPEN_DURATION,
      ease: easeInOutCubic,
    },
  },
  open: {
    rotateY: -180,
    zIndex: 10,
  },
  closing: {
    rotateY: 0,
    zIndex: 30,
    transition: {
      duration: BOOK_CLOSE_DURATION,
      ease: easeInOutCubic,
    },
  },
};

// Right cover (hinged on LEFT edge, swings open to the RIGHT)
// Starts flat (0deg), opens by rotating +180deg around left edge
export const coverRightVariants: Variants = {
  closed: {
    rotateY: 0,
    zIndex: 30,
  },
  opening: {
    rotateY: 180,
    zIndex: 10,
    transition: {
      duration: BOOK_OPEN_DURATION,
      ease: easeInOutCubic,
    },
  },
  open: {
    rotateY: 180,
    zIndex: 10,
  },
  closing: {
    rotateY: 0,
    zIndex: 30,
    transition: {
      duration: BOOK_CLOSE_DURATION,
      ease: easeInOutCubic,
    },
  },
};

// Pages container - always visible, no animation
export const pagesVariants: Variants = {
  closed: {},
  opening: {},
  open: {},
  closing: {},
};

// RIGHT PAGE FLIP - hinged on LEFT edge, turns like a real book page
// When going NEXT: right page rotates from 0deg to -180deg (turns over to the left)
export const rightPageFlipVariants: Variants = {
  // Normal state - page is flat, showing front
  flat: {
    rotateY: 0,
    transition: {
      duration: PAGE_FLIP_DURATION,
      ease: easeInCubic,
    },
  },
  // Flipped state - page has turned over to the left
  flipped: {
    rotateY: -180,
    transition: {
      duration: PAGE_FLIP_DURATION,
      ease: easeInCubic,
    },
  },
  // Hidden - used to instantly hide the flipping page after animation
  hidden: {
    rotateY: -180,
    opacity: 0,
    transition: {
      duration: 0,
    },
  },
};

// LEFT PAGE FLIP - hinged on RIGHT edge, turns like a real book page
// When going PREV: left page rotates from 0deg to 180deg (turns over to the right)
export const leftPageFlipVariants: Variants = {
  // Normal state - page is flat, showing front
  flat: {
    rotateY: 0,
    transition: {
      duration: PAGE_FLIP_DURATION,
      ease: easeInCubic,
    },
  },
  // Flipped state - page has turned over to the right
  flipped: {
    rotateY: 180,
    transition: {
      duration: PAGE_FLIP_DURATION,
      ease: easeInCubic,
    },
  },
  // Hidden - used to instantly hide the flipping page after animation
  hidden: {
    rotateY: 180,
    opacity: 0,
    transition: {
      duration: 0,
    },
  },
};

// Chevron button variants
export const chevronVariants: Variants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.1,
  },
  tap: {
    scale: 0.95,
  },
  disabled: {
    scale: 1,
  },
};

// Overlay variants - keep simple fade for background
export const overlayVariants: Variants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};
