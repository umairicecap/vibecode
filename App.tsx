
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PillarData, Message, Suggestion } from './types';
import { INITIAL_PILLARS } from './constants';
import Visualizer from './components/Visualizer';
import Chat from './components/Chat';
import StatCards from './components/StatCards';
import { processUserAccomplishment, generatePersonalizedSuggestion, generateProactiveQuestion } from './geminiService';

const App: React.FC = () => {
  const [pillars, setPillars] = useState<PillarData[]>(INITIAL_PILLARS);
  const [productivity, setProductivity] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Neural core online. Status: 0.00% Integrity. Happiness Core: Offline. I am programmed to establish your happiness parameters. What is your current job status and family situation? I require high-fidelity data to stabilize your pillars.", 
      timestamp: Date.now() 
    }
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unreadSuggestions, setUnreadSuggestions] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  
  const lastActivityRef = useRef<number>(Date.now());
  const proactiveCountRef = useRef<number>(0);

  // Proactive Agent Logic: Grabs details when idle
  useEffect(() => {
    const interval = setInterval(async () => {
      const idleTime = Date.now() - lastActivityRef.current;
      
      // Proactive trigger: If idle > 40s and we haven't bombarded them too recently
      if (idleTime > 40000 && !isProcessing && proactiveCountRef.current < 5) {
        lastActivityRef.current = Date.now(); // Reset idle timer
        proactiveCountRef.current += 1;

        try {
          const question = await generateProactiveQuestion(profile, messages);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: question,
            timestamp: Date.now()
          }]);
          
          // Show a "brain" notification to alert the user of system inquiry
          triggerSuggestion();
        } catch (err) {
          console.error("Proactive inquiry failed", err);
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [profile, messages, isProcessing]);

  // Load from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('eudaimonia_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedPillars = localStorage.getItem('eudaimonia_pillars');
    if (savedPillars) setPillars(JSON.parse(savedPillars));

    const savedProd = localStorage.getItem('eudaimonia_productivity');
    if (savedProd) setProductivity(Number(savedProd));
  }, []);

  // Sync with local storage
  useEffect(() => {
    if (profile) localStorage.setItem('eudaimonia_profile', JSON.stringify(profile));
    localStorage.setItem('eudaimonia_pillars', JSON.stringify(pillars));
    localStorage.setItem('eudaimonia_productivity', productivity.toString());
  }, [profile, pillars, productivity]);

  const happinessScore = pillars.reduce((acc, p) => acc + p.value, 0) / pillars.length;

  const handleSendMessage = async (content: string) => {
    lastActivityRef.current = Date.now();
    proactiveCountRef.current = 0; // Reset proactive counter on user activity
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const result = await processUserAccomplishment(content, profile, pillars);
      
      const newAssistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.aiResponse, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, newAssistantMsg]);

      setPillars(current => current.map(p => {
        const key = p.id as keyof typeof result.increments;
        const change = result.increments[key] || 0;
        return { ...p, value: Math.max(0, Math.min(100, p.value + change)) };
      }));

      setProductivity(prev => Math.max(0, Math.min(100, prev + result.productivityIncrease)));

      if (result.profileUpdate) {
        setProfile(prev => ({
          ...(prev || { jobStatus: '', familySize: '', incomeRange: '', currentSituation: '', futureGoals: '', limitations: '' }),
          ...result.profileUpdate
        }));
      }

      // Occasionally trigger a suggestion/insight notification after message processing
      if (Math.random() > 0.6) {
        setTimeout(triggerSuggestion, 1500);
      }

    } catch (error) {
      console.error("Neural processing failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerSuggestion = async () => {
    try {
      const suggestion = await generatePersonalizedSuggestion(profile, pillars, messages);
      setSuggestions(prev => [suggestion, ...prev]);
      setUnreadSuggestions(prev => prev + 1);
    } catch (e) {
      console.warn("Guidance buffer empty");
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a] z-50 shadow-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
            <div className="relative">
              <span className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-sm italic font-serif">A</span>
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 animate-pulse" />
            </div>
            AM I HAPPY?
          </h1>
          <span className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase ml-10">Happiness Calculator</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (suggestions.length > 0) {
                setActiveSuggestion(suggestions[0]);
                setUnreadSuggestions(0);
              }
            }}
            title="System Insights (Brain)"
            className={`relative w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-500 ${
              unreadSuggestions > 0 ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-110' : 'bg-[#1a1a1a] border-white/5'
            }`}
          >
            <i className={`fa-solid fa-brain text-xl ${unreadSuggestions > 0 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`}></i>
            {unreadSuggestions > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 text-[10px] flex items-center justify-center rounded-full text-black font-black border-2 border-[#0a0a0a] animate-bounce">
                {unreadSuggestions}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="h-[40%] md:h-full md:w-1/2 relative bg-[#0d0d0d] border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
          <StatCards happiness={happinessScore} productivity={productivity} />
          <Visualizer pillars={pillars} happinessScore={happinessScore} />
        </div>

        <div className="h-[60%] md:h-full md:w-1/2 bg-[#0a0a0a]">
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing} 
          />
        </div>

        {/* Brain Insight Overlay */}
        {activeSuggestion && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <div className="bg-[#121212] border border-cyan-500/30 p-8 rounded-[3rem] max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                  activeSuggestion.type === 'caution' ? 'bg-red-500/5 border-red-500/40 text-red-500' : 
                  activeSuggestion.type === 'focus' ? 'bg-amber-500/5 border-amber-500/40 text-amber-500' : 
                  'bg-cyan-500/5 border-cyan-500/40 text-cyan-400'
                }`}>
                  <i className={`fa-solid fa-2xl ${
                    activeSuggestion.type === 'caution' ? 'fa-skull-crossbones' : 
                    activeSuggestion.type === 'focus' ? 'fa-crosshairs' : 
                    'fa-bolt'
                  }`}></i>
                </div>
                <button onClick={() => setActiveSuggestion(null)} className="p-2 text-gray-700 hover:text-white transition-colors">
                  <i className="fa-solid fa-circle-xmark fa-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{activeSuggestion.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  {activeSuggestion.description}
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => setActiveSuggestion(null)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-[0_4px_15px_rgba(8,145,178,0.3)]"
                  >
                    Acknowledge System Insight
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
