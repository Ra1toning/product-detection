import React from 'react';
import { Trash2 } from 'lucide-react';

interface SettingsModalProps {
  lotteryNumbers: string[];
  onClose: () => void;
  onDelete: (number: string) => void;
}

export default function SettingsModal({ lotteryNumbers, onClose, onDelete }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Lottery Numbers</h2>
        <ul className="mb-4 max-h-80 overflow-y-auto">
          {lotteryNumbers.map((number, index) => (
            <li key={index} className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-lg">{number}</span>
              <button 
                onClick={() => onDelete(number)}
                className="text-red-500 hover:text-red-600 transition duration-300 ease-in-out"
                aria-label="Delete lottery number"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}