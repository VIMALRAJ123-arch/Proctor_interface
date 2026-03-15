import { useProctorStore } from '../store/proctorStore';
import NavBar from '../Components/NavBar';
import CandidateGrid from '../Components/CandidateGrid';

export default function Dashboard() {
    const { isAuthenticated } = useProctorStore();

    // Authenticated by default

    if (!isAuthenticated) return null;

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col font-sans overflow-hidden">
            <NavBar />

            {/* Main Workspace: Left View only */}
            <main className="flex-1 min-h-0 flex flex-col w-full">

                {/* Left Side: Dynamic Workspace */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Scrolling Grid Area */}
                    <div className="flex-1 min-h-0 relative">
                        <CandidateGrid />
                    </div>
                </div>
            </main>
        </div>
    );
}
