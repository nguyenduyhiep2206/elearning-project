const cloudinary = require('../config/cloudinary.config');
const crypto = require('crypto');
const { lessons } = require('../models');

class CloudinaryService {
  /**
   * Tạo signed upload signature cho giảng viên upload trực tiếp lên Cloudinary
   * @param {Object} options - Tùy chọn: folder, resourceType, timestamp
   * @returns {Object} - Upload signature và các thông tin cần thiết
   */
  generateUploadSignature(options = {}) {
    try {
      const {
        folder = 'elearning/videos',
        resourceType = 'video',
        timestamp = Math.round(new Date().getTime() / 1000),
      } = options;

      // Tạo params để ký - CHỈ các params không phải file
      // Theo tài liệu Cloudinary, signature chỉ bao gồm các params ngoài file
      // LƯU Ý: resource_type KHÔNG cần trong signature vì nó đã có trong URL (/video/upload)
      const params = {};
      
      // Chỉ thêm folder nếu có
      if (folder) {
        params.folder = folder;
      }
      
      // Thêm timestamp (BẮT BUỘC)
      params.timestamp = timestamp;
      
      // KHÔNG thêm resource_type vào signature vì nó đã có trong URL

      // Tạo string để ký (theo thứ tự alphabet)
      // Format: key1=value1&key2=value2&timestamp=xxx
      const paramsString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

      // Tạo signature: SHA1(paramsString + api_secret)
      const signature = crypto
        .createHash('sha1')
        .update(paramsString + process.env.CLOUDINARY_API_SECRET)
        .digest('hex');

      // Log để debug (chỉ trong development)
      if (process.env.NODE_ENV !== 'production') {
        console.log('📝 Cloudinary Upload Signature:', {
          paramsString,
          signature,
          timestamp,
          folder,
          resourceType,
        });
      }

      return {
        signature,
        timestamp,
        folder,
        resourceType,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      };
    } catch (error) {
      console.error('Error generating upload signature:', error);
      throw new Error(`Lỗi khi tạo upload signature: ${error.message}`);
    }
  }

  /**
   * Lấy signed URL cho học viên xem video
   * @param {number} lessonId - ID của lesson
   * @param {number} userId - ID của user (để cache key)
   * @param {Object} options - Tùy chọn: expiresIn (giây)
   * @returns {Promise<Object>} - Signed URL và thông tin
   */
  async getLessonViewUrl(lessonId, userId, options = {}) {
    try {
      const { expiresIn = 3600 } = options; // Mặc định 1 giờ

      // Lấy lesson để lấy video URL
      const lesson = await lessons.findByPk(lessonId);
      if (!lesson || !lesson.videourl) {
        const error = new Error('Không tìm thấy video cho bài học này');
        error.statusCode = 404;
        throw error;
      }

      const videoUrl = lesson.videourl;

      // Kiểm tra xem có phải là Cloudinary URL không
      const cloudinaryRegex = /cloudinary\.com\/.*\/upload\/(?:v\d+\/)?(.+)/;
      const match = videoUrl.match(cloudinaryRegex);

      if (!match) {
        // Nếu không phải Cloudinary URL (YouTube, Vimeo, direct URL), trả về URL gốc
        return {
          url: videoUrl,
          isCloudinary: false,
          expiresAt: null,
        };
      }

      // Lấy public_id từ URL - cần extract đúng format
      // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
      const urlParts = videoUrl.split('/upload/');
      if (urlParts.length < 2) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      const afterUpload = urlParts[1];
      // Bỏ version nếu có (v123456/)
      const withoutVersion = afterUpload.replace(/^v\d+\//, '');
      // Lấy public_id (bỏ extension)
      const publicId = withoutVersion.split('.')[0];
      const resourceType = videoUrl.includes('/video/') ? 'video' : 'image';

      // Tạo signed URL với timestamp hết hạn
      const expiresAt = Math.round(new Date().getTime() / 1000) + expiresIn;

      // Tạo signed URL sử dụng cloudinary.url với sign_url: true
      // Cloudinary SDK sẽ tự động tạo signature khi sign_url: true
      const signedUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        sign_url: true,
        expires_at: expiresAt,
        type: 'upload',
      });

      return {
        url: signedUrl,
        isCloudinary: true,
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        expiresIn,
      };
    } catch (error) {
      console.error('Error getting lesson view URL:', error);
      throw error;
    }
  }

  /**
   * Tạo signature cho signed URL
   * @param {Object} params - Parameters
   * @returns {string} - Signature
   */
  generateSignedUrlSignature(params) {
    const { publicId, resourceType, timestamp, expiresIn } = params;
    
    // Tạo string để ký
    const toSign = `public_id=${publicId}&resource_type=${resourceType}&timestamp=${timestamp}`;
    
    // Tạo signature
    const signature = crypto
      .createHash('sha1')
      .update(toSign + process.env.CLOUDINARY_API_SECRET)
      .digest('hex');

    return signature;
  }
}

module.exports = new CloudinaryService();
