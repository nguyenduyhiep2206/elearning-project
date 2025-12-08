import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningService } from '../services';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QuizResultPage = () => {
  const { id: courseId, quizId } = useParams();
  const navigate = useNavigate();

  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ['learning', 'quiz-result', quizId],
    queryFn: () => learningService.getQuizResult(quizId),
    enabled: !!quizId,
  });

  const session = resultData?.data?.data;
  const quiz = session?.quiz;
  const questions = quiz?.questions || [];
  const answers = session?.answers || [];

  if (isLoading) {
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

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy kết quả</h1>
            <p className="text-gray-600 mb-6">
              {error?.response?.data?.message || 'Bạn chưa nộp bài quiz này'}
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

  const correctAnswers = answers.filter(a => a.iscorrect).length;
  const totalQuestions = questions.length;
  const score = session.score || 0;
  const scorePercentage = (score / 100) * 100;

  // Create a map of answers by question ID for easy lookup
  const answerMap = {};
  answers.forEach(answer => {
    answerMap[answer.questionid] = answer;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Result Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
          
          <div className="mb-6">
            <div className="inline-block relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${scorePercentage * 3.516} 351.6`}
                  className="text-teal-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{score.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div>
              <div className="text-3xl font-bold text-teal-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Câu đúng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-gray-600">Câu sai</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Tổng câu</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Nộp bài lúc: {new Date(session.submittedat).toLocaleString('vi-VN')}
          </div>
        </div>

        {/* Questions Review */}
        {quiz.showanswersaftersubmission && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết câu trả lời</h2>
            {questions.map((question, index) => {
              const answer = answerMap[question.questionid];
              const isCorrect = answer?.iscorrect;
              const selectedOption = question.options?.find(
                opt => opt.optionid === answer?.selectedoptionid
              );
              const correctOption = question.options?.find(
                opt => opt.optionid === question.correctoptionid
              );

              return (
                <div
                  key={question.questionid}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        Câu {index + 1}: {question.questiontext}
                      </span>
                      {isCorrect ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Đúng
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          Sai
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const isSelected = option.optionid === answer?.selectedoptionid;
                      const isCorrectAnswer = option.optionid === question.correctoptionid;

                      return (
                        <div
                          key={option.optionid}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectAnswer && (
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {isSelected && !isCorrectAnswer && (
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span
                              className={`${
                                isCorrectAnswer
                                  ? 'font-semibold text-green-800'
                                  : isSelected
                                  ? 'font-semibold text-red-800'
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.optiontext}
                              {isCorrectAnswer && ' (Đáp án đúng)'}
                              {isSelected && !isCorrectAnswer && ' (Bạn đã chọn)'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/courses/${courseId}/learn`)}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              Quay lại khóa học
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuizResultPage;

