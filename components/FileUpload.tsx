
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileAccepted }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileAccepted(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileAccepted]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAccepted(e.target.files[0]);
    }
  };

  const borderStyle = isDragging 
    ? 'border-blue-500 bg-blue-50' 
    : 'border-gray-300 hover:border-blue-400';

  return (
    <div className="w-full p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">1단계: 공고문 업로드(반드시 pdf로)</h2>
      <p className="text-gray-500 mb-6">입찰 공고문 파일을 업로드하여 분석을 시작하세요.</p>
      <label htmlFor="file-upload" className="w-full max-w-lg cursor-pointer">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-64 p-4 border-2 border-dashed rounded-xl transition-colors duration-200 ${borderStyle}`}
        >
          <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-semibold text-gray-600">파일을 드래그 앤 드롭하거나 클릭하여 업로드</p>
            <p className="mt-1 text-sm text-gray-500">(PDF 파일만 가능)</p>
          </div>
        </div>
      </label>
      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
    </div>
  );
};