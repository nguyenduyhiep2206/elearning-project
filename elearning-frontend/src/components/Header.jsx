import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { cartService } from '../services';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Toggle Browse Menu
  const toggleBrowseMenu = () => {
    setIsBrowseMenuOpen(!isBrowseMenuOpen);
    setIsUserMenuOpen(false);
    setMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsBrowseMenuOpen(false);
    setMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsBrowseMenuOpen(false);
    setIsUserMenuOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    closeAllMenus();
    await logout();
    setCartItemCount(0); // Reset cart count on logout
    navigate('/');
  };

  // Lấy chữ cái đầu tiên từ tên hoặc email
  const getInitials = () => {
    if (user?.name) {
      // Lấy chữ cái đầu tiên của từ đầu tiên và từ cuối cùng
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Fetch cart items count
  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }

    try {
      const response = await cartService.getCart();
      const items = response.data?.data || response.data || [];
      setCartItemCount(items.length);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    }
  };

  // Fetch cart count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated]);

  // Refresh cart count when navigating back to the page (e.g., from cart page)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchCartCount();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + Browse */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">m</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">MyCourse.io</h1>
            </div>

            {/* Browse Dropdown */}
            <div className="relative">
              <button
                onClick={toggleBrowseMenu}
                className="hidden md:flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-900"
              >
                <span className="text-sm font-medium">Danh mục</span>
                <i className={`fas fa-chevron-down transition-transform ${isBrowseMenuOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Browse Dropdown Menu */}
              {isBrowseMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Thiết kế</h3>
                            <p className="text-sm text-gray-500">Tất cả về khóa học thiết kế</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Lập trình</h3>
                            <p className="text-sm text-gray-500">Lập trình Web và Mobile</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Kinh doanh & Marketing</h3>
                            <p className="text-sm text-gray-500">Chiến lược và phát triển</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Ảnh & Video</h3>
                            <p className="text-sm text-gray-500">Kỹ năng quay chụp và dựng</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Viết lách</h3>
                            <p className="text-sm text-gray-500">Nâng cao kỹ năng viết</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Minh họa</h3>
                            <p className="text-sm text-gray-500">Trở thành họa sĩ minh họa giỏi</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Thiết kế đồ họa</h3>
                            <p className="text-sm text-gray-500">Tối ưu giá trị từ thiết kế</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Thiết kế UI/UX</h3>
                            <p className="text-sm text-gray-500">Thiết kế cho website và ứng dụng</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Section: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học"
                  className="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-full"
                />
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Become Instructor Link */}
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Trở thành giảng viên
            </a>

            {/* When NOT logged in */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                {/* Login Button */}
                <Link to="/login">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Đăng nhập
                  </button>
                </Link>

                {/* Sign Up Button */}
                <Link to="/register">
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center gap-2">
                    <i className="fas fa-clock"></i>
                    <span>Đăng ký</span>
                  </button>
                </Link>
              </div>
            )}

            {/* When logged in */}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {/* Shopping Cart */}
                <Link to="/cart">
                  <button className="relative p-2 text-gray-700 hover:text-gray-900">
                    <i className="fas fa-shopping-cart text-lg"></i>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Notification Bell */}
                <button className="relative p-2 text-gray-700 hover:text-gray-900">
                  <i className="fas fa-bell text-lg"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
                </button>

                {/* User Avatar with Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || 'User Avatar'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-500 border-2 border-gray-200 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials()}
                      </div>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">{user?.name || 'Người dùng'}</h3>
                        <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link to="/my-courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Khóa học của tôi</Link>
                        <Link to="/cart" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Giỏ hàng</Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lịch sử đơn hàng</Link>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thông báo</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cài đặt tài khoản</a>
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-gray-200 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <i className="fas fa-search text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học"
                  className="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full"
                />
              </div>

              {/* Mobile Browse */}
              <div className="flex items-center gap-1 text-gray-600 py-2">
                <span className="text-sm font-medium">Danh mục</span>
                <i className="fas fa-chevron-down"></i>
              </div>

              {/* Mobile Actions */}
              <a href="#" className="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2">
                Trở thành giảng viên
              </a>

              {/* Mobile Shopping Cart */}
              <Link to="/cart" className="flex items-center justify-between py-2">
                <span className="text-gray-700 text-sm font-medium">Giỏ hàng</span>
                <button className="relative p-2 text-gray-700 hover:text-gray-900">
                  <i className="fas fa-shopping-cart text-lg text-gray-700"></i>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
              </Link>

              <div className="flex items-center gap-4">
                <Link to="/login" className="flex-1">
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Login
                  </button>
                </Link>

                <Link to="/register" className="flex-1">
                  <button className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdowns */}
      {(isBrowseMenuOpen || isUserMenuOpen) && (
        <div onClick={closeAllMenus} className="fixed inset-0 z-40"></div>
      )}
    </header>
  );
};

export default Header;