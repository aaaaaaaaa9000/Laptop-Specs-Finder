import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { HistoryEntry, IdentifyResponse, SpecsResponse } from './types';
import { fetchLaptopSpecs, identifyLaptopFromImage } from './services/geminiService';
import { addToHistory, clearHistory, findInHistory, getSuggestions, loadHistory, removeFromHistory } from './services/historyService';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { LaptopIcon } from './components/icons';

const identifyMessages = ["جاري قراءة الملصق...", "استخراج الموديل ورقم القطعة..."];

interface Identified {
  info: IdentifyResponse;
  previewUrl: string;
}

const App: React.FC = () => {
  const [laptopModel, setLaptopModel] = useState<string>('');
  const [result, setResult] = useState<SpecsResponse | null>(null);
  const [resultQuery, setResultQuery] = useState<string>('');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loadingStage, setLoadingStage] = useState<'identify' | 'search' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [identified, setIdentified] = useState<Identified | null>(null);
  const busyRef = useRef(false);

  const suggestions = useMemo(() => getSuggestions(history, laptopModel), [history, laptopModel]);

  const replaceIdentified = (next: Identified | null) => {
    setIdentified(prev => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return next;
    });
  };

  const runSearch = useCallback(async (model: string, refresh = false) => {
    const query = model.trim();
    if (!query || busyRef.current) return;

    setError(null);
    setResult(null);

    const saved = refresh ? undefined : findInHistory(history, query);
    if (saved) {
      setResult(saved.result);
      setResultQuery(saved.query);
      setSavedAt(saved.timestamp);
      return;
    }

    busyRef.current = true;
    setLoadingStage('search');
    try {
      const specs = await fetchLaptopSpecs(query, refresh);
      setResult(specs);
      setResultQuery(query);
      setSavedAt(null);
      if (specs.matchStatus !== 'not_found') {
        setHistory(h => addToHistory(h, query, specs));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع.");
      }
    } finally {
      busyRef.current = false;
      setLoadingStage(null);
    }
  }, [history]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    replaceIdentified(null);
    runSearch(laptopModel);
  }, [laptopModel, runSearch]);

  const handleSuggestionClick = useCallback((model: string) => {
    setLaptopModel(model);
    runSearch(model);
  }, [runSearch]);

  const handleImageSelect = useCallback(async (file: File) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setResult(null);
    replaceIdentified(null);
    setLoadingStage('identify');

    let query = '';
    try {
      const info = await identifyLaptopFromImage(file);
      if (!info.found) {
        setError("لم أتمكن من قراءة موديل اللابتوب من الصورة. صوّر الملصق بشكل أقرب وبإضاءة جيدة، أو اكتب الموديل يدويًا.");
      } else {
        replaceIdentified({ info, previewUrl: URL.createObjectURL(file) });
        setLaptopModel(info.searchQuery);
        query = info.searchQuery;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      busyRef.current = false;
      setLoadingStage(null);
    }
    if (query) runSearch(query);
  }, [runSearch]);

  const handleRemoveHistory = (query: string) => setHistory(h => removeFromHistory(h, query));
  const handleClearHistory = () => setHistory(clearHistory());

  const showRecent = !result && !loadingStage && !error && history.length > 0;

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
            أدخل موديل أي لابتوب أو رقم القطعة (Part Number)، أو صوّر الملصق الموجود أسفل الجهاز، وسيبحث الذكاء الاصطناعي في الإنترنت عن مواصفاته الفنية مع ذكر المصادر.
          </p>
        </header>

        <main className="w-full">
          <SearchBar
            value={laptopModel}
            onChange={setLaptopModel}
            onSubmit={handleSearch}
            onSuggestionSelect={handleSuggestionClick}
            onImageSelect={handleImageSelect}
            suggestions={suggestions}
            isLoading={loadingStage !== null}
          />

          {showRecent && (
            <div className="w-full max-w-2xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-400">عمليات البحث الأخيرة</h3>
                <button onClick={handleClearHistory} className="text-xs text-gray-500 hover:text-red-400">مسح السجل</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 10).map(entry => (
                  <span key={entry.query} className="flex items-center bg-gray-800 border border-gray-700 rounded-full">
                    <button
                      onClick={() => handleSuggestionClick(entry.query)}
                      dir="auto"
                      className="ps-3 pe-1 py-1.5 text-sm text-gray-200 hover:text-white"
                    >
                      {entry.query}
                    </button>
                    <button
                      onClick={() => handleRemoveHistory(entry.query)}
                      className="px-2 py-1.5 text-gray-500 hover:text-red-400"
                      aria-label={`حذف ${entry.query} من السجل`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {identified && (
            <div className="w-full max-w-2xl mx-auto mt-6 p-3 flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
              <img src={identified.previewUrl} alt="صورة الملصق" className="w-16 h-16 object-cover rounded-lg shrink-0" />
              <div className="text-sm text-right">
                <p className="font-semibold text-gray-200">تم التعرف من الصورة:</p>
                <p className="text-gray-300 text-right" dir="auto">
                  {[identified.info.brand, identified.info.modelName].filter(Boolean).join(' ') || identified.info.searchQuery}
                </p>
                {identified.info.partNumber && (
                  <p className="text-gray-400 text-right" dir="auto">P/N: {identified.info.partNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">إذا كانت القراءة خاطئة، عدّل النص في خانة البحث واضغط بحث.</p>
              </div>
            </div>
          )}

          <div className="mt-6 min-h-[200px]">
            {loadingStage && <LoadingSpinner key={loadingStage} messages={loadingStage === 'identify' ? identifyMessages : undefined} />}
            {error && <ErrorMessage message={error} />}
            {result && savedAt && (
              <div className="w-full max-w-2xl mx-auto mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
                <span>نتيجة محفوظة من {new Date(savedAt).toLocaleDateString('ar-EG')}</span>
                <button
                  onClick={() => runSearch(resultQuery, true)}
                  className="px-3 py-1 text-blue-300 border border-blue-700 rounded-full hover:bg-blue-900/40"
                >
                  تحديث من الإنترنت
                </button>
              </div>
            )}
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
