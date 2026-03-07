import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useProctorStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && password === 'proctor123') {
            login(username);
            navigate('/dashboard');
        } else {
            setError('Invalid credentials. Hint: use password "proctor123"');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Proctor Authentication
                    </h1>
                    <p className="text-sm text-gray-500">
                        Secure access to the candidate monitoring system.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proctor ID</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="Enter your ID..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2"
                        >
                            <span className="shrink-0">⚠️</span>
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm active:scale-[0.98]"
                    >
                        <span>Authenticate</span>
                        <LogIn className="w-5 h-5 ml-1" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
