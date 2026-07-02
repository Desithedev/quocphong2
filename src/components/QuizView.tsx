import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  HelpCircle, 
  Clock, 
  Search, 
  Filter, 
  Check, 
  X, 
  FileCheck, 
  History,
  AlertCircle,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { Question, QuizMode, UserAnswers, QuestionFlags } from '../types';
import { getCategoryForQuestionId } from '../data/categories';

interface QuizViewProps {
  mode: QuizMode;
  questions: Question[];
  title: string;
  onExit: () => void;
  onSubmitResults: (answers: UserAnswers, timeSpent: number) => void;
  pastResultAnswers?: UserAnswers; 
  isReviewMode?: boolean;
}

const isAnswerComplete = (question: Question, ans?: string): boolean => {
  if (!ans) return false;
  if (question.type === 'single-choice') return true;
  return !ans.includes('-');
};

const getTrueFalseCombinations = (qId: number, qAnswer: string) => {
  const correct = qAnswer.split(','); // e.g. ['Đ', 'S', 'Đ', 'S']
  const len = correct.length;
  
  const comboA = [...correct];
  const comboB = correct.map(v => v === 'Đ' ? 'S' : 'Đ');
  
  const comboC = Array(len).fill('S');
  for (let i = 0; i < Math.ceil(len / 2); i++) comboC[i] = 'Đ';
  if (comboC.join(',') === comboA.join(',') || comboC.join(',') === comboB.join(',')) {
    for (let i = 0; i < len; i++) comboC[i] = i % 2 === 0 ? 'Đ' : 'S';
  }
  
  const comboD = Array(len).fill('Đ');
  for (let i = 0; i < Math.ceil(len / 2); i++) comboD[i] = 'S';
  if (comboD.join(',') === comboA.join(',') || comboD.join(',') === comboB.join(',') || comboD.join(',') === comboC.join(',')) {
    for (let i = 0; i < len; i++) comboD[i] = i % 2 === 1 ? 'Đ' : 'S';
  }
  
  // Create our 4 raw options
  const list = [
    { value: comboA.map((v, i) => `${i + 1}-${v}`).join(', '), raw: comboA.join(','), isCorrect: true },
    { value: comboB.map((v, i) => `${i + 1}-${v}`).join(', '), raw: comboB.join(','), isCorrect: false },
    { value: comboC.map((v, i) => `${i + 1}-${v}`).join(', '), raw: comboC.join(','), isCorrect: false },
    { value: comboD.map((v, i) => `${i + 1}-${v}`).join(', '), raw: comboD.join(','), isCorrect: false }
  ];
  
  // Shuffle using a simple stable hashing method based on qId
  const hashedSeed = (qId * 9301 + 49297) % 233280;
  const indexOrder = [0, 1, 2, 3];
  
  let seed = hashedSeed;
  for (let i = indexOrder.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    const temp = indexOrder[i];
    indexOrder[i] = indexOrder[j];
    indexOrder[j] = temp;
  }
  
  const shuffledList = indexOrder.map((origIdx, itemIdx) => {
    const letters = ['a', 'b', 'c', 'd'];
    const item = list[origIdx];
    return {
      key: letters[itemIdx],
      value: item.value,
      raw: item.raw,
      isCorrect: item.isCorrect
    };
  });
  
  return shuffledList;
};

