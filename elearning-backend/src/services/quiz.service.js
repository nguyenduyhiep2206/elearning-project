const { quizzes, quizquestions, quizoptions, quizsessions, quizanswers, lessons, users, courses, chapters } = require('../models');
const { Op } = require('sequelize');

class QuizService {
  /**
   * Tạo quiz mới
   * @param {number} lessonId - ID của lesson
   * @param {Object} quizData - Dữ liệu quiz
   * @returns {Promise<Object>}
   */
  async createQuiz(lessonId, quizData) {
    try {
      const { title, timeLimit, showAnswersAfterSubmission, maxAttempts } = quizData;

      const quiz = await quizzes.create({
        lessonid: lessonId,
        title: title,
        timelimit: timeLimit || null,
        showanswersaftersubmission: showAnswersAfterSubmission || false,
        maxattempts: maxAttempts || 1,
      });

      return quiz;
    } catch (error) {
      console.error('Error in createQuiz:', error);
      throw new Error(`Lỗi khi tạo quiz: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách quiz theo lesson
   * @param {number} lessonId - ID của lesson
   * @returns {Promise<Array>}
   */
  async getQuizzesByLesson(lessonId) {
    try {
      const quizList = await quizzes.findAll({
        where: { lessonid: lessonId },
        include: [
          {
            model: quizquestions,
            as: 'questions',
            include: [
              {
                model: quizoptions,
                as: 'options',
              },
            ],
          },
        ],
        order: [['createdat', 'DESC']],
      });

      return quizList;
    } catch (error) {
      console.error('Error in getQuizzesByLesson:', error);
      throw new Error(`Lỗi khi lấy danh sách quiz: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin quiz theo ID
   * @param {number} quizId - ID của quiz
   * @returns {Promise<Object>}
   */
  async getQuizById(quizId) {
    try {
      const quiz = await quizzes.findByPk(quizId, {
        include: [
          {
            model: quizquestions,
            as: 'questions',
            required: false,
            include: [
              {
                model: quizoptions,
                as: 'options',
                required: false,
              },
            ],
            order: [['questionid', 'ASC']],
          },
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
      });

      if (!quiz) {
        throw new Error('Không tìm thấy quiz');
      }

      // Kiểm tra xem có đầy đủ thông tin không
      if (!quiz.lesson) {
        throw new Error('Quiz không có lesson liên kết');
      }

      if (!quiz.lesson.chapter) {
        throw new Error('Lesson không có chapter liên kết');
      }

      if (!quiz.lesson.chapter.course) {
        throw new Error('Chapter không có course liên kết');
      }

      return quiz;
    } catch (error) {
      console.error('Error in getQuizById:', error);
      throw new Error(`Lỗi khi lấy thông tin quiz: ${error.message}`);
    }
  }

  /**
   * Cập nhật quiz
   * @param {number} quizId - ID của quiz
   * @param {Object} quizData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateQuiz(quizId, quizData) {
    try {
      const quiz = await quizzes.findByPk(quizId);
      if (!quiz) {
        throw new Error('Không tìm thấy quiz');
      }

      // Cập nhật quiz
      await quiz.update({
        title: quizData.title !== undefined ? quizData.title : quiz.title,
        timelimit: quizData.timeLimit !== undefined ? (quizData.timeLimit === '' ? null : quizData.timeLimit) : quiz.timelimit,
        showanswersaftersubmission: quizData.showAnswersAfterSubmission !== undefined 
          ? quizData.showAnswersAfterSubmission 
          : quiz.showanswersaftersubmission,
        maxattempts: quizData.maxAttempts !== undefined ? quizData.maxAttempts : quiz.maxattempts,
      });

      // Reload quiz với đầy đủ thông tin
      const updatedQuiz = await quizzes.findByPk(quizId, {
        include: [
          {
            model: quizquestions,
            as: 'questions',
            required: false,
            include: [
              {
                model: quizoptions,
                as: 'options',
                required: false,
              },
            ],
          },
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
      });

      return updatedQuiz;
    } catch (error) {
      console.error('Error in updateQuiz:', error);
      throw new Error(`Lỗi khi cập nhật quiz: ${error.message}`);
    }
  }

  /**
   * Xóa quiz
   * @param {number} quizId - ID của quiz
   * @returns {Promise<boolean>}
   */
  async deleteQuiz(quizId) {
    try {
      const quiz = await quizzes.findByPk(quizId);
      if (!quiz) {
        throw new Error('Không tìm thấy quiz');
      }

      await quiz.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteQuiz:', error);
      throw new Error(`Lỗi khi xóa quiz: ${error.message}`);
    }
  }

  /**
   * Tạo câu hỏi cho quiz
   * @param {number} quizId - ID của quiz
   * @param {Object} questionData - Dữ liệu câu hỏi
   * @returns {Promise<Object>}
   */
  async createQuestion(quizId, questionData) {
    try {
      const { questionText, options, correctOptionIndex, explanation } = questionData;

      // Tạo câu hỏi
      const question = await quizquestions.create({
        quizid: quizId,
        questiontext: questionText,
        explanation: explanation || null,
        correctoptionid: null, // Sẽ cập nhật sau khi tạo options
      });

      // Tạo các lựa chọn
      const createdOptions = [];
      let correctOptionId = null;

      for (let i = 0; i < options.length; i++) {
        const option = await quizoptions.create({
          questionid: question.questionid,
          optiontext: options[i],
        });
        createdOptions.push(option);

        // Lưu ID của đáp án đúng
        if (i === correctOptionIndex) {
          correctOptionId = option.optionid;
        }
      }

      // Cập nhật correctoptionid
      if (correctOptionId) {
        await question.update({ correctoptionid: correctOptionId });
      }

      // Lấy lại câu hỏi với options
      const questionWithOptions = await quizquestions.findByPk(question.questionid, {
        include: [
          {
            model: quizoptions,
            as: 'options',
          },
        ],
      });

      return questionWithOptions;
    } catch (error) {
      console.error('Error in createQuestion:', error);
      throw new Error(`Lỗi khi tạo câu hỏi: ${error.message}`);
    }
  }

  /**
   * Cập nhật câu hỏi
   * @param {number} questionId - ID của câu hỏi
   * @param {Object} questionData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateQuestion(questionId, questionData) {
    try {
      const question = await quizquestions.findByPk(questionId);
      if (!question) {
        throw new Error('Không tìm thấy câu hỏi');
      }

      // Cập nhật thông tin câu hỏi
      await question.update({
        questiontext: questionData.questionText || question.questiontext,
        explanation: questionData.explanation !== undefined ? questionData.explanation : question.explanation,
      });

      // Nếu có options mới, cập nhật
      if (questionData.options && questionData.correctOptionIndex !== undefined) {
        // Xóa các options cũ
        await quizoptions.destroy({
          where: { questionid: questionId },
        });

        // Tạo options mới
        let correctOptionId = null;
        for (let i = 0; i < questionData.options.length; i++) {
          const option = await quizoptions.create({
            questionid: questionId,
            optiontext: questionData.options[i],
          });

          if (i === questionData.correctOptionIndex) {
            correctOptionId = option.optionid;
          }
        }

        // Cập nhật correctoptionid
        if (correctOptionId) {
          await question.update({ correctoptionid: correctOptionId });
        }
      }

      // Lấy lại câu hỏi với options
      const updatedQuestion = await quizquestions.findByPk(questionId, {
        include: [
          {
            model: quizoptions,
            as: 'options',
          },
        ],
      });

      return updatedQuestion;
    } catch (error) {
      console.error('Error in updateQuestion:', error);
      throw new Error(`Lỗi khi cập nhật câu hỏi: ${error.message}`);
    }
  }

  /**
   * Xóa câu hỏi
   * @param {number} questionId - ID của câu hỏi
   * @returns {Promise<boolean>}
   */
  async deleteQuestion(questionId) {
    try {
      const question = await quizquestions.findByPk(questionId);
      if (!question) {
        throw new Error('Không tìm thấy câu hỏi');
      }

      // Xóa các options trước
      await quizoptions.destroy({
        where: { questionid: questionId },
      });

      // Xóa câu hỏi
      await question.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteQuestion:', error);
      throw new Error(`Lỗi khi xóa câu hỏi: ${error.message}`);
    }
  }

  /**
   * Lấy kết quả làm bài của học viên cho một quiz
   * @param {number} quizId - ID của quiz
   * @returns {Promise<Array>}
   */
  async getQuizResults(quizId) {
    try {
      const sessions = await quizsessions.findAll({
        where: { quizid: quizId },
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email'],
          },
          {
            model: quizanswers,
            as: 'answers',
            include: [
              {
                model: quizquestions,
                as: 'question',
                include: [
                  {
                    model: quizoptions,
                    as: 'options',
                  },
                ],
              },
              {
                model: quizoptions,
                as: 'selectedOption',
              },
            ],
          },
        ],
        order: [['submittedat', 'DESC']],
      });

      return sessions;
    } catch (error) {
      console.error('Error in getQuizResults:', error);
      throw new Error(`Lỗi khi lấy kết quả quiz: ${error.message}`);
    }
  }

  /**
   * Cập nhật điểm cho một session (nếu cần chấm lại)
   * @param {number} sessionId - ID của session
   * @param {number} score - Điểm số
   * @returns {Promise<Object>}
   */
  async updateQuizScore(sessionId, score) {
    try {
      const session = await quizsessions.findByPk(sessionId);
      if (!session) {
        throw new Error('Không tìm thấy session');
      }

      await session.update({ score: score });
      return session;
    } catch (error) {
      console.error('Error in updateQuizScore:', error);
      throw new Error(`Lỗi khi cập nhật điểm: ${error.message}`);
    }
  }
}

module.exports = new QuizService();

