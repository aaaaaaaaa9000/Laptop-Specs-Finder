import React, { useState, useCallback } from 'react';
import type { SpecsResponse } from './types';
import { fetchLaptopSpecs } from './services/geminiService';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { LaptopIcon } from './components/icons';

const App: React.FC = () => {
  const [laptopModel, setLaptopModel] = useState<string>('');
  const [result, setResult] = useState<SpecsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (model: string) => {
    if (!model.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const specs = await fetchLaptopSpecs(model);
      setResult(specs);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    runSearch(laptopModel);
  }, [laptopModel, runSearch]);

  const handleSuggestionClick = useCallback((model: string) => {
    setLaptopModel(model);
    runSearch(model);
  }, [runSearch]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        <header className="w-full text-center mb-8 mt-10 p-8 rounded-2xl bg-gradient-to-br from-gray-800/80 via-blue-950/60 to-cyan-950/50 backdrop-blur-sm border border-gray-700">
          <div className="flex items-center justify-center gap-4 mb-3">
            <LaptopIcon className="w-12 h-12 text-blue-400"/>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              مستكشف مواصفات اللابتوب
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            أدخل موديل أي لابتوب أو رقم القطعة (Part Number)، وسيبحث الذكاء الاصطناعي في الإنترنت عن مواصفاته الفنية مع ذكر المصادر، مع التركيز على تفاصيل الشاشة.
          </p>
        </header>

        <main className="w-full">
          <SearchBar
            value={laptopModel}
            onChange={(e) => setLaptopModel(e.target.value)}
            onSubmit={handleSearch}
            isLoading={isLoading}
          />

          <div className="mt-6 min-h-[200px]">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {result && <SearchResults result={result} onSuggestionClick={handleSuggestionClick} />}
          </div>
        </main>
      </div>
       <footer className="mt-auto text-center text-gray-500 py-4 z-10">
            <p>مدعوم بواسطة Gemini API و Google Search</p>
        </footer>
    </div>
  );
};

export default App;
