import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Clock, 
  RotateCcw, 
  Eye, 
  Home, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  FileText,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Question, UserAnswers } from '../types';
import { CATEGORIES, getCategoryForQuestionId } from '../data/categories';

interface ResultsViewProps {
  questions: Question[];
  answers: UserAnswers;
  timeSpent: number;
  onRestart: () => void;
  onReviewAnswers: () => void;
  onBackToDashboard: () => void;
}

export function ResultsView({
  questions,
  answers,
  timeSpent,
  onRestart,
  onReviewAnswers,
  onBackToDashboard
}: ResultsViewProps) {
  // Score calculations
  const totalQuestions = questions.length;
  
  const correctCount = useMemo(() => {
    return questions.filter(q => answers[q.id] === q.answer).length;
  }, [questions, answers]);

  const incorrectCount = useMemo(() => {
    return questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
  }, [questions, answers]);

  const skippedCount = totalQuestions - correctCount - incorrectCount;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Format second to minutes and seconds
  const formatSpentTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s} giây`;
  };

  // Determine feedback text and colors
  let feedbackTitle = 'Cần ôn luyện thêm';
  let feedbackDesc = 'Kiến thức của bạn về GDQPAN cần được bồi đắp nhiều hơn. Hãy bắt đầu luyện tập phân chuyên đề trước nhé!';
  let feedbackColor = 'text-rose-600 bg-rose-50 border-rose-100';
  let iconBg = 'bg-rose-100 text-rose-600';

  if (scorePercentage >= 85) {
    feedbackTitle = 'Cực kỳ Xuất Sắc!';
    feedbackDesc = 'Bạn đã nắm vững lý thuyết GDQPAN rất vững chắc. Bạn hoàn toàn sẵn sàng cho kỳ thi chính thức đạt điểm cao!';
    feedbackColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
    iconBg = 'bg-emerald-100 text-emerald-600';
  } else if (scorePercentage >= 50) {
    feedbackTitle = 'Chúc mừng, Bạn đã Đạt!';
    feedbackDesc = 'Bạn đã vượt qua bài kiểm tra với số điểm tương đối tốt. Hãy củng cố thêm các câu còn trả lời sai để đạt kết quả xuất sắc nhé.';
    feedbackColor = 'text-indigo-700 bg-indigo-50 border-indigo-100';
    iconBg = 'bg-indigo-100 text-indigo-600';
  }

  // Calculate scores per category for diagnostic breakdown
  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      // Filter questions belonging to this category that are present in our active questions list
      const catQuestions = questions.filter(q => q.id >= cat.startId && q.id <= cat.endId);
      const totalInCat = catQuestions.length;

      if (totalInCat === 0) return null; // skip category if no questions present in active quiz context

      const correctInCat = catQuestions.filter(q => answers[q.id] === q.answer).length;
      const incorrectInCat = catQuestions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
      const accuracy = totalInCat > 0 ? (correctInCat / totalInCat) * 100 : 0;

      return {
        name: cat.name,
        correct: correctInCat,
        total: totalInCat,
        accuracy
      };
    }).filter(Boolean);
  }, [questions, answers]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Rating Score Dashboard Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left md:max-w-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase block">
                KẾT QUẢ BÀI LÀM
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                Kỳ Thi Trắc Nghiệm GDQPAN
              </h2>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${feedbackColor}`}>
              <h3 className="font-bold text-sm mb-1">{feedbackTitle}</h3>
              <p>{feedbackDesc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Đúng: {correctCount}/{totalQuestions}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                <XCircle className="h-4 w-4 text-rose-500" /> Sai: {incorrectCount}
              </span>
              {skippedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <HelpCircle className="h-4 w-4 text-slate-400" /> Bỏ qua: {skippedCount}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                <Clock className="h-4 w-4 text-slate-500" /> Thời gian: {formatSpentTime(timeSpent)}
              </span>
            </div>
          </div>

          {/* Radial score display ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="relative h-32 w-32 md:h-36 md:w-36 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  fill="transparent"
                  stroke={scorePercentage >= 85 ? '#10b981' : scorePercentage >= 50 ? '#4f46e5' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - scorePercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 font-mono">
                  {scorePercentage}
                </span>
                <span className="text-xs font-extrabold text-slate-400 uppercase block tracking-wider mt-0.5">%</span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-500 font-mono uppercase tracking-wider">Tỷ lệ chính xác</span>
          </div>
        </div>

        {/* Diagnostic Chart Breakdown analysis */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm md:text-base flex items-center gap-2 mb-4">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              Điểm Chẩn Đoán Theo Chuyên Đề (Topic Insights)
            </h3>
            
            <p className="text-xs text-slate-500 mb-6">
              Bảng biểu phân tích mức độ chuẩn xác của bạn trong từng nội dung cốt lõi giúp bạn phát hiện phần kiến thức còn yếu.
            </p>

            <div className="space-y-4">
              {categoryStats.map((stat, idx) => {
                if (!stat) return null;
                const progressColor = stat.accuracy >= 85 
                  ? 'bg-emerald-500' 
                  : stat.accuracy >= 50 
                    ? 'bg-indigo-600' 
                    : 'bg-rose-500';

                return (
                  <div key={stat.name} className="space-y-1.5" id={`diagnostic-topic-${idx}`}>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs font-bold text-slate-700 line-clamp-1">{stat.name}</span>
                      <span className="text-xs font-mono font-bold text-slate-500 flex-shrink-0">
                        {stat.correct}/{stat.total} câu ({Math.round(stat.accuracy)}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${stat.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onReviewAnswers}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
            id="result-review-btn"
          >
            <Eye className="h-4 w-4" /> Xem lại bài chi tiết
          </button>
          
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold text-sm rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-2"
            id="result-retry-btn"
          >
            <RotateCcw className="h-4 w-4" /> Làm lại đề thi này
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
            id="result-home-btn"
          >
            <Home className="h-4 w-4" /> Quay về màn hình chính
          </button>
        </div>

      </motion.div>
    </div>
  );
}
