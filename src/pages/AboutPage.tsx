import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiAward,
  FiUsers,
  FiTruck,
  FiShield,
  FiHeart,
  FiTarget,
  FiEye,
  FiStar,
  FiPackage
} from 'react-icons/fi';

const milestones = [
  { year: '2015', event: 'Thành lập Hương Small House với 10 sản phẩm đầu tiên' },
  { year: '2017', event: 'Mở rộng kho hàng với 100+ sản phẩm từ Mỹ, Úc' },
  { year: '2019', event: 'Đạt 10,000 khách hàng thân thiết' },
  { year: '2021', event: 'Ra mắt website và hệ thống giao hàng toàn quốc' },
  { year: '2023', event: 'Hợp tác với 500+ thương hiệu quốc tế' },
  { year: '2024', event: 'Đạt chứng nhận ISO 9001:2015 về quản lý chất lượng' }
];

const teamMembers = [
  {
    name: 'Vũ Quỳnh Hương',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    description: 'Dược sĩ với 10 năm kinh nghiệm trong ngành dược phẩm'
  },
  {
    name: 'Phạm Thế Vượng',
    role: 'Co-Founder & CTO',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    description: 'Chuyên gia công nghệ và phát triển hệ thống'
  },
  {
    name: 'Vũ Xuân Anh',
    role: 'Co-Founder & COO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    description: 'Chuyên gia vận hành và quản lý chuỗi cung ứng'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary to-secondary py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/auth-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Về Hương Small House
            </h1>
            <p className="text-xl leading-relaxed">
              Hơn 10 năm đồng hành cùng sức khỏe người Việt với các sản phẩm thực phẩm chức năng
              chính hãng, chất lượng cao từ các thương hiệu uy tín trên thế giới.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <FiTarget className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Sứ mệnh</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Mang đến cho khách hàng Việt Nam những sản phẩm thực phẩm chức năng chất lượng cao,
                chính hãng 100% với giá cả hợp lý nhất. Chúng tôi cam kết tư vấn chuyên nghiệp,
                tận tâm để mỗi khách hàng tìm được sản phẩm phù hợp nhất với nhu cầu sức khỏe của mình.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <FiEye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Tầm nhìn</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Trở thành đơn vị phân phối thực phẩm chức năng hàng đầu Việt Nam, được khách hàng
                tin tưởng lựa chọn đầu tiên khi cần chăm sóc sức khỏe. Xây dựng hệ sinh thái
                sức khỏe toàn diện với dịch vụ tư vấn chuyên sâu và sản phẩm đa dạng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chính hãng</h3>
              <p className="text-gray-600">100% sản phẩm nhập khẩu chính hãng có nguồn gốc rõ ràng</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiShield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Uy tín</h3>
              <p className="text-gray-600">Cam kết bảo hành, đổi trả theo quy định của nhà sản xuất</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiHeart className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tận tâm</h3>
              <p className="text-gray-600">Tư vấn nhiệt tình, hỗ trợ khách hàng 24/7</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiAward className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chuyên nghiệp</h3>
              <p className="text-gray-600">Đội ngũ được đào tạo chuyên sâu về dược phẩm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Hành trình phát triển</h2>
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden md:block">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-green-500 to-secondary rounded-full"></div>
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 px-8">
                      <div
                        className={`bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                          index % 2 === 0 ? 'text-left ml-auto max-w-md' : 'text-left mr-auto max-w-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {index === 0 && <FiAward className="w-6 h-6 text-primary" />}
                          {index === 1 && <FiPackage className="w-6 h-6 text-primary" />}
                          {index === 2 && <FiUsers className="w-6 h-6 text-primary" />}
                          {index === 3 && <FiTruck className="w-6 h-6 text-primary" />}
                          {index === 4 && <FiStar className="w-6 h-6 text-primary" />}
                          {index === 5 && <FiShield className="w-6 h-6 text-primary" />}
                          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {milestone.year}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white border-4 border-primary rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-green-500 to-secondary"></div>
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4 mb-8">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white border-4 border-primary rounded-full flex items-center justify-center shadow-lg z-10 relative">
                        <div className="w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          {index === 0 && <FiAward className="w-5 h-5 text-primary" />}
                          {index === 1 && <FiPackage className="w-5 h-5 text-primary" />}
                          {index === 2 && <FiUsers className="w-5 h-5 text-primary" />}
                          {index === 3 && <FiTruck className="w-5 h-5 text-primary" />}
                          {index === 4 && <FiStar className="w-5 h-5 text-primary" />}
                          {index === 5 && <FiShield className="w-5 h-5 text-primary" />}
                          <div className="text-xl font-bold text-primary">{milestone.year}</div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Đội ngũ của chúng tôi</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Đội ngũ chuyên gia giàu kinh nghiệm, luôn sẵn sàng tư vấn và hỗ trợ khách hàng
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <FiAward className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-lg font-semibold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{member.description}</p>

                <div className="mt-6 flex justify-center gap-3">
                  <div className="w-8 h-1 bg-primary rounded-full"></div>
                  <div className="w-8 h-1 bg-secondary rounded-full"></div>
                  <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-primary via-green-600 to-secondary">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Thành tựu nổi bật
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <FiUsers className="w-12 h-12 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  50,000+
                </div>
                <div className="text-white/90 font-medium text-sm md:text-base">
                  Khách hàng tin tưởng
                </div>
                <div className="w-16 h-1 bg-white/50 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <FiPackage className="w-12 h-12 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  1,500+
                </div>
                <div className="text-white/90 font-medium text-sm md:text-base">
                  Sản phẩm đa dạng
                </div>
                <div className="w-16 h-1 bg-white/50 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <FiAward className="w-12 h-12 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  500+
                </div>
                <div className="text-white/90 font-medium text-sm md:text-base">
                  Thương hiệu quốc tế
                </div>
                <div className="w-16 h-1 bg-white/50 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <FiStar className="w-12 h-12 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  99.8%
                </div>
                <div className="text-white/90 font-medium text-sm md:text-base">
                  Khách hàng hài lòng
                </div>
                <div className="w-16 h-1 bg-white/50 mx-auto mt-4 rounded-full group-hover:w-24 transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu hành trình sức khỏe của bạn</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Hãy để Hương Small House đồng hành cùng bạn trong việc chăm sóc sức khỏe gia đình
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Khám phá sản phẩm
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
