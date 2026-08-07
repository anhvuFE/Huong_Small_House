import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { palette } from '../../../theme';

interface DesktopNavProps {
  navItems: { label: string; href: string }[];
  isActive: (href: string) => boolean;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ navItems, isActive }) => {
  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        gap: 0.3,
        ml: 1,
        bgcolor: palette.background,
        borderRadius: 3,
        p: 0.5,
        border: `1px solid ${palette.border}`,
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            'px-3.5 py-2 text-[0.84rem] font-medium rounded-[10px] transition-all duration-200 whitespace-nowrap',
            isActive(item.href)
              ? 'bg-white text-[#7daf18] shadow-sm'
              : 'text-[#5A6B7F] hover:text-[#2E7D32] hover:bg-white/60'
          )}
        >
          {item.label}
        </Link>
      ))}
    </Box>
  );
};
