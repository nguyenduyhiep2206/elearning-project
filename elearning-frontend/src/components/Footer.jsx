import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* <!-- Logo --> */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-lg text-white">MyCourse.io</span>
          </div>
          <p className="text-sm text-gray-400">Học điều mới mỗi ngày.</p>
        </div>

        {/* <!-- Links Column 1 --> */}
        <div>
          <h4 className="font-bold text-white mb-4">Lập trình</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-teal-400 transition">Lập trình Web</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Lập trình Mobile</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Java Cơ bản</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">PHP Cơ bản</a></li>
          </ul>
        </div>

        {/* <!-- Links Column 2 --> */}
        <div>
          <h4 className="font-bold text-white mb-4">Thiết kế</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-teal-400 transition">Adobe Illustrator</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Adobe Photoshop</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Thiết kế Logo</a></li>
          </ul>
        </div>

        {/* <!-- Links Column 3 --> */}
        <div>
          <h4 className="font-bold text-white mb-4">Khác</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-teal-400 transition">Khóa học Viết lách</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Nhiếp ảnh</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Dựng Video</a></li>
          </ul>
        </div>
      </div>

       {/* Bottom Section */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-400 text-sm mb-4 md:mb-0">
          © MyCourses 2024, Bảo lưu mọi quyền
        </p>

        {/* <!-- Social Links --> */}
        <div className="flex gap-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <i className="fab fa-twitter text-xl"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <i className="fab fa-instagram text-xl"></i>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <i className="fab fa-facebook text-xl"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
