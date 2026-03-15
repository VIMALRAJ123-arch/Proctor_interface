import { Monitor } from 'lucide-react';

export default function CandidateGrid() {
    return (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center p-8">
            <div className="w-full max-w-5xl aspect-video bg-[#0f172a] rounded-xl shadow-2xl relative overflow-hidden">
                {/* View Label Overlay */}
                <div className="absolute top-6 left-6 z-20">
                    <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                        <Monitor className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Front Feed</span>
                    </div>
                </div>

                {/* Main Feed area - Styled as an empty dark workspace as seen in screenshot */}
                <div className="w-full h-full bg-[#0f172a] flex items-center justify-center">
                    {/* Placeholder for future video stream */}
                </div>
            </div>
        </div>
    );
}
