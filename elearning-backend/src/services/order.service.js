const { sequelize, orders, orderdetails, cart, courses } = require('../models');
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

    // Nếu có mã khuyến mãi, xác thực và tính toán lại tổng tiền
    if (promotionCode) {
        const promotion = await validatePromotionCode(promotionCode);
        discountPercentage = promotion.discountpercentage;
        finalTotal = originalTotal * (1 - discountPercentage / 100);
    }

    const newOrder = await orders.create({
      userid: userId,
      totalamount: finalTotal, // Sử dụng tổng tiền cuối cùng
      status: 'Completed',
    }, { transaction: t });

    // ... code tạo orderdetails và xóa cart giữ nguyên ...
    const orderDetailsData = cartItems.map(item => ({
        orderid: newOrder.orderid,
        courseid: item.courseid,
        price: item.course.price,
    }));
    await orderdetails.bulkCreate(orderDetailsData, { transaction: t });

    await cart.destroy({
      where: { userid: userId },
      transaction: t,
    });
    
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

module.exports = {
  createOrderFromCart,
  getOrdersByUserId,
  getOrderById
};