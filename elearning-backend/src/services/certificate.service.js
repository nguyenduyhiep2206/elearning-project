const { certificates, coursecompletions, users, courses, userdetails } = require('../models');
const { Op } = require('sequelize');
const blockchainService = require('./blockchainService');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class CertificateService {
  /**
   * Kiểm tra xem sinh viên đã hoàn thành khóa học chưa
   * @param {number} studentId - ID của sinh viên
   * @param {number} courseId - ID của khóa học
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
      console.error('Error checking course completion:', error);
      throw error;
    }
  }

  /**
   * Tạo metadata JSON cho certificate
   * @param {number} certificateId - ID của certificate
   * @param {Object} student - Thông tin sinh viên
   * @param {Object} course - Thông tin khóa học
   * @returns {Promise<string>} - URL của metadata file
   */
  async createCertificateMetadata(certificateId, student, course) {
    try {
      const metadata = {
        name: `Academic Certificate - ${course.coursename}`,
        description: `This certificate is awarded to ${student.fullname} for successfully completing the course "${course.coursename}"`,
        image: course.imageurl || '', // URL của hình ảnh certificate
        attributes: [
          {
            trait_type: "Student Name",
            value: student.fullname
          },
          {
            trait_type: "Student Email",
            value: student.email
          },
          {
            trait_type: "Course Name",
            value: course.coursename
          },
          {
            trait_type: "Course ID",
            value: course.courseid.toString()
          },
          {
            trait_type: "Certificate ID",
            value: certificateId.toString()
          },
          {
            trait_type: "Issue Date",
            value: new Date().toISOString()
          }
        ],
        external_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/${certificateId}`
      };

      // Tạo thư mục metadata nếu chưa có
      const metadataDir = path.join(__dirname, '../../public/metadata');
      await fs.mkdir(metadataDir, { recursive: true });

      // Lưu metadata vào file
      const metadataPath = path.join(metadataDir, `certificate-${certificateId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // Trả về URL của metadata
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      return `${baseUrl}/metadata/certificate-${certificateId}.json`;
    } catch (error) {
      console.error('Error creating certificate metadata:', error);
      throw error;
    }
  }

  /**
   * Issue certificate cho sinh viên
   * @param {number} studentId - ID của sinh viên
   * @param {number} courseId - ID của khóa học
   * @param {string} studentWalletAddress - Địa chỉ ví của sinh viên
   * @returns {Promise<Object>}
   */
  async issueCertificate(studentId, courseId, studentWalletAddress) {
    try {
      // 1. Kiểm tra xem sinh viên đã hoàn thành khóa học chưa
      const isCompleted = await this.checkCourseCompletion(studentId, courseId);
      if (!isCompleted) {
        throw new Error('Student has not completed the course yet');
      }

      // 2. Kiểm tra xem đã có certificate chưa
      const existingCertificate = await certificates.findOne({
        where: {
          studentid: studentId,
          courseid: courseId
        }
      });

      if (existingCertificate) {
        // Nếu đã có certificate nhưng chưa mint trên blockchain
        if (!existingCertificate.transactionhash) {
          // Lấy thông tin student và course
          const student = await users.findByPk(studentId);
          const course = await courses.findByPk(courseId);

          if (!student || !course) {
            throw new Error('Student or course not found');
          }

          // Tạo metadata
          const metadataUrl = await this.createCertificateMetadata(
            existingCertificate.certificateid,
            student,
            course
          );

          // Mint trên blockchain
          const blockchainResult = await blockchainService.mintCertificateOnChain(
            studentWalletAddress,
            metadataUrl,
            existingCertificate.certificateid
          );

          // Cập nhật certificate với transaction hash và token ID
          await existingCertificate.update({
            transactionhash: blockchainResult.transactionHash,
            tokenid: blockchainResult.tokenId
          });

          return {
            certificate: existingCertificate,
            transactionHash: blockchainResult.transactionHash,
            tokenId: blockchainResult.tokenId
          };
        } else {
          throw new Error('Certificate already issued and minted on blockchain');
        }
      }

      // 3. Lấy thông tin student và course
      const student = await users.findByPk(studentId, {
        include: [{
          model: userdetails,
          as: 'userdetails',
          required: false
        }]
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // 3.1. Kiểm tra wallet address có khớp với student không
      let studentWalletInDB = null;
      if (student.userdetails) {
        if (Array.isArray(student.userdetails) && student.userdetails.length > 0) {
          studentWalletInDB = student.userdetails[0].walletaddress;
        } else if (student.userdetails.walletaddress) {
          studentWalletInDB = student.userdetails.walletaddress;
        }
      }

      // Nếu student có wallet address trong DB, phải khớp với wallet được truyền vào
      if (studentWalletInDB && studentWalletInDB.toLowerCase() !== studentWalletAddress.toLowerCase()) {
        throw new Error('Wallet address không khớp với địa chỉ ví đã đăng ký của học viên. Vui lòng sử dụng đúng địa chỉ ví đã đăng ký.');
      }

      // 3.2. Kiểm tra wallet address có được sử dụng bởi user khác không
      const walletOwner = await userdetails.findOne({
        where: {
          walletaddress: studentWalletAddress
        }
      });

      if (walletOwner && walletOwner.userid !== parseInt(studentId)) {
        throw new Error('Địa chỉ ví này đã được sử dụng bởi tài khoản khác. Mỗi địa chỉ ví chỉ có thể được liên kết với một tài khoản để đảm bảo tính duy nhất của chứng chỉ.');
      }

      const course = await courses.findByPk(courseId);

      if (!course) {
        throw new Error('Course not found');
      }

      // 4. Tạo certificate trong database
      const certificate = await certificates.create({
        studentid: studentId,
        courseid: courseId,
        issuedat: new Date()
      });

      // 5. Tạo metadata JSON
      const metadataUrl = await this.createCertificateMetadata(
        certificate.certificateid,
        student,
        course
      );

      // 6. Mint certificate trên blockchain
      const blockchainResult = await blockchainService.mintCertificateOnChain(
        studentWalletAddress,
        metadataUrl,
        certificate.certificateid
      );

      // 7. Cập nhật certificate với transaction hash và token ID
      await certificate.update({
        transactionhash: blockchainResult.transactionHash,
        tokenid: blockchainResult.tokenId
      });

      return {
        certificate: certificate,
        transactionHash: blockchainResult.transactionHash,
        tokenId: blockchainResult.tokenId,
        metadataUrl: metadataUrl
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách certificates của sinh viên
   * @param {number} studentId - ID của sinh viên
   * @returns {Promise<Array>}
   */
  async getStudentCertificates(studentId) {
    try {
      const studentCerts = await certificates.findAll({
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

      return studentCerts;
    } catch (error) {
      console.error('Error getting student certificates:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả certificates (cho admin)
   * @param {Object} options - Filter options (studentId, courseId, search, page, limit)
   * @returns {Promise<Object>}
   */
  async getAllCertificates(options = {}) {
    try {
      const {
        studentId,
        courseId,
        search,
        page = 1,
        limit = 20,
        sortBy = 'issuedat',
        sortOrder = 'DESC'
      } = options;

      const where = {};
      if (studentId) {
        where.studentid = parseInt(studentId);
      }
      if (courseId) {
        where.courseid = parseInt(courseId);
      }

      const include = [
        {
          model: users,
          as: 'student',
          attributes: ['userid', 'fullname', 'email'],
          required: false
        },
        {
          model: courses,
          as: 'course',
          attributes: ['courseid', 'coursename', 'description', 'imageurl'],
          required: false
        }
      ];

      // Search by student name or course name
      if (search) {
        include[0].where = {
          [Op.or]: [
            { fullname: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        };
        include[1].where = {
          coursename: { [Op.like]: `%${search}%` }
        };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await certificates.findAndCountAll({
        where,
        include,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      return {
        certificates: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error getting all certificates:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin certificate theo ID
   * @param {number} certificateId - ID của certificate
   * @returns {Promise<Object>}
   */
  async getCertificateById(certificateId) {
    try {
      const certificate = await certificates.findByPk(certificateId, {
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email'],
            include: [
              {
                model: userdetails,
                as: 'userdetails',
                attributes: ['walletaddress'],
                required: false
              }
            ]
          },
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'description', 'imageurl']
          }
        ]
      });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      return certificate;
    } catch (error) {
      console.error('Error getting certificate by ID:', error);
      throw error;
    }
  }

  /**
   * Học viên tự mint lại chứng chỉ của mình (nếu đã có wallet address)
   * @param {number} certificateId - ID của certificate
   * @param {number} studentId - ID của học viên (để verify quyền sở hữu)
   * @returns {Promise<Object>}
   */
  async studentMintCertificate(certificateId, studentId) {
    try {
      // 1. Lấy thông tin certificate
      const certificate = await certificates.findByPk(certificateId, {
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email'],
            include: [
              {
                model: userdetails,
                as: 'userdetails',
                attributes: ['walletaddress'],
                required: false
              }
            ]
          },
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'description', 'imageurl']
          }
        ]
      });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // 2. Kiểm tra quyền sở hữu
      if (certificate.studentid !== studentId) {
        throw new Error('Bạn không có quyền phát hành chứng chỉ này');
      }

      // 3. Kiểm tra xem đã được mint chưa
      // Nếu có transactionhash VÀ tokenid thì đã mint thành công
      if (certificate.transactionhash && certificate.tokenid) {
        throw new Error('Chứng chỉ đã được phát hành trên blockchain rồi');
      }
      
      // Nếu có transactionhash nhưng không có tokenid, thử query lại từ blockchain
      if (certificate.transactionhash && !certificate.tokenid) {
        console.log(`[Student Mint] Certificate ${certificateId} has transaction hash but no token ID. Attempting to retrieve...`);
        try {
          const blockchainService = require('./blockchainService');
          const tokenIdFromContract = await blockchainService.getTokenIdByCertificateId(certificateId);
          if (tokenIdFromContract && tokenIdFromContract !== '0') {
            // Cập nhật tokenid vào database
            await certificate.update({ tokenid: tokenIdFromContract });
            console.log(`[Student Mint] ✅ Successfully retrieved Token ID ${tokenIdFromContract} for certificate ${certificateId}`);
            throw new Error('Chứng chỉ đã được phát hành trên blockchain rồi');
          }
        } catch (queryError) {
          // Nếu query thất bại, có thể transaction chưa hoàn tất hoặc có vấn đề
          // Cho phép mint lại
          console.warn(`[Student Mint] Could not retrieve Token ID: ${queryError.message}. Allowing re-mint.`);
        }
      }

      // 4. Lấy wallet address từ userdetails
      let walletAddress = null;
      if (certificate.student?.userdetails) {
        if (Array.isArray(certificate.student.userdetails) && certificate.student.userdetails.length > 0) {
          walletAddress = certificate.student.userdetails[0].walletaddress;
        } else if (certificate.student.userdetails.walletaddress) {
          walletAddress = certificate.student.userdetails.walletaddress;
        }
      }

      if (!walletAddress) {
        throw new Error('Bạn chưa cập nhật địa chỉ ví. Vui lòng cập nhật địa chỉ ví trong phần Cài đặt tài khoản trước.');
      }

      // 5. Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error('Địa chỉ ví không hợp lệ. Vui lòng kiểm tra lại.');
      }

      // 6. Tạo metadata
      const metadataUrl = await this.createCertificateMetadata(
        certificate.certificateid,
        certificate.student,
        certificate.course
      );

      // 7. Mint trên blockchain
      const blockchainResult = await blockchainService.mintCertificateOnChain(
        walletAddress,
        metadataUrl,
        certificate.certificateid
      );

      // 8. Cập nhật certificate với transaction hash và token ID
      // Chỉ cập nhật tokenid nếu có (có thể null nếu không parse được)
      const updateData = {
        transactionhash: blockchainResult.transactionHash
      };
      
      if (blockchainResult.tokenId) {
        updateData.tokenid = blockchainResult.tokenId;
      } else {
        console.warn(`[Student Mint] Certificate ${certificate.certificateid} minted but Token ID not found. Transaction Hash: ${blockchainResult.transactionHash}`);
        console.warn(`   Token ID will be retrieved later or can be queried from contract.`);
      }
      
      await certificate.update(updateData);

      // 9. Tạo notification cho học viên
      const { notifications } = require('../models');
      await notifications.create({
        userid: studentId,
        message: `Chúc mừng! Chứng chỉ của bạn đã được phát hành thành công trên blockchain. Token ID: ${blockchainResult.tokenId}`,
        isread: false,
        createdat: new Date()
      });

      return {
        certificate: certificate,
        transactionHash: blockchainResult.transactionHash,
        tokenId: blockchainResult.tokenId,
        metadataUrl: metadataUrl
      };
    } catch (error) {
      console.error('Error in studentMintCertificate:', error);
      throw error;
    }
  }

  /**
   * Tạo PDF certificate
   * @param {number} certificateId - ID của certificate
   * @param {Object} student - Thông tin sinh viên
   * @param {Object} course - Thông tin khóa học
   * @param {Date} issueDate - Ngày cấp
   * @returns {Promise<string>} - Đường dẫn đến file PDF
   */
  async generatePDFCertificate(certificateId, student, course, issueDate) {
    try {
      // Tạo thư mục certificates nếu chưa có
      const certificatesDir = path.join(__dirname, '../../public/certificates');
      await fs.mkdir(certificatesDir, { recursive: true });

      const pdfPath = path.join(certificatesDir, `certificate-${certificateId}.pdf`);

      // Tạo PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape', // Chứng chỉ thường là landscape
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe PDF vào file
      const stream = fsSync.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f8f9fa');

      // Border
      doc.strokeColor('#2c3e50')
         .lineWidth(5)
         .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .stroke();

      // Inner border
      doc.strokeColor('#3498db')
         .lineWidth(2)
         .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
         .stroke();

      // Title
      doc.fontSize(36)
         .fillColor('#2c3e50')
         .font('Helvetica-Bold')
         .text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', {
           align: 'center',
           y: 120
         });

      // Subtitle
      doc.fontSize(20)
         .fillColor('#7f8c8d')
         .font('Helvetica')
         .text('CERTIFICATE OF COMPLETION', {
           align: 'center',
           y: 170
         });

      // Certificate ID
      doc.fontSize(12)
         .fillColor('#95a5a6')
         .font('Helvetica-Oblique')
         .text(`Mã chứng chỉ: #${certificateId}`, {
           align: 'center',
           y: 220
         });

      // Award text
      doc.fontSize(18)
         .fillColor('#34495e')
         .font('Helvetica')
         .text('Đây là để chứng nhận rằng', {
           align: 'center',
           y: 280
         });

      // Student name
      doc.fontSize(32)
         .fillColor('#2c3e50')
         .font('Helvetica-Bold')
         .text(student.fullname.toUpperCase(), {
           align: 'center',
           y: 320
         });

      // Completion text
      doc.fontSize(18)
         .fillColor('#34495e')
         .font('Helvetica')
         .text('đã hoàn thành thành công khóa học', {
           align: 'center',
           y: 380
         });

      // Course name
      doc.fontSize(24)
         .fillColor('#2980b9')
         .font('Helvetica-Bold')
         .text(course.coursename, {
           align: 'center',
           y: 420,
           width: doc.page.width - 200
         });

      // Issue date
      const formattedDate = new Date(issueDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
         .fillColor('#7f8c8d')
         .font('Helvetica')
         .text(`Ngày cấp: ${formattedDate}`, {
           align: 'center',
           y: doc.page.height - 150
         });

      // Footer
      doc.fontSize(10)
         .fillColor('#95a5a6')
         .font('Helvetica-Oblique')
         .text('Chứng chỉ này được phát hành trên blockchain', {
           align: 'center',
           y: doc.page.height - 100
         });

      // Signature line (nếu có)
      const signatureY = doc.page.height - 80;
      doc.moveTo(150, signatureY)
         .lineTo(350, signatureY)
         .strokeColor('#2c3e50')
         .lineWidth(1)
         .stroke();

      doc.fontSize(10)
         .fillColor('#7f8c8d')
         .font('Helvetica')
         .text('Chữ ký', 150, signatureY + 5, { width: 200, align: 'center' });

      // End PDF
      doc.end();

      // Đợi stream hoàn thành
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      throw new Error(`Lỗi khi tạo PDF chứng chỉ: ${error.message}`);
    }
  }

  /**
   * Lấy đường dẫn PDF certificate (tạo mới nếu chưa có)
   * @param {number} certificateId - ID của certificate
   * @returns {Promise<string>} - Đường dẫn đến file PDF
   */
  async getPDFCertificatePath(certificateId) {
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
            attributes: ['courseid', 'coursename', 'description']
          }
        ]
      });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const pdfPath = path.join(__dirname, '../../public/certificates', `certificate-${certificateId}.pdf`);

      // Kiểm tra xem PDF đã tồn tại chưa
      try {
        await fs.access(pdfPath);
        return pdfPath; // PDF đã tồn tại
      } catch {
        // PDF chưa tồn tại, tạo mới
        return await this.generatePDFCertificate(
          certificateId,
          certificate.student,
          certificate.course,
          certificate.issuedat || new Date()
        );
      }
    } catch (error) {
      console.error('Error getting PDF certificate path:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();

