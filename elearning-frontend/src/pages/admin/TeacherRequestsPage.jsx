import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherRequestService } from '../../services';

const TeacherRequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const queryClient = useQueryClient();

  // Fetch all requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['teacherRequests', statusFilter],
    queryFn: async () => {
      const response = await teacherRequestService.getAllRequests({ status: statusFilter });
      return response.data?.data || [];
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await teacherRequestService.approveRequest(requestId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherRequests']);
      setSelectedRequest(null);
      setNotification({
        show: true,
        message: '✅ Duyệt yêu cầu thành công!',
        type: 'success'
      });
    },
    onError: (error) => {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi duyệt yêu cầu',
        type: 'error'
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      const response = await teacherRequestService.rejectRequest(requestId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherRequests']);
      setSelectedRequest(null);
      setRejectionReason('');
      setNotification({
        show: true,
        message: '✅ Từ chối yêu cầu thành công!',
        type: 'success'
      });
    },
    onError: (error) => {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu',
        type: 'error'
      });
    }
  });

  const handleApprove = (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
      approveMutation.mutate(requestId);
    }
  };

  const handleReject = (requestId) => {
    if (!rejectionReason.trim()) {
      setNotification({
        show: true,
        message: '⚠️ Vui lòng nhập lý do từ chối',
        type: 'error'
      });
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      rejectMutation.mutate({ requestId, reason: rejectionReason });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      Pending: 'Chờ duyệt',
      Approved: 'Đã duyệt',
      Rejected: 'Đã từ chối'
    };
    return texts[status] || status;
  };

  // Auto hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const requests = requestsData || [];

  return (
    <>
      {/* Success/Error Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          } text-white`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-relaxed">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Yêu cầu Giảng viên</h1>
        <p className="text-gray-600">Duyệt hoặc từ chối các yêu cầu trở thành giảng viên</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'Pending'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => setStatusFilter('Approved')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'Approved'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đã duyệt
        </button>
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'Rejected'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đã từ chối
        </button>
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === ''
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.requestid} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {request.user?.fullname || 'Người dùng'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.user?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ngày gửi: {new Date(request.submittedat).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Lĩnh vực giảng dạy:</h4>
                <p className="text-gray-900">{request.specialization || 'Chưa có'}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân:</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{request.requestdetails || 'Chưa có'}</p>
              </div>

              {/* Documents */}
              {request.documents && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tài liệu:</h4>
                  <div className="space-y-2">
                    {request.documents.cvUrl && (
                      <div>
                        <a
                          href={request.documents.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          CV (Ảnh)
                        </a>
                      </div>
                    )}
                    {request.documents.idCardUrl && (
                      <div>
                        <a
                          href={request.documents.idCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          CCCD
                        </a>
                      </div>
                    )}
                    {request.documents.certificateUrls && request.documents.certificateUrls.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Chứng chỉ:</p>
                        {request.documents.certificateUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-2 mb-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Chứng chỉ {index + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {request.status === 'Pending' && (
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(request.requestid)}
                    disabled={approveMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {approveMutation.isPending ? 'Đang xử lý...' : 'Duyệt'}
                  </button>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối yêu cầu</h3>
            <p className="text-gray-600 mb-4">
              Yêu cầu từ: <strong>{selectedRequest.user?.fullname}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Nhập lý do từ chối yêu cầu..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleReject(selectedRequest.requestid)}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default TeacherRequestsPage;

