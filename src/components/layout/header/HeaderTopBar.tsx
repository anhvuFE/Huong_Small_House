import React from 'react';
import { Box, Typography } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';
import { palette } from '../../../theme';
import { SITE } from '../../../config/site';

export const HeaderTopBar: React.FC = () => {
  return (
    <Box
      id="top-bar"
      sx={{
        bgcolor: palette.primary,
        color: '#fff',
        py: 0.8,
        fontSize: '0.8rem',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
          <Box
            component="a"
            href={SITE.phoneHref}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              color: '#fff',
              textDecoration: 'none',
              '&:hover': { color: 'rgba(255,255,255,0.85)' },
              transition: 'color 0.2s',
            }}
          >
            <Phone sx={{ fontSize: 15 }} />
            <span>{SITE.phone}</span>
          </Box>
          <Box
            component="a"
            href={SITE.emailHref}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.7,
              color: '#fff',
              textDecoration: 'none',
              '&:hover': { color: 'rgba(255,255,255,0.85)' },
              transition: 'color 0.2s',
            }}
          >
            <Email sx={{ fontSize: 15 }} />
            <span>{SITE.email}</span>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.7,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <LocationOn sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.8rem' }}>{SITE.addressShort}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
