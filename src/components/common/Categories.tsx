import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { Card } from 'antd';
import {
  FiActivity,
  FiFeather,
  FiShield,
  FiHeart,
  FiSun,
  FiMoon,
  FiStar,
  FiTrendingDown,
  FiBox,
} from 'react-icons/fi';
import { productApi } from '../../services/productApi';
import type { Category } from '../../types';
import { mockCategories } from '../../data/categoryData';

interface CategoriesProps {
  className?: string;
}

const iconComponents = {
  vitamin: FiActivity,
  digestive: FiTrendingDown,
  immunity: FiShield,
  heart: FiHeart,
  beauty: FiStar,
  energy: FiSun,
  sleep: FiMoon,
  collagen: FiFeather,
} as const;

const iconColors = {
  vitamin: '#E65100',
  digestive: '#2E7D32',
  immunity: '#1565C0',
  heart: '#C62828',
  beauty: '#AD1457',
  energy: '#F9A825',
  sleep: '#4527A0',
  collagen: '#00838F',
} as const;

const iconBgColors = {
  vitamin: '#FFF3E0',
  digestive: '#E8F5E9',
  immunity: '#E3F2FD',
  heart: '#FFEBEE',
  beauty: '#FCE4EC',
  energy: '#FFFDE7',
  sleep: '#EDE7F6',
  collagen: '#E0F7FA',
} as const;

const getIcon = (slug: string) => {
  const normalized = slug.replace(/-.*$/, '');
  return iconComponents[normalized as keyof typeof iconComponents] ?? FiBox;
};

const getIconColor = (slug: string) => {
  const normalized = slug.replace(/-.*$/, '');
  return iconColors[normalized as keyof typeof iconColors] ?? '#7daf18';
};

const getIconBgColor = (slug: string) => {
  const normalized = slug.replace(/-.*$/, '');
  return iconBgColors[normalized as keyof typeof iconBgColors] ?? '#EDF7D5';
};

export const Categories: FC<CategoriesProps> = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await productApi.listCategories('customer');
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch categories, using mock data:', err);
        setItems(mockCategories);
        setError('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              fontSize: { xs: '0.85rem', md: '0.9rem' },
              fontWeight: 600,
              color: '#7daf18',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              mb: 1,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Danh mục
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Khám phá sản phẩm theo nhu cầu
          </Typography>
        </Box>

        {error && (
          <Typography sx={{ textAlign: 'center', color: '#d32f2f', mb: 3 }}>{error}</Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 140,
                    bgcolor: '#F5F5F5',
                    borderRadius: 3,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 0.6 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
              ))
            : items.map((category) => {
                const Icon = getIcon(category.slug);
                const iconColor = getIconColor(category.slug);
                const iconBg = getIconBgColor(category.slug);

                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: 12,
                        border: '1px solid #EEEEEE',
                        textAlign: 'center',
                        height: '100%',
                      }}
                      styles={{
                        body: {
                          padding: '24px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 12,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon style={{ width: 26, height: 26, color: iconColor }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#1a1a1a',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        {category.name}
                      </Typography>
                      {(category.productCount ?? 0) > 0 && (
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: '#9E9E9E',
                            fontFamily: 'Inter, system-ui, sans-serif',
                          }}
                        >
                          {category.productCount} sản phẩm
                        </Typography>
                      )}
                    </Card>
                  </Link>
                );
              })}
        </Box>
      </Container>
    </Box>
  );
};
