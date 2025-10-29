// src/components/course/LessonComments.jsx
import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/comment.service';
import { useAuth } from '../../context/AuthContext'; // (File bạn đã có)

function LessonComments({ lessonId }) {
  const { user } = useAuth(); // Lấy user đang đăng nhập
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const fetchComments = () => {
    setLoading(true);
    commentService.getCommentsByLesson(lessonId)
      .then(res => setComments(res.data))
      .catch(err => console.error("Lỗi tải bình luận:", err))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // (Backend của bạn có thể cần studentid, nhưng lý tưởng là lấy từ token)
      // Dựa theo controller, backend tạm thời cần { lessonid, studentid, content }
      const data = {
        lessonid: parseInt(lessonId),
        studentid: user.userid, // Lấy từ AuthContext
        content: newComment,
      };
      
      await commentService.createComment(data);
      setNewComment('');
      fetchComments(); // Tải lại danh sách bình luận
    } catch (err) {
      alert("Gửi bình luận thất bại");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Bình luận</h3>
      
      {/* Form Gửi Bình luận */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Viết bình luận..."
          rows="3"
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Gửi
        </button>
      </form>
      
      {/* Danh sách bình luận */}
      {loading && <div>Đang tải bình luận...</div>}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.commentid} className="border-b pb-2">
            <p className="font-bold">Học viên {comment.studentid}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonComments;