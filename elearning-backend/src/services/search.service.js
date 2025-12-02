const { courses, categories, users } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

/**
 * Service xử lý tìm kiếm nâng cao với:
 * 1. Trigram Matching (pg_trgm) - Fuzzy search
 * 2. Text Normalization (unaccent) - Bỏ dấu tiếng Việt
 * 3. Weighted Ranking - Xếp hạng theo trọng số
 */
class SearchService {
  /**
   * Tìm kiếm khóa học với Trigram Matching, Text Normalization và Weighted Ranking
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise<Object>} - Kết quả tìm kiếm với courses, totalCount, totalPages, currentPage
   */
  async searchCourses(query, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Normalize query: bỏ dấu và chuyển về lowercase
      const normalizedQuery = query.trim().toLowerCase();
      
      // Raw SQL query với Trigram Matching và Weighted Ranking
      const searchQuery = `
        SELECT 
          c.*,
          -- Tính điểm tương đồng với Weighted Ranking
          (
            -- Khớp trong Tiêu đề: điểm x2
            (similarity(unaccent(lower(c.coursename)), unaccent(:normalizedQuery)) * 2) +
            -- Khớp trong Mô tả: điểm x1
            similarity(unaccent(lower(c.description)), unaccent(:normalizedQuery))
          ) AS search_score
        FROM courses c
        WHERE 
          -- Sử dụng Trigram Matching: similarity >= 0.1 (có thể điều chỉnh)
          (
            similarity(unaccent(lower(c.coursename)), unaccent(:normalizedQuery)) >= 0.1
            OR similarity(unaccent(lower(c.description)), unaccent(:normalizedQuery)) >= 0.1
          )
        ORDER BY search_score DESC, c.createdat DESC
        LIMIT :limit OFFSET :offset
      `;
      
      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        WHERE 
          (
            similarity(unaccent(lower(c.coursename)), unaccent(:normalizedQuery)) >= 0.1
            OR similarity(unaccent(lower(c.description)), unaccent(:normalizedQuery)) >= 0.1
          )
      `;
      
      // Execute queries
      const results = await sequelize.query(searchQuery, {
        replacements: {
          normalizedQuery,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        type: sequelize.QueryTypes.SELECT
      });
      
      const countResults = await sequelize.query(countQuery, {
        replacements: { normalizedQuery },
        type: sequelize.QueryTypes.SELECT
      });
      
      const totalCount = parseInt(countResults[0]?.total || 0);
      
      // Lấy course IDs từ kết quả
      const courseIds = results.map(r => r.courseid);
      
      // Nếu không có kết quả, trả về empty
      if (courseIds.length === 0) {
        return {
          courses: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: parseInt(page)
        };
      }
      
      // Tạo map để lưu search_score
      const scoreMap = new Map(results.map(r => [r.courseid, r.search_score]));
      
      // Lấy đầy đủ thông tin courses với includes
      const courseRows = await courses.findAll({
        where: {
          courseid: {
            [Op.in]: courseIds
          }
        },
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname']
          }
        ]
      });
      
      // Sắp xếp lại theo thứ tự search_score (giữ nguyên thứ tự từ SQL query)
      const courseMap = new Map(courseRows.map(c => [c.courseid, c]));
      const sortedCourses = courseIds
        .map(id => courseMap.get(id))
        .filter(c => c !== undefined);
      
      // Thêm search_score vào mỗi course
      const coursesWithScore = sortedCourses.map((course) => {
        const courseData = course.toJSON();
        courseData.search_score = scoreMap.get(course.courseid) || 0;
        return courseData;
      });
      
      return {
        courses: coursesWithScore,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Error in searchCourses:', error);
      
      // Fallback về tìm kiếm đơn giản nếu extensions chưa được enable
      if (error.message.includes('function similarity') || error.message.includes('unaccent')) {
        console.warn('Extensions chưa được enable, sử dụng tìm kiếm đơn giản');
        return this._fallbackSearchCourses(query, page, limit);
      }
      
      throw new Error(`Lỗi khi tìm kiếm khóa học: ${error.message}`);
    }
  }
  
  /**
   * Fallback search method nếu extensions chưa được enable
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise<Object>} - Kết quả tìm kiếm
   */
  async _fallbackSearchCourses(query, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await courses.findAndCountAll({
        where: {
          [Op.or]: [
            { coursename: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdat', 'DESC']]
      });
      
      return {
        courses: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Error in _fallbackSearchCourses:', error);
      throw new Error(`Lỗi khi tìm kiếm khóa học: ${error.message}`);
    }
  }
}

module.exports = new SearchService();

