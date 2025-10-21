/**

 * Utility class for standardized API responses
 */
class ApiResponse {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {*} errors - Additional error details
   */
  error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode
    });
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  validationError(res, errors, message = 'Validation Error') {
    return res.status(400).json({
      success: false,
      message,
      errors,
      statusCode: 400
    });
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      message,
      statusCode: 401
    });
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  forbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message,
      statusCode: 403
    });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  notFound(res, message = 'Not Found') {
    return res.status(404).json({
      success: false,
      message,
      statusCode: 404
    });
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      statusCode: 200
    });
  }
}

module.exports = new ApiResponse();
