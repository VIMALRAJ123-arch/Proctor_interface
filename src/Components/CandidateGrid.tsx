import { useProctorStore } from '../store/proctorStore';
import { ShieldAlert, VideoOff, WifiOff, MessageSquare, Monitor, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateGrid() {
    const { candidates, selectedCandidateId, selectCandidate, viewMode, currentPage } = useProctorStore();

    const maxCandidatesPerPage = 4;
    const startIndex = (currentPage - 1) * maxCandidatesPerPage;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + maxCandidatesPerPage);

    // Determine grid columns based on how many candidates are visible
    // For 4 candidates, a 2x2 grid is ideal.
    const gridRows = paginatedCandidates.length <= 2 ? 'grid-rows-1' : 'grid-rows-2';

    return (
        <div className="h-full w-full bg-slate-100 p-4 md:p-6 overflow-y-auto">
            {/* 4-Person Grid Layout */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 h-full ${gridRows}`}>
                <AnimatePresence>
                    {paginatedCandidates.map((candidate) => {
                        const isSelected = selectedCandidateId === candidate.id;
                        const isOffline = candidate.status === 'disconnected';

                        return (
                            <motion.div
                                key={candidate.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => selectCandidate(candidate.id)}
                                className={`video-card group cursor-pointer relative overflow-hidden flex ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 z-10' : 'hover:ring-1 hover:ring-slate-400'
                                    }`}
                            >
                                {/* Dual Camera Container */}
                                <div className="flex flex-1 w-full h-full relative">
                                    {/* Front Camera */}
                                    {(viewMode === 'front' || viewMode === 'both') && (
                                        <div className={`relative flex-1 bg-slate-800/90 border-r border-slate-700/50 ${viewMode === 'both' ? 'w-1/2' : 'w-full'}`}>
                                            {candidate.hasFrontCam && !isOffline ? (
                                                <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black mix-blend-screen" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                                                    {isOffline ? <WifiOff className="w-8 h-8 text-slate-500 mb-2" /> : <VideoOff className="w-8 h-8 text-slate-500 mb-2" />}
                                                    <span className="text-[11px] font-medium text-slate-400">{isOffline ? 'Connection Lost' : 'Camera Off'}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1.5 backdrop-blur-sm">
                                                <Monitor className="w-3 h-3 text-slate-300" />
                                                <span className="text-[10px] text-slate-200 uppercase font-semibold tracking-wider">Front</span>
                                            </div>

                                            {/* Avatar display if no front cam */}
                                            {(!candidate.hasFrontCam || isOffline) && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${candidate.avatarColor}`}>
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Side Camera */}
                                    {(viewMode === 'side' || viewMode === 'both') && (
                                        <div className={`relative flex-1 bg-slate-900/95 ${viewMode === 'both' ? 'w-1/2' : 'w-full'}`}>
                                            {candidate.hasSideCam && !isOffline ? (
                                                <div className="w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600 via-slate-800 to-black mix-blend-screen" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                                                    {isOffline ? <WifiOff className="w-8 h-8 text-slate-600 mb-2" /> : <VideoOff className="w-8 h-8 text-slate-600 mb-2" />}
                                                    <span className="text-[11px] font-medium text-slate-500">{isOffline ? 'Connection Lost' : 'Side Cam Off'}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1.5 backdrop-blur-sm">
                                                <Smartphone className="w-3 h-3 text-slate-300" />
                                                <span className="text-[10px] text-slate-200 uppercase font-semibold tracking-wider">Side</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Overlays (Bottom info bar) */}
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent flex items-end justify-between z-10 pointer-events-none">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium text-sm text-shadow-sm">{candidate.name}</span>
                                            <span className="text-[10px] text-slate-300 font-mono bg-slate-800/80 px-1.5 rounded">{candidate.id}</span>
                                        </div>
                                        {/* Status Indicators */}
                                        <div className="flex items-center gap-2">
                                            {candidate.status === 'active' && !isOffline && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                                                </div>
                                            )}
                                            {candidate.status === 'warning' && (
                                                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/30">
                                                    <ShieldAlert className="w-3 h-3" />
                                                    {candidate.warnings}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Icon on Hover/Selected */}
                                    <div className={`w-8 h-8 rounded-full bg-blue-600/90 flex items-center justify-center text-white backdrop-blur-sm transition-opacity pointer-events-auto ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
