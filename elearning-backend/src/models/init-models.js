var DataTypes = require("sequelize").DataTypes;
var _assignments = require("./assignments");
var _cart = require("./cart");
var _categories = require("./categories");
var _certificates = require("./certificates");
var _chapters = require("./chapters");
var _coursecompletions = require("./coursecompletions");
var _coursereviews = require("./coursereviews");
var _courses = require("./courses");
var _enrollments = require("./enrollments");
var _favorites = require("./favorites");
var _forumdiscussions = require("./forumdiscussions");
var _forumreplies = require("./forumreplies");
var _lessoncomments = require("./lessoncomments");
var _lessonprogress = require("./lessonprogress");
var _lessons = require("./lessons");
var _livesessions = require("./livesessions");
var _messages = require("./messages");
var _notifications = require("./notifications");
var _orderdetails = require("./orderdetails");
var _orders = require("./orders");
var _promotions = require("./promotions");
var _quizanswers = require("./quizanswers");
var _quizoptions = require("./quizoptions");
var _quizquestions = require("./quizquestions");
var _quizsessions = require("./quizsessions");
var _quizzes = require("./quizzes");
var _reports = require("./reports");
var _schedules = require("./schedules");
var _submissions = require("./submissions");
var _teacherrequests = require("./teacherrequests");
var _userdetails = require("./userdetails");
var _users = require("./users");

