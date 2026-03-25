import { useInView } from 'framer-motion';
import { useRef } from 'react';
import type { RefObject } from 'react';

interface ScrollAnimationOptions {
  once?: boolean;
  amount?: number;
  margin?: string;
}

interface ScrollAnimationReturn {
  ref: RefObject<HTMLDivElement | null>;
  isInView: boolean;
}

/**
 * Custom hook for triggering animations on scroll.
 * Wraps framer-motion's useInView for consistent usage across components.
 */
export function useScrollAnimation(
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn {
  const { once = true, amount = 0.2, margin = '-50px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount, margin: margin as `${number}px` });

  return { ref, isInView };
}

// Reusable animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

// Stagger children helper
export const staggerContainer = (staggerDelay = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});
