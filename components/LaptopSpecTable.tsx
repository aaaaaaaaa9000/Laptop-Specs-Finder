import React, { useState } from 'react';
import type { Laptop } from '../types';
import { toSpecGroups } from '../services/specGroups';
import { CopyIcon, CheckIcon } from './icons';

interface LaptopSpecTableProps {
  laptop: Laptop;
}

const LaptopSpecTable: React.FC<LaptopSpecTableProps> = ({ laptop }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const groups = toSpecGroups(laptop);

  if (groups.length === 0) {
    return <p className="p-6 text-center text-gray-400">لا توجد مواصفات مؤكدة لهذه النسخة.</p>;
  }

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        {groups.map(group => (
          <tbody key={group.title} className="divide-y divide-gray-700">
            <tr className={group.highlight ? 'bg-blue-900/50' : 'bg-gray-900/40'}>
              <th colSpan={3} className={`px-6 py-2 text-sm font-bold ${group.highlight ? 'text-cyan-300' : 'text-gray-400'}`}>
                {group.title}
              </th>
            </tr>
            {group.specs.map(spec => {
              const key = `${group.title}-${spec.name}`;
              return (
                <tr key={key} className={`transition-colors duration-200 ${group.highlight ? 'bg-blue-900/30' : 'hover:bg-gray-700/50'}`}>
                  <th className="px-6 py-4 font-semibold text-gray-200 whitespace-nowrap">{spec.name}</th>
                  <td className="px-6 py-4 text-gray-300" dir="auto">{spec.value}</td>
                  <td className="px-4 py-4 text-center w-16">
                    <button
                      onClick={() => handleCopy(spec.value, key)}
                      className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all"
                      aria-label={`نسخ ${spec.name}`}
                    >
                      {copiedKey === key ? (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <CopyIcon className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
};

export default LaptopSpecTable;
