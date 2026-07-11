import React from 'react';
import { motion } from 'framer-motion';
import type { Suggestion } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAdd: (title: string) => void;
  index: number;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onAdd, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
        <span className="text-xs text-indigo-600 font-medium capitalize">{suggestion.type}</span>
      </div>
      <button
        onClick={() => onAdd(suggestion.title)}
        className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md hover:bg-indigo-100 transition-colors"
      >
        Add
      </button>
    </motion.div>
  );
};
