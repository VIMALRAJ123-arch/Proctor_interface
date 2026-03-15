import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProctorStore } from '../store/proctorStore';
import NavBar from '../Components/NavBar';
import GridControls from '../Components/GridControls';
import CandidateGrid from '../Components/CandidateGrid';
import FocusView from '../Components/FocusView';
import ProctorCamera from '../Components/ProctorCamera';
import ChatSystem from '../Components/ChatSystem';

export default function Dashboard() {
    const navigate = useNavigate();
    const { isAuthenticated, candidates, focusedCandidateId } = useProctorStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    const activeCandidates = candidates.filter(c => c.status === 'active').length;
    const warningCandidates = candidates.filter(c => c.status === 'warning').length;
    const offlineCandidates = candidates.filter(c => c.status === 'disconnected').length;

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col font-sans overflow-hidden">
            <NavBar />

            {/* Main Workspace: Left View, Right Sidebar */}
            <main className="flex-1 min-h-0 flex flex-col md:flex-row w-full">

                {/* Left Side: Dynamic Workspace */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">

                    {focusedCandidateId ? (
                        <FocusView />
                    ) : (
                        <>
                            {/* Top minimal stats bar (only visible in Grid Mode) */}
                            <div className="h-10 shrink-0 px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-6 justify-between z-10 hidden lg:flex">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Overview</h2>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                                        <span className="text-sm font-bold text-slate-900">{candidates.length}</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-300" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Active</span>
                                        <span className="text-sm font-bold text-emerald-700">{activeCandidates}</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-300" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Alerts</span>
                                        <span className="text-sm font-bold text-amber-700">{warningCandidates}</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-300" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Offline</span>
                                        <span className="text-sm font-bold text-red-600">{offlineCandidates}</span>
                                    </div>
                                </div>
                            </div>

                            {/* View Controls Toolbar */}
                            <GridControls />

                            {/* Scrolling Grid Area */}
                            <div className="flex-1 min-h-0 relative">
                                <CandidateGrid />
                            </div>
                        </>
                    )}
                </div>

                {/* Right Sidebar: Fixed Width (Camera + Chat) */}
                <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 h-full flex flex-col bg-white">
                    <ProctorCamera />
                    <div className="flex-1 min-h-0">
                        <ChatSystem />
                    </div>
                </div>
            </main>
        </div>
    );
}
