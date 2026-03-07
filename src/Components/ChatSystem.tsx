import { useState, useRef, useEffect } from 'react';
import { Send, Users, User, MessageCircle } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatSystem() {
    const {
        messages,
        selectedCandidateId,
        candidates,
        sendMessage,
        receiveMessage
    } = useProctorStore();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
    const isBroadcast = selectedCandidateId === null;

    const displayMessages = messages.filter(m => {
        if (isBroadcast) return m.isBroadcast === true;
        return m.isBroadcast === false && m.targetCandidateId === selectedCandidateId;
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            sendMessage(inputText.trim());
            setInputText('');
        }
    };

    const handleSimulateReply = () => {
        if (!isBroadcast && selectedCandidate) {
            receiveMessage(selectedCandidate.id, `Simulated reply from candidate ${selectedCandidate.id}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBroadcast ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {isBroadcast ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800 text-sm leading-tight">
                            {isBroadcast ? 'Global Broadcast' : `${selectedCandidate?.name}`}
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {isBroadcast ? 'Message all participants' : 'Private Message'}
                        </p>
                    </div>
                </div>

                {!isBroadcast && (
                    <button
                        onClick={handleSimulateReply}
                        className="text-[11px] flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded transition-colors font-medium"
                    >
                        <MessageCircle className="w-3 h-3" />
                        Test Reply
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {displayMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                            <MessageCircle className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-xs">No messages yet. Start typing below.</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {displayMessages.map((msg) => {
                        const isMe = msg.sender === 'proctor';
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                layout
                                className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                                <div className={`px-3 py-2 rounded-2xl text-[13px] shadow-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                                    }`}>
                                    {msg.text}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isBroadcast ? "Broadcast to everyone..." : `Message ${selectedCandidate?.name}...`}
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md transition-colors flex items-center justify-center shadow-sm"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
