import { create } from 'zustand';

export interface Candidate {
    id: string;
    name: string;
    avatarColor: string;
}

export interface ChatMessage {
    id: string;
    sender: 'proctor' | string;
    text: string;
    timestamp: Date;
    isBroadcast: boolean;
    targetCandidateId?: string;
}

interface ProctorState {
    isAuthenticated: boolean;
    proctorName: string;
    candidates: Candidate[];
    messages: ChatMessage[];

    login: (name: string) => void;
    logout: () => void;
    sendMessage: (text: string) => void;
}

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500'
];

const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 'C-001',
        name: 'Candidate 1',
        avatarColor: AVATAR_COLORS[0],
    }
];

export const useProctorStore = create<ProctorState>((set) => ({
    isAuthenticated: true,
    proctorName: 'Vimal',
    candidates: MOCK_CANDIDATES,
    messages: [
        {
            id: 'greeting',
            sender: 'proctor',
            text: 'System: Monitoring session initiated. Connection established securely.',
            timestamp: new Date(),
            isBroadcast: true,
        }
    ],

    login: (name) => set({ isAuthenticated: true, proctorName: name }),
    logout: () => set({ isAuthenticated: false, proctorName: '' }),

    sendMessage: (text) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'proctor',
            text,
            timestamp: new Date(),
            isBroadcast: true,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
    },
}));
