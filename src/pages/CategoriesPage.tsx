import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart,
  FiActivity,
  FiBattery,
  FiSun,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiFeather,
  FiEye,
  FiSmile,
  FiDroplet,
  FiGrid,
  FiPackage,
  FiTarget,
  FiCommand,
  FiLayers,
} from 'react-icons/fi';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  productCount: number;
  color: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Vitamin & Khoáng chất',
    slug: 'vitamin-khoang-chat',
    description: 'Bổ sung vitamin và khoáng chất thiết yếu cho cơ thể',
    icon: <FiSun className="w-8 h-8" />,
    productCount: 156,
    color: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Sức khỏe tim mạch',
    slug: 'suc-khoe-tim-mach',
    description: 'Hỗ trợ và bảo vệ hệ tim mạch khỏe mạnh',
    icon: <FiHeart className="w-8 h-8" />,
    productCount: 89,
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Tăng cường miễn dịch',
    slug: 'tang-cuong-mien-dich',
    description: 'Tăng cường hệ miễn dịch, phòng ngừa bệnh tật',
    icon: <FiShield className="w-8 h-8" />,
    productCount: 124,
    color: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Sức khỏe xương khớp',
    slug: 'suc-khoe-xuong-khop',
    description: 'Hỗ trợ xương chắc khỏe và khớp linh hoạt',
    icon: <FiCommand className="w-8 h-8" />,
    productCount: 76,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Sức khỏe não bộ',
    slug: 'suc-khoe-nao-bo',
    description: 'Tăng cường trí nhớ và chức năng não',
    icon: <FiTarget className="w-8 h-8" />,
    productCount: 92,
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Tiêu hóa & Gan',
    slug: 'tieu-hoa-gan',
    description: 'Hỗ trợ hệ tiêu hóa và chức năng gan',
    icon: <FiDroplet className="w-8 h-8" />,
    productCount: 68,
    color: 'bg-yellow-500',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    name: 'Làm đẹp',
    slug: 'lam-dep',
    description: 'Chăm sóc da, tóc, móng từ bên trong',
    icon: <FiFeather className="w-8 h-8" />,
    productCount: 145,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    name: 'Giảm cân',
    slug: 'giam-can',
    description: 'Hỗ trợ giảm cân an toàn và hiệu quả',
    icon: <FiTrendingUp className="w-8 h-8" />,
    productCount: 98,
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&h=300&fit=crop'
  },
  {
    id: 9,
    name: 'Năng lượng',
    slug: 'nang-luong',
    description: 'Tăng cường năng lượng và sức bền',
    icon: <FiBattery className="w-8 h-8" />,
    productCount: 87,
    color: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop'
  },
  {
    id: 10,
    name: 'Mẹ và bé',
    slug: 'me-va-be',
    description: 'Dinh dưỡng cho mẹ bầu và trẻ nhỏ',
    icon: <FiLayers className="w-8 h-8" />,
    productCount: 112,
    color: 'bg-rose-500',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'
  },
  {
    id: 11,
    name: 'Người cao tuổi',
    slug: 'nguoi-cao-tuoi',
    description: 'Sản phẩm đặc biệt cho người cao tuổi',
    icon: <FiUsers className="w-8 h-8" />,
    productCount: 73,
    color: 'bg-teal-500',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop'
  },
  {
    id: 12,
    name: 'Thể thao',
    slug: 'the-thao',
    description: 'Dinh dưỡng thể thao và phục hồi cơ bắp',
    icon: <FiActivity className="w-8 h-8" />,
    productCount: 94,
    color: 'bg-cyan-500',
    image: 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=400&h=300&fit=crop'
  },
  {
    id: 13,
    name: 'Sức khỏe mắt',
    slug: 'suc-khoe-mat',
    description: 'Bảo vệ và tăng cường thị lực',
    icon: <FiEye className="w-8 h-8" />,
    productCount: 56,
    color: 'bg-sky-500',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'
  },
  {
    id: 14,
    name: 'Giảm stress',
    slug: 'giam-stress',
    description: 'Thư giãn tinh thần, giảm căng thẳng',
    icon: <FiSmile className="w-8 h-8" />,
    productCount: 82,
    color: 'bg-violet-500',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop'
  },
  {
    id: 15,
    name: 'Detox & Thanh lọc',
    slug: 'detox-thanh-loc',
    description: 'Thanh lọc cơ thể và loại bỏ độc tố',
    icon: <FiDroplet className="w-8 h-8" />,
    productCount: 64,
    color: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop'
  }
];

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary to-secondary py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1920&h=400&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Danh mục sản phẩm
            </h1>
            <p className="text-xl mb-8">
              Khám phá đa dạng các sản phẩm chăm sóc sức khỏe
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                className="w-full px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiGrid className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 font-medium">Danh mục</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiPackage className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0).toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Sản phẩm</div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiAward className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">Thương hiệu</div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FiShield className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Chính hãng</div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mt-2 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              onMouseEnter={() => setSelectedCategory(category.slug)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Icon Badge */}
                <div className={`absolute top-4 right-4 ${category.color} p-3 rounded-full text-white shadow-lg`}>
                  {category.icon}
                </div>
              </div>

              {/* Category Info */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.productCount} sản phẩm
                  </span>
                  <span className="text-primary font-semibold group-hover:underline">
                    Xem thêm →
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              {selectedCategory === category.slug && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
              )}
            </Link>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Không tìm thấy danh mục nào phù hợp với "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary to-secondary py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Cần tư vấn sản phẩm?
          </h2>
          <p className="text-lg mb-8">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0336064040"
              className="px-8 py-3 bg-white text-primary rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Gọi ngay: 0336 064 040
            </a>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
