import React from 'react';
import { motion } from 'framer-motion';
import { DiagnosisItem } from '../types';
import { Activity, AlertCircle } from 'lucide-react';

interface DiagnosisCardProps {
  item: DiagnosisItem;
  rank: number;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ item, rank }) => {
  const maxIndicators = 6; // Max blocks to show for visual scale

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-800 rounded-lg p-4 mb-3 border border-slate-700 shadow-lg relative overflow-hidden"
    >
      {/* Background Gradient based on rank */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          rank === 0 ? 'bg-red-500' : rank === 1 ? 'bg-orange-500' : 'bg-yellow-500'
        }`} 
      />

      <div className="flex justify-between items-start mb-2 pl-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {item.diagnosis}
            {rank === 0 && <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />}
          </h3>
          <span className="text-xs font-mono text-slate-400">ID: {item.did}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold px-2 py-1 rounded ${
            item.probability === 'High' ? 'bg-red-900/50 text-red-200' : 
            item.probability === 'Medium' ? 'bg-yellow-900/50 text-yellow-200' : 
            'bg-blue-900/50 text-blue-200'
          }`}>
            {item.probability}
          </span>
        </div>
      </div>

      {/* Indicator Bar */}
      <div className="pl-3 mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Evidence Strength</span>
          <span>{item.indicators_count} Points</span>
        </div>
        <div className="flex gap-1 h-3">
          {Array.from({ length: maxIndicators }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ 
                opacity: i < item.indicators_count ? 1 : 0.2, 
                scaleY: 1,
                backgroundColor: i < item.indicators_count 
                  ? (rank === 0 ? '#ef4444' : rank === 1 ? '#f97316' : '#eab308') 
                  : '#334155'
              }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 rounded-sm"
            />
          ))}
        </div>
        
        {/* Indicators Text Preview (First 2) */}
        <div className="mt-2 space-y-1">
          {item.indicators_point.slice(0, 2).map((point, idx) => (
            <div key={idx} className="flex items-center text-xs text-slate-400">
              <Activity className="w-3 h-3 mr-1 inline opacity-50" />
              <span className="truncate">{point}</span>
            </div>
          ))}
          {item.indicators_point.length > 2 && (
             <div className="text-[10px] text-slate-500 pl-4">+{item.indicators_point.length - 2} more factors...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};