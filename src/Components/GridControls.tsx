import { LayoutGrid, Monitor, Smartphone, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';

export default function GridControls() {
    const {
        viewMode, setViewMode,
        candidates,
        currentPage, setCurrentPage,
        setFocusedCandidate
    } = useProctorStore();

    const maxCandidatesPerPage = 4;
    const totalPages = Math.ceil(candidates.length / maxCandidatesPerPage);

    return (
        <div className="h-14 shrink-0 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 w-full">

            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                    onClick={() => setViewMode('front')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${viewMode === 'front' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    <Monitor className="w-4 h-4" />
                    Front
                </button>
                <button
                    onClick={() => setViewMode('side')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${viewMode === 'side' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    <Smartphone className="w-4 h-4" />
                    Side
                </button>
                <button
                    onClick={() => setViewMode('both')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${viewMode === 'both' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    Both
                </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[13px] font-medium text-slate-600 min-w-[60px] text-center">
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200" />

                {/* Focus Candidate Dropdown */}
                <div className="relative flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    <select
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setFocusedCandidate(null);
                            else setFocusedCandidate(val);
                        }}
                        className="text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none outline-none"
                    >
                        <option value="">Select Candidate to Focus...</option>
                        {candidates.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.id})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
