
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserProfileFormProps {
  onSave: (profile: UserProfile) => void;
  initialProfile: UserProfile | null;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSave, initialProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile || {
    jobStatus: '',
    familySize: '',
    incomeRange: '',
    currentSituation: '',
    futureGoals: '',
    limitations: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 max-w-md w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
        <i className="fa-solid fa-brain"></i> Persona Setup
      </h2>
      <p className="text-xs text-gray-400 mb-6">Tell us about yourself so suggestions are tailored to your reality.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase text-gray-500 mb-1">Job Status</label>
          <input 
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none" 
            value={formData.jobStatus}
            onChange={e => setFormData({...formData, jobStatus: e.target.value})}
            placeholder="e.g. Full-time Engineer, Freelancer"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase text-gray-500 mb-1">Family Size</label>
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none" 
              value={formData.familySize}
              onChange={e => setFormData({...formData, familySize: e.target.value})}
              placeholder="e.g. 4"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 mb-1">Income Level</label>
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none" 
              value={formData.incomeRange}
              onChange={e => setFormData({...formData, incomeRange: e.target.value})}
              placeholder="e.g. Mid-range"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-gray-500 mb-1">Current Situation</label>
          <textarea 
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none h-20" 
            value={formData.currentSituation}
            onChange={e => setFormData({...formData, currentSituation: e.target.value})}
            placeholder="Briefly describe your current lifestyle..."
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-gray-500 mb-1">Limitations</label>
          <input 
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none" 
            value={formData.limitations}
            onChange={e => setFormData({...formData, limitations: e.target.value})}
            placeholder="e.g. No car, limited budget for travel"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-colors mt-4"
        >
          Initialize Pillars
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;
