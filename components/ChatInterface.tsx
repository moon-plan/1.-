
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { PaperAirplaneIcon } from './icons';

interface ChatInterfaceProps {
  chatHistory: Message[];
  onSubmitAnswer: (answer: string) => void;
  isLastQuestion: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSubmitAnswer, isLastQuestion }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmitAnswer(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)] bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  봇
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="답변을 입력하고 Enter를 누르세요..."
            className="flex-1 w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {isLastQuestion ? '결과 생성' : <PaperAirplaneIcon className="h-6 w-6" />}
          </button>
        </form>
      </div>
    </div>
  );
};
