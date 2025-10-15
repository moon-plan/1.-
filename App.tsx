
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, Message, Answer } from './types';
import { INITIAL_QUESTIONS } from './constants';
import { generateProposalGuide } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { QuestionEditor } from './components/QuestionEditor';
import { ChatInterface } from './components/ChatInterface';
import { ResultDisplay } from './components/ResultDisplay';

// Configure pdf.js worker
if ((window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [questions, setQuestions] = useState<string[]>(INITIAL_QUESTIONS);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalResult, setFinalResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const chatQuestions = useMemo(() => questions.filter(q => q.trim() !== ''), [questions]);

  const resetState = useCallback(() => {
    setAppState(AppState.INITIAL);
    setFileContent(null);
    setChatHistory([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setFinalResult('');
    setError(null);
  }, []);

  const handleFileAccepted = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
        setError('PDF 파일만 업로드할 수 있습니다.');
        setAppState(AppState.ERROR);
        return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (!arrayBuffer || !(window as any).pdfjsLib) {
                throw new Error("PDF 라이브러리를 로드할 수 없거나 파일을 읽지 못했습니다.");
            }

            const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map((s: any) => s.str).join(' ') + '\n';
            }
            
            setFileContent(textContent);
            setAppState(AppState.CHATTING);
        } catch (err) {
            console.error("Error parsing PDF:", err);
            setError('PDF 파일을 처리하는 중 오류가 발생했습니다.');
            setAppState(AppState.ERROR);
        }
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setAppState(AppState.ERROR);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  useEffect(() => {
    if (appState === AppState.CHATTING && chatHistory.length === 0 && chatQuestions.length > 0) {
      setChatHistory([{ role: 'model', text: chatQuestions[0] }]);
    }
  }, [appState, chatHistory.length, chatQuestions]);

  const handleSubmitAnswer = useCallback(async (answer: string) => {
    const newAnswer: Answer = { question: chatQuestions[currentQuestionIndex], answer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const newHistory: Message[] = [
      ...chatHistory,
      { role: 'user', text: answer },
    ];

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < chatQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setChatHistory([...newHistory, { role: 'model', text: chatQuestions[nextQuestionIndex] }]);
    } else {
      setAppState(AppState.GENERATING);
      setChatHistory(newHistory);
      try {
        if (!fileContent) {
          throw new Error("File content is not available.");
        }
        const result = await generateProposalGuide(fileContent, updatedAnswers);
        setFinalResult(result);
        setAppState(AppState.RESULT);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        setAppState(AppState.ERROR);
      }
    }
  }, [currentQuestionIndex, answers, chatHistory, chatQuestions, fileContent]);
  
  const renderContent = () => {
    switch (appState) {
      case AppState.INITIAL:
        return (
          <div className="space-y-8">
            <FileUpload onFileAccepted={handleFileAccepted} />
            <QuestionEditor 
              questions={questions} 
              onSave={setQuestions}
              disabled={false}
            />
          </div>
        );
      case AppState.CHATTING:
        return (
          <ChatInterface
            chatHistory={chatHistory}
            onSubmitAnswer={handleSubmitAnswer}
            isLastQuestion={currentQuestionIndex === chatQuestions.length - 1}
          />
        );
      case AppState.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">기획 가이드 생성 중...</h2>
            <p className="mt-2 text-gray-500">공고문과 답변을 분석하여 최적의 제안서를 만들고 있습니다.</p>
          </div>
        );
      case AppState.RESULT:
        return <ResultDisplay result={finalResult} onRestart={resetState} />;
      case AppState.ERROR:
        return (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-700">오류 발생</h2>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={resetState}
              className="mt-6 px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              다시 시작하기
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            공공기관 입찰 제안서 기획 챗봇
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            공고문 분석과 핵심 질의응답을 통해 성공적인 입찰을 위한 맞춤형 기획안을 완성하세요.
          </p>
        </header>
        <div className="flex items-center justify-center">
            {renderContent()}
        </div>
      </div>
    </main>
  );
};

export default App;