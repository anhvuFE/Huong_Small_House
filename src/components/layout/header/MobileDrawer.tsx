import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close, Person, Logout, Login } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../../../types';
import { palette } from '../../../theme';

// Framer motion variants
const mobileMenuOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const mobileMenuPanel = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { x: '-100%', transition: { duration: 0.25 } },
};

const mobileNavItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; href: string; icon: SvgIconComponent }[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  navItems,
  isActive,
  isAuthenticated,
  user,
  onLogout,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            variants={mobileMenuOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 45,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Panel */}
          <motion.nav
            variants={mobileMenuPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 300,
              maxWidth: '85vw',
              zIndex: 50,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 30px rgba(0,0,0,0.1)',
            }}
          >
            {/* Menu Header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: palette.textMuted, mb: 0.2 }}>
                  Menu
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: palette.textPrimary }}>
                  Hương Small House
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  border: `1px solid ${palette.border}`,
                  borderRadius: 2,
                  p: 0.6,
                  color: palette.textSecondary,
                }}
                aria-label="Đóng menu"
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Nav items */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.04, delayChildren: 0.1 }}
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <motion.div key={item.href} variants={mobileNavItem} transition={{ duration: 0.25 }}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        style={{ textDecoration: 'none' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.4,
                            px: 1.5,
                            mb: 0.5,
                            borderRadius: 2.5,
                            bgcolor: active ? '#EDF7D5' : 'transparent',
                            border: `1px solid ${active ? 'rgba(125,175,24,0.2)' : 'transparent'}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: active ? '#EDF7D5' : palette.background,
                            },
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: 20,
                              color: active ? palette.accent : palette.textMuted,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.92rem',
                              fontWeight: active ? 600 : 500,
                              color: active ? palette.accent : palette.textPrimary,
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </Box>

            {/* Footer actions */}
            <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${palette.border}` }}>
              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={onClose} style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.3,
                        px: 1.5,
                        mb: 1,
                        borderRadius: 2.5,
                        border: `1px solid ${palette.border}`,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: palette.accent },
                      }}
                    >
                      <Person sx={{ fontSize: 20, color: palette.textSecondary }} />
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: palette.textPrimary }}>
                        {user?.fullName || 'Tài khoản'}
                      </Typography>
                    </Box>
                  </Link>
                  <Box
                    component="button"
                    type="button"
                    onClick={onLogout}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.3,
                      px: 1.5,
                      width: '100%',
                      borderRadius: 2.5,
                      border: '1px solid #FFCDD2',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#FFEBEE' },
                    }}
                  >
                    <Logout sx={{ fontSize: 20, color: '#C62828' }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#C62828' }}>
                      Đăng xuất
                    </Typography>
                  </Box>
                </>
              ) : (
                <Link to="/login" onClick={onClose} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      py: 1.4,
                      borderRadius: 2.5,
                      bgcolor: palette.accent,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#6B9E12' },
                    }}
                  >
                    <Login sx={{ fontSize: 20 }} />
                    <span>Đăng nhập</span>
                  </Box>
                </Link>
              )}
            </Box>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
