import React from 'react';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

interface ProductImageFallbackProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProductImageFallback: React.FC<ProductImageFallbackProps> = ({
  name,
  className = ''
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-full h-full bg-gray-100',
        className
      )}
    >
      <img
        src={logo}
        alt={name}
        className="w-full h-full object-contain p-4"
      />
    </div>
  );
};