import React from 'react';
import { motion } from 'framer-motion';
import { QuestionItem } from '../types';
import { MessageCircleQuestion, CheckCircle2 } from 'lucide-react';

interface QuestionItemCardProps {
  item: QuestionItem;
  index: number;
}

export const QuestionItemCard: React.FC<QuestionItemCardProps> = ({ item, index }) => {
  const isDeleted = item.status === 'deleted';

  // Determine styling based on index (Rank)
  const getRankStyles = () => {
    if (isDeleted) return "border-slate-800 bg-slate-900/50 text-slate-500";
    if (index === 0) return "border-red-500/50 bg-gradient-to-r from-red-900/20 to-slate-800 text-white shadow-red-900/10 shadow-lg";
    if (index < 5) return "border-orange-500/30 bg-gradient-to-r from-orange-900/10 to-slate-800 text-slate-100";
    return "border-slate-700 bg-slate-800 text-slate-300";
  };

  const getRankBadge = () => {
    if (isDeleted) return "bg-slate-700 text-slate-400";
    if (index === 0) return "bg-red-500 text-white animate-pulse";
    if (index < 5) return "bg-orange-500 text-white";
    return "bg-slate-600 text-slate-300";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-3 rounded-md border mb-2 flex items-start gap-3 ${getRankStyles()}`}
    >
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge()}`}>
        {isDeleted ? <CheckCircle2 className="w-3 h-3" /> : (index + 1)}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${isDeleted ? 'line-through' : 'font-medium'}`}>
          {item.content}
        </p>
        {!isDeleted && (
          <div className="mt-1 flex gap-2 text-[10px] uppercase tracking-wider opacity-60">
            <span>Score: {item.score}</span>
            <span>•</span>
            <span>ID: {item.qid}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};