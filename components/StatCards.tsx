
import React from 'react';

interface StatCardsProps {
  happiness: number;
  productivity: number;
}

const StatCards: React.FC<StatCardsProps> = ({ happiness, productivity }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-30">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
          <i className="fa-solid fa-bolt text-cyan-400 animate-pulse"></i>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase leading-none">Productivity</div>
          <div className="text-xl font-bold text-white">{Math.round(productivity)}%</div>
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
        <div>
          <div className="text-[10px] text-gray-400 uppercase leading-none text-right">Happiness</div>
          <div className="text-xl font-bold text-white text-right">{Math.round(happiness)}%</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/40">
          <i className="fa-solid fa-heart text-pink-400"></i>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
