import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Clock, 
  History, 
  Play, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Activity, 
  Calendar,
  AlertTriangle,
  Shuffle,
  Settings
} from 'lucide-react';
import { Question, QuizMode, HistoricalResult } from '../types';
import { CATEGORIES, Category } from '../data/categories';
import { QUESTIONS } from '../data/questions';

interface DashboardProps {
  history: HistoricalResult[];
  onStartQuiz: (mode: QuizMode, subset: Question[], title: string) => void;
  onViewPastResult: (result: HistoricalResult) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  onToggleShuffleQuestions: (val: boolean) => void;
  onToggleShuffleOptions: (val: boolean) => void;
}

export function Dashboard({
  history,
  onStartQuiz,
  onViewPastResult,
  onDeleteHistoryItem,
  onClearHistory,
  shuffleQuestions,
  shuffleOptions,
  onToggleShuffleQuestions,
  onToggleShuffleOptions
}: DashboardProps) {
  // Stats calculations
  const totalTests = history.length;
  const examTests = history.filter(h => h.mode === 'exam');
  
  const bestScore = history.length > 0 
    ? Math.max(...history.map(h => (h.score / h.total) * 100)) 
    : 0;

  const averageAccuracy = history.length > 0
    ? history.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / history.length * 100
    : 0;

  // Let's count how many questions are answered in each category across history to see strengths?
  // But standard stats are perfect. Let's keep it highly performant.

  const getRandomSubset = <T,>(array: T[], size: number, shuffle: boolean): T[] => {
    if (!shuffle) {
      return array.slice(0, Math.min(size, array.length));
    }
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(size, array.length));
  };

  const handleStartPracticeFull = () => {
    const subset = getRandomSubset(QUESTIONS, QUESTIONS.length, shuffleQuestions);
    onStartQuiz('practice', subset, `Luyện tập: Bộ đề ${QUESTIONS.length} câu ngẫu nhiên`);
  };

  const handleStartExamFull = () => {
    // Exam mode is best experienced completely shuffled to sample a rigorous full test
    const subset = getRandomSubset(QUESTIONS, QUESTIONS.length, true);
    onStartQuiz('exam', subset, `Thi thử: Đề thi ${QUESTIONS.length} câu chuẩn cấu trúc`);
  };

  const handleStartPracticeCategory = (cat: Category) => {
    const subset = QUESTIONS.filter(q => q.id >= cat.startId && q.id <= cat.endId);
    onStartQuiz('practice', subset, `${cat.name}`);
  };

  const handleStartExamCategory = (cat: Category) => {
    const subset = QUESTIONS.filter(q => q.id >= cat.startId && q.id <= cat.endId);
    onStartQuiz('exam', subset, `Thi chuyên đề: ${cat.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pointer-events-auto">
      {/* Intro Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4 font-mono">
            Môn học: Đại Cương Giáo Dục Quốc Phòng - An Ninh (GDQPAN)
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Hệ Thống Luyện Thi Trắc Nghiệm GDQPAN
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-sm md:text-base">
            Ngân hàng câu hỏi trắc nghiệm Đại Cương Giáo Dục Quốc Phòng - An Ninh đầy đủ, chuẩn cấu trúc.
            Hỗ trợ luyện tập ngẫu nhiên đề {QUESTIONS.length} câu tráo đáp án học hiệu quả tức thì!
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="h-6 w-6" id="dashboard-stat-activity-icon" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Lượt kiểm tra</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalTests}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="h-6 w-6" id="dashboard-stat-award-icon" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium font-sans">Điểm cao nhất</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {bestScore.toFixed(1)}%
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="h-6 w-6" id="dashboard-stat-accuracy-icon" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Chính xác trung bình</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {averageAccuracy.toFixed(1)}%
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <Clock className="h-6 w-6" id="dashboard-stat-clock-icon" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Lượt thi thử</p>
              <h3 className="text-2xl font-bold text-slate-800">{examTests.length} đề</h3>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Full Scope and Categories */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shuffling Configuration Bento Box widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
            <div className="space-y-1 pl-2">
              <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-600 animate-spin-slow" />
                Cấu hình xáo trộn bộ đề
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Tự động tráo ngẫu nhiên ví trí câu hỏi hoặc thay đổi thứ tự đáp án (A,B,C,D) khi bắt đầu làm bài để tránh học vẹt.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              {/* Question Shuffle Switch */}
              <button
                onClick={() => onToggleShuffleQuestions(!shuffleQuestions)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer outline-hidden ${
                  shuffleQuestions
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-500'
                }`}
                title="Thay đổi vị trí xuất hiện của các câu trắc nghiệm"
                id="toggle-shuffle-questions"
              >
                <Shuffle className={`h-3 w-3 ${shuffleQuestions ? 'animate-pulse' : ''}`} />
                Tráo câu hỏi: <span className={shuffleQuestions ? 'text-indigo-800 font-extrabold' : 'font-semibold'}>{shuffleQuestions ? 'BẬT' : 'TẮT'}</span>
              </button>

              {/* Option Shuffle Switch */}
              <button
                onClick={() => onToggleShuffleOptions(!shuffleOptions)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer outline-hidden ${
                  shuffleOptions
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-500'
                }`}
                title="Đảo ngẫu nhiên các phương án lựa chọn (A, B, C, D)"
                id="toggle-shuffle-options"
              >
                <Shuffle className={`h-3 w-3 ${shuffleOptions ? 'animate-pulse' : ''}`} />
                Tráo đáp án: <span className={shuffleOptions ? 'text-indigo-800 font-extrabold' : 'font-semibold'}>{shuffleOptions ? 'BẬT' : 'TẮT'}</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Chọn Phạm Vi Luyện Tập
          </h2>

          {/* Full Questions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Practice Full Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs relative overflow-hidden group flex flex-col justify-between"
              id="full-practice-card"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110 duration-300" />
              <div className="relative">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 font-mono">
                  Luyện tập tự do
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">
                  Đề Luyện Tập Ngẫu Nhiên {QUESTIONS.length} Câu
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Tự động rút ngẫu nhiên hoặc sắp xếp đầy đủ toàn bộ {QUESTIONS.length} câu của đề cương. Xem ngay đáp án, giải thích chi tiết sau mỗi câu.
                </p>
              </div>
              <button
                onClick={handleStartPracticeFull}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-sm text-sm"
                id="btn-practice-all"
              >
                <Play className="h-4 w-4" /> Bắt đầu luyện tập
              </button>
            </motion.div>

            {/* Exam Full Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs relative overflow-hidden group flex flex-col justify-between"
              id="full-exam-card"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110 duration-300" />
              <div className="relative">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 font-mono">
                  Thi thử (Có tính giờ)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">
                  Đề Thi Thử {QUESTIONS.length} Câu
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Đề thi thử gồm đầy đủ {QUESTIONS.length} câu đại cương. Thời gian làm bài: 90 phút. Đáp án chỉ được tiết lộ sau khi ấn nộp bài.
                </p>
              </div>
              <button
                onClick={handleStartExamFull}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-sm text-sm"
                id="btn-exam-all"
              >
                <Clock className="h-4 w-4 text-rose-400" /> Bắt đầu thi thử (90p)
              </button>
            </motion.div>
          </div>

          {/* Topics/Categories section */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Luyện tập chuyên đề (Chia nhỏ để học nhanh)
            </h3>
            <div className="space-y-3">
              {CATEGORIES.map((cat, idx) => {
                const count = cat.endId - cat.startId + 1;
                return (
                  <div 
                    key={cat.name}
                    className="p-4 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm md:text-base font-bold text-slate-800">
                          {cat.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-8">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-8 md:pl-0">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-sm font-mono mr-1">
                        Câu {cat.startId} - {cat.endId} ({count} câu)
                      </span>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleStartPracticeCategory(cat)}
                          title="Luyện tập tự do chương này"
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                        >
                          Luyện tập
                        </button>
                        <button
                          onClick={() => handleStartExamCategory(cat)}
                          title="Thi thử tính giờ chương này"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          Thi thử
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: History list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              Lịch Sử Làm Bài
            </h2>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-500 font-semibold hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                id="btn-clear-history"
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa toàn bộ
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-dashed border-slate-200 text-center text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-3 stroke-1 text-slate-300" />
              <p className="text-sm font-medium">Chưa có kết quả làm bài nào</p>
              <p className="text-xs text-slate-400 mt-1">Các lượt thi hoặc luyện tập sau khi hoàn thành sẽ được lưu trữ tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto scroll-thin pr-1">
              {history.map((item) => {
                const formattedDate = new Date(item.date).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                const percentage = (item.score / item.total) * 100;
                let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (percentage < 50) colorClass = 'bg-rose-50 text-rose-700 border-rose-100';
                else if (percentage < 80) colorClass = 'bg-amber-50 text-amber-700 border-amber-100';

                return (
                  <div 
                    key={item.id}
                    className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border font-mono ${
                            item.mode === 'exam' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {item.mode === 'exam' ? 'Thi thử' : 'Luyện tập'}
                          </span>
                        </div>
                        <h4 className="text-xs text-slate-500 font-medium mt-1 font-mono flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formattedDate}
                        </h4>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-sm font-extrabold font-mono ${colorClass}`}>
                        {item.score}/{item.total}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-2.5">
                      <span>Thời gian: {Math.floor(item.timeSpent / 60)} phút {item.timeSpent % 60} giây</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewPastResult(item)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          Xem lại <ChevronRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteHistoryItem(item.id)}
                          title="Xóa kết quả này"
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Academic info card */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100/60 text-amber-900/80 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold mb-1">Mẹo Luyện Thi Hiệu Quả:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Bắt đầu luyện tập từng <strong>Chuyên đề</strong> để nắm vững kiến thức nền tảng trước.</li>
                <li>Dùng nút <strong>Đánh dấu xem lại</strong> trong quá trình làm bài đối với những câu phân vân.</li>
                <li>Sau khi thi thử, hãy xem kỹ phần giải thích chi tiết trong mục <strong>Lịch sử làm bài</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
