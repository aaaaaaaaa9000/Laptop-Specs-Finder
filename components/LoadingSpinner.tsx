
import React from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
      "جاري تحليل طلبك...",
      "التواصل مع الذكاء الاصطناعي...",
      "البحث في الإنترنت عن المصادر...",
      "جمع المواصفات المطلوبة...",
      "لحظات قليلة وينتهي كل شيء..."
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
        setMessage(prev => {
            const currentIndex = messages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % messages.length;
            return messages[nextIndex];
        });
    }, 2000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-4 mt-8">
      <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-semibold animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
