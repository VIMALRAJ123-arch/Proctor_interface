import { useState } from 'react';
import { useProctorStore, Candidate } from '../store/proctorStore';
import { Shield, Maximize2, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import AgoraVideoPlayer from './AgoraVideoPlayer';
import FlagDetailsOverlay from './FlagDetailsOverlay';

interface CandidateGridProps {
    viewMode: 'front' | 'side' | 'both';
}

export default function CandidateGrid({ viewMode }: CandidateGridProps) {
    const { candidates, setFocusedCandidateId, assessmentId } = useProctorStore();
    const [flagOverlayCandidate, setFlagOverlayCandidate] = useState<Candidate | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 max-w-[1600px] mx-auto relative">
            {candidates.map((candidate, idx) => (
                <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#1E293B]/50 rounded-[2.5rem] border border-slate-800/50 overflow-hidden group hover:border-indigo-500/30 hover:bg-[#1E293B] shadow-2xl transition-all relative"
                >
                    <div 
                        onClick={() => setFocusedCandidateId(candidate.id)}
                        className="flex-1 bg-[#0F172A] relative overflow-hidden group-hover:bg-slate-900 transition-colors aspect-video cursor-pointer"
                    >
                        <AgoraVideoPlayer 
                            assessmentId={assessmentId} 
                            candidateId={candidate.id} 
                            layout="grid" 
                            viewMode={viewMode}
                        />
                        
                        {/* Status Overlays */}
                        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
                            {candidate.cameraOn && (
                                <div className="px-3 py-1.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                                </div>
                            )}
                            <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform ml-auto">
                                <Maximize2 size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info Footer */}
                    <div className="p-6 flex items-center justify-between font-black">
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{candidate.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Flag Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFlagOverlayCandidate(candidate);
                                }}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    candidate.flags.length > 0 
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                                title="View Flags"
                            >
                                <Flag size={14} fill={candidate.flags.length > 0 ? "currentColor" : "none"} />
                            </button>
                            <div className="px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 font-black">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: C-0{idx + 1}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Flag Overlay */}
            {flagOverlayCandidate && (
                <FlagDetailsOverlay 
                    candidate={flagOverlayCandidate}
                    onClose={() => setFlagOverlayCandidate(null)}
                />
            )}
        </div>
    );
}