function initModels(sequelize) {
  var assignments = _assignments(sequelize, DataTypes);
  var cart = _cart(sequelize, DataTypes);
  var categories = _categories(sequelize, DataTypes);
  var certificates = _certificates(sequelize, DataTypes);
  var chapters = _chapters(sequelize, DataTypes);
  var coursecompletions = _coursecompletions(sequelize, DataTypes);
  var coursereviews = _coursereviews(sequelize, DataTypes);
  var courses = _courses(sequelize, DataTypes);
  var enrollments = _enrollments(sequelize, DataTypes);
  var favorites = _favorites(sequelize, DataTypes);
  var forumdiscussions = _forumdiscussions(sequelize, DataTypes);
  var forumreplies = _forumreplies(sequelize, DataTypes);
  var lessoncomments = _lessoncomments(sequelize, DataTypes);
  var lessonprogress = _lessonprogress(sequelize, DataTypes);
  var lessons = _lessons(sequelize, DataTypes);
  var livesessions = _livesessions(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var orderdetails = _orderdetails(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var promotions = _promotions(sequelize, DataTypes);
  var quizanswers = _quizanswers(sequelize, DataTypes);
  var quizoptions = _quizoptions(sequelize, DataTypes);
  var quizquestions = _quizquestions(sequelize, DataTypes);
  var quizsessions = _quizsessions(sequelize, DataTypes);
  var quizzes = _quizzes(sequelize, DataTypes);
  var reports = _reports(sequelize, DataTypes);
  var schedules = _schedules(sequelize, DataTypes);
  var submissions = _submissions(sequelize, DataTypes);
  var teacherrequests = _teacherrequests(sequelize, DataTypes);
  var userdetails = _userdetails(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

 // PHẦN 1: ĐỊNH NGHĨA CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // -----------------------------------------------------------------
  // --- Core (User, Category, Course, Chapter, Lesson) ---
  users.hasMany(courses, { as: "taughtCourses", foreignKey: "teacherid"});
  courses.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  
  categories.hasMany(courses, { as: "courses", foreignKey: "categoryid"});
  courses.belongsTo(categories, { as: "category", foreignKey: "categoryid"});

  courses.hasMany(chapters, { as: "chapters", foreignKey: "courseid"});
  chapters.belongsTo(courses, { as: "course", foreignKey: "courseid"});

  courses.hasMany(lessons, { as: "lessons", foreignKey: "courseid"});
  lessons.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  
  chapters.hasMany(lessons, { as: "lessons", foreignKey: "chapterid"});
  lessons.belongsTo(chapters, { as: "chapter", foreignKey: "chapterid"});

  // --- Learning Progress (User, Lesson, Progress, Completion, Certificate) ---
  users.hasMany(lessonprogress, { as: "progress", foreignKey: "studentid"});
  lessonprogress.belongsTo(users, { as: "student", foreignKey: "studentid"});
  
  lessons.hasMany(lessonprogress, { as: "progress", foreignKey: "lessonid"});
  lessonprogress.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});

  users.hasMany(coursecompletions, { as: "completions", foreignKey: "studentid"});
  coursecompletions.belongsTo(users, { as: "student", foreignKey: "studentid"});

  courses.hasMany(coursecompletions, { as: "completions", foreignKey: "courseid"});
  coursecompletions.belongsTo(courses, { as: "course", foreignKey: "courseid"});

  users.hasMany(certificates, { as: "certificates", foreignKey: "studentid"});
  certificates.belongsTo(users, { as: "student", foreignKey: "studentid"});

  courses.hasMany(certificates, { as: "certificates", foreignKey: "courseid"});
  certificates.belongsTo(courses, { as: "course", foreignKey: "courseid"});

  lessons.hasMany(lessoncomments, { as: "comments", foreignKey: "lessonid"});
  lessoncomments.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});

  users.hasMany(lessoncomments, { as: "comments", foreignKey: "studentid"});
  lessoncomments.belongsTo(users, { as: "student", foreignKey: "studentid"});

  // --- Assignments ---
  courses.hasMany(assignments, { as: "assignments", foreignKey: "courseid"});
  assignments.belongsTo(courses, { as: "course", foreignKey: "courseid"});

  assignments.hasMany(submissions, { as: "submissions", foreignKey: "assignmentid"});
  submissions.belongsTo(assignments, { as: "assignment", foreignKey: "assignmentid"});

  users.hasMany(submissions, { as: "submissions", foreignKey: "studentid"});
  submissions.belongsTo(users, { as: "student", foreignKey: "studentid"});

  // --- Quizzes ---
  lessons.hasMany(quizzes, { as: "quizzes", foreignKey: "lessonid"});
  quizzes.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});

  quizzes.hasMany(quizquestions, { as: "questions", foreignKey: "quizid"});
  quizquestions.belongsTo(quizzes, { as: "quiz", foreignKey: "quizid"});

  quizquestions.hasMany(quizoptions, { as: "options", foreignKey: "questionid"});
  quizoptions.belongsTo(quizquestions, { as: "question", foreignKey: "questionid"});

  quizzes.hasMany(quizsessions, { as: "sessions", foreignKey: "quizid"});
  quizsessions.belongsTo(quizzes, { as: "quiz", foreignKey: "quizid"});

  users.hasMany(quizsessions, { as: "quizSessions", foreignKey: "studentid"});
  quizsessions.belongsTo(users, { as: "student", foreignKey: "studentid"});

  quizsessions.hasMany(quizanswers, { as: "answers", foreignKey: "sessionid"});
  quizanswers.belongsTo(quizsessions, { as: "session", foreignKey: "sessionid"});

  quizquestions.hasMany(quizanswers, { as: "answers", foreignKey: "questionid"});
  quizanswers.belongsTo(quizquestions, { as: "question", foreignKey: "questionid"});

  quizoptions.hasMany(quizanswers, { as: "answers", foreignKey: "selectedoptionid"});
  quizanswers.belongsTo(quizoptions, { as: "selectedOption", foreignKey: "selectedoptionid"});
  
  // --- Forum ---
  courses.hasMany(forumdiscussions, { as: "discussions", foreignKey: "courseid"});
  forumdiscussions.belongsTo(courses, { as: "course", foreignKey: "courseid"});

  users.hasMany(forumdiscussions, { as: "discussions", foreignKey: "createdby"});
  forumdiscussions.belongsTo(users, { as: "author", foreignKey: "createdby"});

  forumdiscussions.hasMany(forumreplies, { as: "replies", foreignKey: "discussionid"});
  forumreplies.belongsTo(forumdiscussions, { as: "discussion", foreignKey: "discussionid"});

  users.hasMany(forumreplies, { as: "replies", foreignKey: "userid"});
  forumreplies.belongsTo(users, { as: "author", foreignKey: "userid"});

  // --- PHẦN BỔ SUNG: Các quan hệ chỉ có trong code gốc (Input 1) ---
  // (E-commerce, Reviews, Social, Admin, etc.)
  cart.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(cart, { as: "carts", foreignKey: "courseid"});

  cart.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(cart, { as: "carts", foreignKey: "userid"});

  coursereviews.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(coursereviews, { as: "coursereviews", foreignKey: "courseid"});

  coursereviews.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(coursereviews, { as: "coursereviews", foreignKey: "studentid"});

  enrollments.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(enrollments, { as: "enrollments", foreignKey: "courseid"});

  enrollments.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(enrollments, { as: "enrollments", foreignKey: "studentid"});

  favorites.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(favorites, { as: "favorites", foreignKey: "courseid"});

  favorites.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(favorites, { as: "favorites", foreignKey: "userid"});

  livesessions.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(livesessions, { as: "livesessions", foreignKey: "courseid"});

  livesessions.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  users.hasMany(livesessions, { as: "livesessions", foreignKey: "teacherid"});

  orderdetails.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(orderdetails, { as: "orderdetails", foreignKey: "courseid"});

  orderdetails.belongsTo(orders, { as: "order", foreignKey: "orderid"});
  orders.hasMany(orderdetails, { as: "orderdetails", foreignKey: "orderid"});

  orders.belongsTo(promotions, { as: "promotion", foreignKey: "promotionid"});
  promotions.hasMany(orders, { as: "orders", foreignKey: "promotionid"});

  orders.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(orders, { as: "orders", foreignKey: "userid"});

  reports.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(reports, { as: "reports", foreignKey: "courseid"});

  reports.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(reports, { as: "reports", foreignKey: "studentid"});

  schedules.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(schedules, { as: "schedules", foreignKey: "courseid"});

  schedules.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  users.hasMany(schedules, { as: "schedules", foreignKey: "teacherid"});

  messages.belongsTo(users, { as: "receiver", foreignKey: "receiverid"});
  users.hasMany(messages, { as: "messages", foreignKey: "receiverid"});

  messages.belongsTo(users, { as: "sender", foreignKey: "senderid"});
  users.hasMany(messages, { as: "sender_messages", foreignKey: "senderid"});

  notifications.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "userid"});

  teacherrequests.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(teacherrequests, { as: "teacherrequests", foreignKey: "userid"});

  userdetails.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(userdetails, { as: "userdetails", foreignKey: "userid"});


