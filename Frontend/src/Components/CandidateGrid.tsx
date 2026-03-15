import { useProctorStore } from '../store/proctorStore';
import { VideoOff, WifiOff, Monitor, Smartphone } from 'lucide-react';

export default function CandidateGrid() {
    const { candidates, viewMode } = useProctorStore();
    const candidate = candidates[0];

    if (!candidate) return null;

    const isOffline = candidate.status === 'disconnected';

    return (
        <div className="h-full w-full bg-slate-100 p-4 md:p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-lg ring-1 ring-slate-200 overflow-hidden relative group">
                {/* Dual Camera Container */}
                <div className="flex w-full h-full relative">
                    {/* Front Camera */}
                    {(viewMode === 'front' || viewMode === 'both') && (
                        <div className={`relative flex-1 bg-slate-800/90 border-r border-slate-700/50 ${viewMode === 'both' ? 'w-1/2' : 'w-full'}`}>
                            {candidate.hasFrontCam && !isOffline ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black mix-blend-screen" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                                    {isOffline ? <WifiOff className="w-12 h-12 text-slate-500 mb-2" /> : <VideoOff className="w-12 h-12 text-slate-500 mb-2" />}
                                    <span className="text-sm font-medium text-slate-400">{isOffline ? 'Connection Lost' : 'Camera Off'}</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-md flex items-center gap-2 backdrop-blur-sm">
                                <Monitor className="w-4 h-4 text-slate-300" />
                                <span className="text-xs text-slate-200 uppercase font-bold tracking-wider">Front Feed</span>
                            </div>

                            {(!candidate.hasFrontCam || isOffline) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl ${candidate.avatarColor}`}>
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
                                <div className="w-full h-full opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600 via-slate-800 to-black mix-blend-screen" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                                    {isOffline ? <WifiOff className="w-12 h-12 text-slate-700 mb-2" /> : <VideoOff className="w-12 h-12 text-slate-700 mb-2" />}
                                    <span className="text-sm font-medium text-slate-600">{isOffline ? 'Connection Lost' : 'Side Cam Off'}</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-md flex items-center gap-2 backdrop-blur-sm">
                                <Smartphone className="w-4 h-4 text-slate-300" />
                                <span className="text-xs text-slate-200 uppercase font-bold tracking-wider">Side Feed</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlay removed as requested */}
            </div>
        </div>
    );
}
