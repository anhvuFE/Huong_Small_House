import React from 'react';
import { cn } from '../../utils/cn';

interface ProductImageFallbackProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProductImageFallback: React.FC<ProductImageFallbackProps> = ({
  name,
  className = '',
  size = 'lg'
}) => {
  const getInitials = (productName: string): string => {
    const words = productName.trim().split(' ').filter(word => word.length > 0);

    if (words.length === 0) return 'SP';

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const initials = getInitials(name);

  const backgroundColors = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-red-400 to-red-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
  ];

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % backgroundColors.length;
  const backgroundColor = backgroundColors[colorIndex];

  return (
    <div
      className={cn(
        'flex items-center justify-center w-full h-full',
        backgroundColor,
        className
      )}
    >
      <span className={cn(
        'font-bold text-white select-none',
        sizeClasses[size]
      )}>
        {initials}
      </span>
    </div>
  );
};