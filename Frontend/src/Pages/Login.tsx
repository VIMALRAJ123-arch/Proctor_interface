import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';

export default function Login() {
    const [assessmentId, setAssessmentId] = useState('');
    const [passkey, setPasskey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useProctorStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const success = await login(assessmentId, passkey);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid Assessment ID or Passkey. Please check your credentials and try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans relative">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] flex flex-col items-center"
            >
                {/* Center Logo/Icon */}
                <div className="mb-10 w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden">
                    <img 
                        src="https://pbs.twimg.com/profile_images/1973372506271584256/Sb4wfgD0_400x400.jpg" 
                        alt="Virtusa" 
                        className="w-14 h-14 object-contain"
                    />
                </div>

                {/* Login Card */}
                <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Proctor Login</h1>
                        <p className="text-gray-400 text-[13px] font-medium">Enter your credentials to start monitoring</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                            >
                                <AlertCircle className="text-red-500 shrink-0" size={18} />
                                <p className="text-red-600 text-xs font-bold leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Assessment ID</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    value={assessmentId}
                                    onChange={(e) => setAssessmentId(e.target.value)}
                                    placeholder="Enter Assessment ID"
                                    className="w-full bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 px-6 text-gray-800 text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value.toUpperCase().trim())}
                                    placeholder="8-character passkey"
                                    className="w-full bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 px-6 text-gray-800 text-sm font-bold outline-none transition-all placeholder:text-gray-300 uppercase"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F172A] hover:bg-black text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? 'Verifying...' : (
                                <>
                                    Launch Assessment
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed">
                            Secure browser environment will be<br/>
                            initialized upon login.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
