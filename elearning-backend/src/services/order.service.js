const { sequelize, orders, orderdetails, cart, courses, enrollments } = require('../models');
const { Op } = require('sequelize');
const { validatePromotionCode } = require('./promotion.service');

/**
 * Tạo một đơn hàng từ giỏ hàng của người dùng.
 * @param {number} userId - ID người dùng.
 * @param {string|null} promotionCode - Áp dụng mã khuyến mại.
 */
const createOrderFromCart = async (userId, promotionCode = null) => {
  const t = await sequelize.transaction();
  try {
    const cartItems = await cart.findAll({
      where: { userid: userId },
      include: [{ model: courses, as: 'course' }],
      transaction: t,
    });

    if (cartItems.length === 0) {
      throw new Error('Giỏ hàng của bạn đang trống.');
    }

    const originalTotal = cartItems.reduce((sum, item) => sum + item.course.price, 0);
    let finalTotal = originalTotal;
    let discountPercentage = 0;
    let promotionId = null;
    let discountedAmount = 0;

    // Nếu có mã khuyến mãi, xác thực và tính toán lại tổng tiền
    if (promotionCode) {
        const promotion = await validatePromotionCode(promotionCode);
        promotionId = promotion.promotionid;
        discountPercentage = promotion.discountpercentage;
        discountedAmount = Math.round(originalTotal * (discountPercentage / 100) * 100) / 100; // Làm tròn 2 chữ số thập phân
        finalTotal = Math.round((originalTotal - discountedAmount) * 100) / 100; // Làm tròn 2 chữ số thập phân
    }

    // Tạo order với status 'Pending' - sẽ được cập nhật thành 'Completed' khi thanh toán thành công
    // Sử dụng thời gian hiện tại với timezone Việt Nam
    const now = new Date();
    const newOrder = await orders.create({
      userid: userId,
      totalamount: finalTotal, // Sử dụng tổng tiền cuối cùng
      status: 'Pending',
      promotionid: promotionId,
      discountedamount: discountedAmount,
      createdat: now, // Set thời gian tạo rõ ràng
    }, { transaction: t });

    // Tạo orderdetails từ các items trong giỏ hàng
    const orderDetailsData = cartItems.map(item => ({
        orderid: newOrder.orderid,
        courseid: item.courseid,
        price: item.course.price,
    }));
    await orderdetails.bulkCreate(orderDetailsData, { transaction: t });

    // KHÔNG xóa giỏ hàng ở đây - chỉ xóa khi thanh toán thành công
    // Nếu user hủy thanh toán, giỏ hàng vẫn còn để có thể thử lại
    
    await t.commit();
    return newOrder;
  } catch (error) {
    await t.rollback();
    throw new Error(`Không thể tạo đơn hàng: ${error.message}`);
  }
};

/**
 * Lấy lịch sử đơn hàng của một người dùng.
 */
const getOrdersByUserId = async (userId) => {
  return await orders.findAll({
    where: { userid: userId },
    include: {
      model: orderdetails,
      as: 'orderdetails', // Alias từ association
      include: {
        model: courses,
        as: 'course', // Alias từ association
        attributes: ['coursename', 'imageurl'],
      },
    },
    order: [['createdat', 'DESC']],
  });
};

const getOrderById = async (orderId, userId) => {
  const order = await orders.findOne({
    where: { 
      orderid: orderId,
      userid: userId // Đảm bảo người dùng chỉ xem được đơn hàng của chính họ
    },
    include: {
      model: orderdetails,
      as: 'orderdetails',
      include: {
        model: courses,
        as: 'course',
        attributes: ['coursename', 'imageurl'],
      },
    },
  });

  if (!order) {
    throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.');
  }

  return order;
};

/**
 * Cập nhật trạng thái đơn hàng và tạo enrollments nếu status = 'Completed'
 * @param {number} orderId - ID đơn hàng
 * @param {string} status - Trạng thái mới ('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled')
 * @returns {Promise<Object>} - Đơn hàng đã được cập nhật
 */
const updateOrderStatus = async (orderId, status) => {
  const t = await sequelize.transaction();
  try {
    const order = await orders.findByPk(orderId, {
      include: [
        {
          model: orderdetails,
          as: 'orderdetails',
          attributes: ['courseid'],
        },
      ],
      transaction: t,
    });

    if (!order) {
      throw new Error('Đơn hàng không tồn tại.');
    }

    // Cập nhật trạng thái đơn hàng
    await order.update({ status }, { transaction: t });

    // Nếu status = 'Completed', tạo enrollments và xóa giỏ hàng
    if (status === 'Completed') {
      const userId = order.userid;
      const courseIds = order.orderdetails.map(od => od.courseid);

      // Tạo enrollments cho từng khóa học (tránh trùng lặp)
      for (const courseId of courseIds) {
        // Kiểm tra xem đã có enrollment chưa
        const existingEnrollment = await enrollments.findOne({
          where: {
            studentid: userId,
            courseid: courseId,
          },
          transaction: t,
        });

        // Nếu chưa có, tạo mới
        if (!existingEnrollment) {
          await enrollments.create(
            {
              studentid: userId,
              courseid: courseId,
              enrolledat: new Date(),
            },
            { transaction: t }
          );
        }
      }

      // Xóa giỏ hàng chỉ khi thanh toán thành công
      // Lấy danh sách courseId từ order để xóa đúng các items trong giỏ hàng
      await cart.destroy({
        where: {
          userid: userId,
          courseid: {
            [Op.in]: courseIds, // Xóa các khóa học đã thanh toán thành công
          },
        },
        transaction: t,
      });
    }

    await t.commit();
    return order;
  } catch (error) {
    await t.rollback();
    throw new Error(`Không thể cập nhật trạng thái đơn hàng: ${error.message}`);
  }
};

/**
 * Hủy đơn hàng (chỉ user sở hữu mới được hủy)
 * @param {number} orderId - ID đơn hàng
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object>} - Đơn hàng đã được hủy
 */
const cancelOrder = async (orderId, userId) => {
  const order = await orders.findOne({
    where: {
      orderid: orderId,
      userid: userId,
    },
  });

  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền hủy đơn hàng này.');
  }

  // Chỉ cho phép hủy đơn hàng có trạng thái Pending
  if (order.status !== 'Pending') {
    throw new Error(`Không thể hủy đơn hàng với trạng thái: ${order.status}`);
  }

  // Cập nhật trạng thái thành Cancelled
  await order.update({ status: 'Cancelled' });
  return order;
};

module.exports = {
  createOrderFromCart,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};