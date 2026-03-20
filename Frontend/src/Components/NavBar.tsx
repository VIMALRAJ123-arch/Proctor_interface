import { useProctorStore } from '../store/proctorStore';
import { ShieldCheck, LogOut } from 'lucide-react';

const NavBar = () => {
    const { proctorName, logout } = useProctorStore();

    return (
        <div className="bg-[#0F172A] border-b border-slate-800 px-8 py-3 sticky top-0 z-50 shadow-2xl">
            <div className="flex items-center justify-between">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-slate-700">
                        <img 
                            src="https://pbs.twimg.com/profile_images/1973372506271584256/Sb4wfgD0_400x400.jpg" 
                            alt="Virtusa" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                            Virtusa <span className="text-slate-500 font-bold mx-1">|</span> <span className="text-indigo-400">Proctor Portal</span>
                        </h1>
                    </div>
                </div>

                {/* Right Side Info & Badges */}
                <div className="flex items-center gap-6">
                    {/* Security Badge */}
                    <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Secure Connection</span>
                    </div>

                    {/* Proctor Identity */}
                    <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
                        <div className="text-right">
                            <p className="text-xs font-black text-white tracking-tight uppercase">{proctorName}</p>
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest italic">Lead Proctor</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                            End Session
                            <LogOut size={12} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
