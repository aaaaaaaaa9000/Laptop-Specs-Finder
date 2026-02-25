import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="مثال: Dell XPS 15 9530"
          disabled={isLoading}
          className="w-full pr-4 pl-12 py-3 text-lg bg-gray-700 text-white border-2 border-gray-600 rounded-full focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 ease-in-out placeholder-gray-400 disabled:opacity-50"
          aria-label="ادخل موديل اللابتوب"
        />
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
      </div>
    </form>
  );
};

export default SearchBar;