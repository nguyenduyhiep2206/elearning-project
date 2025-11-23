import React from 'react';

/**
 * StatCard - Component hiển thị thẻ thống kê
 * @param {string} title - Tiêu đề của thẻ
 * @param {number|string} value - Giá trị thống kê
 * @param {string} icon - Icon SVG hoặc emoji
 * @param {string} color - Màu sắc của thẻ (bg-teal-500, bg-blue-500, etc.)
 */
const StatCard = ({ title, value, icon, color = 'bg-teal-500' }) => {
  // Format số với dấu phẩy
  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return num.toLocaleString('vi-VN');
    }
    return num;
  };

  return (
    <div className={`${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{formatNumber(value)}</p>
        </div>
        {icon && (
          <div className="text-4xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

