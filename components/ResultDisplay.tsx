
import React from 'react';

interface ResultDisplayProps {
  result: string;
  onRestart: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onRestart }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-3xl font-bold text-gray-800">생성된 기획 가이드</h2>
        <button
          onClick={onRestart}
          className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          새로 시작하기
        </button>
      </div>
      <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg">
        <pre className="whitespace-pre-wrap font-sans">{result}</pre>
      </div>
    </div>
  );
};
