import React, { useRef, useState } from 'react';
import type { Suggestion } from '../services/historyService';
import { SearchIcon, CameraIcon, ClockIcon } from './icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSuggestionSelect: (text: string) => void;
  onImageSelect: (file: File) => void;
  suggestions: Suggestion[];
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, onSuggestionSelect, onImageSelect, suggestions, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showList = isOpen && suggestions.length > 0 && !isLoading;

  const select = (text: string) => {
    setIsOpen(false);
    setActiveIndex(-1);
    onSuggestionSelect(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex].text);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    setIsOpen(false);
    onSubmit(e);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onImageSelect(file);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="مثال: Dell XPS 15 9530 أو رقم القطعة"
          disabled={isLoading}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          className="w-full pr-4 pl-28 py-3 text-lg bg-gray-700 text-white border-2 border-gray-600 rounded-full focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 ease-in-out placeholder-gray-400 disabled:opacity-50"
          aria-label="ادخل موديل اللابتوب"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="absolute inset-y-0 left-14 flex items-center justify-center w-12 h-full text-gray-300 hover:text-white focus:outline-none focus:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="البحث بصورة ملصق اللابتوب"
          title="البحث بصورة ملصق اللابتوب"
        >
          <CameraIcon className="w-6 h-6" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute inset-y-0 left-0 flex items-center justify-center w-14 h-full text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-transform duration-200 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed"
          aria-label="بحث"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <SearchIcon className="w-6 h-6" />
          )}
        </button>

        {showList && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-600 rounded-2xl shadow-xl overflow-hidden"
          >
            {suggestions.map((s, index) => (
              <li
                key={s.text}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => { e.preventDefault(); select(s.text); }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${index === activeIndex ? 'bg-gray-700' : ''}`}
              >
                {s.fromHistory ? (
                  <ClockIcon className="w-4 h-4 shrink-0 text-gray-400" />
                ) : (
                  <SearchIcon className="w-4 h-4 shrink-0 text-gray-500" />
                )}
                <span dir="auto" className="text-gray-200">{s.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
