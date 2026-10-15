import React, { useState } from 'react';
import type { Confidence, Laptop } from '../types';
import { formatLaptopAsText } from '../services/specGroups';
import { shopAddUrl } from '../services/shopExport';
import LaptopSpecTable from './LaptopSpecTable';
import { ChevronDownIcon, CopyIcon, CheckIcon } from './icons';

interface LaptopSpecAccordionProps {
  laptops: Laptop[];
}

const confidenceStyles: Record<Confidence, { label: string; className: string }> = {
  high: { label: 'دقة عالية', className: 'bg-green-900/60 text-green-300 border-green-700' },
  medium: { label: 'دقة متوسطة', className: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' },
  low: { label: 'دقة منخفضة', className: 'bg-red-900/60 text-red-300 border-red-700' },
};

const ConfidenceBadge: React.FC<{ confidence: Confidence }> = ({ confidence }) => {
  const style = confidenceStyles[confidence] ?? confidenceStyles.medium;
  return (
    <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full border ${style.className}`}>
      {style.label}
    </span>
  );
};

const CopyAllButton: React.FC<{ laptop: Laptop }> = ({ laptop }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatLaptopAsText(laptop)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-sm px-3 py-1.5 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
    >
      {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
      {copied ? 'تم النسخ' : 'نسخ كل المواصفات'}
    </button>
  );
};

const AddToShopButton: React.FC<{ laptop: Laptop }> = ({ laptop }) => (
  <a
    href={shopAddUrl(laptop)}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm px-3 py-1.5 text-white bg-green-700 hover:bg-green-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
    title="يفتح صفحة إضافة لابتوب ومواصفاته مملوءة للمراجعة"
  >
    + إضافة للموقع
  </a>
);

const LaptopSpecAccordion: React.FC<LaptopSpecAccordionProps> = ({ laptops }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!laptops || laptops.length === 0) {
    return null;
  }

  if (laptops.length === 1) {
    const laptop = laptops[0];
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
             <div className="p-5 flex flex-col items-center gap-3">
                <h2 className="text-2xl font-bold text-center text-white" dir="auto">{laptop.modelName}</h2>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <ConfidenceBadge confidence={laptop.confidence} />
                  <CopyAllButton laptop={laptop} />
                  <AddToShopButton laptop={laptop} />
                </div>
             </div>
            <LaptopSpecTable laptop={laptop} />
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
       <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-t-2xl border border-b-0 border-gray-700">
            <h2 className="text-xl font-bold text-center text-white">تم العثور على {laptops.length} نسخ مختلفة:</h2>
       </div>
       <div className="border border-t-0 border-gray-700 rounded-b-2xl overflow-hidden">
        {laptops.map((laptop, index) => (
          <div key={index} className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 last:border-b-0">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex justify-between items-center gap-3 text-start p-5 text-lg font-semibold text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded={activeIndex === index}
              aria-controls={`content-${index}`}
            >
              <span dir="auto">{laptop.modelName}</span>
              <span className="flex items-center gap-3">
                <ConfidenceBadge confidence={laptop.confidence} />
                <ChevronDownIcon
                  className={`w-6 h-6 shrink-0 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            <div
              id={`content-${index}`}
              inert={activeIndex !== index}
              className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                activeIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-700">
                  <div className="flex justify-end gap-2 p-3">
                    <CopyAllButton laptop={laptop} />
                    <AddToShopButton laptop={laptop} />
                  </div>
                  <LaptopSpecTable laptop={laptop} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaptopSpecAccordion;
