/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Target, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Layout, 
  Clock, 
  Brain,
  ArrowRight,
  RefreshCw,
  User,
  Settings,
  Plus,
  BarChart3,
  Flame,
  Globe,
  Lock
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Standard AI initialization (lazy)
let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// Types
interface LifePlan {
  dailyRoutine: {
    time: string;
    activity: string;
    description: string;
    focus: 'deep' | 'light' | 'social' | 'rest';
  }[];
  habits: {
    name: string;
    frequency: string;
    why: string;
  }[];
  goals: {
    title: string;
    steps: string[];
    motivation: string;
  }[];
  weeklyPlanner: {
    day: string;
    theme: string;
    priority: string;
  }[];
  growthInsights: string;
}

interface UserInput {
  mainGoal: string;
  habit: string;
  focusLevel: string;
  schedulePreference: string;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [formData, setFormData] = useState<UserInput>({
    mainGoal: '',
    habit: '',
    focusLevel: 'balanced',
    schedulePreference: 'morning'
  });
  const [plan, setPlan] = useState<LifePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    setView('dashboard');
    
    try {
      const model = getAI();
      const prompt = `Generate a comprehensive high-performance life plan for a user with these details:
        Main Goal: ${formData.mainGoal}
        Habit to build: ${formData.habit}
        Focus Level: ${formData.focusLevel}
        Daily Preference: ${formData.schedulePreference}
        
        Provide:
        1. A daily routine (6 blocks).
        2. 3 essential habits.
        3. 3 Strategic goal steps.
        4. A 7-day weekly overview with a theme and one specific priority for each day.
        5. A motivational growth insight.`;

      const response = await model.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailyRoutine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    description: { type: Type.STRING },
                    focus: { type: Type.STRING, enum: ['deep', 'light', 'social', 'rest'] }
                  },
                  required: ['time', 'activity', 'description', 'focus']
                }
              },
              habits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ['name', 'frequency', 'why']
                }
              },
              goals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    motivation: { type: Type.STRING }
                  },
                  required: ['title', 'steps', 'motivation']
                }
              },
              weeklyPlanner: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                     day: { type: Type.STRING },
                     theme: { type: Type.STRING },
                     priority: { type: Type.STRING }
                   },
                   required: ['day', 'theme', 'priority']
                }
              },
              growthInsights: { type: Type.STRING }
            },
            required: ['dailyRoutine', 'habits', 'goals', 'weeklyPlanner', 'growthInsights']
          }
        }
      });

      const generatedData = JSON.parse(response.text || '{}');
      setPlan(generatedData);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0C]/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">LifeAI</span>
          </div>
          <div className="flex items-center gap-8">
            <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors">Framework</button>
            <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors">Pricing</button>
            <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-emerald-400 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="px-6 py-24 max-w-7xl mx-auto relative"
            >
              <div className="text-center max-w-4xl mx-auto space-y-12">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  Neural Growth Engine 2.0
                </motion.div>
                
                <h1 className="text-7xl md:text-8xl font-black leading-[1.05] tracking-tighter">
                  Evolve Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">Daily OS.</span>
                </h1>
                
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  The first AI-native growth system that aligns your biology with your ambitions. Design routines that don't just look good, but feel inevitable.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                  <button 
                    onClick={() => setView('onboarding')}
                    className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-500 hover:scale-[1.05] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Forge My Routine <ArrowRight size={22} />
                  </button>
                  <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
                    Explore Systems
                  </button>
                </div>
                
                <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="flex items-center justify-center gap-2 font-bold"><Globe size={20}/> Forbes</div>
                  <div className="flex items-center justify-center gap-2 font-bold"><Flame size={20}/> TechCrunch</div>
                  <div className="flex items-center justify-center gap-2 font-bold"><Lock size={20}/> Wired</div>
                  <div className="flex items-center justify-center gap-2 font-bold font-serif italic text-2xl">VOGUE</div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="px-6 py-20 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-5xl font-black tracking-tight">System Configuration.</h2>
                <p className="text-gray-400 text-xl font-medium">Calibrate the AI to your specific growth parameters.</p>
              </div>

              <div className="bg-[#141417] rounded-[2.5rem] p-12 border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10" />
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Target size={18} className="text-emerald-500" />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Primary Mission</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="What is your North Star?"
                    className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 outline-none transition-all text-xl font-medium"
                    value={formData.mainGoal}
                    onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap size={18} className="text-orange-400" />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Structural Habit</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="What single action changes everything?"
                    className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 outline-none transition-all text-lg"
                    value={formData.habit}
                    onChange={(e) => setFormData({ ...formData, habit: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Focus Mode</label>
                    <div className="grid grid-cols-1 gap-3">
                       {['balanced', 'high-intensity', 'flow-state'].map((level) => (
                         <button
                           key={level}
                           onClick={() => setFormData({ ...formData, focusLevel: level })}
                           className={`py-4 rounded-xl border text-sm font-bold transition-all ${
                             formData.focusLevel === level 
                             ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                             : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                           }`}
                         >
                           {level.replace('-', ' ').toUpperCase()}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Circadian Rhythm</label>
                    <div className="grid grid-cols-1 gap-3">
                       {['morning', 'night', 'varying'].map((pref) => (
                         <button
                           key={pref}
                           onClick={() => setFormData({ ...formData, schedulePreference: pref })}
                           className={`py-4 rounded-xl border text-sm font-bold transition-all ${
                             formData.schedulePreference === pref 
                             ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                             : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                           }`}
                         >
                           {pref.toUpperCase()}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={generatePlan}
                  disabled={!formData.mainGoal || !formData.habit}
                  className="w-full py-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-3xl font-black text-xl hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-4"
                >
                  INITIALIZE PLAN <Sparkles size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-6 py-12"
            >
              {isGenerating ? (
                <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="w-32 h-32 border-4 border-white/5 border-t-emerald-500 rounded-full"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-4 border-4 border-white/5 border-t-blue-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                      <Brain size={40} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl font-black tracking-tight">Architecting Your System</h3>
                    <p className="text-gray-500 text-lg">Synthesizing routine blocks and growth trajectories...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-16 pb-32">
                  <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                        <BarChart3 size={16} /> Operational Dashboard
                      </div>
                      <h2 className="text-5xl font-black tracking-tighter">Growth <span className="text-emerald-500">Blueprint</span></h2>
                      <p className="text-gray-400 font-medium">Mission: {formData.mainGoal}</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><RefreshCw size={20} /></button>
                      <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><Settings size={20} /></button>
                      <button className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all">Export System</button>
                    </div>
                  </header>

                  <div className="grid lg:grid-cols-3 gap-10">
                     {/* Column 1: Daily Routine */}
                     <div className="lg:col-span-2 space-y-10">
                        <section className="bg-[#141417]/40 backdrop-blur-md rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] -z-10" />
                          
                          <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                                <Clock size={24} />
                              </div>
                              <h3 className="text-2xl font-black tracking-tight">Daily Protocol</h3>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-gray-400 uppercase tracking-widest">
                              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          
                          <div className="space-y-10 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                            {plan?.dailyRoutine.map((block, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-10 relative z-10 group"
                              >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-all group-hover:scale-110 ${
                                  block.focus === 'deep' ? 'bg-indigo-600 text-white shadow-indigo-500/20' :
                                  block.focus === 'light' ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
                                  block.focus === 'social' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-gray-800 text-gray-400'
                                }`}>
                                  {block.focus === 'deep' ? <Brain size={20} /> :
                                   block.focus === 'light' ? <Zap size={20} /> :
                                   block.focus === 'social' ? <User size={20} /> : <Calendar size={20} />}
                                </div>
                                <div className="flex-1 pt-0.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-black text-xl text-white group-hover:text-emerald-400 transition-colors">{block.activity}</h4>
                                    <span className="text-xs font-mono text-gray-500 font-bold tracking-widest uppercase">{block.time}</span>
                                  </div>
                                  <p className="text-gray-400 text-lg leading-relaxed">{block.description}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </section>

                        {/* Weekly Planner Section (New) */}
                        <section className="bg-[#141417]/40 backdrop-blur-md rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
                           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10" />
                           <div className="flex items-center gap-4 mb-10">
                              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                                <Calendar size={24} />
                              </div>
                              <h3 className="text-2xl font-black tracking-tight">Macro Schedule</h3>
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                              {plan?.weeklyPlanner.map((day, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex flex-col gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group"
                                >
                                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{day.day}</div>
                                  <div className="text-sm font-bold text-white leading-tight h-10 group-hover:text-emerald-400 transition-colors">{day.theme}</div>
                                  <div className="mt-auto pt-3 border-t border-white/5">
                                     <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest truncate">PRIORITY</div>
                                     <div className="text-[10px] text-gray-400 truncate mt-1">{day.priority}</div>
                                  </div>
                                </motion.div>
                              ))}
                           </div>
                        </section>
                     </div>

                     {/* Column 2: Profile & Stats */}
                     <div className="space-y-10">
                        <div className="bg-[#141417]/60 backdrop-blur-xl rounded-[3rem] p-12 border border-white/5 shadow-2xl text-center relative overflow-hidden">
                           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full" />
                           <div className="relative inline-block w-32 h-32 mb-8 p-1 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500">
                             <img 
                               src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jared" 
                               alt="Profile" 
                               className="w-full h-full rounded-full bg-[#141417] p-1"
                             />
                             <div className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-600 rounded-full border-4 border-[#141417] flex items-center justify-center text-white shadow-xl">
                               <Plus size={20} />
                             </div>
                           </div>
                           <h3 className="font-black text-3xl tracking-tight">Optimizer Jared</h3>
                           <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mt-2">Level 4 Growth Architect</p>
                           
                           <div className="grid grid-cols-2 gap-4 mt-12">
                              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">STREAK</div>
                                <div className="text-3xl font-black flex items-center justify-center gap-1">
                                  12 <Zap size={20} className="text-orange-400 fill-orange-400" />
                                </div>
                              </div>
                              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">STABILITY</div>
                                <div className="text-3xl font-black text-emerald-400">88%</div>
                              </div>
                           </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-8 relative group cursor-pointer overflow-hidden">
                           <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-emerald-500/20 blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
                           <div className="flex items-center gap-4 text-emerald-400">
                             <div className="p-3 bg-emerald-400/10 rounded-2xl">
                               <Sparkles size={28} />
                             </div>
                             <h4 className="font-black text-xl tracking-tight">Neural Pulse</h4>
                           </div>
                           <p className="text-gray-300 text-lg leading-relaxed font-medium italic">
                             "{plan?.growthInsights}"
                           </p>
                           <div className="pt-6 border-t border-white/10">
                             <button className="text-white text-sm font-black flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                               System Analysis <ArrowRight size={18} className="text-emerald-400" />
                             </button>
                           </div>
                        </div>

                        <div className="bg-[#141417]/40 rounded-[3rem] p-10 border border-white/5 space-y-6">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={20} />
                              </div>
                              <h3 className="text-xl font-black">Habit Nexus</h3>
                           </div>
                           <div className="space-y-4">
                              {plan?.habits.map((habit, idx) => (
                                <div key={idx} className="flex gap-5 p-5 rounded-3xl bg-white/5 border border-transparent hover:border-emerald-500/20 hover:bg-white/10 transition-all duration-300">
                                  <div className="pt-1"><CheckCircle2 size={20} className="text-emerald-500" /></div>
                                  <div>
                                    <div className="font-bold text-white">{habit.name}</div>
                                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-1">{habit.frequency}</div>
                                    <div className="text-sm text-gray-400 mt-3 italic">"{habit.why}"</div>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Growth Map Hero Section */}
                  <section className="bg-gradient-to-r from-[#141417] to-[#0A0A0C] rounded-[4rem] p-16 border border-white/5 flex flex-col md:flex-row items-center gap-16 shadow-3xl">
                     <div className="flex-1 space-y-8">
                       <h3 className="text-5xl font-black tracking-tight leading-tight">Mastering Your <br/><span className="text-blue-500">Trajectory.</span></h3>
                       <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                         Strategic milestones calculated by AI to ensure progressive overload in your personal growth journey.
                       </p>
                       <div className="space-y-4">
                         {plan?.goals[0]?.steps.map((step, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-6"
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-mono font-bold text-blue-400">
                                0{idx + 1}
                              </div>
                              <span className="text-lg font-bold text-gray-200">{step}</span>
                            </motion.div>
                         ))}
                       </div>
                     </div>
                     <div className="w-full md:w-[40%] aspect-square bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-[3rem] border border-white/5 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-white/5 rounded-[3rem] group-hover:scale-105 transition-transform duration-700" />
                        <div className="text-center space-y-4 relative z-10">
                           <div className="text-7xl font-black text-white">82<span className="text-emerald-500 text-4xl">%</span></div>
                           <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Projected Success Rate</div>
                        </div>
                     </div>
                  </section>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 mt-20 border-t border-white/5 relative bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Brain size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight">LifeAI</span>
            </div>
            <p className="text-gray-500 max-w-sm">The world's first neuro-aligned life planning system. Built for high-performers, dreamers, and optimizers.</p>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400">Resources</h5>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Community</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400">Connect</h5>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">X / Twitter</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Github</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-bold text-gray-600 tracking-[0.2em] uppercase">
          <span>© 2026 LIFEAI NEURAL SYSTEMS</span>
          <div className="flex gap-8">
             <a href="#">Privacy Protocol</a>
             <a href="#">Term of Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
