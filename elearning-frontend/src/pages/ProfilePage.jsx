import React, { useState, useEffect } from 'react';
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

            {/* User Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin tài khoản</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <p className="text-gray-900">{userData?.fullname || user?.fullname || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{userData?.email || user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <p className="text-gray-900 capitalize">
                    {userData?.role || user?.role || 'N/A'}
                  </p>
                </div>
                {userData?.createdat && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày tham gia
                    </label>
                    <p className="text-gray-900">
                      {new Date(userData.createdat).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
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

