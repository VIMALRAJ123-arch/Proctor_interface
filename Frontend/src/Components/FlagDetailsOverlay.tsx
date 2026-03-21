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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={overlayRef}
                className="w-full max-w-xl bg-surface rounded-[2rem] border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between bg-surface/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-main rounded-xl flex items-center justify-center font-black text-white text-lg shadow-xl ring-2 ring-accent-main/20">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">{candidate.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield size={12} className="text-text-secondary" />
                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none">Flag History</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-brand rounded-xl transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Flags List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-brand/50">
                    {candidate.flags.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 filter grayscale">
                            <AlertTriangle size={48} className="mb-4 text-text-secondary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-text-secondary">No violations detected</p>
                        </div>
                    ) : (
                        candidate.flags.map((flag, fIdx) => (
                            <div key={fIdx} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-[28px] before:bottom-[-22px] before:w-px before:bg-border-subtle last:before:hidden">
                                <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-status-offline/20 border border-status-offline/30 flex items-center justify-center z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-offline shadow-[0_0_8px_var(--color-status-offline)]" />
                                </div>
                                <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-lg hover:border-status-offline/30 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">{flag.type}</h4>
                                        <div className="flex items-center gap-1.5 text-text-secondary">
                                            <Clock size={10} />
                                            <span className="text-[9px] font-bold uppercase">{flag.timestamp}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                        {flag.reason}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-surface border-t border-border-subtle flex items-center justify-between">
                    <p className="text-[9px] font-black text-status-offline uppercase tracking-widest">
                        Total Flags: {candidate.flags.length}
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-brand hover:bg-brand/80 text-text-primary rounded-xl font-black uppercase text-[9px] tracking-widest border border-border-subtle transition-all active:scale-[0.98]"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
