import React from 'react';
import { cn } from '../../utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', label, fullscreen = false, className }) => {
  const borderWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;
  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <div
        className={cn(
          'rounded-full border-primary border-t-transparent animate-spin',
          sizeMap[size],
        )}
        style={{ borderWidth }}
        aria-hidden
      />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm', className)}>
        {spinner}
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center py-4', className)}>{spinner}</div>;
};
