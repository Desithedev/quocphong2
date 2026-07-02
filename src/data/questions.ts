import { Question } from '../types';
import { PART3 } from './questions_part3';
import { PART4 } from './questions_part4';

const rawQuestions = [
  ...PART3,
  ...PART4
];

export const QUESTIONS: Question[] = rawQuestions.map(q => {
  if (q.type === 'single-choice') {
    const optionsObj: { [key: string]: string } = {};
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const optionsArray = q.options || [];
    optionsArray.forEach((opt, idx) => {
      const key = keys[idx] || `option_${idx}`;
      optionsObj[key] = opt;
    });
    return {
      id: q.id,
      type: 'single-choice',
      question: q.question,
      options: optionsObj,
      statements: [],
      answer: q.answer
    };
  } else {
    // type === 'true-false'
    const rawQ = q as any;
    const answersArray = (rawQ.answer || '').split(',');
    const numCorrect = answersArray.filter((x: string) => x === 'Đ').length;
    
    // Automatically convert "true-false" questions with exactly 1 "Đ" to single-choice questions with options (a, b, c, d, e...)
    if (numCorrect === 1 && rawQ.statements && rawQ.statements.length > 0) {
      const optionsObj: { [key: string]: string } = {};
      const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      rawQ.statements.forEach((stmt: string, idx: number) => {
        const key = keys[idx] || `option_${idx}`;
        optionsObj[key] = stmt;
      });
      
      const correctIdx = answersArray.indexOf('Đ');
      const answerKey = keys[correctIdx] || 'a';
      
      return {
        id: rawQ.id,
        type: 'single-choice',
        question: rawQ.question,
        options: optionsObj,
        statements: [],
        answer: answerKey
      };
    }
    
    return {
      id: rawQ.id,
      type: 'true-false',
      question: rawQ.question,
      options: {},
      statements: rawQ.statements || [],
      answer: rawQ.answer
    };
  }
});
