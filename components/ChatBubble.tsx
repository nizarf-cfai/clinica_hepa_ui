import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { User, Stethoscope } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isNurse = message.speaker.toUpperCase() === 'NURSE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-4 ${isNurse ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[80%] ${isNurse ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isNurse ? 'bg-cyan-600' : 'bg-emerald-600'
        }`}>
          {isNurse ? <Stethoscope className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
        </div>

        {/* Bubble */}
        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isNurse 
            ? 'bg-cyan-900/40 text-cyan-100 rounded-br-none border border-cyan-800' 
            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
        }`}>
          <div className={`text-[10px] mb-1 font-bold uppercase opacity-50 ${isNurse ? 'text-right' : 'text-left'}`}>
            {message.speaker} <span className="font-normal normal-case opacity-70 ml-1">{message.timestamp}</span>
          </div>
          {message.text}
        </div>
      </div>
    </motion.div>
  );
};