import { useState } from 'react';
import { useProctorStore } from '../store/proctorStore';
import { Search, ShieldAlert, WifiOff } from 'lucide-react';

export default function CandidateList() {
    const { candidates, selectedCandidateId, selectCandidate } = useProctorStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-card flex flex-col h-full bg-white">
            {/* Header & Search */}
            <div className="p-4 border-b border-gray-100 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 text-sm">Monitored Candidates</h2>
                    <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                        {candidates.length} Total
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search candidate by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Candidate Grid / List */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 gap-2 hide-scrollbar bg-gray-50/30">
                {filteredCandidates.map(candidate => {
                    const isSelected = selectedCandidateId === candidate.id;

                    return (
                        <button
                            key={candidate.id}
                            onClick={() => selectCandidate(candidate.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${isSelected
                                    ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                        } transition-colors`}>
                                        {candidate.name.split(' ')[1] || candidate.name[0]}
                                    </div>
                                    {/* Status Indicator Dot */}
                                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${candidate.status === 'active' ? 'bg-emerald-500' :
                                            candidate.status === 'warning' ? 'bg-amber-500' :
                                                'bg-red-500'
                                        }`} />
                                </div>

                                <div>
                                    <div className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {candidate.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                        <span className="font-mono bg-gray-100 px-1 rounded text-gray-600">{candidate.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Warnings / Status Icons */}
                            <div className="flex items-center gap-2">
                                {candidate.status === 'warning' && (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                        <ShieldAlert className="w-3 h-3" />
                                        <span>{candidate.warnings}</span>
                                    </div>
                                )}
                                {candidate.status === 'disconnected' && (
                                    <div className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                        <WifiOff className="w-3 h-3 mr-1" />
                                        Offline
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}

                {filteredCandidates.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No candidates found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
