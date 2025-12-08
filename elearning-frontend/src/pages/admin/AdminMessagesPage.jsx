import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, messagesServices } from '../../services';
import { io } from 'socket.io-client';

/**
 * AdminMessagesPage - Trang quản lý tin nhắn cho admin
 * Route: /admin/dashboard/messages
 */
const AdminMessagesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('messages'); // messages, conversations
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    senderId: '',
    receiverId: '',
    search: '',
    startDate: '',
    endDate: '',
    seen: '',
  });
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat state
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const messageEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const admin = JSON.parse(localStorage.getItem('user') || '{}');
  const adminId = admin?.id || admin?.userid;

  // Fetch messages
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['admin', 'messages', page, filters],
    queryFn: () => adminService.getAllMessages({ page, limit, ...filters }),
    enabled: activeTab === 'messages',
  });

  // Fetch conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['admin', 'conversations', page],
    queryFn: () => adminService.getAllConversations({ page, limit }),
    enabled: activeTab === 'conversations',
  });

  // Search messages
  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['admin', 'search-messages', searchQuery, page],
    queryFn: () => adminService.searchMessages(searchQuery, { page, limit }),
    enabled: activeTab === 'messages' && searchQuery.length > 0,
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId) => adminService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'messages']);
      queryClient.invalidateQueries(['admin', 'conversations']);
      setNotification({ type: 'success', message: 'Xóa tin nhắn thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi xóa tin nhắn: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Delete multiple messages mutation
  const deleteMultipleMutation = useMutation({
    mutationFn: (messageIds) => adminService.deleteMultipleMessages(messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'messages']);
      queryClient.invalidateQueries(['admin', 'conversations']);
      setSelectedMessages([]);
      setNotification({ type: 'success', message: 'Xóa tin nhắn thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi xóa tin nhắn: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters((prev) => ({ ...prev, search: searchQuery }));
      setPage(1);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      senderId: '',
      receiverId: '',
      search: '',
      startDate: '',
      endDate: '',
      seen: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedMessages.length} tin nhắn đã chọn?`)) {
      deleteMultipleMutation.mutate(selectedMessages);
    }
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    const messages = searchQuery
      ? searchData?.data?.data?.messages || []
      : messagesData?.data?.data?.messages || [];
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((m) => m.messageid));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Socket.io setup for chat
  useEffect(() => {
    if (activeTab === 'conversations') {
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Create new socket connection
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      socketRef.current = socket;

      socket.emit('admin_join');

      socket.on('user_list', (list) => {
        // Handle user list if needed
      });

      // Cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off('user_list');
          socketRef.current.off('new_message');
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else {
      // Disconnect socket when leaving conversations tab
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Reset chat state when leaving tab
      setActiveConversation(null);
      setChatMessages([]);
      setChatText('');
    }
  }, [activeTab]);

  // Handle new messages - separate effect for activeConversation
  useEffect(() => {
    if (!socketRef.current || !activeConversation) return;

    const handleNewMessage = (msg) => {
      if (
        msg.senderid === activeConversation.userId || 
        msg.receiverid === activeConversation.userId
      ) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socketRef.current.on('new_message', handleNewMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message', handleNewMessage);
      }
    };
  }, [activeConversation]);

  // Scroll to bottom when new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load chat messages when conversation is selected
  const handleSelectConversation = async (conv) => {
    // Reset chat messages first
    setChatMessages([]);
    setChatText('');
    
    // Determine the other user (not admin)
    const senderId = conv.sender?.userid;
    const receiverId = conv.receiver?.userid;
    const isSenderAdmin = senderId === adminId || senderId === parseInt(adminId);
    const userId = isSenderAdmin ? receiverId : senderId;
    
    if (!userId) {
      setNotification({
        type: 'error',
        message: 'Không thể xác định người dùng',
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
      return;
    }

    setActiveConversation({
      userId,
      sender: conv.sender,
      receiver: conv.receiver,
    });

    try {
      const res = await messagesServices.getMessages(userId);
      setChatMessages(res.data.data || []);
      
      if (socketRef.current) {
        socketRef.current.emit('admin_open_chat', userId);
      }
    } catch (err) {
      console.log('❌ Load messages error:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi khi tải tin nhắn: ' + (err.response?.data?.message || err.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!chatText.trim() || !activeConversation) return;

    const textToSend = chatText.trim();
    setChatText(''); // Clear input immediately for better UX

    const payload = {
      receiverId: activeConversation.userId,
      content: textToSend,
    };

    try {
      const res = await messagesServices.sendMessage(payload);
      const savedMessage = res.data.data;

      // Add message to chat immediately
      setChatMessages((prev) => [...prev, savedMessage]);
      
      // Emit to socket
      if (socketRef.current) {
        socketRef.current.emit('admin_message', savedMessage);
      }
      
      // Refresh conversations list to update last message time
      queryClient.invalidateQueries(['admin', 'conversations']);
    } catch (err) {
      console.log('❌ Send message failed:', err);
      // Restore text if send failed
      setChatText(textToSend);
      setNotification({
        type: 'error',
        message: 'Lỗi khi gửi tin nhắn: ' + (err.response?.data?.message || err.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    }
  };

  // Parse data
  const messagesResult = searchQuery
    ? searchData?.data?.data || {}
    : messagesData?.data?.data || {};
  const messages = messagesResult.messages || [];
  const messagesPagination = messagesResult.pagination || {};

  const conversationsResult = conversationsData?.data?.data || {};
  const conversations = conversationsResult.conversations || [];
  const conversationsPagination = conversationsResult.pagination || {};

  const isLoading =
    (activeTab === 'messages' && (isLoadingMessages || isLoadingSearch)) ||
    (activeTab === 'conversations' && isLoadingConversations);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý tin nhắn</h1>
        <p className="text-gray-600 mt-2">Quản lý tất cả tin nhắn trong hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'messages'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tất cả tin nhắn
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'conversations'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cuộc trò chuyện
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm nội dung</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Nhập từ khóa..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Tìm
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
                    <select
                      value={filters.seen}
                      onChange={(e) => handleFilterChange('seen', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Đã đọc</option>
                      <option value="false">Chưa đọc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Người gửi</label>
                    <input
                      type="number"
                      value={filters.senderId}
                      onChange={(e) => handleFilterChange('senderId', e.target.value)}
                      placeholder="Nhập ID..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Người nhận</label>
                    <input
                      type="number"
                      value={filters.receiverId}
                      onChange={(e) => handleFilterChange('receiverId', e.target.value)}
                      placeholder="Nhập ID..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>

              {/* Actions */}
              {selectedMessages.length > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
                  <p className="text-teal-800 font-medium">
                    Đã chọn {selectedMessages.length} tin nhắn
                  </p>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleteMultipleMutation.isPending}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Xóa đã chọn
                  </button>
                </div>
              )}

              {/* Messages Table */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                  <p>Không tìm thấy tin nhắn nào</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedMessages.length === messages.length && messages.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người gửi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người nhận
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nội dung
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {messages.map((message) => (
                          <tr key={message.messageid} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(message.messageid)}
                                onChange={() => handleSelectMessage(message.messageid)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{message.messageid}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {message.sender?.fullname || `User ${message.senderid}`}
                              </div>
                              <div className="text-sm text-gray-500">{message.sender?.email || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {message.receiver?.fullname || `User ${message.receiverid}`}
                              </div>
                              <div className="text-sm text-gray-500">{message.receiver?.email || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {message.content}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  message.seen
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {message.seen ? 'Đã đọc' : 'Chưa đọc'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateShort(message.sentat)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteMessage(message.messageid)}
                                disabled={deleteMessageMutation.isPending}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {messagesPagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Trang {messagesPagination.page} / {messagesPagination.totalPages} ({messagesPagination.total} tin nhắn)
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={messagesPagination.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Trước
                          </button>
                          <button
                            onClick={() => setPage((p) => Math.min(messagesPagination.totalPages, p + 1))}
                            disabled={messagesPagination.page === messagesPagination.totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div className="w-full h-[calc(100vh-300px)] grid grid-cols-[350px_1fr] bg-gray-100 rounded-lg overflow-hidden">
              {/* LEFT: Conversation List */}
              <div className="bg-white border-r shadow-md overflow-y-auto">
                <div className="p-4 border-b bg-teal-50">
                  <h2 className="text-xl font-bold text-gray-800">Danh sách cuộc trò chuyện</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Không tìm thấy cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {conversations.map((conv, index) => {
                      const senderId = conv.sender?.userid;
                      const receiverId = conv.receiver?.userid;
                      const isSenderAdmin = senderId === adminId || senderId === parseInt(adminId);
                      const otherUser = isSenderAdmin ? conv.receiver : conv.sender;
                      const isActive = activeConversation?.userId === otherUser?.userid;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleSelectConversation(conv)}
                          className={`p-3 rounded-xl cursor-pointer mb-2 transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                {otherUser?.fullname || `User ${otherUser?.userid}`}
                              </p>
                              <p className={`text-xs ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>
                                {otherUser?.email || ''}
                              </p>
                            </div>
                            {conv.unreadCount > 0 && !isActive && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>
                            {conv.messageCount} tin nhắn • {formatDateShort(conv.lastMessageTime)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {conversationsPagination.totalPages > 1 && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Trang {conversationsPagination.page} / {conversationsPagination.totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={conversationsPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Trước
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(conversationsPagination.totalPages, p + 1))}
                          disabled={conversationsPagination.page === conversationsPagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Chat Panel */}
              <div className="flex flex-col h-full min-h-0 bg-gray-50">
                {/* Header */}
                <div className="bg-white p-4 shadow-md border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {activeConversation
                      ? `Chat với: ${(activeConversation.sender?.userid === adminId || activeConversation.sender?.userid === parseInt(adminId)) ? (activeConversation.receiver?.fullname || `User ${activeConversation.receiver?.userid}`) : (activeConversation.sender?.fullname || `User ${activeConversation.sender?.userid}`)}`
                      : 'Chọn một cuộc trò chuyện'}
                  </h2>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!activeConversation && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">
                        Chọn một cuộc trò chuyện để bắt đầu chat
                      </p>
                    </div>
                  )}

                  {activeConversation &&
                    chatMessages.map((m, i) => {
                      const isAdminMessage = m.senderid === adminId || m.senderid === parseInt(adminId);
                      return (
                      <div
                        key={m.messageid || i}
                        className={`flex ${
                          isAdminMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl max-w-[70%] shadow ${
                            isAdminMessage
                              ? 'bg-teal-600 text-white'
                              : 'bg-white text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{m.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isAdminMessage ? 'text-teal-100' : 'text-gray-500'
                            }`}
                          >
                            {formatDateShort(m.sentat)}
                          </p>
                        </div>
                      </div>
                      );
                    })}

                  <div ref={messageEndRef} />
                </div>

                {/* Input */}
                {activeConversation && (
                  <div className="p-4 bg-white border-t flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Nhập tin nhắn..."
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors"
                    >
                      Gửi
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;

