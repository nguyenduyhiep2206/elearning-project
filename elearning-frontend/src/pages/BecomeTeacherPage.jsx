import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherRequestService, cloudinaryService, categoryService } from '../services';

const BecomeTeacherPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    teachingField: '',
    cvUrl: '',
    certificateUrls: [],
    idCardUrl: ''
  });
  const [uploading, setUploading] = useState({
    cv: false,
    certificates: false,
    idCard: false
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const queryClient = useQueryClient();

  // Kiểm tra user đã có yêu cầu chưa
  const { data: myRequest, isLoading: loadingRequest } = useQuery({
    queryKey: ['myTeacherRequest'],
    queryFn: async () => {
      const response = await teacherRequestService.getMyRequest();
      return response.data?.data || null;
    },
    enabled: isAuthenticated,
    // Refetch khi user quay lại trang
    refetchOnWindowFocus: true
  });

  // Fetch categories từ API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  const categories = categoriesData?.data?.data || categoriesData?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Nếu user đã là teacher, redirect
    if (user?.role === 'teacher') {
      navigate('/teacher/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Auto hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Submit request mutation - PHẢI ĐẶT TRƯỚC CÁC EARLY RETURN
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const response = await teacherRequestService.submitRequest(data);
      return response.data;
    },
    onSuccess: () => {
      setNotification({
        show: true,
        message: '🎉 Gửi yêu cầu thành công! Vui lòng chờ admin duyệt.',
        type: 'success'
      });
      // Reset form
      setFormData({
        bio: '',
        teachingField: '',
        cvUrl: '',
        certificateUrls: [],
        idCardUrl: ''
      });
      setErrors({});
      // Invalidate query để refetch yêu cầu mới
      queryClient.invalidateQueries(['myTeacherRequest']);
      // Tự động redirect sau 2 giây
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: (error) => {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.',
        type: 'error'
      });
    }
  });

  // Nếu đã có yêu cầu đang chờ duyệt
  if (myRequest && myRequest.status === 'Pending') {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu đang chờ duyệt</h2>
            <p className="text-gray-600 mb-6">
              Yêu cầu trở thành giảng viên của bạn đã được gửi và đang chờ admin duyệt. 
              Vui lòng kiên nhẫn chờ phản hồi.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <strong>Trạng thái:</strong> <span className="text-yellow-600 font-semibold">Đang chờ duyệt</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Ngày gửi:</strong> {new Date(myRequest.submittedat).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
    );
  }

  // Lấy lý do từ chối nếu có
  const rejectionReason = myRequest && myRequest.status === 'Rejected' 
    ? myRequest.requestdetails?.split('[Lý do từ chối:')[1]?.replace(']', '').trim() || null
    : null;

  // Upload file lên Cloudinary
  const uploadFile = async (file, type) => {
    try {
      // Lấy signed upload signature
      const signatureResponse = await cloudinaryService.getUploadSignature({
        folder: `elearning/teacher-requests/${type}`,
        resourceType: 'image' // Tất cả đều là ảnh (CV, chứng chỉ, CCCD)
      });

      const { signature, timestamp, folder, resourceType, apiKey, cloudName, uploadUrl } = 
        signatureResponse.data.data;

      // Tạo FormData để upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('resource_type', resourceType);
      formData.append('access_mode', 'public'); // Quan trọng: cho phép file có thể truy cập công khai

      // Upload lên Cloudinary
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Lỗi khi upload file');
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.secure_url || uploadResult.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - tất cả đều phải là ảnh
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, [type]: `${type === 'cv' ? 'CV' : type === 'idCard' ? 'CCCD' : 'Chứng chỉ'} phải là file ảnh` });
      return;
    }

    setUploading({ ...uploading, [type]: true });
    setErrors({ ...errors, [type]: null });

    try {
      const url = await uploadFile(file, type);
      
      if (type === 'cv') {
        setFormData({ ...formData, cvUrl: url });
      } else if (type === 'idCard') {
        setFormData({ ...formData, idCardUrl: url });
      } else if (type === 'certificates') {
        setFormData({ ...formData, certificateUrls: [...formData.certificateUrls, url] });
      }
    } catch (error) {
      setErrors({ ...errors, [type]: error.message || 'Lỗi khi upload file' });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  // Remove certificate
  const removeCertificate = (index) => {
    const newUrls = formData.certificateUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, certificateUrls: newUrls });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.bio.trim()) {
      newErrors.bio = 'Vui lòng nhập giới thiệu bản thân';
    }
    if (!formData.teachingField) {
      newErrors.teachingField = 'Vui lòng chọn lĩnh vực giảng dạy';
    }
    if (!formData.cvUrl) {
      newErrors.cvUrl = 'Vui lòng upload CV';
    }
    if (!formData.idCardUrl) {
      newErrors.idCardUrl = 'Vui lòng upload CCCD';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    submitMutation.mutate(formData);
  };

  if (loadingRequest) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
    );
  }

  return (
    <>
      {/* Success/Error Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md transform transition-all ${
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

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trở thành giảng viên</h1>
            <p className="text-gray-600 mb-8">
              Điền form đăng ký để trở thành giảng viên trên nền tảng của chúng tôi
            </p>

            {/* Hiển thị lý do từ chối nếu có */}
            {rejectionReason && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Yêu cầu trước đã bị từ chối
                    </h3>
                    <p className="text-sm text-red-700">
                      <strong>Lý do:</strong> {rejectionReason}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Vui lòng điều chỉnh và gửi lại yêu cầu mới.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu bản thân <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kinh nghiệm, sở trường, trình độ học vấn..."
                />
                {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
              </div>

              {/* Teaching Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực giảng dạy <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.teachingField}
                  onChange={(e) => setFormData({ ...formData, teachingField: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.teachingField ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={categories.length === 0}
                >
                  <option value="">-- Chọn lĩnh vực --</option>
                  {categories.map((category) => (
                    <option key={category.categoryid} value={category.categoryname}>
                      {category.categoryname}
                    </option>
                  ))}
                </select>
                {errors.teachingField && <p className="mt-1 text-sm text-red-500">{errors.teachingField}</p>}
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV (Ảnh) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'cv')}
                      className="hidden"
                      disabled={uploading.cv}
                    />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-lg text-center ${
                      formData.cvUrl 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-300 hover:border-teal-500'
                    } ${uploading.cv ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading.cv ? (
                        <span className="text-gray-600">Đang upload...</span>
                      ) : formData.cvUrl ? (
                        <span className="text-teal-600">✓ CV đã upload</span>
                      ) : (
                        <span className="text-gray-600">Chọn file ảnh</span>
                      )}
                    </div>
                  </label>
                </div>
                {errors.cvUrl && <p className="mt-1 text-sm text-red-500">{errors.cvUrl}</p>}
              </div>

              {/* Certificates Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chứng chỉ (Ảnh) - Tùy chọn
                </label>
                <div className="space-y-2">
                  {formData.certificateUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Chứng chỉ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'certificates')}
                      className="hidden"
                      disabled={uploading.certificates}
                    />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-lg text-center ${
                      uploading.certificates 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'border-gray-300 hover:border-teal-500'
                    }`}>
                      {uploading.certificates ? (
                        <span className="text-gray-600">Đang upload...</span>
                      ) : (
                        <span className="text-gray-600">+ Thêm chứng chỉ</span>
                      )}
                    </div>
                  </label>
                </div>
                {errors.certificates && <p className="mt-1 text-sm text-red-500">{errors.certificates}</p>}
              </div>

              {/* ID Card Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD (Ảnh) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'idCard')}
                      className="hidden"
                      disabled={uploading.idCard}
                    />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-lg text-center ${
                      formData.idCardUrl 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-300 hover:border-teal-500'
                    } ${uploading.idCard ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading.idCard ? (
                        <span className="text-gray-600">Đang upload...</span>
                      ) : formData.idCardUrl ? (
                        <span className="text-teal-600">✓ CCCD đã upload</span>
                      ) : (
                        <span className="text-gray-600">Chọn file ảnh CCCD</span>
                      )}
                    </div>
                  </label>
                </div>
                {errors.idCardUrl && <p className="mt-1 text-sm text-red-500">{errors.idCardUrl}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending ? 'Đang gửi...' : 'Gửi đăng ký'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeTeacherPage;
