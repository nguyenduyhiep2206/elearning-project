import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { cartService, categoryService, notificationService } from '../services';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fetch notifications
  const {
    data: notifData,
    refetch: refetchNotifs,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationService.getMyNotifications(1, 10);
      // backend: { message, notifications, totalItems, unreadCount }
      const payload = res.data?.data || res.data || {};
      return {
        notifications: payload.notifications || res.data.notifications || [],
        unreadCount: payload.unreadCount ?? res.data.unreadCount ?? 0,
      };
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  const categories = categoriesData?.data?.data || categoriesData?.data || [];
  const allCategories = [
    { id: 'all', name: 'Tất cả' },
    ...categories.map(cat => ({
      id: cat.categoryid || cat.id,
      name: cat.categoryname || cat.name,
    })),
  ];

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
    setIsNotifOpen(false);
  };

  const handleLogout = async () => {
    closeAllMenus();
    await logout();
    setCartItemCount(0); // Reset cart count on logout
    navigate('/');
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  // Lấy chữ cái đầu tiên từ tên hoặc email
  const getInitials = () => {
    const displayName = user?.fullName || user?.name;
    if (displayName) {
      // Lấy chữ cái đầu tiên của từ đầu tiên và từ cuối cùng
      const nameParts = displayName.trim().split(' ');
      if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return displayName[0].toUpperCase();
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
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">m</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">MyCourse.io</h1>
            </Link>

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
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((category) => {
                        const isAll = category.id === 'all';
                        const label = isAll ? 'Tất cả' : category.name;

                        const handleClick = () => {
                          setActiveCategory(label);
                          setIsBrowseMenuOpen(false);

                          const params = new URLSearchParams();
                          params.set('q', label);
                          if (!isAll) {
                            params.set('category', category.id);
                          }
                          navigate(`/search?${params.toString()}`);
                        };

                        return (
                          <button
                            key={category.id}
                            onClick={handleClick}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                              activeCategory === label
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Section: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm khóa học"
                  className="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-full"
                />
                <button type="submit" className="ml-2 text-gray-400 hover:text-teal-500 transition-colors">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Right Section: Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Become Instructor Link */}
            <a 
              href="/become-teacher" 
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/become-teacher';
              }}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium cursor-pointer"
            >
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((prev) => !prev)}
                    className="relative p-2 text-gray-700 hover:text-gray-900"
                  >
                  <i className="fas fa-bell text-lg"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                </button>

                  {/* Notifications Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Thông báo</p>
                          <p className="text-xs text-gray-500">
                            {unreadCount > 0
                              ? `${unreadCount} thông báo chưa đọc`
                              : 'Bạn đã đọc hết thông báo'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={async () => {
                                const unreadIds = notifications
                                  .filter((n) => n.isread === false)
                                  .map((n) => n.notificationid);
                                if (unreadIds.length === 0) return;
                                try {
                                  await notificationService.updateReadStatus(unreadIds, true);
                                  refetchNotifs();
                                } catch (err) {
                                  console.error('Failed to mark notifications as read', err);
                                }
                              }}
                              className="text-xs text-teal-600 hover:text-teal-700"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            onClick={() => {
                              setIsNotifOpen(false);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Xem tất cả
                          </Link>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            Chưa có thông báo nào.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.notificationid}
                              type="button"
                              onClick={async () => {
                                if (!notif.isread) {
                                  try {
                                    await notificationService.updateReadStatus(
                                      [notif.notificationid],
                                      true
                                    );
                                    refetchNotifs();
                                  } catch (err) {
                                    console.error('Failed to mark notification as read', err);
                                  }
                                }
                              }}
                              className={`w-full px-4 py-3 text-left text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition ${
                                notif.isread ? 'bg-white' : 'bg-teal-50'
                              }`}
                            >
                              <p className="text-gray-800">{notif.message}</p>
                              {notif.createdat && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdat).toLocaleString('vi-VN')}
                                </p>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar with Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    {user?.profilepicture ? (
                      <img
                        src={user.profilepicture}
                        alt={user?.fullName || user?.name || 'User Avatar'}
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
                        <h3 className="font-semibold text-gray-900">
                          {user?.fullName || user?.name || 'Người dùng'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link to="/my-courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Khóa học của tôi</Link>
                        <Link to="/my-certificates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Chứng chỉ của tôi</Link>
                        <Link to="/cart" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Giỏ hàng</Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lịch sử đơn hàng</Link>
                        <Link
                          to="/notifications"
                          onClick={closeAllMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Thông báo
                        </Link>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cài đặt tài khoản</Link>
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
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <i className="fas fa-search text-gray-400"></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm khóa học"
                  className="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full"
                />
                <button type="submit" className="ml-2 text-teal-500">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </form>

              {/* Mobile Browse */}
              <div className="flex items-center gap-1 text-gray-600 py-2">
                <span className="text-sm font-medium">Danh mục</span>
                <i className="fas fa-chevron-down"></i>
              </div>

              {/* Mobile Category Scroll giống HomePage */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {allCategories.map((category) => {
                  const isAll = category.id === 'all';
                  const label = isAll ? 'Tất cả' : category.name;

                  const handleClick = () => {
                    setActiveCategory(label);
                    setMenuOpen(false);

                    const params = new URLSearchParams();
                    params.set('q', label);
                    if (!isAll) {
                      params.set('category', category.id);
                    }
                    navigate(`/search?${params.toString()}`);
                  };

                  return (
                    <button
                      key={category.id}
                      onClick={handleClick}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                        activeCategory === label
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Actions */}
              <a 
                href="/become-teacher" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/become-teacher';
                }}
                className="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2 cursor-pointer"
              >
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