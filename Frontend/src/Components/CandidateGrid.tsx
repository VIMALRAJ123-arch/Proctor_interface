import { useProctorStore } from '../store/proctorStore';
import { Monitor, Smartphone, Shield, Maximize2, VideoOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface CandidateGridProps {
    viewMode: 'front' | 'side' | 'both';
}

export default function CandidateGrid({ viewMode }: CandidateGridProps) {
    const { candidates, setFocusedCandidateId } = useProctorStore();

    if (candidates.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[#0F172A]">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
                    <Shield className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Candidates Assigned</h3>
                <p className="text-slate-500 text-sm max-w-[300px] font-medium">Please wait for the administrator to assign candidates to your session.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 max-w-[1600px] mx-auto">
            {candidates.map((candidate, idx) => (
                <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setFocusedCandidateId(candidate.id)}
                    className="bg-[#1E293B]/50 rounded-[2.5rem] border border-slate-800/50 overflow-hidden cursor-pointer group hover:border-indigo-500/30 hover:bg-[#1E293B] shadow-2xl transition-all relative"
                >
                    {/* Camera Feed Containers */}
                    <div className="flex gap-px bg-slate-800/30 aspect-video relative">
                        {/* Front Camera */}
                        {(viewMode === 'front' || viewMode === 'both') && (
                            <div className="flex-1 bg-slate-900/50 relative flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                                <div className="absolute top-4 left-5 flex items-center gap-1.5 bg-[#0F172A]/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800/50">
                                    <Monitor size={10} className="text-indigo-400" />
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Front</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <div className={`w-12 h-12 ${candidate.avatarColor} rounded-full flex items-center justify-center text-white text-lg font-black`}>
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <VideoOff size={20} className="text-slate-500" />
                                </div>
                            </div>
                        )}

                        {/* Side Camera */}
                        {(viewMode === 'side' || viewMode === 'both') && (
                            <div className="flex-1 bg-slate-900/50 relative flex items-center justify-center border-l border-slate-800/30 group-hover:bg-slate-900 transition-colors">
                                <div className="absolute top-4 left-5 flex items-center gap-1.5 bg-[#0F172A]/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800/50">
                                    <Smartphone size={10} className="text-indigo-400" />
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Side</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <VideoOff size={24} className="text-slate-500" />
                                </div>
                            </div>
                        )}

                        {/* Status Overlays */}
                        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none">
                            <div className="px-3 py-1.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                                <Maximize2 size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info Footer */}
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{candidate.id}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: C-0{idx + 1}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
