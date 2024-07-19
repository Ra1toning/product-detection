import React from 'react';

interface ProductDetailsProps {
  product: {
    name: string;
    score: number;
    details: string;
  };
  lotteryNumber: string;
  onClose: () => void;
}

export default function ProductDetails({ product, lotteryNumber, onClose }: ProductDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">Successfully!</h2>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{product.name}</h3>
          <p className="mb-6 text-lg font-bold text-gray-600 dark:text-gray-300">
            Lottery: <span className="font-mono font-bold">{lotteryNumber}</span>
          </p>
          <button 
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}