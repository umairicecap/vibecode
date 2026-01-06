
import React, { useMemo, useState, useEffect } from 'react';
import { PillarData } from '../types';

interface VisualizerProps {
  pillars: PillarData[];
  happinessScore: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ pillars, happinessScore }) => {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const [prevScore, setPrevScore] = useState(happinessScore);
  const [showIncrAnim, setShowIncrAnim] = useState(false);
  const [showDecrAnim, setShowDecrAnim] = useState(false);

  useEffect(() => {
    if (Math.abs(happinessScore - prevScore) >= 1) {
      if (happinessScore > prevScore) {
        setShowIncrAnim(true);
        setTimeout(() => setShowIncrAnim(false), 1000);
      } else {
        setShowDecrAnim(true);
        setTimeout(() => setShowDecrAnim(false), 1000);
      }
      setPrevScore(happinessScore);
    }
  }, [happinessScore, prevScore]);

  const variance = useMemo(() => {
    const mean = pillars.reduce((acc, p) => acc + p.value, 0) / pillars.length;
    const sqDiffs = pillars.map(p => Math.pow(p.value - mean, 2));
    const avgSqDiff = sqDiffs.reduce((acc, v) => acc + v, 0) / sqDiffs.length;
    return Math.sqrt(avgSqDiff);
  }, [pillars]);

  const getFaceData = () => {
    const score = Math.round(happinessScore);
    if (score <= 0) {
      return {
        eyes: "cross",
        mouth: "M -15 15 L 15 15",
        glow: "#333",
        status: "CORE OFFLINE"
      };
    }
    if (score < 20) {
      return {
        eyes: "dots",
        mouth: "M -15 20 Q 0 10 15 20",
        glow: "#ef4444",
        status: "SYSTEM FROWNING"
      };
    }
    if (score < 40) {
      return {
        eyes: "dots",
        mouth: "M -15 15 L 15 15",
        glow: "#f97316",
        status: "UNSTABLE NEUTRAL"
      };
    }
    if (score < 60) {
      return {
        eyes: "dots",
        mouth: "M -15 10 Q 0 18 15 10",
        glow: "#fbbf24",
        status: "OPTIMIZING SMILE"
      };
    }
    if (score < 80) {
      return {
        eyes: "happy",
        mouth: "M -20 8 Q 0 25 20 8",
        glow: "#22d3ee",
        status: "INTEGRITY HIGH"
      };
    }
    if (score < 100) {
      return {
        eyes: "happy",
        mouth: "M -25 5 Q 0 32 25 5",
        glow: "#22d3ee",
        status: "OPTIMIZED RADIANCE"
      };
    }
    return {
      eyes: "sparkle",
      mouth: "M -28 2 Q 0 40 28 2",
      glow: "#22d3ee",
      status: "EUDAIMONIA DETECTED"
    };
  };

  const face = getFaceData();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pt-24 pb-12 px-4 perspective-1000 overflow-hidden bg-[#0d0d0d]">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, #22d3ee 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      <div className={`absolute top-20 z-20 flex flex-col items-center transition-all duration-700 ${showIncrAnim ? 'scale-110' : showDecrAnim ? 'animate-shake' : ''}`}
           style={{ 
             transform: `translateY(${variance * -0.5}px) rotate(${variance * 0.2}deg)`,
             filter: `drop-shadow(0 0 ${10 + happinessScore/3}px ${face.glow}88)`
           }}>
        
        <svg width="110" height="110" viewBox="0 0 100 100" className="overflow-visible">
          <circle cx="50" cy="50" r="45" fill="#111" stroke={face.glow} strokeWidth="2" className="transition-colors duration-700" />
          
          <g className="transition-all duration-700">
            {face.eyes === 'cross' && (
              <>
                <path d="M 28 38 L 40 50 M 40 38 L 28 50" stroke="#555" strokeWidth="3" strokeLinecap="round" />
                <path d="M 60 38 L 72 50 M 72 38 L 60 50" stroke="#555" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
            {face.eyes === 'dots' && (
              <>
                <circle cx="35" cy="42" r="4" fill={face.glow} />
                <circle cx="65" cy="42" r="4" fill={face.glow} />
              </>
            )}
            {face.eyes === 'happy' && (
              <>
                <path d="M 28 45 Q 35 32 42 45" fill="none" stroke={face.glow} strokeWidth="4" strokeLinecap="round" />
                <path d="M 58 45 Q 65 32 72 45" fill="none" stroke={face.glow} strokeWidth="4" strokeLinecap="round" />
              </>
            )}
            {face.eyes === 'sparkle' && (
              <>
                <path d="M 35 30 L 38 38 L 46 41 L 38 44 L 35 52 L 32 44 L 24 41 L 32 38 Z" fill="#fff" className="animate-pulse" />
                <path d="M 65 30 L 68 38 L 76 41 L 68 44 L 65 52 L 62 44 L 54 41 L 62 38 Z" fill="#fff" className="animate-pulse" />
              </>
            )}
          </g>

          <path 
            d={face.mouth} 
            transform="translate(50, 48)" 
            fill="none" 
            stroke={face.glow} 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="transition-all duration-700"
          />
        </svg>

        <div className="mt-4 text-center">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500" style={{ color: face.glow }}>
            {face.status}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between w-full h-1/2 gap-2 z-10 relative">
        {pillars.map((pillar) => (
          <div 
            key={pillar.id} 
            className="group relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer"
            onMouseEnter={() => setHoveredPillar(pillar.id)}
            onMouseLeave={() => setHoveredPillar(null)}
          >
            {hoveredPillar === pillar.id && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-[#1a1a1a] border border-cyan-500/50 rounded-lg px-3 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.2)] whitespace-nowrap">
                  <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider mb-0.5">{pillar.name}</p>
                  <p className="text-sm font-mono text-white text-center">{Math.round(pillar.value)}%</p>
                </div>
                <div className="w-2 h-2 bg-[#1a1a1a] border-b border-r border-cyan-500/50 rotate-45 mx-auto -mt-1" />
              </div>
            )}

            <div className="w-full relative h-full flex items-end justify-center">
              <div className="absolute bottom-0 w-[85%] h-full border-x border-t border-white/5 bg-white/[0.02] rounded-t-full" />
              <div 
                className="w-[85%] relative transition-all duration-1000 flex flex-col justify-start overflow-hidden rounded-t-full"
                style={{ 
                  height: `${Math.max(4, pillar.value)}%`,
                  backgroundColor: pillar.color,
                  boxShadow: `0 0 25px ${pillar.color}44, inset 0 0 15px rgba(0,0,0,0.6)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent h-[200%] animate-[flow_4s_linear_infinite]" 
                     style={{ backgroundImage: `linear-gradient(0deg, transparent 0%, ${pillar.color} 50%, transparent 100%)` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-cyan-900/30 to-transparent" />
      
      <style>{`
        @keyframes flow {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Visualizer;
