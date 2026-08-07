import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  InputBase,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Inventory2,
} from '@mui/icons-material';
import { Button, Select as AntSelect, Input, Modal } from 'antd';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { productApi } from '../../services/productApi';
import type { Category, Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { getProductImage } from '../../utils/productImage';

const { TextArea } = Input;

const palette = {
  accent: '#7daf18',
  accentLight: '#EDF7D5',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
  border: '#E8ECF0',
  background: '#FAFBFC',
};

interface ProductFormState {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  price: string;
  stock: string;
  images: string;
}

const defaultFormState: ProductFormState = {
  name: '', brand: '', categoryId: '', description: '', price: '', stock: '', images: '',
};

const getStockStatus = (stock: number) => {
  if (stock === 0) return { text: 'Hết hàng', color: '#EF4444', bg: '#FEF2F2' };
  if (stock < 20) return { text: 'Sắp hết', color: '#F59E0B', bg: '#FFFBEB' };
  return { text: 'Còn hàng', color: '#10B981', bg: '#ECFDF5' };
};


export const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const { showToast } = useToast();

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, getPaginatedData } = usePagination(1, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [catData, prodData] = await Promise.all([
          productApi.listCategories('admin'),
          productApi.listProducts(),
        ]);
        setCategories(catData);
        setProducts(prodData);
        setBrands([...new Set(prodData.map((p) => p.brand))]);
      } catch {
        setError('Không thể tải dữ liệu sản phẩm.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !selectedCategory || p.categoryId?.toString() === selectedCategory;
      const matchBrand = !selectedBrand || p.brand === selectedBrand;
      return matchSearch && matchCat && matchBrand;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const paginatedData = useMemo(() => getPaginatedData(filteredProducts), [filteredProducts, getPaginatedData]);

  const openCreateModal = () => { setFormState(defaultFormState); setEditingProduct(null); setIsFormOpen(true); };
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name, brand: product.brand, categoryId: product.categoryId?.toString() ?? '',
      description: product.description, price: product.price.toString(), stock: product.stock.toString(),
      images: product.images.join('\n'),
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formState.categoryId || !formState.name) return;
    try {
      setIsSubmitting(true);
      const payload = {
        name: formState.name, brand: formState.brand, categoryId: Number(formState.categoryId),
        description: formState.description, price: Number(formState.price), stock: Number(formState.stock),
        images: formState.images.split('\n').map((u) => u.trim()).filter(Boolean).map((url) => ({ url })),
      };
      if (editingProduct?.productId) await productApi.updateProduct(editingProduct.productId, payload);
      else await productApi.createProduct(payload);

      const [catData, prodData] = await Promise.all([productApi.listCategories('admin'), productApi.listProducts()]);
      setCategories(catData);
      setProducts(prodData);
      setBrands([...new Set(prodData.map((p) => p.brand))]);
      setIsFormOpen(false);
      setEditingProduct(null);
      setFormState(defaultFormState);
      showToast({ title: editingProduct ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm', variant: 'success' });
    } catch {
      showToast({ title: 'Lưu sản phẩm thất bại', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.productId) return;
    try {
      await productApi.deleteProduct(deleteTarget.productId);
      setProducts((prev) => prev.filter((p) => p.productId !== deleteTarget.productId));
      showToast({ title: 'Đã xóa sản phẩm', variant: 'error' });
    } catch {
      showToast({ title: 'Xóa sản phẩm thất bại', variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const inputStyle = { borderRadius: 10, height: 40, fontFamily: 'Inter, system-ui, sans-serif' };

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 4, border: `1px solid ${palette.border}`, borderRadius: 3, display: 'flex', justifyContent: 'center' }}>
        <Loader />
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: palette.textPrimary }}>Quản lý sản phẩm</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>{filteredProducts.length} sản phẩm</Typography>
        </Box>
        <Button
          type="primary"
          icon={<Add style={{ fontSize: 18 }} />}
          onClick={openCreateModal}
          style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {error && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', borderRadius: 2 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</Typography>
        </Paper>
      )}

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${palette.border}`, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 1.5 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: palette.background, borderRadius: 2.5, border: `1px solid ${palette.border}`, px: 1.5, '&:focus-within': { borderColor: palette.accent } }}>
            <Search sx={{ fontSize: 20, color: palette.textMuted, mr: 1 }} />
            <InputBase
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              sx={{ flex: 1, fontSize: '0.88rem', py: 0.8 }}
            />
          </Box>
          <AntSelect
            value={selectedCategory || undefined}
            onChange={(v) => setSelectedCategory(v || '')}
            allowClear
            placeholder="Tất cả danh mục"
            options={categories.map((c) => ({ value: c.categoryId.toString(), label: c.name }))}
            style={{ width: 200, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <AntSelect
            value={selectedBrand || undefined}
            onChange={(v) => setSelectedBrand(v || '')}
            allowClear
            placeholder="Tất cả thương hiệu"
            options={brands.map((b) => ({ value: b, label: b }))}
            style={{ width: 200, height: 40, fontFamily: 'Inter, system-ui, sans-serif' }}
          />
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
        {/* Desktop table */}
        <Box sx={{ display: { xs: 'none', lg: 'block' }, overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: palette.background }}>
                {['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Thao tác'].map((h) => (
                  <Box key={h} component="th" sx={{ py: 1.5, px: 2.5, textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {paginatedData.items.map((product) => {
                const stock = getStockStatus(product.stock);
                return (
                  <Box key={product.id} component="tr" sx={{ borderBottom: `1px solid ${palette.border}`, '&:hover': { bgcolor: palette.background }, transition: 'background 0.15s' }}>
                    <Box component="td" sx={{ py: 1.5, px: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={getProductImage(product)}
                          variant="rounded"
                          sx={{ width: 48, height: 48, bgcolor: palette.background, '& img': { objectFit: 'contain', p: 0.3 } }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 250 }}>
                            {product.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{product.brand}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2.5 }}>
                      <Chip label={product.category} size="small" sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2.5 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(product.price)}</Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2.5 }}>
                      <Chip label={stock.text} size="small" sx={{ bgcolor: stock.bg, color: stock.color, fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                      <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, mt: 0.3 }}>Còn {product.stock}</Typography>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, px: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openEditModal(product)} sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => openEditModal(product)} sx={{ color: palette.textMuted, '&:hover': { bgcolor: palette.background } }}>
                          <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteTarget(product)} sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}>
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Mobile cards */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column' }}>
          {paginatedData.items.map((product) => {
            const stock = getStockStatus(product.stock);
            return (
              <Box key={product.id} sx={{ display: 'flex', gap: 1.5, p: 2, borderBottom: `1px solid ${palette.border}` }}>
                <Avatar
                  src={getProductImage(product)}
                  variant="rounded"
                  sx={{ width: 56, height: 56, bgcolor: palette.background, '& img': { objectFit: 'contain', p: 0.3 } }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </Typography>
                    <IconButton size="small" onClick={() => openEditModal(product)} sx={{ color: '#1565C0', ml: 0.5 }}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, mb: 0.8 }}>{product.brand}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={product.category} size="small" sx={{ bgcolor: palette.accentLight, color: palette.accent, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: palette.textPrimary }}>{formatCurrency(product.price)}</Typography>
                    <Chip label={stock.text} size="small" sx={{ bgcolor: stock.bg, color: stock.color, fontWeight: 600, fontSize: '0.68rem', height: 22, ml: 'auto' }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {paginatedData.totalItems === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Inventory2 sx={{ fontSize: 48, color: palette.border, mb: 1.5 }} />
            <Typography sx={{ fontWeight: 600, color: palette.textPrimary, mb: 0.5 }}>Không tìm thấy sản phẩm</Typography>
            <Typography sx={{ fontSize: '0.88rem', color: palette.textMuted }}>Thử thay đổi bộ lọc hoặc từ khóa</Typography>
          </Box>
        )}
      </Paper>

      <Pagination
        currentPage={currentPage}
        totalPages={paginatedData.totalPages}
        totalItems={paginatedData.totalItems}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        showPageSizeSelect
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={isFormOpen}
        onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        footer={null}
        width={640}
        centered
        styles={{ header: { borderBottom: `1px solid ${palette.border}`, paddingBottom: 12 } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tên sản phẩm *</Typography>
              <Input value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Thương hiệu *</Typography>
              <Input value={formState.brand} onChange={(e) => setFormState((p) => ({ ...p, brand: e.target.value }))} style={inputStyle} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Danh mục *</Typography>
              <AntSelect
                value={formState.categoryId || undefined}
                onChange={(v) => setFormState((p) => ({ ...p, categoryId: v }))}
                placeholder="Chọn danh mục"
                options={categories.map((c) => ({ value: c.categoryId.toString(), label: c.name }))}
                style={{ width: '100%', height: 40, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Giá *</Typography>
              <Input type="number" min={0} value={formState.price} onChange={(e) => setFormState((p) => ({ ...p, price: e.target.value }))} style={inputStyle} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Tồn kho *</Typography>
              <Input type="number" min={0} value={formState.stock} onChange={(e) => setFormState((p) => ({ ...p, stock: e.target.value }))} style={inputStyle} />
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Mô tả</Typography>
            <TextArea rows={3} value={formState.description} onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: palette.textPrimary, mb: 0.5 }}>Ảnh sản phẩm (mỗi dòng 1 URL)</Typography>
            <TextArea rows={3} value={formState.images} onChange={(e) => setFormState((p) => ({ ...p, images: e.target.value }))} style={{ borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button onClick={() => { setIsFormOpen(false); setEditingProduct(null); }} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Hủy
            </Button>
            <Button
              type="primary"
              loading={isSubmitting}
              onClick={handleFormSubmit}
              style={{ backgroundColor: palette.accent, borderColor: palette.accent, height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa sản phẩm"
        centered
        footer={null}
        width={440}
      >
        <Typography sx={{ fontSize: '0.9rem', color: palette.textSecondary, py: 2 }}>
          Bạn có chắc muốn xóa &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => setDeleteTarget(null)} style={{ height: 40, borderRadius: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Hủy
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleDelete}
            style={{ height: 40, borderRadius: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Xóa
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
