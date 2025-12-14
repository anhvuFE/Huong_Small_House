import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';

interface ProductImageFallbackProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProductImageFallback: React.FC<ProductImageFallbackProps> = ({
  name,
  className = '',
  size = 'md'
}) => {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [name]);

  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
  ];

  const colorIndex = name.length % colors.length;
  const gradientColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div
      className={cn(
        `flex items-center justify-center bg-gradient-to-br ${gradientColor} text-white`,
        className
      )}
    >
      <span className={cn('font-bold', sizeClasses[size])}>{initials}</span>
    </div>
  );
};