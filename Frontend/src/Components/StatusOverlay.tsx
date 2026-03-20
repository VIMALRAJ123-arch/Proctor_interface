import { useEffect, useRef } from 'react';
import { X, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Candidate } from '../store/proctorStore';

interface StatusOverlayProps {
    title: string;
    candidates: Candidate[];
    onClose: () => void;
    type: 'active' | 'offline' | 'joined' | 'yet_to_join';
}

export default function StatusOverlay({ title, candidates, onClose, type }: StatusOverlayProps) {
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

    const getIcon = () => {
        switch (type) {
            case 'active': return <CheckCircle size={18} className="text-emerald-500" />;
            case 'offline': return <AlertCircle size={18} className="text-rose-500" />;
            case 'joined': return <User size={18} className="text-indigo-500" />;
            case 'yet_to_join': return <Clock size={18} className="text-amber-500" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={overlayRef}
                className="w-full max-w-lg bg-[#1E293B] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-black text-slate-400">
                            {candidates.length}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {candidates.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No candidates in this category</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {candidates.map((c) => (
                                <div 
                                    key={c.id}
                                    className="p-4 bg-[#0F172A] rounded-2xl border border-slate-800/50 flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase group-hover:text-indigo-400 transition-colors">
                                                {c.name}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                ID: {c.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${type === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-800">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                    >
                        Close List
                    </button>
                </div>
            </div>
        </div>
    );
}
