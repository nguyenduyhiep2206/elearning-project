import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook để quản lý kết nối với Metamask
 * @returns {Object} - { account, isConnected, connect, disconnect, provider, signer }
 */
export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra xem Metamask có được cài đặt không
  const checkMetamask = useCallback(() => {
    if (typeof window.ethereum !== 'undefined') {
      return true;
    }
    return false;
  }, []);

  // Lấy account hiện tại
  const getCurrentAccount = useCallback(async () => {
    if (!checkMetamask()) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        return { provider, signer, address };
      }
      return null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }, [checkMetamask]);

  // Kết nối với Metamask
  const connect = useCallback(async () => {
    if (!checkMetamask()) {
      setError('Metamask chưa được cài đặt. Vui lòng cài đặt Metamask extension.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Yêu cầu kết nối
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        setError('Không có tài khoản nào được kết nối.');
        setIsLoading(false);
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setIsConnected(true);
      setProvider(provider);
      setSigner(signer);

      // Lưu vào localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error connecting to Metamask:', error);
      
      let errorMessage = 'Không thể kết nối với Metamask.';
      if (error.code === 4001) {
        errorMessage = 'Người dùng đã từ chối kết nối.';
      } else if (error.code === -32002) {
        errorMessage = 'Yêu cầu kết nối đang chờ xử lý. Vui lòng kiểm tra Metamask.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [checkMetamask]);

  // Ngắt kết nối
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // Khởi tạo khi component mount
  useEffect(() => {
    const init = async () => {
      if (!checkMetamask()) {
        return;
      }

      // Kiểm tra xem đã kết nối trước đó chưa
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (wasConnected) {
        const result = await getCurrentAccount();
        if (result) {
          setAccount(result.address);
          setIsConnected(true);
          setProvider(result.provider);
          setSigner(result.signer);
        } else {
          // Nếu không tìm thấy account, xóa flag
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      }
    };

    init();

    // Lắng nghe sự kiện thay đổi account
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setProvider(provider);
        setSigner(signer);
        localStorage.setItem('walletAddress', address);
      }
    };

    // Lắng nghe sự kiện chain changed
    const handleChainChanged = () => {
      // Reload page khi chain thay đổi
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkMetamask, getCurrentAccount, disconnect]);

  return {
    account,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    provider,
    signer,
    checkMetamask,
  };
};

