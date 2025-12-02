const { courses, chapters, lessons, orders, orderdetails, lessonprogress, users, categories, quizzes, quizquestions, quizoptions, quizsessions, quizanswers, coursecompletions, certificates, userdetails, notifications } = require('../models');
const { Op } = require('sequelize');

class LearningService {
  /**
   * Kiểm tra xem user đã mua khóa học chưa
   * @param {number} userId - ID của user
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<boolean>}
   */
  async checkEnrollment(userId, courseId) {
    try {
      // Kiểm tra trong orders với status = Completed
      const orderDetail = await orderdetails.findOne({
        where: {
          courseid: courseId,
        },
        include: [
          {
            model: orders,
            as: 'order',
            where: {
              userid: userId,
              status: 'Completed',
            },
            required: true,
          },
        ],
      });

      return !!orderDetail;
    } catch (error) {
      console.error('Error in checkEnrollment:', error);
      throw new Error(`Lỗi khi kiểm tra enrollment: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin khóa học với chapters và lessons cho học viên
   * @param {number} userId - ID của user
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<Object>}
   */
  async getCourseContent(userId, courseId) {
    try {
      // Kiểm tra enrollment
      const isEnrolled = await this.checkEnrollment(userId, courseId);
      if (!isEnrolled) {
        const error = new Error('Bạn chưa đăng ký khóa học này');
        error.statusCode = 403;
        throw error;
      }

      // Lấy thông tin khóa học
      const course = await courses.findByPk(courseId, {
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname'],
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname', 'email', 'profilepicture'],
          },
        ],
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học');
        error.statusCode = 404;
        throw error;
      }

      // Lấy chapters với lessons
      const courseChapters = await chapters.findAll({
        where: {
          courseid: courseId,
        },
        include: [
          {
            model: lessons,
            as: 'lessons',
            required: false,
            order: [['sortorder', 'ASC']],
            attributes: ['lessonid', 'title', 'videourl', 'content', 'sortorder', 'createdat'],
          },
        ],
        order: [['sortorder', 'ASC']],
      });

      // Lấy tất cả lesson IDs
      const allLessonIds = courseChapters.flatMap(chapter => 
        (chapter.lessons || []).map(lesson => lesson.lessonid)
      ).filter(id => id !== undefined);

      // Lấy tiến độ học của user
      const progressRecords = allLessonIds.length > 0 ? await lessonprogress.findAll({
        where: {
          studentid: userId,
          lessonid: {
            [Op.in]: allLessonIds,
          },
        },
      }) : [];

      // Tạo map để dễ tra cứu
      const progressMap = new Map();
      progressRecords.forEach(progress => {
        progressMap.set(progress.lessonid, {
          iscompleted: progress.iscompleted,
          completedat: progress.completedat,
        });
      });

      // Thêm thông tin tiến độ vào lessons
      const chaptersWithProgress = courseChapters.map(chapter => {
        const lessonsWithProgress = (chapter.lessons || []).map(lesson => {
          const progress = progressMap.get(lesson.lessonid);
          return {
            ...lesson.toJSON(),
            progress: progress || { iscompleted: false, completedat: null },
          };
        });

        return {
          ...chapter.toJSON(),
          lessons: lessonsWithProgress,
        };
      });

      // Tính tổng số lessons đã hoàn thành
      const completedLessons = progressRecords.filter(p => p.iscompleted).length;
      const totalLessons = courseChapters.reduce((total, chapter) => total + (chapter.lessons || []).length, 0);
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        course: course.toJSON(),
        chapters: chaptersWithProgress,
        progress: {
          completedLessons,
          totalLessons,
          progressPercentage,
        },
      };
    } catch (error) {
      console.error('Error in getCourseContent:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin lesson cụ thể
   * @param {number} userId - ID của user
   * @param {number} lessonId - ID của lesson
   * @returns {Promise<Object>}
   */
  async getLesson(userId, lessonId) {
    try {
      const lesson = await lessons.findByPk(lessonId, {
        include: [
          {
            model: chapters,
            as: 'chapter',
            include: [
              {
                model: courses,
                as: 'course',
                attributes: ['courseid', 'coursename', 'teacherid'],
              },
            ],
          },
        ],
      });

      if (!lesson) {
        const error = new Error('Không tìm thấy bài học');
        error.statusCode = 404;
        throw error;
      }

      // Kiểm tra enrollment
      const isEnrolled = await this.checkEnrollment(userId, lesson.chapter.course.courseid);
      if (!isEnrolled) {
        const error = new Error('Bạn chưa đăng ký khóa học này');
        error.statusCode = 403;
        throw error;
      }

      // Lấy tiến độ học
      const progress = await lessonprogress.findOne({
        where: {
          studentid: userId,
          lessonid: lessonId,
        },
      });

      // Lấy lesson trước và sau
      const allLessons = await lessons.findAll({
        where: {
          chapterid: lesson.chapterid,
        },
        order: [['sortorder', 'ASC']],
        attributes: ['lessonid', 'title', 'sortorder'],
      });

      const currentIndex = allLessons.findIndex(l => l.lessonid === lessonId);
      const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

      return {
        lesson: {
          ...lesson.toJSON(),
          progress: progress ? {
            iscompleted: progress.iscompleted,
            completedat: progress.completedat,
          } : { iscompleted: false, completedat: null },
        },
        navigation: {
          prevLesson: prevLesson ? {
            lessonid: prevLesson.lessonid,
            title: prevLesson.title,
          } : null,
          nextLesson: nextLesson ? {
            lessonid: nextLesson.lessonid,
            title: nextLesson.title,
          } : null,
        },
      };
    } catch (error) {
      console.error('Error in getLesson:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tiến độ học
   * @param {number} userId - ID của user
   * @param {number} lessonId - ID của lesson
   * @param {boolean} isCompleted - Đã hoàn thành chưa
   * @returns {Promise<Object>}
   */
  async updateProgress(userId, lessonId, isCompleted = true) {
    try {
      // Kiểm tra lesson tồn tại và user đã đăng ký
      const lesson = await lessons.findByPk(lessonId, {
        include: [
          {
            model: chapters,
            as: 'chapter',
            include: [
              {
                model: courses,
                as: 'course',
                attributes: ['courseid'],
              },
            ],
          },
        ],
      });

      if (!lesson) {
        const error = new Error('Không tìm thấy bài học');
        error.statusCode = 404;
        throw error;
      }

      const isEnrolled = await this.checkEnrollment(userId, lesson.chapter.course.courseid);
      if (!isEnrolled) {
        const error = new Error('Bạn chưa đăng ký khóa học này');
        error.statusCode = 403;
        throw error;
      }

      // Tìm hoặc tạo progress record
      const [progress, created] = await lessonprogress.findOrCreate({
        where: {
          studentid: userId,
          lessonid: lessonId,
        },
        defaults: {
          studentid: userId,
          lessonid: lessonId,
          iscompleted: isCompleted,
          completedat: isCompleted ? new Date() : null,
        },
      });

      // Nếu đã tồn tại, cập nhật
      if (!created) {
        progress.iscompleted = isCompleted;
        progress.completedat = isCompleted ? new Date() : null;
        await progress.save();
      }

      // Nếu bài học vừa được đánh dấu hoàn thành, kiểm tra xem đã hoàn thành 100% khóa học chưa
      if (isCompleted) {
        const courseId = lesson.chapter.course.courseid;
        // Chạy ngầm (không await) để không chặn response
        this.checkCourseCompletionAndIssueCertificate(userId, courseId).catch(err => {
          console.error('Error in background certificate issuance:', err);
        });
      }

      return progress.toJSON();
    } catch (error) {
      console.error('Error in updateProgress:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách khóa học đã đăng ký của user
   * @param {number} userId - ID của user
   * @param {Object} options - Tùy chọn: page, limit
   * @returns {Promise<Object>}
   */
  async getMyCourses(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      // Lấy tất cả orderdetails có order status = Completed
      const allOrderDetails = await orderdetails.findAll({
        include: [
          {
            model: orders,
            as: 'order',
            where: {
              userid: userId,
              status: 'Completed',
            },
            required: true,
          },
          {
            model: courses,
            as: 'course',
            required: true,
            include: [
              {
                model: categories,
                as: 'category',
                attributes: ['categoryid', 'categoryname'],
              },
              {
                model: users,
                as: 'teacher',
                attributes: ['userid', 'fullname', 'email'],
              },
            ],
          },
        ],
        order: [['order', 'createdat', 'DESC']],
      });

      // Lọc unique courses (lấy course mới nhất nếu có nhiều order cho cùng 1 course)
      const uniqueCoursesMap = new Map();
      allOrderDetails.forEach((orderDetail) => {
        const courseId = orderDetail.course.courseid;
        if (!uniqueCoursesMap.has(courseId)) {
          uniqueCoursesMap.set(courseId, orderDetail);
        } else {
          // Nếu đã có, so sánh ngày tạo order, lấy cái mới hơn
          const existing = uniqueCoursesMap.get(courseId);
          if (new Date(orderDetail.order.createdat) > new Date(existing.order.createdat)) {
            uniqueCoursesMap.set(courseId, orderDetail);
          }
        }
      });

      const uniqueOrderDetails = Array.from(uniqueCoursesMap.values());
      const totalCount = uniqueOrderDetails.length;

      // Phân trang
      const offset = (page - 1) * limit;
      const paginatedOrderDetails = uniqueOrderDetails.slice(offset, offset + parseInt(limit));

      // Tính tiến độ cho mỗi khóa học
      const coursesWithProgress = await Promise.all(
        paginatedOrderDetails.map(async (orderDetail) => {
          const courseId = orderDetail.course.courseid;
          
          // Đếm số lessons đã hoàn thành
          const courseChapters = await chapters.findAll({
            where: { courseid: courseId },
            include: [
              {
                model: lessons,
                as: 'lessons',
                required: false,
                attributes: ['lessonid'],
              },
            ],
          });

          const allLessonIds = courseChapters.flatMap(chapter => 
            chapter.lessons.map(lesson => lesson.lessonid)
          );

          const completedProgress = await lessonprogress.count({
            where: {
              studentid: userId,
              lessonid: { [Op.in]: allLessonIds },
              iscompleted: true,
            },
          });

          const totalLessons = allLessonIds.length;
          const progressPercentage = totalLessons > 0 
            ? Math.round((completedProgress / totalLessons) * 100) 
            : 0;

          // Kiểm tra xem đã hoàn thành khóa học chưa
          let completion = await coursecompletions.findOne({
            where: {
              studentid: userId,
              courseid: courseId,
            },
          });

          // Nếu chưa có completion record nhưng đã hoàn thành 100%, tự động tạo
          if (!completion && progressPercentage === 100 && totalLessons > 0) {
            try {
              const [newCompletion, created] = await coursecompletions.findOrCreate({
                where: {
                  studentid: userId,
                  courseid: courseId,
                },
                defaults: {
                  studentid: userId,
                  courseid: courseId,
                  completedat: new Date(),
                },
              });
            } catch (err) {
              console.error(`Error creating completion for course ${courseId}:`, err);
            }
          }

          return {
            ...orderDetail.course.toJSON(),
            progress: {
              completedLessons: completedProgress,
              totalLessons,
              progressPercentage,
            },
            isCompleted: !!completion || (progressPercentage === 100 && totalLessons > 0),
            completedAt: completion?.completedat || null,
            enrolledAt: orderDetail.order.createdat,
          };
        })
      );

      return {
        courses: coursesWithProgress,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      };
    } catch (error) {
      console.error('Error in getMyCourses:', error);
      throw new Error(`Lỗi khi lấy danh sách khóa học đã đăng ký: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách quiz của một lesson (cho học viên)
   * @param {number} userId - ID của user
   * @param {number} lessonId - ID của lesson
   * @returns {Promise<Array>}
   */
  async getQuizzesByLesson(userId, lessonId) {
    try {
      // Kiểm tra enrollment thông qua lesson
      const lesson = await lessons.findByPk(lessonId, {
        include: [
          {
            model: chapters,
            as: 'chapter',
            include: [
              {
                model: courses,
                as: 'course',
              },
            ],
          },
        ],
      });

      if (!lesson) {
        throw new Error('Không tìm thấy lesson');
      }

      const isEnrolled = await this.checkEnrollment(userId, lesson.chapter.course.courseid);
      if (!isEnrolled) {
        const error = new Error('Bạn chưa đăng ký khóa học này');
        error.statusCode = 403;
        throw error;
      }

      // Lấy danh sách quiz
      const quizList = await quizzes.findAll({
        where: { lessonid: lessonId },
        include: [
          {
            model: quizquestions,
            as: 'questions',
            required: false,
            attributes: ['questionid'], // Chỉ lấy ID để đếm số câu hỏi
          },
        ],
        order: [['createdat', 'DESC']],
      });

      // Thêm thông tin về số lần đã làm và điểm cao nhất
      const quizzesWithStats = await Promise.all(
        quizList.map(async (quiz) => {
          const sessions = await quizsessions.findAll({
            where: {
              quizid: quiz.quizid,
              studentid: userId,
            },
            order: [['submittedat', 'DESC']],
          });

          const bestScore = sessions
            .filter(s => s.score !== null)
            .reduce((max, s) => Math.max(max, s.score), 0);

          const latestSession = sessions[0];
          const canRetake = !latestSession || 
            (latestSession.submittedat && quiz.maxattempts > sessions.length);

          return {
            ...quiz.toJSON(),
            questionsCount: quiz.quizquestions?.length || 0,
            attemptsCount: sessions.length,
            bestScore: bestScore || null,
            canRetake,
            latestSession: latestSession ? {
              sessionid: latestSession.sessionid,
              submittedat: latestSession.submittedat,
              score: latestSession.score,
            } : null,
          };
        })
      );

      return quizzesWithStats;
    } catch (error) {
      console.error('Error in getQuizzesByLesson:', error);
      throw error;
    }
  }

  /**
   * Bắt đầu làm quiz (tạo session mới)
   * @param {number} userId - ID của user
   * @param {number} quizId - ID của quiz
   * @returns {Promise<Object>}
   */
  async startQuiz(userId, quizId) {
    try {
      // Lấy thông tin quiz
      const quiz = await quizzes.findByPk(quizId, {
        include: [
          {
            model: lessons,
            as: 'lesson',
            include: [
              {
                model: chapters,
                as: 'chapter',
                include: [
                  {
                    model: courses,
                    as: 'course',
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

      // Kiểm tra enrollment
      const isEnrolled = await this.checkEnrollment(userId, quiz.lesson.chapter.course.courseid);
      if (!isEnrolled) {
        const error = new Error('Bạn chưa đăng ký khóa học này');
        error.statusCode = 403;
        throw error;
      }

      // Kiểm tra số lần làm
      const existingSessions = await quizsessions.findAll({
        where: {
          quizid: quizId,
          studentid: userId,
        },
      });

      if (existingSessions.length >= (quiz.maxattempts || 1)) {
        throw new Error(`Bạn đã đạt số lần làm tối đa (${quiz.maxattempts || 1} lần)`);
      }

      // Kiểm tra xem có session chưa nộp không
      const activeSession = existingSessions.find(s => !s.submittedat);
      if (activeSession) {
        // Trả về session hiện tại
        return await this.getCurrentSession(userId, quizId);
      }

      // Tạo session mới
      const now = new Date();
      const endTime = quiz.timelimit 
        ? new Date(now.getTime() + quiz.timelimit * 60 * 1000)
        : null;

      const session = await quizsessions.create({
        quizid: quizId,
        studentid: userId,
        starttime: now,
        endtime: endTime,
        startedat: now,
      });

      // Lấy lại session với đầy đủ thông tin
      return await this.getCurrentSession(userId, quizId);
    } catch (error) {
      console.error('Error in startQuiz:', error);
      throw error;
    }
  }

  /**
   * Lấy session hiện tại của học viên cho một quiz
   * @param {number} userId - ID của user
   * @param {number} quizId - ID của quiz
   * @returns {Promise<Object>}
   */
  async getCurrentSession(userId, quizId) {
    try {
      const session = await quizsessions.findOne({
        where: {
          quizid: quizId,
          studentid: userId,
          submittedat: null, // Chưa nộp bài
        },
        include: [
          {
            model: quizzes,
            as: 'quiz',
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
                order: [['questionid', 'ASC']],
              },
            ],
          },
          {
            model: quizanswers,
            as: 'answers',
            include: [
              {
                model: quizoptions,
                as: 'selectedOption',
              },
            ],
          },
        ],
        order: [['startedat', 'DESC']],
      });

      return session;
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      throw error;
    }
  }

  /**
   * Nộp câu trả lời cho một câu hỏi
   * @param {number} userId - ID của user
   * @param {number} sessionId - ID của session
   * @param {number} questionId - ID của câu hỏi
   * @param {number} selectedOptionId - ID của lựa chọn đã chọn
   * @returns {Promise<Object>}
   */
  async submitAnswer(userId, sessionId, questionId, selectedOptionId) {
    try {
      // Kiểm tra session thuộc về user
      const session = await quizsessions.findByPk(sessionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
          },
        ],
      });

      if (!session) {
        throw new Error('Không tìm thấy session');
      }

      if (session.studentid !== userId) {
        const error = new Error('Bạn không có quyền truy cập session này');
        error.statusCode = 403;
        throw error;
      }

      if (session.submittedat) {
        throw new Error('Quiz đã được nộp, không thể thay đổi câu trả lời');
      }

      // Kiểm tra thời gian (nếu có)
      if (session.endtime && new Date() > new Date(session.endtime)) {
        throw new Error('Đã hết thời gian làm bài');
      }

      // Lấy câu hỏi để kiểm tra đáp án đúng
      const question = await quizquestions.findByPk(questionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
            where: { quizid: session.quizid },
            required: true,
          },
        ],
      });

      if (!question) {
        throw new Error('Không tìm thấy câu hỏi');
      }

      // Kiểm tra xem đã trả lời câu này chưa
      const existingAnswer = await quizanswers.findOne({
        where: {
          sessionid: sessionId,
          questionid: questionId,
        },
      });

      const isCorrect = question.correctoptionid === selectedOptionId;

      if (existingAnswer) {
        // Cập nhật câu trả lời
        await existingAnswer.update({
          selectedoptionid: selectedOptionId,
          iscorrect: isCorrect,
        });
        return existingAnswer;
      } else {
        // Tạo câu trả lời mới
        const answer = await quizanswers.create({
          sessionid: sessionId,
          questionid: questionId,
          selectedoptionid: selectedOptionId,
          iscorrect: isCorrect,
        });
        return answer;
      }
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      throw error;
    }
  }

  /**
   * Nộp bài quiz
   * @param {number} userId - ID của user
   * @param {number} sessionId - ID của session
   * @returns {Promise<Object>}
   */
  async submitQuiz(userId, sessionId) {
    try {
      // Kiểm tra session thuộc về user
      const session = await quizsessions.findByPk(sessionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
          },
          {
            model: quizanswers,
            as: 'answers',
          },
        ],
      });

      if (!session) {
        throw new Error('Không tìm thấy session');
      }

      if (session.studentid !== userId) {
        const error = new Error('Bạn không có quyền truy cập session này');
        error.statusCode = 403;
        throw error;
      }

      if (session.submittedat) {
        throw new Error('Quiz đã được nộp rồi');
      }

      // Tính điểm
      const totalQuestions = session.quizanswers.length;
      const correctAnswers = session.quizanswers.filter(a => a.iscorrect).length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // Cập nhật session
      await session.update({
        submittedat: new Date(),
        score: score,
      });

      // Lấy lại session với đầy đủ thông tin
      const submittedSession = await quizsessions.findByPk(sessionId, {
        include: [
          {
            model: quizzes,
            as: 'quiz',
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
      });

      return submittedSession;
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      throw error;
    }
  }

  /**
   * Lấy kết quả quiz đã nộp
   * @param {number} userId - ID của user
   * @param {number} quizId - ID của quiz
   * @returns {Promise<Object>}
   */
  async getQuizResult(userId, quizId) {
    try {
      const session = await quizsessions.findOne({
        where: {
          quizid: quizId,
          studentid: userId,
          submittedat: { [Op.ne]: null }, // Đã nộp bài
        },
        include: [
          {
            model: quizzes,
            as: 'quiz',
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

      if (!session) {
        throw new Error('Bạn chưa nộp bài quiz này');
      }

      return session;
    } catch (error) {
      console.error('Error in getQuizResult:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem học viên đã hoàn thành 100% khóa học chưa và tự động cấp chứng chỉ
   * Hàm này chạy ngầm (background) để không chặn response
   * @param {number} studentId - ID của học viên
   * @param {number} courseId - ID của khóa học
   */
  async checkCourseCompletionAndIssueCertificate(studentId, courseId) {
    try {
      // 1. Đếm tổng số bài học trong khóa học
      const totalLessons = await lessons.count({
        where: { courseid: courseId }
      });

      if (totalLessons === 0) {
        console.log(`[Auto Certificate] Course ${courseId} has no lessons. Skipping.`);
        return;
      }

      // 2. Đếm số bài học mà học viên đã hoàn thành
      const completedLessons = await lessonprogress.count({
        where: {
          studentid: studentId,
          iscompleted: true
        },
        include: [{
          model: lessons,
          as: 'lesson',
          where: { courseid: courseId },
          required: true
        }]
      });

      // 3. Kiểm tra xem đã hoàn thành 100% chưa
      if (totalLessons !== completedLessons) {
        console.log(`[Auto Certificate] Student ${studentId} has completed ${completedLessons}/${totalLessons} lessons in course ${courseId}. Not yet 100%.`);
        return;
      }

      console.log(`[Auto Certificate] ✅ Student ${studentId} has completed 100% of course ${courseId}!`);

      // 4. Kiểm tra xem đã có coursecompletion record chưa
      let completion = await coursecompletions.findOne({
        where: {
          studentid: studentId,
          courseid: courseId
        }
      });

      // 5. Nếu chưa có, tạo mới
      if (!completion) {
        console.log(`[Auto Certificate] Creating course completion record...`);
        [completion] = await coursecompletions.findOrCreate({
          where: {
            studentid: studentId,
            courseid: courseId
          },
          defaults: {
            studentid: studentId,
            courseid: courseId,
            completedat: new Date()
          }
        });
      }

      // 6. Kiểm tra xem đã có certificate chưa
      let certificate = await certificates.findOne({
        where: {
          studentid: studentId,
          courseid: courseId
        }
      });

      // 7. Nếu chưa có certificate, tạo mới
      if (!certificate) {
        console.log(`[Auto Certificate] Creating certificate record...`);
        certificate = await certificates.create({
          studentid: studentId,
          courseid: courseId,
          issuedat: new Date()
        });
      }

      // 8. Nếu certificate đã được mint rồi, không cần làm gì nữa
      if (certificate.transactionhash) {
        console.log(`[Auto Certificate] Certificate ${certificate.certificateid} already minted. Skipping.`);
        return;
      }

      // 9. Lấy thông tin student và userdetails để kiểm tra wallet address
      const student = await users.findByPk(studentId, {
        include: [{
          model: userdetails,
          as: 'userdetails',
          required: false
        }]
      });

      if (!student) {
        console.log(`[Auto Certificate] Student ${studentId} not found. Skipping.`);
        return;
      }

      // 10. Lấy wallet address từ userdetails
      let walletAddress = null;
      if (student.userdetails) {
        if (Array.isArray(student.userdetails) && student.userdetails.length > 0) {
          walletAddress = student.userdetails[0].walletaddress;
        } else if (student.userdetails.walletaddress) {
          walletAddress = student.userdetails.walletaddress;
        }
      }

      if (!walletAddress) {
        console.log(`[Auto Certificate] Student ${studentId} does not have wallet address. Certificate created but not minted.`);
        // Tạo notification thông báo học viên cần cập nhật wallet address
        await notifications.create({
          userid: studentId,
          message: `Chúc mừng! Bạn đã hoàn thành khóa học. Vui lòng cập nhật địa chỉ ví để nhận chứng chỉ trên blockchain.`,
          isread: false,
          createdat: new Date()
        });
        return;
      }

      // 11. Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        console.log(`[Auto Certificate] Invalid wallet address format for student ${studentId}. Certificate created but not minted.`);
        await notifications.create({
          userid: studentId,
          message: `Chúc mừng! Bạn đã hoàn thành khóa học. Vui lòng cập nhật địa chỉ ví hợp lệ để nhận chứng chỉ trên blockchain.`,
          isread: false,
          createdat: new Date()
        });
        return;
      }

      // 12. Lấy thông tin course
      const course = await courses.findByPk(courseId);
      if (!course) {
        console.log(`[Auto Certificate] Course ${courseId} not found. Skipping.`);
        return;
      }

      // 13. Import certificateService và blockchainService
      const certificateService = require('./certificate.service');
      const blockchainService = require('./blockchainService');

      // 14. Tạo metadata JSON
      console.log(`[Auto Certificate] Creating metadata for certificate ${certificate.certificateid}...`);
      const metadataUrl = await certificateService.createCertificateMetadata(
        certificate.certificateid,
        student,
        course
      );

      // 15. Mint certificate trên blockchain
      console.log(`[Auto Certificate] Minting certificate ${certificate.certificateid} to wallet ${walletAddress}...`);
      const blockchainResult = await blockchainService.mintCertificateOnChain(
        walletAddress,
        metadataUrl,
        certificate.certificateid
      );

      // 16. Cập nhật certificate với transaction hash và token ID
      await certificate.update({
        transactionhash: blockchainResult.transactionHash,
        tokenid: blockchainResult.tokenId
      });

      console.log(`[Auto Certificate] ✅ Certificate ${certificate.certificateid} minted successfully!`);
      console.log(`   Transaction Hash: ${blockchainResult.transactionHash}`);
      console.log(`   Token ID: ${blockchainResult.tokenId}`);

      // 17. Tạo notification cho học viên
      await notifications.create({
        userid: studentId,
        message: `Chúc mừng! Chứng chỉ của bạn đã được gửi đến ví ${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 8)}. Token ID: ${blockchainResult.tokenId}`,
        isread: false,
        createdat: new Date()
      });

    } catch (error) {
      // Không throw error để không làm gián đoạn quá trình
      console.error(`[Auto Certificate] ❌ Error auto-issuing certificate for student ${studentId}, course ${courseId}:`, error.message);
      
      // Tạo notification thông báo lỗi (nếu có thể)
      try {
        await notifications.create({
          userid: studentId,
          message: `Chúc mừng! Bạn đã hoàn thành khóa học. Chứng chỉ đang được xử lý và sẽ được gửi đến ví của bạn sớm nhất.`,
          isread: false,
          createdat: new Date()
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }
  }
}

module.exports = new LearningService();

