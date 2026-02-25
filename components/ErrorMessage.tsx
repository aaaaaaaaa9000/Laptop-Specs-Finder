
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
      <p className="text-red-300 font-semibold">{message}</p>
    </div>
  );
};

export default ErrorMessage;
