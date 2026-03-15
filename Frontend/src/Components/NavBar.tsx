import { Video } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';

const NavBar = () => {
    const { isAuthenticated, proctorName, logout } = useProctorStore();

    return (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 sticky top-0 z-50">
            <div className="flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            Virtusa <span className="text-slate-400 font-normal">| Proctor Portal</span>
                        </h1>
                    </div>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center gap-4">


                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{proctorName}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Lead Proctor</p>
                            </div>
                            <button
                                onClick={logout}
                                className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-700 font-medium ml-2 shadow-sm"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavBar;
