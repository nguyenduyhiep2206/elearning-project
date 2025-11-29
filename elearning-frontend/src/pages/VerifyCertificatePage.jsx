import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';
import { certificateService } from '../services';

const VerifyCertificatePage = () => {
  const { certificateId } = useParams();
  const { account, isConnected, connect, provider } = useWallet();
  
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(false);

  // Contract ABI (chỉ cần các hàm cần thiết)
  const CONTRACT_ABI = [
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function getCertificateIdByTokenId(uint256 tokenId) public view returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string)"
  ];

  // Contract address từ environment variable hoặc config
  const CONTRACT_ADDRESS = import.meta.env.VITE_BLOCKCHAIN_CONTRACT_ADDRESS || '';

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await certificateService.getCertificateById(certificateId);
      setCertificate(response.data.data);
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin chứng chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOnBlockchain = async () => {
    if (!certificate) {
      setError('Không có thông tin chứng chỉ');
      return;
    }

    if (!certificate.tokenid) {
      setError('Chứng chỉ chưa được mint trên blockchain');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Contract address chưa được cấu hình');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Kiểm tra xem đã kết nối ví chưa
      if (!isConnected || !account) {
        const connected = await connect();
        if (!connected) {
          setError('Vui lòng kết nối với Metamask để verify');
          setIsVerifying(false);
          return;
        }
      }

      // Lấy provider từ window.ethereum
      if (!window.ethereum) {
        setError('Metamask chưa được cài đặt');
        setIsVerifying(false);
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);

      const tokenId = certificate.tokenid;
      
      // Lấy wallet address từ userdetails (có thể là array hoặc object)
      let studentWalletAddress = null;
      if (certificate.student?.userdetails) {
        if (Array.isArray(certificate.student.userdetails) && certificate.student.userdetails.length > 0) {
          studentWalletAddress = certificate.student.userdetails[0].walletaddress;
        } else if (certificate.student.userdetails.walletaddress) {
          studentWalletAddress = certificate.student.userdetails.walletaddress;
        }
      }

      if (!studentWalletAddress) {
        setError('Sinh viên chưa cập nhật địa chỉ ví. Vui lòng cập nhật địa chỉ ví trong phần Cài đặt tài khoản.');
        setIsVerifying(false);
        return;
      }

      // 1. Kiểm tra owner của token
      const owner = await contract.ownerOf(tokenId);
      const ownerAddress = owner.toLowerCase();

      // 2. Kiểm tra certificateId trên blockchain
      const blockchainCertificateId = await contract.getCertificateIdByTokenId(tokenId);
      const dbCertificateId = BigInt(certificate.certificateid);

      // 3. So sánh kết quả
      const ownerMatches = ownerAddress === studentWalletAddress.toLowerCase();
      const certificateIdMatches = blockchainCertificateId.toString() === dbCertificateId.toString();

      const isValid = ownerMatches && certificateIdMatches;

      setVerificationResult({
        isValid,
        ownerMatches,
        certificateIdMatches,
        ownerAddress,
        studentWalletAddress,
        tokenId,
        blockchainCertificateId: blockchainCertificateId.toString(),
        dbCertificateId: certificate.certificateid
      });

    } catch (err) {
      console.error('Error verifying certificate:', err);
      
      let errorMessage = 'Không thể verify chứng chỉ trên blockchain';
      
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Token không tồn tại trên blockchain hoặc contract address không đúng';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (error && !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/'} variant="primary">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác thực Chứng chỉ</h1>
          <p className="text-gray-600 mb-6">
            Xác thực tính hợp lệ của chứng chỉ trên blockchain để đảm bảo chứng chỉ là thật và không bị giả mạo.
          </p>

          {/* Hướng dẫn */}
          {certificate && !certificate.tokenid && !certificate.transactionhash && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium">Chứng chỉ chưa được phát hành trên blockchain</p>
                  <p className="text-yellow-700 text-sm mt-1">Chứng chỉ này chưa được mint thành NFT. Bạn có thể tự phát hành bằng cách nhấn nút bên dưới (nếu đã cập nhật địa chỉ ví).</p>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo nếu có transactionhash nhưng không có tokenid */}
          {certificate && certificate.transactionhash && !certificate.tokenid && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-orange-800 font-medium">Chứng chỉ đang được xử lý</p>
                  <p className="text-orange-700 text-sm mt-1">
                    Transaction đã được gửi (Hash: {certificate.transactionhash.substring(0, 10)}...) nhưng Token ID chưa được cập nhật. 
                    Hệ thống sẽ tự động cập nhật khi bạn tải lại trang hoặc thử phát hành lại.
                  </p>
                </div>
              </div>
            </div>
          )}

          {certificate && certificate.tokenid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium">Cách xác thực chứng chỉ:</p>
                  <ol className="text-blue-700 text-sm mt-1 list-decimal list-inside space-y-1">
                    <li>Đảm bảo bạn đã cài đặt Metamask và đã kết nối ví</li>
                    <li>Nhấn nút "Verify on Blockchain" bên dưới</li>
                    <li>Xác nhận kết nối ví trong Metamask (nếu chưa kết nối)</li>
                    <li>Hệ thống sẽ kiểm tra và hiển thị kết quả xác thực</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {certificate && (
            <div className="space-y-6">
              {/* Thông tin chứng chỉ */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Thông tin Chứng chỉ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã chứng chỉ</p>
                    <p className="font-medium text-gray-800">#{certificate.certificateid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Token ID</p>
                    <p className="font-medium text-gray-800">
                      {certificate.tokenid ? `#${certificate.tokenid}` : 'Chưa mint'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sinh viên</p>
                    <p className="font-medium text-gray-800">{certificate.student?.fullname || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{certificate.student?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Khóa học</p>
                    <p className="font-medium text-gray-800">{certificate.course?.coursename || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày cấp</p>
                    <p className="font-medium text-gray-800">
                      {certificate.issuedat ? new Date(certificate.issuedat).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  {certificate.transactionhash && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Transaction Hash</p>
                      <p className="font-mono text-xs text-gray-800 break-all">{certificate.transactionhash}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                {(!certificate.tokenid && !certificate.transactionhash) ? (
                  // Nếu chứng chỉ chưa được mint (không có cả tokenid và transactionhash), hiển thị nút phát hành
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={async () => {
                        try {
                          setIsMinting(true);
                          setError(null);
                          setMintSuccess(false);
                          
                          const response = await certificateService.studentMintCertificate(certificateId);
                          
                          setMintSuccess(true);
                          // Refresh certificate data
                          await fetchCertificate();
                          
                          alert(`Chứng chỉ đã được phát hành thành công!\nToken ID: ${response.data.data.tokenId}\nTransaction Hash: ${response.data.data.transactionHash}`);
                        } catch (error) {
                          setError(error.response?.data?.message || error.message || 'Lỗi khi phát hành chứng chỉ');
                        } finally {
                          setIsMinting(false);
                        }
                      }}
                      disabled={isMinting}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang phát hành chứng chỉ...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>Phát hành chứng chỉ trên Blockchain</span>
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Nhấn nút trên để phát hành chứng chỉ của bạn thành NFT trên blockchain. 
                      Bạn cần đã cập nhật địa chỉ ví trong phần Cài đặt tài khoản.
                    </p>
                  </div>
                ) : (
                  // Nếu đã mint, hiển thị nút verify và download
                  <div className="flex gap-4 justify-center">
                <Button
                  onClick={verifyOnBlockchain}
                      disabled={isVerifying}
                  loading={isVerifying}
                  variant="primary"
                  size="large"
                >
                  {isVerifying ? 'Đang xác thực...' : 'Verify on Blockchain'}
                </Button>
                    <button
                      onClick={async () => {
                        try {
                          await certificateService.downloadPDF(certificateId);
                        } catch (error) {
                          alert('Lỗi khi tải xuống chứng chỉ: ' + error.message);
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Tải xuống PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Success message after minting */}
              {mintSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ Chứng chỉ đã được phát hành thành công!</p>
                  <p className="text-green-700 text-sm mt-1">Trang sẽ tự động làm mới để hiển thị thông tin mới nhất.</p>
                </div>
              )}

              {/* Kết quả verification */}
              {verificationResult && (
                <div className={`rounded-lg p-6 ${
                  verificationResult.isValid 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <div className="flex items-center mb-4">
                    {verificationResult.isValid ? (
                      <>
                        <div className="text-green-600 text-4xl mr-3">✓</div>
                        <div>
                        <h3 className="text-2xl font-bold text-green-800">Xác thực thành công!</h3>
                          <p className="text-green-700 text-sm mt-1">Chứng chỉ này là hợp lệ và đã được xác thực trên blockchain.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-red-600 text-4xl mr-3">✕</div>
                        <div>
                        <h3 className="text-2xl font-bold text-red-800">Xác thực thất bại</h3>
                          <p className="text-red-700 text-sm mt-1">Chứng chỉ không hợp lệ hoặc có vấn đề. Vui lòng liên hệ quản trị viên.</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 text-sm mt-4">
                    <div className={`p-3 rounded-lg ${verificationResult.ownerMatches ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex items-center mb-1">
                        {verificationResult.ownerMatches ? (
                          <span className="text-green-700 font-medium">✓ Chủ sở hữu token khớp</span>
                        ) : (
                          <span className="text-red-700 font-medium">✕ Chủ sở hữu token không khớp</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        <strong>Địa chỉ ví sở hữu:</strong> <span className="font-mono">{verificationResult.ownerAddress}</span>
                      </p>
                      <p className="text-gray-600 text-xs">
                        <strong>Địa chỉ ví học viên:</strong> <span className="font-mono">{verificationResult.studentWalletAddress}</span>
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${verificationResult.certificateIdMatches ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex items-center mb-1">
                        {verificationResult.certificateIdMatches ? (
                          <span className="text-green-700 font-medium">✓ Certificate ID khớp</span>
                        ) : (
                          <span className="text-red-700 font-medium">✕ Certificate ID không khớp</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        <strong>Certificate ID (Database):</strong> {verificationResult.dbCertificateId}
                      </p>
                      <p className="text-gray-600 text-xs">
                        <strong>Certificate ID (Blockchain):</strong> {verificationResult.blockchainCertificateId}
                      </p>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-gray-700 text-xs">
                        <strong>Token ID (NFT):</strong> {verificationResult.tokenId}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && !isVerifying && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificatePage;

