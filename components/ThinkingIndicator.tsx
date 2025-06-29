import React from 'react';

interface ThinkingIndicatorProps {
  isSummarizing?: boolean;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isSummarizing }) => (
  <div className="flex items-center justify-center w-full px-4 py-2">
    <div className="text-gray-400 text-lg animate-pulse">
      {isSummarizing ? '物語を記憶中...' : 'AIが思考中...'}
    </div>
  </div>
);