export function QuizView({
  mode,
  questions,
  title,
  onExit,
  onSubmitResults,
  pastResultAnswers,
  isReviewMode = false
}: QuizViewProps) {
  // Current active question index in the SUBSET array
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for answer choices (pre-populated if review mode or started a fresh session)
  const [answers, setAnswers] = useState<UserAnswers>(() => {
    return pastResultAnswers || {};
  });

  // Flagged/Bookmarked questions state
  const [flags, setFlags] = useState<QuestionFlags>({});

  // Search in sidebar questions
  const [searchQuery, setSearchQuery] = useState('');
  
  // Grid navigation filter
  const [gridFilter, setGridFilter] = useState<'all' | 'answered' | 'unanswered' | 'flagged' | 'correct' | 'incorrect'>('all');

  // Timer states
  const examDuration = questions.length >= 100 ? 5400 : (questions.length * 45); // 100+ questions = 90 mins (5400s), otherwise 45s per question
  const totalDuration = questions.length * 45; 
  const initialTime = mode === 'exam' ? examDuration : 0;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Submit confirmation modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Get active question
  const currentQuestion = questions[currentIndex];
  const questionCategory = currentQuestion ? getCategoryForQuestionId(currentQuestion.id) : undefined;

  // Manage timer effect
  useEffect(() => {
    if (isReviewMode) return;

    const timer = setInterval(() => {
      if (mode === 'exam') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time is out! Auto submit!
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeElapsed((prev) => prev + 1);
      } else {
        // Practice mode checks time elapsed
        setTimeElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isReviewMode]);

  // Handle select option
  const handleSelectOption = (optionKey: string) => {
    if (isReviewMode) return;
    
    // In practice mode, locking answer once clicked?
    // Let's allow change but state updates
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const handleSelectStatementValue = (sIdx: number, value: 'Đ' | 'S') => {
    if (isReviewMode) return;
    const numStatements = currentQuestion.statements?.length || 4;
    const defaultAnswer = Array(numStatements).fill('-').join(',');
    const currentAnswer = answers[currentQuestion.id] || defaultAnswer;
    const parts = currentAnswer.split(',');
    while (parts.length < numStatements) {
      parts.push('-');
    }
    parts[sIdx] = value;
    const newAnswer = parts.join(',');

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: newAnswer
    }));
  };

  // Toggle Bookmark Flag
  const toggleFlag = (id: number) => {
    setFlags((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format second to mm:ss
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Check stats for active list
  const answeredCount = useMemo(() => {
    return questions.filter(q => isAnswerComplete(q, answers[q.id])).length;
  }, [questions, answers]);
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  // Practice mode scoring status
  const correctCount = useMemo(() => {
    return questions.filter(q => {
      const ans = answers[q.id];
      return ans && isAnswerComplete(q, ans) && ans === q.answer;
    }).length;
  }, [questions, answers]);

  const incorrectCount = useMemo(() => {
    return questions.filter(q => {
      const ans = answers[q.id];
      return ans && isAnswerComplete(q, ans) && ans !== q.answer;
    }).length;
  }, [questions, answers]);

  // Filtered down indices for grid search & filter selection
  const filteredQuestionIndices = useMemo(() => {
    return questions.map((q, idx) => ({ question: q, index: idx })).filter(({ question, index }) => {
      // 1. Filter by search query
      const matchesSearch = searchQuery.trim() === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(question.options || {}).some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (question.statements || []).some(stm => stm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        `câu ${question.id}`.includes(searchQuery.toLowerCase()) ||
        `${question.id}` === searchQuery.trim();

      if (!matchesSearch) return false;

      // 2. Filter by tab selection
      const isAnswered = isAnswerComplete(question, answers[question.id]);
      const isFlagged = !isReviewMode && !!flags[question.id];

      if (gridFilter === 'answered') return isAnswered;
      if (gridFilter === 'unanswered') return !isAnswered;
      if (gridFilter === 'flagged') return isFlagged;
      
      // Correct/incorrect filters (only meaningful in practice or review/revealed mode)
      if (gridFilter === 'correct') {
        return isAnswered && answers[question.id] === question.answer;
      }
      if (gridFilter === 'incorrect') {
        return isAnswered && answers[question.id] !== question.answer;
      }

      return true;
    });
  }, [questions, answers, flags, searchQuery, gridFilter, isReviewMode]);

  // Submit test
  const handleSubmit = () => {
    setIsSubmitModalOpen(false);
    const finalTimeSpent = mode === 'exam' ? timeElapsed : timeElapsed;
    onSubmitResults(answers, finalTimeSpent);
  };

  // Highlight codes in a beautiful way if it looks like code
  const isCodeBlock = (text: string) => {
    return text.includes('for(') || text.includes('while(') || text.includes('pthread_') || text.includes('counter++') || text.includes('turn = j;');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pointer-events-auto">
      {/* Header Back controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Thoát về trang chủ"
            id="back-home-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-sm uppercase font-mono tracking-wide">
              {mode === 'exam' ? 'Chế độ thi thử' : 'Chế độ luyện tập'}
            </span>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 mt-0.5 line-clamp-1">
              {title}
            </h1>
          </div>
        </div>

        {/* Top Status & Timers */}
        <div className="flex items-center gap-4">
          {mode === 'exam' && !isReviewMode ? (
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm shadow-xs ${
              timeLeft < 300 
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <Clock className="h-4 w-4" />
              <span>Thời gian còn lại: {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-600 text-sm shadow-xs">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Thời gian: {formatTime(timeElapsed)}</span>
            </div>
          )}

          {mode === 'practice' && (
            <div className="flex gap-2 items-center text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <Check className="h-3 w-3" /> Đúng: {correctCount}
              </span>
              <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                <X className="h-3 w-3" /> Sai: {incorrectCount}
              </span>
            </div>
          )}

          {mode === 'exam' && !isReviewMode && (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
              id="submit-exam-button"
            >
              <FileCheck className="h-4 w-4" /> Nộp bài
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Active Question Display Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm relative">
            
            {/* Meta Header block */}
            <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-50">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 font-mono">
                  MỤC TIÊU CÂU {currentQuestion.id} THUỘC CHUYÊN ĐỀ:
                </span>
                <span className="block text-xs font-semibold text-slate-600" id="question-category-label">
                  {questionCategory?.name || 'Tổng quan'}
                </span>
              </div>
              
              <div className="flex gap-2">
                {!isReviewMode && (
                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                      flags[currentQuestion.id]
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title="Đánh dấu câu hỏi này đề xem lại sau"
                    id="flag-question-button"
                  >
                    <Bookmark className={`h-4 w-4 fill-transparent ${flags[currentQuestion.id] ? 'fill-amber-600' : ''}`} />
                    <span className="hidden sm:inline">Xem lại</span>
                  </button>
                )}
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg flex items-center">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h2 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed mb-4">
                {currentQuestion.question}
              </h2>

              {isCodeBlock(currentQuestion.question) && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg font-mono text-xs text-slate-700 mb-4 whitespace-pre-wrap overflow-x-auto">
                  {currentQuestion.question.match(/`([^`]+)`/g)?.map(m => m.replace(/`/g, ''))?.join('\n') || currentQuestion.question}
                </div>
              )}
            </div>

            {/* Answer Options list */}
            {currentQuestion.type === 'single-choice' ? (
              <div className="space-y-3">
                {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = answers[currentQuestion.id] === key;
                  const isCorrectAnswer = currentQuestion.answer === key;
                  
                  // Styling determination
                  let optionStyle = 'border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 text-slate-700 bg-white';
                  let checkIcon = null;

                  if (isSelected) {
                    optionStyle = 'border-indigo-600 bg-indigo-50/30 text-indigo-900 font-medium';
                  }

                  // In study mode (practice or review after submission), immediate feedback reveals values
                  const isPracticeReveal = mode === 'practice' && answers[currentQuestion.id];
                  const shouldReveal = isPracticeReveal || isReviewMode;

                  if (shouldReveal) {
                    if (isCorrectAnswer) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
                      checkIcon = <Check className="h-4 w-4 text-emerald-600" />;
                    } else if (isSelected) {
                      optionStyle = 'border-rose-300 bg-rose-50 text-rose-950 font-medium';
                      checkIcon = <X className="h-4 w-4 text-rose-600" />;
                    } else {
                      optionStyle = 'border-slate-100 text-slate-400 bg-white opacity-80';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={isReviewMode}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer text-sm outline-hidden ${optionStyle}`}
                      id={`option-${currentQuestion.id}-${key}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold uppercase transition-colors ${
                          isSelected 
                            ? 'bg-indigo-600 text-white' 
                            : shouldReveal && isCorrectAnswer 
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          {key}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{value}</span>
                      </div>
                      {checkIcon && <div className="flex-shrink-0">{checkIcon}</div>}
                    </button>
                  );
                })}
              </div>
            ) : (
              // true-false layout
              <div className="space-y-4">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                  Đánh giá Đúng (Đ) / Sai (S) cho từng nhận định dưới đây:
                </p>
                
                <div className="space-y-3">
                  {(currentQuestion.statements || []).map((statement, sIdx) => {
                    const numStatements = currentQuestion.statements?.length || 4;
                    const defaultAnswer = Array(numStatements).fill('-').join(',');
                    const userChoices = (answers[currentQuestion.id] || defaultAnswer).split(',');
                    const currentChoice = userChoices[sIdx] || '-';
                    
                    const correctAnswers = currentQuestion.answer.split(',');
                    const correctChoice = correctAnswers[sIdx] || 'Đ';

                    const isPracticeReveal = mode === 'practice' && isAnswerComplete(currentQuestion, answers[currentQuestion.id]);
                    const shouldReveal = isPracticeReveal || isReviewMode;

                    return (
                      <div 
                        key={sIdx}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-bold">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs md:text-sm text-slate-700 leading-relaxed pt-0.5">{statement}</span>
                        </div>

                        {/* Choice Segmented Controller */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* ĐÚNG button */}
                          <button
                            disabled={isReviewMode}
                            onClick={() => handleSelectStatementValue(sIdx, 'Đ')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                              currentChoice === 'Đ'
                                ? shouldReveal
                                  ? correctChoice === 'Đ'
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                    : 'bg-rose-500 border-rose-500 text-white shadow-xs'
                                  : 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : shouldReveal && correctChoice === 'Đ'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Đúng
                          </button>

                          {/* SAI button */}
                          <button
                            disabled={isReviewMode}
                            onClick={() => handleSelectStatementValue(sIdx, 'S')}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                              currentChoice === 'S'
                                ? shouldReveal
                                  ? correctChoice === 'S'
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                    : 'bg-rose-500 border-rose-500 text-white shadow-xs'
                                  : 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : shouldReveal && correctChoice === 'S'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Combinations Selection (Quick Selection) */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Chọn nhanh tổ hợp đáp án (A, B, C, D):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="quick-combinations-grid">
                    {getTrueFalseCombinations(currentQuestion.id, currentQuestion.answer).map((combo) => {
                      const userAnsValue = answers[currentQuestion.id] || '';
                      const isSelected = userAnsValue === combo.raw;
                      const isPracticeReveal = mode === 'practice' && isAnswerComplete(currentQuestion, userAnsValue);
                      const shouldReveal = isPracticeReveal || isReviewMode;

                      // Determine color and border styles
                      let cardStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                      let letterStyle = 'bg-slate-100 text-slate-500';

                      if (isSelected) {
                        if (shouldReveal) {
                          if (combo.isCorrect) {
                            cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs';
                            letterStyle = 'bg-emerald-500 text-white';
                          } else {
                            cardStyle = 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs';
                            letterStyle = 'bg-rose-500 text-white';
                          }
                        } else {
                          cardStyle = 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs';
                          letterStyle = 'bg-indigo-600 text-white';
                        }
                      } else if (shouldReveal && combo.isCorrect) {
                        cardStyle = 'bg-emerald-50/50 border-emerald-200 text-emerald-700';
                        letterStyle = 'bg-emerald-400 text-white';
                      }

                      return (
                        <button
                          key={combo.key}
                          disabled={isReviewMode}
                          onClick={() => {
                            if (isReviewMode) return;
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: combo.raw
                            }));
                          }}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${cardStyle}`}
                          id={`tf-combo-btn-${combo.key}`}
                        >
                          <span className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold uppercase transition-colors ${letterStyle}`}>
                            {combo.key}
                          </span>
                          <span className="text-xs md:text-sm font-semibold leading-relaxed">{combo.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Explanation/Feedback Card */}
            <AnimatePresence>
              {((mode === 'practice' && isAnswerComplete(currentQuestion, answers[currentQuestion.id])) || isReviewMode) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-5 border-t border-slate-100 overflow-hidden"
                  id="explanation-panel"
                >
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/80">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-2">
                      <Info className="h-4 w-4" />
                      Giải thích & Học Kiến Thức Chuyên Đề:
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Đáp án chính xác là <strong>{currentQuestion.answer.toUpperCase()}</strong>. Đọc kỹ câu hỏi: "<em>{currentQuestion.question}</em>". 
                      {currentQuestion.type === 'single-choice' ? (
                        <span>
                          Hãy nhớ rằng <strong>{currentQuestion.options?.[currentQuestion.answer]}</strong> là đáp án chuẩn xác nhất theo đề cương môn học GDQPAN về <strong>{questionCategory?.name}</strong>.
                        </span>
                      ) : (
                        <span>
                          Đây là câu hỏi Đúng/Sai. Hãy ghi nhớ chính xác đáp án cho từng nhận định của câu câu hỏi thuộc bài học <strong>{questionCategory?.name}</strong>.
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Nav Controls buttons */}
          <div className="flex justify-between items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              id="prev-question-button"
            >
              <ChevronLeft className="h-4 w-4" /> Câu trước
            </button>

            <span className="text-xs font-mono text-slate-500">
              Câu {currentIndex + 1} / {questions.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              id="next-question-button"
            >
              Câu kế tiếp <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Grid & Session Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            
            {/* Session info summary */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tiến trình làm bài</h3>
              <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Đã trả lời: {answeredCount} / {questions.length} câu</span>
                <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Live Search Questions inside Navigation Panel */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm câu hỏi theo từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
                id="search-question-input"
              />
            </div>

            {/* Quick Status Filter Tab Row */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Filter className="h-3 w-3" /> Lọc danh sách câu hỏi:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setGridFilter('all')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    gridFilter === 'all' 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({questions.length})
                </button>
                <button
                  onClick={() => setGridFilter('answered')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    gridFilter === 'answered' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã làm ({answeredCount})
                </button>
                <button
                  onClick={() => setGridFilter('unanswered')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    gridFilter === 'unanswered' 
                      ? 'bg-slate-200 text-slate-800' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Chưa làm ({unansweredCount})
                </button>
                {!isReviewMode && (
                  <button
                    onClick={() => setGridFilter('flagged')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      gridFilter === 'flagged' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Xem lại ({flaggedCount})
                  </button>
                )}
                {(mode === 'practice' || isReviewMode) && (
                  <>
                    <button
                      onClick={() => setGridFilter('correct')}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md text-emerald-800 transition-colors cursor-pointer ${
                        gridFilter === 'correct' ? 'bg-emerald-100' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      Đúng ({correctCount})
                    </button>
                    <button
                      onClick={() => setGridFilter('incorrect')}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md text-rose-800 transition-colors cursor-pointer ${
                        gridFilter === 'incorrect' ? 'bg-rose-100' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      Sai ({incorrectCount})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Massive Grid Navigation Block */}
            <div className="border-t border-slate-50 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-3">
                BẢNG CHUYỂN NHANH CÂU HỎI ({filteredQuestionIndices.length})
              </span>
              
              {filteredQuestionIndices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không tìm thấy câu hỏi phù hợp với bộ lọc
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-6 gap-2 max-h-[300px] lg:max-h-[380px] overflow-y-auto scroll-thin pr-1">
                  {filteredQuestionIndices.map(({ question, index }) => {
                    const isSelected = index === currentIndex;
                    const isAnswered = isAnswerComplete(question, answers[question.id]);
                    const isFlagged = !isReviewMode && !!flags[question.id];
                    const isCorrectAnswer = isAnswered && answers[question.id] === question.answer;

                    // Compute dynamic button color state
                    let btnClass = 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-300';
                    let flagBadge = null;

                    if (isAnswered) {
                      btnClass = 'bg-slate-900 border-slate-900 text-white';
                    }

                    const isPracticeReveal = mode === 'practice' && isAnswered;
                    const shouldRevealColor = isPracticeReveal || isReviewMode;

                    if (shouldRevealColor) {
                      if (isCorrectAnswer) {
                        btnClass = 'bg-emerald-500 border-emerald-500 text-white';
                      } else if (isAnswered) {
                        btnClass = 'bg-rose-500 border-rose-500 text-white';
                      }
                    }

                    if (isSelected) {
                      btnClass += ' ring-2 ring-indigo-600 ring-offset-2';
                    }

                    if (isFlagged) {
                      flagBadge = <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 border border-white rounded-full" />;
                    }

                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`py-2 text-xs font-bold rounded-lg border text-center transition-all duration-150 relative cursor-pointer font-mono h-9 ${btnClass}`}
                        id={`nav-btn-${question.id}`}
                      >
                        {question.id}
                        {flagBadge}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick action button for practice list */}
            {mode === 'practice' && (
              <div className="mt-2 text-center">
                <button
                  onClick={onExit}
                  className="w-full py-2.5 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/10 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <History className="h-3.5 w-3.5" /> Lưu bài tập & Trở về
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SUBMISSION MODAL DIALOG for EXAM MODE */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl"
              id="submit-modal"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
                  <FileCheck className="h-6 w-6" id="submit-modal-header-icon" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bạn có muốn nộp bài thi?
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Hãy kiểm tra kỹ phần trả lời trước khi nộp. Điểm số của bạn sẽ được ghi nhận vào lịch sử học tập tức thì.
                </p>

                {/* Question report */}
                <div className="my-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 grid grid-cols-2 gap-3 text-left">
                  <div>Đã trả lời: <span className="font-extrabold text-slate-800">{answeredCount} câu</span></div>
                  <div>Chưa làm: <span className="font-extrabold text-amber-600">{unansweredCount} câu</span></div>
                  <div className="col-span-2 text-center text-[11px] text-slate-400 border-t border-slate-200 pt-2 mt-1 font-mono">
                    Hệ thống trắc nghiệm GDQPAN
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    id="btn-cancel-submit"
                  >
                    Tiếp tục làm bài
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    id="btn-confirm-submit"
                  >
                    Đồng ý Nộp bài
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
