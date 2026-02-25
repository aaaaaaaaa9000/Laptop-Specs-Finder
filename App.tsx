import React, { useState, useCallback, useEffect } from 'react';
import type { Laptop } from './types';
import { fetchLaptopSpecs } from './services/geminiService';
import { generateHeroImage } from './services/imageService';
import SearchBar from './components/SearchBar';
import LaptopSpecAccordion from './components/LaptopSpecAccordion';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { LaptopIcon } from './components/icons';

const App: React.FC = () => {
  const [laptopModel, setLaptopModel] = useState<string>('');
  const [laptops, setLaptops] = useState<Laptop[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const imageUrl = await generateHeroImage();
        setHeroImageUrl(imageUrl);
      } catch (err) {
        console.error("Failed to load hero image:", err);
      }
    };
    loadHeroImage();
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laptopModel.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setLaptops(null);

    try {
      const specs = await fetchLaptopSpecs(laptopModel);
      setLaptops(specs);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [laptopModel, isLoading]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        <header 
          className="w-full text-center mb-8 mt-10 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 transition-all duration-1000 ease-in-out"
          style={heroImageUrl ? {
            backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url(${heroImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}}
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <LaptopIcon className="w-12 h-12 text-blue-400"/>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              مستكشف مواصفات اللابتوب
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            أدخل موديل أي لابتوب، وسيقوم الذكاء الاصطناعي بجلب مواصفاته الفنية، مع التركيز على تفاصيل الشاشة.
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
            {laptops && <LaptopSpecAccordion laptops={laptops} />}
          </div>
        </main>
      </div>
       <footer className="mt-auto text-center text-gray-500 py-4 z-10">
            <p>مدعوم بواسطة Gemini API</p>
        </footer>
    </div>
  );
};

export default App;
