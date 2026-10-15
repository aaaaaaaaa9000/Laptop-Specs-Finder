import React from 'react';
import type { SpecsResponse } from '../types';
import LaptopSpecAccordion from './LaptopSpecAccordion';

interface SearchResultsProps {
  result: SpecsResponse;
  onSuggestionClick: (model: string) => void;
}

const Suggestions: React.FC<{ suggestions: string[]; onClick: (model: string) => void }> = ({ suggestions, onClick }) => (
  <div className="flex flex-wrap justify-center gap-2 mt-3">
    {suggestions.map(s => (
      <button
        key={s}
        onClick={() => onClick(s)}
        dir="auto"
        className="px-3 py-1.5 text-sm text-blue-200 bg-blue-900/40 border border-blue-700 rounded-full hover:bg-blue-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {s}
      </button>
    ))}
  </div>
);

const SearchResults: React.FC<SearchResultsProps> = ({ result, onSuggestionClick }) => {
  if (result.matchStatus === 'not_found') {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl text-center">
        <p className="text-lg font-semibold text-gray-200">لم يتم العثور على لابتوب بهذا الاسم.</p>
        <p className="text-gray-400 mt-1">تأكد من كتابة الموديل أو رقم القطعة (Part Number) بشكل صحيح.</p>
        {result.suggestions.length > 0 && (
          <>
            <p className="text-gray-300 mt-4">هل تقصد:</p>
            <Suggestions suggestions={result.suggestions} onClick={onSuggestionClick} />
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {result.matchStatus === 'partial' && (
        <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-2xl text-center">
          <p className="text-yellow-200">لم يتم العثور على تطابق تام؛ هذه أقرب النتائج. للحصول على نتيجة أدق اكتب الموديل كاملًا أو رقم القطعة.</p>
          {result.suggestions.length > 0 && <Suggestions suggestions={result.suggestions} onClick={onSuggestionClick} />}
        </div>
      )}

      <LaptopSpecAccordion laptops={result.laptops} />

      {result.sources.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
          <h3 className="font-bold text-gray-300 mb-2">المصادر</h3>
          <ul className="space-y-1 text-sm">
            {result.sources.map(source => (
              <li key={source.uri}>
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" dir="auto">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-center text-xs text-gray-500 mt-4">
        المواصفات مجمّعة بالذكاء الاصطناعي من نتائج البحث وقد تحتوي على أخطاء — راجع المصادر قبل الاعتماد عليها.
      </p>
    </>
  );
};

export default SearchResults;
