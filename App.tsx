import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Mic, Play, Pause, Server, MessageSquare, ListTodo, History, Loader2 } from 'lucide-react';

import { ChatMessage, DiagnosisItem, QuestionItem, WebSocketMessage } from './types';
import { audioQueueService } from './services/audioQueue';
import { DiagnosisCard } from './components/DiagnosisCard';
import { QuestionItemCard } from './components/QuestionItemCard';
import { ChatBubble } from './components/ChatBubble';

const WS_URL = "wss://clinic-hepa-backend-481780815788.us-central1.run.app/ws/simulation";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [systemStatus, setSystemStatus] = useState("Ready to start");
  
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connect = () => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setSystemStatus("Connected to secure server");
    };

    ws.onclose = () => {
      setConnected(false);
      setSimulationActive(false);
      setSystemStatus("Disconnected");
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'audio':
            audioQueueService.addToQueue(data.data);
            break;

          case 'transcript':
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              speaker: data.speaker,
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }]);
            break;

          case 'diagnosis':
            // Sort by indicators count (desc) then probability if needed
            const sortedDiag = data.data.sort((a, b) => b.indicators_count - a.indicators_count);
            // Keep top 3 for the main view
            setDiagnoses(sortedDiag.slice(0, 3));
            break;

          case 'questions':
            setQuestions(data.data);
            break;

          case 'system':
            setSystemStatus(data.message);
            break;
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  };

  const startSimulation = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
      // Wait for connection to open before sending start
      setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
             wsRef.current.send("start");
             audioQueueService.init();
             setSimulationActive(true);
          }
      }, 1000); 
    } else {
      wsRef.current.send("start");
      audioQueueService.init();
      setSimulationActive(true);
    }
  };

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
        wsRef.current?.close();
    }
  }, []);

  const activeQuestions = questions
    .filter(q => !q.status) // Status null
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10);

  const deletedQuestions = questions
    .filter(q => q.status === 'deleted')
    .slice(0, 5); // Show last 5 asked

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">MedForce <span className="text-blue-500 font-light">Simulator</span></h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              {systemStatus}
            </p>
          </div>
        </div>
        
        <div>
          {!simulationActive ? (
            <button 
              onClick={startSimulation}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Play className="w-4 h-4" /> Start Interview
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 text-slate-400 px-4 py-2 rounded-full border border-slate-700">
               <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Live Simulation
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Column: Chat & Audio (5 cols) */}
        <section className="lg:col-span-5 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full relative">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
            <h2 className="font-semibold text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" /> Live Transcript
            </h2>
            {simulationActive && <Mic className="w-4 h-4 text-red-500 animate-pulse" />}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-20">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                    <Server className="w-12 h-12 mb-4" />
                    <p>Waiting for server stream...</p>
                </div>
            ) : (
                <AnimatePresence>
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                </AnimatePresence>
            )}
            <div ref={chatEndRef} />
          </div>
          
          {/* Audio Visualizer Placeholder */}
          <div className="h-16 border-t border-slate-800 bg-slate-950 flex items-center justify-center relative overflow-hidden">
             {simulationActive && (
                 <div className="flex gap-1 items-center justify-center h-full w-full opacity-30">
                     {[...Array(20)].map((_, i) => (
                         <motion.div 
                            key={i}
                            className="w-1 bg-blue-500 rounded-full"
                            animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                         />
                     ))}
                 </div>
             )}
             <span className="absolute text-xs font-mono text-slate-500">AUDIO OUTPUT STREAM</span>
          </div>
        </section>

        {/* Right Column: Data Streams (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-slate-950">
          
          {/* Top Half: Diagnosis */}
          <div className="flex-1 border-b border-slate-800 p-6 overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Diagnosis Leaderboard
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <AnimatePresence>
                {diagnoses.map((item, index) => (
                  <DiagnosisCard key={item.did} item={item} rank={index} />
                ))}
              </AnimatePresence>
              {diagnoses.length === 0 && (
                <div className="text-center text-slate-600 py-10 italic">
                  Awaiting sufficient clinical data...
                </div>
              )}
            </div>
          </div>

          {/* Bottom Half: Questions */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                
                {/* Active Questions */}
                <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-slate-900 py-2 z-10">
                        <ListTodo className="w-4 h-4 text-orange-500" /> Recommended Questions
                    </h2>
                    <div className="space-y-1">
                        <AnimatePresence>
                            {activeQuestions.map((q, idx) => (
                                <QuestionItemCard key={q.qid} item={q} index={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* History */}
                <div className="border-l border-slate-800 pl-6 opacity-70">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-slate-900 py-2 z-10">
                        <History className="w-4 h-4" /> History
                    </h2>
                    <div className="space-y-1">
                        <AnimatePresence>
                            {deletedQuestions.map((q, idx) => (
                                <QuestionItemCard key={q.qid} item={q} index={idx} />
                            ))}
                        </AnimatePresence>
                        {deletedQuestions.length === 0 && (
                            <p className="text-xs text-slate-600">No questions asked yet.</p>
                        )}
                    </div>
                </div>

             </div>
          </div>

        </section>
      </main>
    </div>
  );
}