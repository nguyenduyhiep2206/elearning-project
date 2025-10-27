import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isBrowseMenuOpen, setIsBrowseMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    navigate('/');
  };

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
                <span className="text-sm font-medium">Browse</span>
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
                            <h3 className="font-semibold text-gray-900">Design</h3>
                            <p className="text-sm text-gray-500">All About Design Course</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Programming</h3>
                            <p className="text-sm text-gray-500">Website and Mobile Programming</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Business & Marketing</h3>
                            <p className="text-sm text-gray-500">Website and Mobile Programming</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Photo & Video</h3>
                            <p className="text-sm text-gray-500">Website and Mobile Programming</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Writing</h3>
                            <p className="text-sm text-gray-500">Website and Mobile Programming</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Illustration</h3>
                            <p className="text-sm text-gray-500">How to be great illustrator</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">Graphic Design</h3>
                            <p className="text-sm text-gray-500">Make more benefit from design</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <h3 className="font-semibold text-gray-900">UI/UX Design</h3>
                            <p className="text-sm text-gray-500">Make Design for website and apps</p>
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
                  placeholder="Search for course"
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
              Become instructor
            </a>

            {/* When NOT logged in */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                {/* Login Button */}
                <Link to="/login">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Login
                  </button>
                </Link>

                {/* Sign Up Button */}
                <Link to="/register">
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center gap-2">
                    <i className="fas fa-clock"></i>
                    <span>Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            {/* When logged in */}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {/* Shopping Cart */}
                <button className="relative p-2 text-gray-700 hover:text-gray-900">
                  <i className="fas fa-shopping-cart text-lg"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>

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
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'}
                      alt={user?.name || 'User Avatar'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">{user?.name || 'Jonathan Doe'}</h3>
                        <p className="text-sm text-gray-500">{user?.email || 'doe.jonathan@email.com'}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Courses</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Cart</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notifications</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-gray-200 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Logout
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
                  placeholder="Search for course"
                  className="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full"
                />
              </div>

              {/* Mobile Browse */}
              <div className="flex items-center gap-1 text-gray-600 py-2">
                <span className="text-sm font-medium">Browse</span>
                <i className="fas fa-chevron-down"></i>
              </div>

              {/* Mobile Actions */}
              <a href="#" className="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2">
                Become instructor
              </a>

              {/* Mobile Shopping Cart */}
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 text-sm font-medium">Shopping Cart</span>
                <button className="relative p-2 text-gray-700 hover:text-gray-900">
                  <i className="fas fa-shopping-cart text-lg text-gray-700"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>
              </div>

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