// -----------------------------------------------------------------
  // PHẦN 2: LOGIC TỰ ĐỘNG (SEQUELIZE HOOKS)
  // -----------------------------------------------------------------

  // Hook 1: Sau khi một LessonProgress được tạo/cập nhật
  lessonprogress.addHook('afterUpdate', 'checkCourseCompletion', async (progress, options) => {
    // Chỉ chạy logic nếu bài học vừa được đánh dấu là "hoàn thành"
    if (progress.iscompleted && progress.previous('iscompleted') === false) {
      const studentId = progress.studentid;
      const lesson = await lessons.findByPk(progress.lessonid);
      if (!lesson) return; // Không tìm thấy bài học
      
      const courseId = lesson.courseid;

      // 1. Đếm tổng số bài học trong khóa học này
      const totalLessons = await lessons.count({
        where: { courseid: courseId }
      });

      // 2. Đếm số bài học mà học viên này đã hoàn thành trong khóa học
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

      // 3. So sánh
      if (totalLessons > 0 && totalLessons === completedLessons) {
        // 4. Kiểm tra xem đã có bản ghi hoàn thành chưa
        const existingCompletion = await coursecompletions.findOne({
          where: {
            studentid: studentId,
            courseid: courseId
          }
        });

        // 5. Nếu chưa có, tạo mới
        if (!existingCompletion) {
          console.log(`[Hook] Student ${studentId} completed course ${courseId}. Generating completion record...`);
          await coursecompletions.create({
            studentid: studentId,
            courseid: courseId,
            completedat: new Date()
          });
        }
      }
    }
  });

  // Hook 2: Sau khi một CourseCompletion được tạo -> Tự động tạo Certificate
  coursecompletions.addHook('afterCreate', 'generateCertificate', async (completion, options) => {
    const studentId = completion.studentid;
    const courseId = completion.courseid;

    // 1. Kiểm tra xem đã có chứng chỉ chưa
    const existingCertificate = await certificates.findOne({
      where: {
        studentid: studentId,
        courseid: courseId
      }
    });

    // 2. Nếu chưa có, tạo mới
    if (!existingCertificate) {
      console.log(`[Hook] Generating certificate for student ${studentId}, course ${courseId}...`);
      await certificates.create({
        studentid: studentId,
        courseid: courseId,
        issuedat: new Date()
      });
    }
  });

  // -----------------------------------------------------------------
  // PHẦN 3: TRẢ VỀ CÁC MODEL
  // -----------------------------------------------------------------

  return {
    assignments,
    cart,
    categories,
    certificates,
    chapters,
    coursecompletions,
    coursereviews,
    courses,
    enrollments,
    favorites,
    forumdiscussions,
    forumreplies,
    lessoncomments,
    lessonprogress,
    lessons,
    livesessions,
    messages,
    notifications,
    orderdetails,
    orders,
    promotions,
    quizanswers,
    quizoptions,
    quizquestions,
    quizsessions,
    quizzes,
    reports,
    schedules,
    submissions,
    teacherrequests,
    userdetails,
    users,
  };
}

// Export hàm initModels
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
