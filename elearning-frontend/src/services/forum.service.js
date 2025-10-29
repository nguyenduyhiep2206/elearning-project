//Dựa trên forumDiscussion.route.js và forumReply.route.js
// src/services/forum.service.js
import api from './api';

const getDiscussionsByCourse = (courseId) => api.get(`/discussions/course/${courseId}`);
// Backend tự lấy user, body cần { courseid, title, content }
const createDiscussion = (data) => api.post('/discussions', data);
const createReply = (data) => api.post('/replies', data); // { discussionId, content }

export const forumService = {
  getDiscussionsByCourse,
  createDiscussion,
  createReply,
};