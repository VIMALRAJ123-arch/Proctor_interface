import { useProctorStore } from '../store/proctorStore';
import { ShieldAlert, VideoOff, WifiOff, X, Monitor, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FocusView() {
    const { candidates, focusedCandidateId, setFocusedCandidate } = useProctorStore();

    const candidate = candidates.find(c => c.id === focusedCandidateId);

    if (!candidate) return null;

    const isOffline = candidate.status === 'disconnected';

    return (
        <div className="h-full w-full bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Header / Close Tab */}
            <div className="h-14 shrink-0 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${candidate.avatarColor}`}>
                        {candidate.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-medium">{candidate.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono tracking-wider">Candidate ID: {candidate.id}</span>
                    </div>
                    {candidate.status === 'warning' && (
                        <div className="ml-4 flex items-center gap-1.5 bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-xs font-bold border border-amber-500/30">
                            <ShieldAlert className="w-4 h-4" />
                            {candidate.warnings} Warnings
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setFocusedCandidate(null)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-md transition-colors border border-slate-700 font-medium text-sm"
                >
                    <X className="w-4 h-4" />
                    Close Focus View
                </button>
            </div>

            {/* Massive Dual Camera View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-h-0 flex flex-col md:flex-row p-4 gap-4"
            >
                {/* Massive Front Camera */}
                <div className="flex-1 relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
                    <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-md flex items-center gap-2 backdrop-blur-md z-10">
                        <Monitor className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white uppercase font-bold tracking-widest">Front Camera</span>
                    </div>

                    {candidate.hasFrontCam && !isOffline ? (
                        <div className="flex-1 w-full opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black mix-blend-screen" />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                            {isOffline ? <WifiOff className="w-12 h-12 text-slate-500 mb-3" /> : <VideoOff className="w-12 h-12 text-slate-500 mb-3" />}
                            <span className="text-sm font-medium text-slate-400">{isOffline ? 'Connection Lost' : 'Camera Disconnected'}</span>
                        </div>
                    )}
                </div>

                {/* Massive Side Camera */}
                <div className="flex-1 relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
                    <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-md flex items-center gap-2 backdrop-blur-md z-10">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white uppercase font-bold tracking-widest">Side Camera</span>
                    </div>

                    {candidate.hasSideCam && !isOffline ? (
                        <div className="flex-1 w-full opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600 via-slate-800 to-black mix-blend-screen" />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                            {isOffline ? <WifiOff className="w-12 h-12 text-slate-600 mb-3" /> : <VideoOff className="w-12 h-12 text-slate-600 mb-3" />}
                            <span className="text-sm font-medium text-slate-500">{isOffline ? 'Connection Lost' : 'Side Camera Unavailable'}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
