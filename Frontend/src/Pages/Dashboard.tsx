import { useEffect, useState, useRef } from 'react';
import { useProctorStore } from '../store/proctorStore';
import NavBar from '../Components/NavBar';
import CandidateGrid from '../Components/CandidateGrid';
import { 
    Monitor,
    Smartphone, 
    LayoutGrid, 
    AlertTriangle, 
    UserX,
    Video,
    VideoOff,
    Send,
    X
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
        setSelectedCandidateId
    } = useProctorStore();

    const [chatInput, setChatInput] = useState('');
    const [viewMode, setViewMode] = useState<'front' | 'side' | 'both'>('both');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    if (!isAuthenticated) return null;

    const focusedCandidate = candidates.find(c => c.id === focusedCandidateId);
    const selectedCandidate = candidates.find(c => c.id === (selectedCandidateId || focusedCandidateId));

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        sendMessage(chatInput, selectedCandidate?.id);
        setChatInput('');
    };

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
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                    <span className="text-sm font-black text-white">{candidates.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Active</span>
                                    <span className="text-sm font-black text-emerald-400">{candidates.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alerts</span>
                                    <span className="text-sm font-black text-amber-500">0</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserX size={12} className="text-rose-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Offline</span>
                                    <span className="text-sm font-black text-rose-500">0</span>
                                </div>
                            </div>
                        </div>

                        {/* View Controls & Pagination */}
                        <div className="flex items-center gap-4">
                            <div className="flex bg-[#0F172A] p-1 rounded-lg border border-slate-800">
                                <button 
                                    onClick={() => setViewMode('front')}
                                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'front' ? 'bg-[#1E293B] text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Monitor size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Front</span>
                                </button>
                                <button 
                                    onClick={() => setViewMode('side')}
                                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'side' ? 'bg-[#1E293B] text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Smartphone size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Side</span>
                                </button>
                                <button 
                                    onClick={() => setViewMode('both')}
                                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'both' ? 'bg-[#1E293B] text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <LayoutGrid size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Both</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Grid / Focused View */}
                    <div className="flex-1 overflow-y-auto bg-[#0F172A] p-6 custom-scrollbar">
                        {focusedCandidateId ? (
                            <div className="h-full flex flex-col animate-in fade-in duration-300">
                                {/* Focused View Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${focusedCandidate?.avatarColor} rounded-xl flex items-center justify-center font-black text-white text-lg`}>
                                            {focusedCandidate?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{focusedCandidate?.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Candidate ID: {focusedCandidate?.id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setFocusedCandidateId(null)}
                                        className="flex items-center gap-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <X size={16} />
                                        Close Focus View
                                    </button>
                                </div>

                                {/* Focused Feeds */}
                                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                                    <div className="aspect-video bg-[#1E293B] rounded-[2rem] border border-slate-800/50 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute top-4 left-6 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                                            <Monitor size={14} className="text-indigo-400" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Front Camera</span>
                                        </div>
                                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 animate-pulse">
                                            <VideoOff size={32} className="text-slate-700" />
                                        </div>
                                    </div>
                                    <div className="aspect-video bg-[#1E293B] rounded-[2rem] border border-slate-800/50 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute top-4 left-6 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                                            <Smartphone size={14} className="text-indigo-400" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Side Camera</span>
                                        </div>
                                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 animate-pulse">
                                            <VideoOff size={32} className="text-slate-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CandidateGrid viewMode={viewMode} />
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-[400px] bg-[#1E293B]/30 flex flex-col overflow-hidden">
                    {/* Proctor Feed Section */}
                    <div className="p-6 border-b border-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Video size={14} className="text-indigo-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-black">Proctor Feed</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase">Live</span>
                            </div>
                        </div>
                        
                        <div className="aspect-video bg-[#0F172A] rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-xl group">
                            {proctorCameraEnabled ? (
                                <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover scale-x-[-1]" // Mirror the proctor's own feed
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-2xl animate-pulse">
                                        <VideoOff size={24} className="text-slate-700" />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Feed Encrypted & Hidden</span>
                                </div>
                            )}
                            
                            {/* Proctor Feed Controls Overlay */}
                            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-[#0F172A]/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white uppercase ml-2 select-none">You (Proctor)</span>
                                    <button 
                                        onClick={toggleProctorCamera}
                                        className={`p-2 rounded-lg transition-all ${proctorCameraEnabled ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                                    >
                                        {proctorCameraEnabled ? <VideoOff size={14} /> : <Video size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col min-h-0 bg-[#0F172A]/20">
                        {/* Chat Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${selectedCandidate?.avatarColor || 'bg-indigo-600'} rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg`}>
                                    {selectedCandidate ? selectedCandidate.name.charAt(0) : 'B'}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-xs font-black text-white tracking-tight leading-none mb-1">
                                        {selectedCandidate ? selectedCandidate.name : 'Global Broadcast'}
                                    </h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                        {selectedCandidate ? 'Private Message' : 'Message all participants'}
                                    </p>
                                </div>
                            </div>
                            {selectedCandidateId && (
                                <button 
                                    onClick={() => setSelectedCandidateId(null)}
                                    className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                                >
                                    <LayoutGrid size={10} />
                                    Global
                                </button>
                            )}
                        </div>

                        {/* Messages List Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0F172A]/10">
                            {messages.filter(m => !selectedCandidateId || m.isBroadcast || m.targetCandidateId === selectedCandidateId).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 filter grayscale">
                                    <Send size={32} className="mb-3" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center">No messages yet.<br/>Start typing below.</p>
                                </div>
                            ) : (
                                messages
                                    .filter(m => !selectedCandidateId || m.isBroadcast || m.targetCandidateId === selectedCandidateId)
                                    .map((msg) => (
                                        <div key={msg.id} className="flex flex-col gap-1.5 max-w-[85%]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{msg.sender}</span>
                                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">18:04</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed border ${
                                                msg.isBroadcast 
                                                    ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                                                    : 'bg-slate-800/80 text-slate-200 border-slate-700/50'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Chat Input Area */}
                        <div className="p-6 bg-[#0F172A]/40 border-t border-slate-800/50 backdrop-blur-xl">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={selectedCandidate ? `Message ${selectedCandidate.name}...` : "Message everyone..."}
                                    className="w-full bg-[#0F172A] border border-slate-700 hover:border-slate-600 focus:border-indigo-500/50 px-5 py-4 pr-14 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-600 shadow-inner"
                                />
                                <button 
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
