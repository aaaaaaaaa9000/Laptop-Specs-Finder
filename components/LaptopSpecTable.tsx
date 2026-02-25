import React, { useState } from 'react';
import type { Specification } from '../types';
import { CopyIcon, CheckIcon } from './icons';

interface LaptopSpecTableProps {
  specifications: Specification[];
}

const LaptopSpecTable: React.FC<LaptopSpecTableProps> = ({ specifications }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!specifications || specifications.length === 0) {
    return null;
  }
  
  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const screenSpecs = ['دقة الشاشة', 'أبعاد الشاشة', 'معدل تحديث الشاشة', 'حجم الشاشة'];

  return (
    <div className="overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <tbody className="divide-y divide-gray-700">
            {specifications.map((spec, index) => {
              const isHighlighted = screenSpecs.some(s => spec.name.includes(s));
              return (
                <tr key={index} className={`transition-colors duration-200 ${isHighlighted ? 'bg-blue-900/30' : 'hover:bg-gray-700/50'}`}>
                  <th className="px-6 py-4 font-semibold text-gray-200 whitespace-nowrap">{spec.name}</th>
                  <td className="px-6 py-4 text-gray-300">{spec.value}</td>
                  <td className="px-4 py-4 text-center w-16">
                    <button
                      onClick={() => handleCopy(spec.value, index)}
                      className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all"
                      aria-label={`نسخ ${spec.name}`}
                    >
                      {copiedIndex === index ? (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <CopyIcon className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaptopSpecTable;
