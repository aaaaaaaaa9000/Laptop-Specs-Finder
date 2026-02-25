import React, { useState } from 'react';
import type { Laptop } from '../types';
import LaptopSpecTable from './LaptopSpecTable';
import { ChevronDownIcon } from './icons';

interface LaptopSpecAccordionProps {
  laptops: Laptop[];
}

const LaptopSpecAccordion: React.FC<LaptopSpecAccordionProps> = ({ laptops }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!laptops || laptops.length === 0) {
    return null;
  }
  
  if (laptops.length === 1) {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
             <div className="p-5">
                <h2 className="text-2xl font-bold text-center text-white">{laptops[0].modelName}</h2>
             </div>
            <LaptopSpecTable specifications={laptops[0].specifications} />
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
              className="w-full flex justify-between items-center text-left p-5 text-lg font-semibold text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded={activeIndex === index}
              aria-controls={`content-${index}`}
            >
              <span>{laptop.modelName}</span>
              <ChevronDownIcon
                className={`w-6 h-6 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              id={`content-${index}`}
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                activeIndex === index ? 'max-h-[2000px]' : 'max-h-0'
              }`}
            >
              <div className="border-t border-gray-700">
                <LaptopSpecTable specifications={laptop.specifications} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaptopSpecAccordion;
