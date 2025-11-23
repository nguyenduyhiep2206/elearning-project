import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { teacherService, categoryService } from '../../services';

/**
 * MyCourses - Trang quản lý khóa học của teacher
 */
const MyCourses = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    categoryId: '',
    price: '',
    imageUrl: '',
    duration: '',
    level: '',
    language: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch courses
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['teacher', 'courses', page, statusFilter],
    queryFn: () => teacherService.getMyCourses({ page, limit: 10, status: statusFilter || undefined }),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  // Không cần fetch lại course khi edit, dùng dữ liệu đã có từ danh sách

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (courseId) => teacherService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'courses']);
      queryClient.invalidateQueries(['teacher', 'stats']);
      setNotification({ type: 'success', message: 'Xóa khóa học thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi xóa khóa học: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data) => teacherService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'courses']);
      queryClient.invalidateQueries(['teacher', 'stats']);
      setIsCreateModalOpen(false);
      resetForm();
      setNotification({ type: 'success', message: 'Tạo khóa học thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi tạo khóa học: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: (data) => teacherService.updateCourse(editingCourse?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'courses']);
      queryClient.invalidateQueries(['teacher', 'course', editingCourse?.id]);
      queryClient.invalidateQueries(['teacher', 'stats']);
      setIsEditModalOpen(false);
      setEditingCourse(null);
      resetForm();
      setNotification({ type: 'success', message: 'Cập nhật khóa học thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi cập nhật khóa học: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Populate form when edit modal opens - dùng dữ liệu từ course object đã lưu
  useEffect(() => {
    if (isEditModalOpen && editingCourse?.course) {
      // Dùng dữ liệu từ course object đã lưu khi mở modal
      const course = editingCourse.course;
      setFormData({
        courseName: course.coursename || '',
        description: course.description || '',
        categoryId: course.categoryid || '',
        price: course.price || '',
        imageUrl: course.imageurl || '',
        duration: course.duration || '',
        level: course.level || '',
        language: course.language || '',
      });
    } else if (!isEditModalOpen && !isCreateModalOpen) {
      // Reset form khi đóng modal
      resetForm();
    }
  }, [isEditModalOpen, editingCourse, isCreateModalOpen]);

  const categories = categoriesData?.data?.data || categoriesData?.data || [];

  const resetForm = () => {
    setFormData({
      courseName: '',
      description: '',
      categoryId: '',
      price: '',
      imageUrl: '',
      duration: '',
      level: '',
      language: '',
    });
    setFormErrors({});
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    // Lưu toàn bộ course object để có thể dùng ngay
    setEditingCourse({ 
      id: course.courseid || course.id,
      course: course // Lưu thêm course object để dùng ngay
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.courseName.trim()) errors.courseName = 'Tên khóa học không được để trống';
    if (!formData.description.trim()) errors.description = 'Mô tả không được để trống';
    if (!formData.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
    if (!formData.price || isNaN(formData.price) || formData.price < 0) {
      errors.price = 'Giá phải là số dương';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSubmit = {
      courseName: formData.courseName,
      description: formData.description,
      categoryId: parseInt(formData.categoryId),
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl || null,
      duration: formData.duration || null,
      level: formData.level || null,
      language: formData.language || null,
    };

    if (isEditModalOpen) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Approved':
        return 'Đã duyệt';
      case 'Pending':
        return 'Chờ duyệt';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      deleteMutation.mutate(courseId);
    }
  };

  // Parse courses data
  const coursesResult = coursesData?.data?.data || coursesData?.data || {};
  const courses = coursesResult.courses || [];
  const pagination = {
    totalPages: coursesResult.totalPages || 1,
    currentPage: coursesResult.currentPage || 1,
    totalCount: coursesResult.totalCount || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Lỗi khi tải dữ liệu: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.message && (
        <div
          className={`rounded-lg p-4 shadow-md ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Khóa học của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả khóa học bạn đã tạo</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Tổng số khóa học</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {courses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Bạn chưa có khóa học nào</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo khóa học mới
              </button>
            </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.courseid || course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {course.imageurl && (
                            <img
                              src={course.imageurl}
                              alt={course.coursename}
                              className="w-12 h-12 object-contain rounded-lg bg-gray-100"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{course.coursename}</p>
                            <p className="text-xs text-gray-500">ID: {course.courseid || course.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {course.category?.categoryname || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(course.price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                          {getStatusText(course.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(course)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(course.courseid || course.id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Tạo khóa học mới</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <CourseForm
                formData={formData}
                formErrors={formErrors}
                categories={categories}
                handleInputChange={handleInputChange}
              />
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa khóa học</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <CourseForm
                formData={formData}
                formErrors={formErrors}
                categories={categories}
                handleInputChange={handleInputChange}
              />
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Course Form Component (reusable for create and edit)
const CourseForm = ({ formData, formErrors, categories, handleInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Course Name */}
      <div className="md:col-span-2">
        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
          Tên khóa học <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="courseName"
          name="courseName"
          value={formData.courseName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${formErrors.courseName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
          placeholder="Nhập tên khóa học"
        />
        {formErrors.courseName && <p className="text-red-500 text-xs mt-1">{formErrors.courseName}</p>}
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
          placeholder="Nhập mô tả khóa học"
        />
        {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${formErrors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat) => (
            <option key={cat.categoryid || cat.id} value={cat.categoryid || cat.id}>
              {cat.categoryname || cat.categoryName}
            </option>
          ))}
        </select>
        {formErrors.categoryId && <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>}
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Giá (VND) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          min="0"
          step="1000"
          className={`w-full px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
          placeholder="0"
        />
        {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL hình ảnh
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Thời lượng
        </label>
        <input
          type="text"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="VD: 8 giờ"
        />
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
          Cấp độ
        </label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Chọn cấp độ</option>
          <option value="Beginner">Cơ bản</option>
          <option value="Intermediate">Trung bình</option>
          <option value="Advanced">Nâng cao</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Ngôn ngữ
        </label>
        <input
          type="text"
          id="language"
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="VD: Tiếng Việt"
        />
      </div>
    </div>
  );
};

export default MyCourses;

