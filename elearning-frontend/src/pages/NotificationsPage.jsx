import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { notificationService } from '../services';

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  // filter: 'all' | 'unread'
  const [filter, setFilter] = useState('all');
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', page, filter],
    queryFn: async () => {
      const readStatus = filter === 'unread' ? false : null;
      const res = await notificationService.getMyNotifications(page, limit, readStatus);
      const payload = res.data?.data || res.data || {};
      return {
        notifications: payload.notifications || res.data.notifications || [],
        totalItems: payload.totalItems ?? res.data.totalItems ?? 0,
        unreadCount: payload.unreadCount ?? res.data.unreadCount ?? 0,
      };
    },
  });

  const notifications = data?.notifications || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isread).map((n) => n.notificationid);
    if (unreadIds.length === 0) return;
    try {
      await notificationService.updateReadStatus(unreadIds, true);
      refetch();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleToggleRead = async (notif) => {
    try {
      await notificationService.updateReadStatus(
        [notif.notificationid],
        !notif.isread
      );
      refetch();
    } catch (err) {
      console.error('Failed to toggle notification read status', err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600 text-sm mt-1">
                Xem và quản lý tất cả thông báo của bạn.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs md:text-sm px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                Đánh dấu tất cả đã đọc ({unreadCount})
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => {
                  setPage(1);
                  setFilter('all');
                }}
                className={`px-3 py-1 rounded-full ${
                  filter === 'all'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setFilter('unread');
                }}
                className={`px-3 py-1 rounded-full ${
                  filter === 'unread'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Tổng: {totalItems} thông báo
            </p>
          </div>

          {isLoading && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500 text-sm">
              Đang tải thông báo...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              Lỗi khi tải thông báo. Vui lòng thử lại.
            </div>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 text-sm">
              Hiện chưa có thông báo nào.
            </div>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.notificationid}
                  className={`px-4 py-3 flex items-start gap-3 ${
                    notif.isread ? 'bg-white' : 'bg-teal-50'
                  }`}
                >
                  <div className="mt-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        notif.isread ? 'bg-gray-300' : 'bg-teal-500'
                      }`}
                    ></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    {notif.createdat && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdat).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleRead(notif)}
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    {notif.isread ? 'Đánh dấu chưa đọc' : 'Đã đọc'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Trước
              </button>
              <span className="text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;


