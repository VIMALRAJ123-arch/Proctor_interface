import { useEffect, useState, useRef } from 'react';
import { useProctorStore } from '../store/proctorStore';
import NavBar from '../Components/NavBar';
import CandidateGrid from '../Components/CandidateGrid';
import AgoraVideoPlayer from '../Components/AgoraVideoPlayer';
import StatusOverlay from '../Components/StatusOverlay';
import { 
    AlertTriangle, 
    UserX,
    Video,
    VideoOff,
    Send,
    X,
    UserCheck,
    Clock
} from 'lucide-react';

export default function Dashboard() {
    const { 
        isAuthenticated, 
        fetchCandidates, 
        candidates, 
        focusedCandidateId, 
        setFocusedCandidateId,
        proctorCameraEnabled,
        toggleProctorCamera,
        messages,
        sendMessage,
        selectedCandidateId,
        setSelectedCandidateId,
        startPolling,
        stopPolling,
        assessmentId,
        initRTM,
        logoutRTM
    } = useProctorStore();

    const [chatInput, setChatInput] = useState('');
    const [viewMode, setViewMode] = useState<'front' | 'side' | 'both'>('both');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Overlay state
    const [overlayType, setOverlayType] = useState<'active' | 'offline' | 'joined' | 'yet_to_join' | null>(null);

    // Effect to handle proctor camera stream
    useEffect(() => {
        const startCamera = async () => {
            if (proctorCameraEnabled && !stream) {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    setStream(newStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = newStream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    toggleProctorCamera(); // Reset toggle if failed
                }
            } else if (!proctorCameraEnabled && stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [proctorCameraEnabled]);

    // Ensure video ref is updated when stream changes
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCandidates();
        }
    }, [isAuthenticated, fetchCandidates]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        sendMessage(chatInput, selectedCandidate?.id);
        setChatInput('');
    };

    // Polling and RTM effect
    useEffect(() => {
        if (isAuthenticated) {
            startPolling();
            initRTM();
        }
        return () => {
            stopPolling();
            logoutRTM();
        };
    }, [isAuthenticated, startPolling, stopPolling, initRTM, logoutRTM]);

    // Filter candidates for overlays
    const activeCandidates = candidates.filter(c => c.isOnline);
    const offlineCandidates = candidates.filter(c => !c.isOnline && c.isJoined);
    const joinedCandidates = candidates.filter(c => c.isJoined);
    const yetToJoinCandidates = candidates.filter(c => !c.isJoined);
    const alertCandidates = candidates.filter(c => c.flags.length > 0);

    if (!isAuthenticated) return null;

    const focusedCandidate = candidates.find(c => c.id === focusedCandidateId);
    const selectedCandidate = candidates.find(c => c.id === (selectedCandidateId || focusedCandidateId));

    return (
        <div className="h-screen w-full bg-[#0F172A] flex flex-col font-sans overflow-hidden text-slate-200">
            <NavBar />

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/50">
                    {/* Top Stats Bar */}
                    <div className="bg-[#1E293B]/50 border-b border-slate-800/50 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Overview</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0F172A]/50 rounded-lg border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                    <span className="text-sm font-black text-white">{candidates.length}</span>
                                </div>
                                
                                {/* Active Button */}
                                <button 
                                    onClick={() => setOverlayType('active')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg border border-emerald-500/20 transition-all group"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Active</span>
                                    <span className="text-sm font-black text-emerald-400">{activeCandidates.length}</span>
                                </button>

                                {/* Offline Button */}
                                <button 
                                    onClick={() => setOverlayType('offline')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all group"
                                >
                                    <UserX size={12} className="text-rose-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Offline</span>
                                    <span className="text-sm font-black text-rose-500">{offlineCandidates.length}</span>
                                </button>

                                {/* Joined Button */}
                                <button 
                                    onClick={() => setOverlayType('joined')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg border border-indigo-500/20 transition-all group"
                                >
                                    <UserCheck size={12} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px) font-bold text-slate-400 uppercase">Joined</span>
                                    <span className="text-sm font-black text-indigo-400">{joinedCandidates.length}</span>
                                </button>

                                {/* Yet to Join Button */}
                                <button 
                                    onClick={() => setOverlayType('yet_to_join')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 hover:bg-amber-500/10 rounded-lg border border-amber-500/20 transition-all group"
                                >
                                    <Clock size={12} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Yet to Join</span>
                                    <span className="text-sm font-black text-amber-500">{yetToJoinCandidates.length}</span>
                                </button>

                                {/* Alerts */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 rounded-lg border border-amber-500/20">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alerts</span>
                                    <span className="text-sm font-black text-amber-500">{alertCandidates.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-[#0F172A] rounded-xl p-1 border border-slate-800">
                                <button 
                                    onClick={() => setViewMode('front')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'front' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Front
                                </button>
                                <button 
                                    onClick={() => setViewMode('side')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'side' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Side
                                </button>
                                <button 
                                    onClick={() => setViewMode('both')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'both' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Both
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-[#0F172A]/30">
                        <CandidateGrid viewMode={viewMode} />
                    </div>
                </div>

                {/* Right Panel - Chat & Focused View */}
                <aside className="w-[400px] flex flex-col bg-[#1E293B]/30 backdrop-blur-xl">
                    {/* Proctor Self View / Focused View */}
                    <div className="p-6 border-b border-slate-800/50">
                        <div className="aspect-video bg-[#0F172A] rounded-[2rem] border border-slate-800 overflow-hidden relative group shadow-2xl">
                            {focusedCandidate ? (
                                <>
                                    <AgoraVideoPlayer 
                                        assessmentId={assessmentId} 
                                        candidateId={focusedCandidate.id} 
                                        layout="focused" 
                                        viewMode={viewMode}
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-500 text-[10px] font-black uppercase rounded-lg shadow-lg">
                                        Focused: {focusedCandidate.name}
                                    </div>
                                    <button 
                                        onClick={() => setFocusedCandidateId(null)}
                                        className="absolute top-4 right-4 w-8 h-8 bg-slate-900/80 backdrop-blur-md rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <video 
                                        ref={videoRef}
                                        autoPlay 
                                        playsInline 
                                        muted
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${proctorCameraEnabled ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    {!proctorCameraEnabled && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500">
                                                <VideoOff size={24} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Camera Offline</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-800">
                                            <div className={`w-1.5 h-1.5 rounded-full ${proctorCameraEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                            <span className="text-[9px] font-black text-white uppercase tracking-tight">Proctor View</span>
                                        </div>
                                        <button 
                                            onClick={toggleProctorCamera}
                                            className={`p-2 rounded-lg backdrop-blur-md border transition-all ${proctorCameraEnabled ? 'bg-rose-500/20 border-rose-500/50 text-rose-500' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'}`}
                                        >
                                            {proctorCameraEnabled ? <VideoOff size={14} /> : <Video size={14} />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chat System */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-tight">Communication</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Channel Active</span>
                                </div>
                            </div>
                            <select 
                                value={selectedCandidateId || focusedCandidateId || 'broadcast'}
                                onChange={(e) => setSelectedCandidateId(e.target.value === 'broadcast' ? null : e.target.value)}
                                className="bg-[#0F172A] border border-slate-800 text-[10px] font-black text-slate-300 px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500 transition-colors uppercase"
                            >
                                <option value="broadcast">Broadcast to All</option>
                                {candidates.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 space-y-4">
                            {messages.filter(m => !m.candidateId || m.candidateId === (selectedCandidateId || focusedCandidateId)).map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'proctor' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{msg.sender}</span>
                                        <span className="text-[9px] font-bold text-slate-600">{msg.timestamp}</span>
                                    </div>
                                    <div className={`max-w-[85%] p-3 text-xs font-medium leading-relaxed ${
                                        msg.sender === 'proctor' 
                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-lg' 
                                            : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-6">
                            <div className="relative group">
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={selectedCandidateId ? `Message ${selectedCandidate?.name}...` : "Broadcast to all candidates..."}
                                    className="w-full bg-[#0F172A] border border-slate-800 text-xs text-white px-5 py-4 rounded-2xl outline-none focus:border-indigo-500/50 transition-all pr-14 placeholder:text-slate-600 group-hover:border-slate-700 shadow-inner"
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </aside>
            </div>

            {/* Overlays */}
            {overlayType && (
                <StatusOverlay 
                    type={overlayType}
                    title={overlayType.replace('_', ' ')}
                    candidates={
                        overlayType === 'active' ? activeCandidates :
                        overlayType === 'offline' ? offlineCandidates :
                        overlayType === 'joined' ? joinedCandidates :
                        yetToJoinCandidates
                    }
                    onClose={() => setOverlayType(null)}
                />
            )}
        </div>
    );
}
