
import React, { useState, useEffect, useRef } from 'react';
import { EditIcon, CheckIcon, DragHandleIcon } from './icons';

interface QuestionEditorProps {
  questions: string[];
  onSave: (newQuestions: string[]) => void;
  disabled: boolean;
}

interface EditableQuestion {
    id: number;
    text: string;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, onSave, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableQuestions, setEditableQuestions] = useState<EditableQuestion[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const idCounter = useRef(0);
  
  useEffect(() => {
    if (!isEditing) {
        setEditableQuestions(
          questions.map(q => ({ id: idCounter.current++, text: q }))
        );
    }
  }, [questions, isEditing]);

  const handleQuestionChange = (id: number, value: string) => {
    setEditableQuestions(currentQuestions =>
      currentQuestions.map(q => (q.id === id ? { ...q, text: value } : q))
    );
  };

  const handleAddQuestion = () => {
    setEditableQuestions([...editableQuestions, { id: idCounter.current++, text: "" }]);
  };
  
  const handleRemoveQuestion = (id: number) => {
    setEditableQuestions(editableQuestions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    onSave(editableQuestions.map(q => q.text));
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (index !== draggedIndex) {
        setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
      setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) return;
      
      const draggedItem = editableQuestions[draggedIndex];
      const newQuestions = [...editableQuestions];
      newQuestions.splice(draggedIndex, 1);
      newQuestions.splice(dropIndex, 0, draggedItem);
      
      setEditableQuestions(newQuestions);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };


  if (!isEditing) {
    return (
      <div className="w-full p-8 flex flex-col items-center bg-gray-50 rounded-xl">
        <div className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-700">2단계: 질의응답 준비</h2>
                    <p className="text-gray-500">아래 질문에 답변하여 기획 가이드를 구체화합니다.</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    disabled={disabled}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <EditIcon className="h-4 w-4" />
                    질문 수정
                </button>
            </div>
            <ul className="space-y-2">
            {questions.map((q, index) => (
                <li key={index} className="p-3 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm">
                {`질문 ${index + 1}: ${q}`}
                </li>
            ))}
            </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 flex flex-col items-center bg-gray-50 rounded-xl">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">질문 목록 수정</h2>
        <p className="text-sm text-gray-500 mb-6">핸들(좌측 아이콘)을 드래그하여 질문 순서를 변경할 수 있습니다.</p>
        <div className="space-y-3">
          {editableQuestions.map((q, index) => (
            <div 
              key={q.id} 
              className={`flex items-center gap-2 rounded-lg transition-colors duration-200 ${dragOverIndex === index && draggedIndex !== index ? 'bg-blue-100' : ''} ${draggedIndex === index ? 'opacity-50' : ''}`}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <span className="cursor-move text-gray-400 hover:text-gray-600 p-3 touch-none">
                <DragHandleIcon className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={q.text}
                onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder={`질문 ${index + 1}`}
              />
              <button onClick={() => handleRemoveQuestion(q.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            + 질문 추가
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckIcon className="h-5 w-5" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
};