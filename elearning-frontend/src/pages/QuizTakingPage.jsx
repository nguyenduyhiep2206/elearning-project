import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '../services';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QuizTakingPage = () => {
  const { id: courseId, quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Start quiz or get current session
  const { data: sessionData, isLoading: isLoadingSession, error: sessionError } = useQuery({
    queryKey: ['learning', 'quiz-session', quizId],
    queryFn: async () => {
      // Try to get current session first
      try {
        const response = await learningService.getCurrentSession(quizId);
        return response.data.data;
      } catch (error) {
        // If no session, start a new one
        if (error.response?.status === 404) {
          const startResponse = await learningService.startQuiz(quizId);
          return startResponse.data.data;
        }
        throw error;
      }
    },
    enabled: !!quizId,
    retry: false,
  });

  const session = sessionData;
  const quiz = session?.quiz;
  const questions = quiz?.questions || [];
  const answers = session?.answers || [];

  // Initialize selected answers from existing answers
  useEffect(() => {
    if (answers.length > 0) {
      const initialAnswers = {};
      answers.forEach(answer => {
        initialAnswers[answer.questionid] = answer.selectedoptionid;
      });
      setSelectedAnswers(initialAnswers);
    }
  }, [answers]);

  // Timer countdown
  useEffect(() => {
    if (!session?.endtime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(session.endtime);
      const diff = Math.max(0, end - now);
      
      if (diff === 0) {
        // Time's up, auto submit
        if (session?.sessionid && !session?.submittedat) {
          submitQuizMutation.mutate(session.sessionid);
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session?.endtime, session?.sessionid, session?.submittedat]);

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, selectedOptionId }) =>
      learningService.submitAnswer(session.sessionid, questionId, selectedOptionId),
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi lưu câu trả lời',
      });
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: (sessionId) => learningService.submitQuiz(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning', 'quiz-session', quizId]);
      queryClient.invalidateQueries(['learning', 'quizzes']);
      navigate(`/courses/${courseId}/learn/quiz/${quizId}/result`);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi nộp bài',
      });
    },
  });

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Auto-save answer
    if (session?.sessionid) {
      submitAnswerMutation.mutate({
        questionId,
        selectedOptionId: optionId,
      });
    }
  };

  const handleSubmitQuiz = () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể thay đổi câu trả lời.')) {
      return;
    }

    if (session?.sessionid) {
      submitQuizMutation.mutate(session.sessionid);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải quiz</h1>
            <p className="text-gray-600 mb-6">
              {sessionError?.response?.data?.message || 'Có lỗi xảy ra khi tải quiz'}
            </p>
            <button
              onClick={() => navigate(`/courses/${courseId}/learn`)}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (session.submittedat) {
    // Already submitted, redirect to result
    navigate(`/courses/${courseId}/learn/quiz/${quizId}/result`);
    return null;
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Notification Banner */}
      {notification.message && (
        <div
          className={`${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          } border-b px-4 py-3 text-center`}
        >
          {notification.message}
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="ml-4 text-sm underline"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            {timeRemaining && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Thời gian còn lại</div>
                <div className={`text-2xl font-bold ${
                  timeRemaining.minutes < 5 ? 'text-red-600' : 'text-teal-600'
                }`}>
                  {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Tổng số câu: {totalQuestions}</span>
            <span>Đã trả lời: {answeredCount}/{totalQuestions}</span>
            {quiz.timelimit && <span>Thời gian: {quiz.timelimit} phút</span>}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => {
            const selectedOptionId = selectedAnswers[question.questionid];
            return (
              <div key={question.questionid} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Câu {index + 1}: {question.questiontext}
                  </h3>
                </div>
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <label
                      key={option.optionid}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedOptionId === option.optionid
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.questionid}`}
                        value={option.optionid}
                        checked={selectedOptionId === option.optionid}
                        onChange={() => handleAnswerSelect(question.questionid, option.optionid)}
                        className="mt-1 mr-3 w-4 h-4 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="flex-1 text-gray-700">{option.optiontext}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Đã trả lời {answeredCount}/{totalQuestions} câu hỏi
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}/learn`)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isLoading}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitQuizMutation.isLoading ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuizTakingPage;

