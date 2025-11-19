import type { FC } from 'react';

interface SocialBadgeProps {
  label: string;
  background: string;
  color: string;
  borderColor?: string;
}

export const SocialBadge: FC<SocialBadgeProps> = ({ label, background, color, borderColor }) => (
  <span
    aria-hidden="true"
    className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold border"
    style={{
      backgroundColor: background,
      color,
      borderColor: borderColor ?? background,
    }}
  >
    {label}
  </span>
);
