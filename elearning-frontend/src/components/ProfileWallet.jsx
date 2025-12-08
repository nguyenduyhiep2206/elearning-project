import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { userService } from '../services';
import Button from './common/Button';
import Input from './common/Input';

const ProfileWallet = ({ userId, currentWalletAddress, onUpdate }) => {
  const { account, isConnected, isLoading, error: walletError, connect, checkMetamask } = useWallet();
  const [walletAddress, setWalletAddress] = useState(currentWalletAddress || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const hasAutoSavedRef = useRef(false); // Để tránh lưu nhiều lần

  useEffect(() => {
    if (currentWalletAddress) {
      setWalletAddress(currentWalletAddress);
      hasAutoSavedRef.current = true; // Đã có ví trong DB, không cần auto save
    } else {
      hasAutoSavedRef.current = false; // Chưa có ví, có thể auto save
    }
  }, [currentWalletAddress]);

  const handleConnect = async () => {
    setError(null);
    setSuccess(false);
    hasAutoSavedRef.current = false; // Reset flag khi kết nối mới
    const connected = await connect();
    if (connected && account) {
      setWalletAddress(account);
      // Tự động lưu khi kết nối thành công (nếu chưa có ví trong DB)
      if (!currentWalletAddress) {
        await saveWalletAddress(account);
      }
    }
  };

  // Hàm lưu wallet address
  const saveWalletAddress = useCallback(async (address) => {
    if (!address || !address.trim()) {
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      setError('Địa chỉ ví không hợp lệ. Địa chỉ ví phải bắt đầu bằng 0x và có 42 ký tự.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Gọi API để cập nhật wallet address
      await userService.updateWalletAddress(userId, address);
      setWalletAddress(address);
      setSuccess(true);
      hasAutoSavedRef.current = true; // Đánh dấu đã lưu
      if (onUpdate) {
        onUpdate(address);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating wallet address:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật địa chỉ ví. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }, [userId, onUpdate]);

  // Tự động lưu khi kết nối thành công và chưa có ví trong DB
  useEffect(() => {
    if (isConnected && account && !currentWalletAddress && !hasAutoSavedRef.current) {
      // Chỉ tự động lưu nếu chưa có ví trong database và chưa từng auto save
      const addressToSave = account.toLowerCase();
      const currentAddress = (currentWalletAddress || '').toLowerCase();
      
      if (addressToSave !== currentAddress) {
        hasAutoSavedRef.current = true; // Đánh dấu đang lưu để tránh lưu nhiều lần
        saveWalletAddress(account);
      }
    }
  }, [isConnected, account, currentWalletAddress, saveWalletAddress]);

  const handleSave = async () => {
    if (!walletAddress || !walletAddress.trim()) {
      setError('Vui lòng nhập địa chỉ ví hoặc kết nối với Metamask');
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
      setError('Địa chỉ ví không hợp lệ. Địa chỉ ví phải bắt đầu bằng 0x và có 42 ký tự.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Gọi API để cập nhật wallet address
      await userService.updateWalletAddress(userId, walletAddress);
      setSuccess(true);
      if (onUpdate) {
        onUpdate(walletAddress);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating wallet address:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật địa chỉ ví. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setWalletAddress(e.target.value);
    setError(null);
    setSuccess(false);
  };

  const handleUseConnected = () => {
    if (account) {
      setWalletAddress(account);
      setError(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Ví Blockchain</h2>
      
      {!checkMetamask() && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            <strong>Lưu ý:</strong> Metamask chưa được cài đặt. 
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              Tải Metamask tại đây
            </a>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Hiển thị thông tin ví nếu đã có */}
        {walletAddress && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  Địa chỉ ví đã được lưu:
                </p>
              <p className="text-sm font-mono text-green-900 break-all">
                  {walletAddress}
              </p>
                {isConnected && account && account.toLowerCase() === walletAddress.toLowerCase() && (
              <p className="text-xs text-green-700 mt-2">
                    ✓ Đã kết nối với Metamask
              </p>
                )}
            </div>
              {isSaving && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              )}
          </div>
        </div>
      )}

        {/* Hiển thị form kết nối nếu chưa có ví */}
        {!walletAddress && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ Ví (Wallet Address)
            </label>
            
            {!isConnected && checkMetamask() && (
              <div className="mb-3">
                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                  size="medium"
                >
                  {isLoading ? 'Đang kết nối...' : 'Kết nối với Metamask'}
                </Button>
              </div>
            )}

            {isConnected && account && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Đã kết nối:</strong> {account}
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Đang tự động lưu địa chỉ ví...
                </p>
              </div>
            )}

            <Input
              type="text"
              value={walletAddress}
              onChange={handleInputChange}
              placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              error={error}
              className="font-mono text-sm"
            />

            {walletError && (
              <p className="mt-1 text-sm text-red-600">{walletError}</p>
            )}

            {success && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Đã cập nhật địa chỉ ví thành công!
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Địa chỉ ví của bạn sẽ được sử dụng để nhận chứng chỉ học thuật dưới dạng NFT trên blockchain.
            </p>

            {walletAddress && (
              <div className="flex gap-3 mt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !walletAddress}
              loading={isSaving}
              variant="primary"
              size="medium"
            >
                  {isSaving ? 'Đang lưu...' : 'Lưu địa chỉ ví'}
            </Button>
          </div>
            )}
        </div>
      )}

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

        {/* Hiển thị thông báo thành công */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Đã cập nhật địa chỉ ví thành công!
            </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProfileWallet;

