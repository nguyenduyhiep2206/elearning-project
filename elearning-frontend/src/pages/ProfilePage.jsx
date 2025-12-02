import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services';
import ProfileWallet from '../components/ProfileWallet';
import Layout from '../components/Layout';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  // Fetch user details including wallet address
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await userService.getUserById(user.id);
      return response.data?.data || response.data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (userData) {
      // Lấy wallet address từ userdetails
      let wallet = '';
      if (userData.userdetails) {
        if (Array.isArray(userData.userdetails) && userData.userdetails.length > 0) {
          wallet = userData.userdetails[0].walletaddress || '';
        } else if (userData.userdetails.walletaddress) {
          wallet = userData.userdetails.walletaddress;
        }
      }
      setWalletAddress(wallet);
    }
  }, [userData]);

  const handleWalletUpdate = (newWalletAddress) => {
    setWalletAddress(newWalletAddress);
    // Refetch user data to get updated wallet address
    refetch();
  };

  const avatarUrl =
    userData?.profilepicture ||
    user?.profilepicture ||
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face';

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarMessage('');
    setAvatarUploading(true);

    try {
      await userService.uploadProfileImage(file);
      setAvatarMessage('Ảnh đại diện đã được cập nhật thành công.');
      // Cập nhật lại dữ liệu user
      refetch();
    } catch (error) {
      setAvatarError(error.message || 'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ của tôi</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt</p>
          </div>

          <div className="space-y-6">
            {/* Avatar & Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-2 border-teal-500 cursor-pointer hover:opacity-90 transition"
                  onClick={handleAvatarClick}
                >
                  <img
                    src={avatarUrl}
                    alt={userData?.fullname || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="mt-3 px-4 py-2 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {avatarUploading ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="mt-2 text-[11px] text-gray-400 text-center">
                  Hỗ trợ file ảnh tối đa 5MB. Ảnh vuông sẽ hiển thị đẹp hơn.
                </p>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.fullname || user?.fullname || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email: </span>
                    <span>{userData?.email || user?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Vai trò: </span>
                    <span className="capitalize">{userData?.role || user?.role || 'N/A'}</span>
                  </div>
                  {userData?.createdat && (
                    <div>
                      <span className="font-medium">Tham gia từ: </span>
                      <span>{new Date(userData.createdat).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                {(avatarMessage || avatarError) && (
                  <div
                    className={`mt-2 text-xs rounded-md px-3 py-2 ${
                      avatarError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {avatarError || avatarMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Reminder Banner */}
            {!walletAddress && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      ⚠️ Quan trọng: Cập nhật địa chỉ ví Blockchain
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Bạn chưa cập nhật địa chỉ ví Blockchain. <strong>Nếu không cập nhật ví, bạn sẽ không nhận được chứng chỉ NFT khi hoàn thành khóa học.</strong> Vui lòng cập nhật địa chỉ ví ngay bên dưới để đảm bảo nhận được chứng chỉ học thuật.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Security & Login Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bảo mật & đăng nhập</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Phương thức đăng nhập</p>
                    <p className="text-gray-600">
                      {userData?.provider === 'google'
                        ? 'Đăng nhập bằng Google'
                        : 'Đăng nhập bằng email & mật khẩu'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="font-medium text-gray-900 mb-1">Đổi mật khẩu</p>
                  <p className="text-gray-600 text-sm mb-3">
                    Hiện tại hệ thống chưa hỗ trợ đổi mật khẩu trực tiếp trong trang này. Nếu bạn cần đổi
                    mật khẩu, vui lòng đăng xuất và sử dụng chức năng quên mật khẩu (khi đã được bật),
                    hoặc liên hệ quản trị viên.
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                    <li>Không chia sẻ mật khẩu hoặc mã OTP cho bất kỳ ai.</li>
                    <li>Ưu tiên sử dụng đăng nhập với Google để bảo mật tốt hơn.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Wallet Management */}
            <ProfileWallet
              userId={user?.id}
              currentWalletAddress={walletAddress}
              onUpdate={handleWalletUpdate}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

