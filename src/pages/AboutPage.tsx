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
import logo from '../assets/logo.png';

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
    image: logo,
    description: 'Dược sĩ với 10 năm kinh nghiệm trong ngành dược phẩm'
  },
  {
    name: 'Phạm Thế Vượng',
    role: 'Co-Founder & CTO',
    image: logo,
    description: 'Chuyên gia công nghệ và phát triển hệ thống'
  },
  {
    name: 'Vũ Xuân Anh',
    role: 'Co-Founder & COO',
    image: logo,
    description: 'Chuyên gia vận hành và quản lý chuỗi cung ứng'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary to-secondary py-16 sm:py-20 md:py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/auth-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Về Hương Small House
            </h1>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed px-4 sm:px-0">
              Hơn 10 năm đồng hành cùng sức khỏe người Việt với các sản phẩm thực phẩm chức năng
              chính hãng, chất lượng cao từ các thương hiệu uy tín trên thế giới.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <FiTarget className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Sứ mệnh</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Mang đến cho khách hàng Việt Nam những sản phẩm thực phẩm chức năng chất lượng cao,
                chính hãng 100% với giá cả hợp lý nhất. Chúng tôi cam kết tư vấn chuyên nghiệp,
                tận tâm để mỗi khách hàng tìm được sản phẩm phù hợp nhất với nhu cầu sức khỏe của mình.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiEye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Tầm nhìn</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Trở thành đơn vị phân phối thực phẩm chức năng hàng đầu Việt Nam, được khách hàng
                tin tưởng lựa chọn đầu tiên khi cần chăm sóc sức khỏe. Xây dựng hệ sinh thái
                sức khỏe toàn diện với dịch vụ tư vấn chuyên sâu và sản phẩm đa dạng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <FiCheckCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Chính hãng</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">100% sản phẩm nhập khẩu chính hãng</p>
            </div>

            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <FiShield className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Uy tín</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Cam kết bảo hành, đổi trả chính hãng</p>
            </div>

            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <FiHeart className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Tận tâm</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Tư vấn nhiệt tình, hỗ trợ 24/7</p>
            </div>

            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <FiAward className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Chuyên nghiệp</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Đội ngũ chuyên môn cao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Hành trình phát triển</h2>

          {/* Simple Card Grid Timeline */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {milestones.map((milestone, index) => {
                const icons = [
                  <FiAward className="w-5 h-5 sm:w-6 sm:h-6" />,
                  <FiPackage className="w-5 h-5 sm:w-6 sm:h-6" />,
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6" />,
                  <FiTruck className="w-5 h-5 sm:w-6 sm:h-6" />,
                  <FiStar className="w-5 h-5 sm:w-6 sm:h-6" />,
                  <FiShield className="w-5 h-5 sm:w-6 sm:h-6" />
                ];

                const colors = [
                  'from-blue-500 to-purple-500',
                  'from-green-500 to-teal-500',
                  'from-orange-500 to-red-500',
                  'from-purple-500 to-pink-500',
                  'from-yellow-500 to-orange-500',
                  'from-cyan-500 to-blue-500'
                ];

                return (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Year Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors[index]} text-white`}>
                          {icons[index]}
                          <span className="text-sm sm:text-base font-bold">{milestone.year}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {index === 0 && 'Khởi đầu'}
                          {index === 1 && 'Mở rộng'}
                          {index === 2 && 'Tăng trưởng'}
                          {index === 3 && 'Số hóa'}
                          {index === 4 && 'Đối tác'}
                          {index === 5 && 'Chất lượng'}
                        </div>
                      </div>

                      {/* Event Description */}
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {milestone.event}
                      </p>

                      {/* Hover Effect Line */}
                      <div className={`mt-4 h-0.5 bg-gradient-to-r ${colors[index]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">Đội ngũ của chúng tôi</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 md:mb-16 max-w-2xl mx-auto px-4">
            Đội ngũ chuyên gia giàu kinh nghiệm, luôn sẵn sàng tư vấn và hỗ trợ khách hàng
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4 sm:mb-6 inline-block">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <FiAward className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-gray-900">{member.name}</h3>
                <p className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {member.role}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs mx-auto px-4">{member.description}</p>

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
      <div className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-primary via-green-600 to-secondary">
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-white">
            Thành tựu nổi bật
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <FiUsers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
                  50,000+
                </div>
                <div className="text-white/90 font-medium text-xs sm:text-sm md:text-base">
                  Khách hàng
                </div>
                <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto mt-2 sm:mt-3 md:mt-4 rounded-full group-hover:w-16 sm:group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <FiPackage className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
                  1,500+
                </div>
                <div className="text-white/90 font-medium text-xs sm:text-sm md:text-base">
                  Sản phẩm
                </div>
                <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto mt-2 sm:mt-3 md:mt-4 rounded-full group-hover:w-16 sm:group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <FiAward className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
                  500+
                </div>
                <div className="text-white/90 font-medium text-xs sm:text-sm md:text-base">
                  Thương hiệu
                </div>
                <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto mt-2 sm:mt-3 md:mt-4 rounded-full group-hover:w-16 sm:group-hover:w-24 transition-all"></div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transform transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <FiStar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 tracking-tight">
                  99.8%
                </div>
                <div className="text-white/90 font-medium text-xs sm:text-sm md:text-base">
                  Hài lòng
                </div>
                <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto mt-2 sm:mt-3 md:mt-4 rounded-full group-hover:w-16 sm:group-hover:w-24 transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Bắt đầu hành trình sức khỏe của bạn</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Hãy để Hương Small House đồng hành cùng bạn trong việc chăm sóc sức khỏe gia đình
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/products"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-full text-sm sm:text-base font-semibold hover:bg-primary-dark transition-colors"
            >
              Khám phá sản phẩm
            </Link>
            <Link
              to="/contact"
              className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-primary text-primary rounded-full text-sm sm:text-base font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
