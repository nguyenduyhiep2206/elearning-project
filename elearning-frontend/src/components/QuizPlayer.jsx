import React, { useState, useEffect } from 'react';
import { quizService } from '../services/quiz.service'; 
// Lưu ý: Đường dẫn '../services' là đúng vì components và services cùng cấp trong src

const QuizPlayer = ({ quizId, onComplete }) => {
  // State quản lý dữ liệu
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null); // Lưu phiên làm bài
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: optionId }
  const [result, setResult] = useState(null); // Kết quả trả về từ server
  
  // State giao diện
  const [step, setStep] = useState('intro'); // 'intro' | 'taking' | 'result'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Tải thông tin đề thi
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        setQuiz(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải đề thi.");
      }
    };
    if (quizId) fetchQuiz();
  }, [quizId]);

  // 2. Bắt đầu làm bài
  const handleStart = async () => {
    setLoading(true);
    try {
      // Gọi API start để lấy sessionId
      const res = await quizService.startQuiz(quizId);
      setSession(res.data.session);
      setStep('taking');
    } catch (err) {
      alert("Lỗi khi bắt đầu: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 3. Chọn đáp án
  const handleSelectOption = (questionId, optionId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // 4. Nộp bài
  const handleSubmit = async () => {
    // Validate: Hỏi nếu chưa làm hết
    const unansweredCount = quiz.questions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`Bạn còn ${unansweredCount} câu chưa chọn. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      // Format dữ liệu đúng chuẩn Backend yêu cầu
      const payload = {
        sessionId: session.sessionid,
        answers: Object.entries(userAnswers).map(([qId, optId]) => ({
          questionId: parseInt(qId),
          selectedOptionId: optId
        }))
      };

      const res = await quizService.submitQuiz(payload);
      setResult(res.data); // Server trả về: { score, correctAnswers, totalQuestions... }
      setStep('result');
      
      // Gọi callback báo cho trang cha biết (để đánh dấu hoàn thành bài học)
      if (onComplete && res.data.score >= 5) { // Ví dụ: Điểm >= 5 là qua
        onComplete();
      }

    } catch (err) {
      alert("Lỗi nộp bài: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>;
  if (!quiz) return <div className="p-4 text-gray-500">Đang tải bài kiểm tra...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 mt-6">
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">📝 Bài kiểm tra: {quiz.title}</h2>
      </div>
      
      {/* --- MÀN HÌNH 1: GIỚI THIỆU --- */}
      {step === 'intro' && (
        <div className="text-center py-6">
          <div className="mb-6 space-y-2 text-gray-600">
            <p>⏱️ Thời gian: <span className="font-semibold">{quiz.timelimit || 'Không giới hạn'} phút</span></p>
            <p>❓ Số câu hỏi: <span className="font-semibold">{quiz.questions?.length} câu</span></p>
            <p>🎯 Điểm đạt: <span className="font-semibold">5/10</span></p>
          </div>
          <button 
            onClick={handleStart}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-400"
          >
            {loading ? 'Đang khởi tạo...' : 'Bắt đầu làm bài'}
          </button>
        </div>
      )}

      {/* --- MÀN HÌNH 2: ĐANG LÀM BÀI --- */}
      {step === 'taking' && (
        <div className="animate-fade-in">
          <div className="space-y-8 mb-8">
            {quiz.questions?.map((q, index) => (
              <div key={q.questionid} className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-bold text-gray-800 mb-4 text-lg">
                  <span className="text-blue-600 mr-2">Câu {index + 1}:</span> 
                  {q.questiontext}
                </p>
                
                <div className="space-y-3 pl-2">
                  {q.options?.map(opt => (
                    <label 
                      key={opt.optionid} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        userAnswers[q.questionid] === opt.optionid 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.questionid}`}
                        value={opt.optionid}
                        checked={userAnswers[q.questionid] === opt.optionid}
                        onChange={() => handleSelectOption(q.questionid, opt.optionid)}
                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{opt.optiontext}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow disabled:bg-gray-400"
            >
              {loading ? 'Đang chấm điểm...' : 'Nộp bài thi'}
            </button>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH 3: KẾT QUẢ --- */}
      {step === 'result' && result && (
        <div className="text-center py-8 animate-fade-in">
          <div className="text-7xl mb-6">
            {result.score >= 5 ? '🎉' : '😓'}
          </div>
          
          <h3 className="text-3xl font-bold mb-2 text-gray-800">
            Kết quả: <span className={result.score >= 5 ? 'text-green-600' : 'text-red-500'}>{result.score}/10</span>
          </h3>
          
          <p className="text-gray-600 mb-8 text-lg">
            Bạn đã trả lời đúng <span className="font-bold text-gray-900">{result.correctAnswers}</span> trên tổng số <span className="font-bold text-gray-900">{result.totalQuestions}</span> câu hỏi.
          </p>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                 setStep('intro');
                 setSession(null);
                 setUserAnswers({});
              }} 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Làm lại bài thi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;