const { certificates, coursecompletions, users, courses } = require('../models');
const blockchainService = require('./blockchainService');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class CertificateService {
  /**
   * Kiểm tra xem sinh viên đã hoàn thành khóa học chưa
   * @param {number} studentId - ID sinh viên
   * @param {number} courseId - ID khóa học
   * @returns {Promise<boolean>}
   */
  async checkCourseCompletion(studentId, courseId) {
    try {
      const completion = await coursecompletions.findOne({
        where: {
          studentid: studentId,
          courseid: courseId
        }
      });

      return !!completion;
    } catch (error) {
      console.error('Lỗi khi kiểm tra course completion:', error);
      throw new Error(`Không thể kiểm tra trạng thái hoàn thành khóa học: ${error.message}`);
    }
  }

  /**
   * Tạo file metadata JSON cho chứng chỉ
   * @param {Object} certificateData - Dữ liệu chứng chỉ
   * @returns {Promise<string>} - URL hoặc path đến file metadata
   */
  async createMetadataJSON(certificateData) {
    try {
      const { studentId, courseId, certificateId, issuedAt } = certificateData;

      // Lấy thông tin sinh viên và khóa học
      const student = await users.findByPk(studentId, {
        attributes: ['userid', 'fullname', 'email']
      });

      const course = await courses.findByPk(courseId, {
        attributes: ['courseid', 'coursename', 'description', 'level', 'duration']
      });

      if (!student) {
        throw new Error('Không tìm thấy thông tin sinh viên');
      }

      if (!course) {
        throw new Error('Không tìm thấy thông tin khóa học');
      }

      // Tạo metadata theo chuẩn ERC721 Metadata JSON Schema
      const metadata = {
        name: `Chứng chỉ ${course.coursename}`,
        description: `Chứng chỉ hoàn thành khóa học ${course.coursename} được cấp cho ${student.fullname}`,
        image: process.env.CERTIFICATE_IMAGE_URL || 'https://via.placeholder.com/800x600?text=Certificate',
        attributes: [
          {
            trait_type: 'Student Name',
            value: student.fullname
          },
          {
            trait_type: 'Student Email',
            value: student.email
          },
          {
            trait_type: 'Course Name',
            value: course.coursename
          },
          {
            trait_type: 'Course Level',
            value: course.level || 'N/A'
          },
          {
            trait_type: 'Course Duration',
            value: course.duration || 'N/A'
          },
          {
            trait_type: 'Issue Date',
            value: issuedAt || new Date().toISOString()
          },
          {
            trait_type: 'Certificate ID',
            value: certificateId.toString()
          }
        ],
        external_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates/${certificateId}`,
        properties: {
          certificateId: certificateId,
          studentId: studentId,
          courseId: courseId,
          issuedAt: issuedAt || new Date().toISOString()
        }
      };

      // Lưu metadata vào file hoặc upload lên IPFS/server
      // Tạm thời lưu vào thư mục public/certificates
      const metadataDir = path.join(__dirname, '../../public/certificates');
      
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }

      const metadataFileName = `certificate-${certificateId}.json`;
      const metadataFilePath = path.join(metadataDir, metadataFileName);
      
      fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));

      // Trả về URL đến file metadata
      // Trong production, nên upload lên IPFS hoặc CDN
      const metadataUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/certificates/${metadataFileName}`;
      
      return metadataUrl;
    } catch (error) {
      console.error('Lỗi khi tạo metadata JSON:', error);
      throw new Error(`Không thể tạo metadata: ${error.message}`);
    }
  }

  /**
   * Issue certificate cho sinh viên
   * @param {number} studentId - ID sinh viên
   * @param {number} courseId - ID khóa học
   * @param {string} walletAddress - Địa chỉ ví của sinh viên
   * @returns {Promise<Object>} - Thông tin certificate đã được tạo
   */
  async issueCertificate(studentId, courseId, walletAddress) {
    try {
      // 1. Kiểm tra xem sinh viên đã hoàn thành khóa học chưa
      const hasCompleted = await this.checkCourseCompletion(studentId, courseId);
      if (!hasCompleted) {
        throw new Error('Sinh viên chưa hoàn thành khóa học');
      }

      // 2. Kiểm tra xem certificate đã tồn tại chưa
      const existingCertificate = await certificates.findOne({
        where: {
          studentid: studentId,
          courseid: courseId
        }
      });

      if (existingCertificate) {
        if (existingCertificate.isminted) {
          throw new Error('Chứng chỉ đã được cấp và mint lên blockchain');
        }
        // Nếu đã có nhưng chưa mint, có thể tiếp tục mint
      }

      // 3. Tạo hoặc lấy certificate record
      let certificate;
      if (existingCertificate) {
        certificate = existingCertificate;
      } else {
        certificate = await certificates.create({
          studentid: studentId,
          courseid: courseId,
          issuedat: new Date(),
          walletaddress: walletAddress,
          isminted: false
        });
      }

      // 4. Tạo metadata JSON
      const metadataUrl = await this.createMetadataJSON({
        studentId,
        courseId,
        certificateId: certificate.certificateid,
        issuedAt: certificate.issuedat
      });

      // 5. Mint certificate lên blockchain
      const { tokenId, transactionHash } = await blockchainService.mintCertificateOnChain(
        walletAddress,
        metadataUrl,
        certificate.certificateid
      );

      // 6. Cập nhật thông tin blockchain vào database
      certificate.tokenid = tokenId;
      certificate.transactionhash = transactionHash;
      certificate.metadatauri = metadataUrl;
      certificate.isminted = true;
      await certificate.save();

      // 7. Lấy thông tin đầy đủ để trả về
      const certificateWithDetails = await certificates.findByPk(certificate.certificateid, {
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email']
          },
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'description']
          }
        ]
      });

      return certificateWithDetails;
    } catch (error) {
      console.error('Lỗi khi issue certificate:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách certificates của sinh viên
   * @param {number} studentId - ID sinh viên
   * @returns {Promise<Array>}
   */
  async getCertificatesByStudent(studentId) {
    try {
      const studentCertificates = await certificates.findAll({
        where: {
          studentid: studentId
        },
        include: [
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'description', 'imageurl']
          }
        ],
        order: [['issuedat', 'DESC']]
      });

      return studentCertificates;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách certificates:', error);
      throw new Error(`Không thể lấy danh sách chứng chỉ: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin certificate theo ID
   * @param {number} certificateId - ID chứng chỉ
   * @returns {Promise<Object>}
   */
  async getCertificateById(certificateId) {
    try {
      const certificate = await certificates.findByPk(certificateId, {
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email']
          },
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'description', 'imageurl']
          }
        ]
      });

      if (!certificate) {
        throw new Error('Không tìm thấy chứng chỉ');
      }

      return certificate;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin certificate:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();

