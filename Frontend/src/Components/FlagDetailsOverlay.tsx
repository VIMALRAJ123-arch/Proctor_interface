import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Shield, Clock } from 'lucide-react';
import { Candidate } from '../store/proctorStore';

interface FlagDetailsOverlayProps {
    candidate: Candidate;
    onClose: () => void;
}

export default function FlagDetailsOverlay({ candidate, onClose }: FlagDetailsOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={overlayRef}
                className="w-full max-w-xl bg-[#1E293B] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-xl ring-2 ring-indigo-500/20">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{candidate.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield size={12} className="text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Flag History</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Flags List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#0F172A]/50">
                    {candidate.flags.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 filter grayscale">
                            <AlertTriangle size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">No violations detected</p>
                        </div>
                    ) : (
                        candidate.flags.map((flag, fIdx) => (
                            <div key={fIdx} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-[28px] before:bottom-[-22px] before:w-px before:bg-slate-800 last:before:hidden">
                                <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                </div>
                                <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/50 shadow-lg hover:border-rose-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{flag.type}</h4>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock size={10} />
                                            <span className="text-[9px] font-bold uppercase">{flag.timestamp}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        {flag.reason}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                        Total Flags: {candidate.flags.length}
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-black uppercase text-[9px] tracking-widest border border-slate-700 transition-all active:scale-[0.98]"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
