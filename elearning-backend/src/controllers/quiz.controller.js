const quizService = require('../services/quiz.service');
const { lessons, courses, chapters, quizzes, quizquestions, quizsessions } = require('../models');

class QuizController {
  /**
   * Tạo quiz mới
   * POST /api/v1/teacher/lessons/:lessonId/quizzes
   */
  async createQuiz(req, res) {
    try {
      const { lessonId } = req.params;
      const teacherId = req.user.id;

      // Kiểm tra lesson thuộc về teacher
      const lesson = await lessons.findByPk(lessonId, {
        include: [
          {
            model: chapters,
            as: 'chapter',
            include: [
              {
                model: courses,
                as: 'course',
                where: { teacherid: teacherId },
                required: true,
              },
            ],
            required: true,
          },
        ],
      });

      if (!lesson) {
        return res.status(403).json({ message: 'Bạn không có quyền tạo quiz cho lesson này' });
      }

      const quiz = await quizService.createQuiz(Number(lessonId), req.body);
      res.status(201).json({
        message: 'Tạo quiz thành công!',
        data: quiz,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Lấy danh sách quiz theo lesson
   * GET /api/v1/teacher/lessons/:lessonId/quizzes
   */
  async getQuizzesByLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const teacherId = req.user.id;

      // Kiểm tra lesson thuộc về teacher
      const lesson = await lessons.findByPk(lessonId, {
        include: [
          {
            model: chapters,
            as: 'chapter',
            include: [
              {
                model: courses,
                as: 'course',
                where: { teacherid: teacherId },
                required: true,
              },
            ],
            required: true,
          },
        ],
      });

      if (!lesson) {
        return res.status(403).json({ message: 'Bạn không có quyền xem quiz của lesson này' });
      }

      const quizzes = await quizService.getQuizzesByLesson(Number(lessonId));
      res.status(200).json({
        message: 'Lấy danh sách quiz thành công!',
        data: quizzes,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lấy thông tin quiz theo ID
   * GET /api/v1/teacher/quizzes/:quizId
   */
  async getQuizById(req, res) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;

      if (!quizId || isNaN(Number(quizId))) {
        return res.status(400).json({ message: 'Quiz ID không hợp lệ' });
      }

      const quiz = await quizService.getQuizById(Number(quizId));

      // Kiểm tra quiz có tồn tại và có đầy đủ thông tin
      if (!quiz) {
        return res.status(404).json({ message: 'Không tìm thấy quiz' });
      }

      // Kiểm tra quiz thuộc về teacher
      const courseTeacherId = quiz.lesson?.chapter?.course?.teacherid;
      if (!courseTeacherId) {
        console.error('Quiz không có thông tin teacher:', {
          quizId: quiz.quizid,
          hasLesson: !!quiz.lesson,
          hasChapter: !!quiz.lesson?.chapter,
          hasCourse: !!quiz.lesson?.chapter?.course,
        });
        return res.status(500).json({ message: 'Quiz không có thông tin đầy đủ' });
      }

      if (courseTeacherId !== teacherId) {
        console.log('Permission check failed:', {
          quizId: quiz.quizid,
          courseTeacherId,
          currentTeacherId: teacherId,
        });
        return res.status(403).json({ 
          message: 'Bạn không có quyền xem quiz này. Quiz này thuộc về teacher khác.' 
        });
      }

      res.status(200).json({
        message: 'Lấy thông tin quiz thành công!',
        data: quiz,
      });
    } catch (error) {
      console.error('Error in getQuizById controller:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ message: error.message || 'Lỗi khi lấy thông tin quiz' });
    }
  }

  /**
   * Cập nhật quiz
   * PUT /api/v1/teacher/quizzes/:quizId
   */
  async updateQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;

      if (!quizId || isNaN(Number(quizId))) {
        return res.status(400).json({ message: 'Quiz ID không hợp lệ' });
      }

      const quiz = await quizService.getQuizById(Number(quizId));

      // Kiểm tra quiz có tồn tại và có đầy đủ thông tin
      if (!quiz) {
        return res.status(404).json({ message: 'Không tìm thấy quiz' });
      }

      // Kiểm tra quiz thuộc về teacher
      const courseTeacherId = quiz.lesson?.chapter?.course?.teacherid;
      if (!courseTeacherId) {
        console.error('Quiz không có thông tin teacher:', {
          quizId: quiz.quizid,
          hasLesson: !!quiz.lesson,
          hasChapter: !!quiz.lesson?.chapter,
          hasCourse: !!quiz.lesson?.chapter?.course,
        });
        return res.status(500).json({ message: 'Quiz không có thông tin đầy đủ' });
      }

      if (courseTeacherId !== teacherId) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền cập nhật quiz này. Quiz này thuộc về teacher khác.' 
        });
      }

      const updatedQuiz = await quizService.updateQuiz(Number(quizId), req.body);
      res.status(200).json({
        message: 'Cập nhật quiz thành công!',
        data: updatedQuiz,
      });
    } catch (error) {
      console.error('Error in updateQuiz controller:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({ message: error.message || 'Lỗi khi cập nhật quiz' });
    }
  }

  /**
   * Xóa quiz
   * DELETE /api/v1/teacher/quizzes/:quizId
   */
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;

      if (!quizId || isNaN(Number(quizId))) {
        return res.status(400).json({ message: 'Quiz ID không hợp lệ' });
      }

      const quiz = await quizService.getQuizById(Number(quizId));

      // Kiểm tra quiz có tồn tại và có đầy đủ thông tin
      if (!quiz) {
        return res.status(404).json({ message: 'Không tìm thấy quiz' });
      }

      // Kiểm tra quiz thuộc về teacher
      const courseTeacherId = quiz.lesson?.chapter?.course?.teacherid;
      if (!courseTeacherId) {
        console.error('Quiz không có thông tin teacher:', {
          quizId: quiz.quizid,
          hasLesson: !!quiz.lesson,
          hasChapter: !!quiz.lesson?.chapter,
          hasCourse: !!quiz.lesson?.chapter?.course,
        });
        return res.status(500).json({ message: 'Quiz không có thông tin đầy đủ' });
      }

      if (courseTeacherId !== teacherId) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền xóa quiz này. Quiz này thuộc về teacher khác.' 
        });
      }

      await quizService.deleteQuiz(Number(quizId));
      res.status(200).json({
        message: 'Xóa quiz thành công!',
      });
    } catch (error) {
      console.error('Error in deleteQuiz controller:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({ message: error.message || 'Lỗi khi xóa quiz' });
    }
  }

  /**
   * Tạo câu hỏi cho quiz
   * POST /api/v1/teacher/quizzes/:quizId/questions
   */
  async createQuestion(req, res) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;

      if (!quizId || isNaN(Number(quizId))) {
        return res.status(400).json({ message: 'Quiz ID không hợp lệ' });
      }

      const quiz = await quizService.getQuizById(Number(quizId));

      // Kiểm tra quiz có tồn tại và có đầy đủ thông tin
      if (!quiz) {
        return res.status(404).json({ message: 'Không tìm thấy quiz' });
      }

      // Kiểm tra quiz thuộc về teacher
      const courseTeacherId = quiz.lesson?.chapter?.course?.teacherid;
      if (!courseTeacherId) {
        console.error('Quiz không có thông tin teacher:', {
          quizId: quiz.quizid,
          hasLesson: !!quiz.lesson,
          hasChapter: !!quiz.lesson?.chapter,
          hasCourse: !!quiz.lesson?.chapter?.course,
        });
        return res.status(500).json({ message: 'Quiz không có thông tin đầy đủ' });
      }

      if (courseTeacherId !== teacherId) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền tạo câu hỏi cho quiz này. Quiz này thuộc về teacher khác.' 
        });
      }

      const question = await quizService.createQuestion(Number(quizId), req.body);
      res.status(201).json({
        message: 'Tạo câu hỏi thành công!',
        data: question,
      });
    } catch (error) {
      console.error('Error in createQuestion controller:', error);
      res.status(400).json({ message: error.message || 'Lỗi khi tạo câu hỏi' });
    }
  }

  /**
   * Cập nhật câu hỏi
   * PUT /api/v1/teacher/questions/:questionId
   */
  async updateQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const teacherId = req.user.id;

      // Lấy question để kiểm tra quyền
      const question = await quizquestions.findByPk(questionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
            required: true,
            include: [
              {
                model: lessons,
                as: 'lesson',
                required: true,
                include: [
                  {
                    model: chapters,
                    as: 'chapter',
                    required: true,
                    include: [
                      {
                        model: courses,
                        as: 'course',
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!question) {
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }

      if (question.quiz.lesson.course.teacherid !== teacherId) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật câu hỏi này' });
      }

      const updatedQuestion = await quizService.updateQuestion(Number(questionId), req.body);
      res.status(200).json({
        message: 'Cập nhật câu hỏi thành công!',
        data: updatedQuestion,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Xóa câu hỏi
   * DELETE /api/v1/teacher/questions/:questionId
   */
  async deleteQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const teacherId = req.user.id;

      // Lấy question để kiểm tra quyền
      const question = await quizquestions.findByPk(questionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
            required: true,
            include: [
              {
                model: lessons,
                as: 'lesson',
                required: true,
                include: [
                  {
                    model: chapters,
                    as: 'chapter',
                    required: true,
                    include: [
                      {
                        model: courses,
                        as: 'course',
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!question) {
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }

      if (question.quiz.lesson.course.teacherid !== teacherId) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này' });
      }

      await quizService.deleteQuestion(Number(questionId));
      res.status(200).json({
        message: 'Xóa câu hỏi thành công!',
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Lấy kết quả làm bài của học viên
   * GET /api/v1/teacher/quizzes/:quizId/results
   */
  async getQuizResults(req, res) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;

      const quiz = await quizService.getQuizById(Number(quizId));

      // Kiểm tra quiz thuộc về teacher
      if (quiz.lesson.course.teacherid !== teacherId) {
        return res.status(403).json({ message: 'Bạn không có quyền xem kết quả quiz này' });
      }

      const results = await quizService.getQuizResults(Number(quizId));
      res.status(200).json({
        message: 'Lấy kết quả quiz thành công!',
        data: results,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cập nhật điểm cho session
   * PUT /api/v1/teacher/quiz-sessions/:sessionId/score
   */
  async updateQuizScore(req, res) {
    try {
      const { sessionId } = req.params;
      const { score } = req.body;
      const teacherId = req.user.id;

      // Kiểm tra session và quyền
      const session = await quizsessions.findByPk(sessionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
            required: true,
            include: [
              {
                model: lessons,
                as: 'lesson',
                required: true,
                include: [
                  {
                    model: chapters,
                    as: 'chapter',
                    required: true,
                    include: [
                      {
                        model: courses,
                        as: 'course',
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!session) {
        return res.status(404).json({ message: 'Không tìm thấy session' });
      }

      if (session.quiz.lesson.course.teacherid !== teacherId) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật điểm cho session này' });
      }

      const updatedSession = await quizService.updateQuizScore(Number(sessionId), score);
      res.status(200).json({
        message: 'Cập nhật điểm thành công!',
        data: updatedSession,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new QuizController();

