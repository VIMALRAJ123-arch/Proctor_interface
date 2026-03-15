import { create } from 'zustand';

export interface Candidate {
    id: string;
    name: string;
    status: 'active' | 'warning' | 'disconnected';
    warnings: number;
    avatarColor: string;
    isSimulatingVideo: boolean;
    hasFrontCam: boolean;
    hasSideCam: boolean;
}

export interface ChatMessage {
    id: string;
    sender: 'proctor' | string;
    text: string;
    timestamp: Date;
    isBroadcast: boolean;
    targetCandidateId?: string;
}

export type ViewMode = 'front' | 'side' | 'both';

interface ProctorState {
    isAuthenticated: boolean;
    proctorName: string;
    cameraEnabled: boolean;
    candidates: Candidate[];
    messages: ChatMessage[];
    selectedCandidateId: string | null;
    viewMode: ViewMode;
    currentPage: number;
    focusedCandidateId: string | null;

    login: (name: string) => void;
    logout: () => void;
    setCameraStatus: (enabled: boolean) => void;
    selectCandidate: (id: string | null) => void;
    setViewMode: (mode: ViewMode) => void;
    setCurrentPage: (page: number) => void;
    setFocusedCandidate: (id: string | null) => void;
    sendMessage: (text: string) => void;
    receiveMessage: (candidateId: string, text: string) => void;
}

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500'
];

const MOCK_CANDIDATES: Candidate[] = Array.from({ length: 20 }, (_, i) => ({
    id: `C-${(i + 1).toString().padStart(3, '0')}`,
    name: `Candidate ${i + 1}`,
    status: i % 7 === 0 ? 'warning' : i % 11 === 0 ? 'disconnected' : 'active',
    warnings: i % 7 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    isSimulatingVideo: i % 11 !== 0,
    hasFrontCam: i % 11 !== 0,
    hasSideCam: i % 11 !== 0 && i % 5 !== 0, // Some disconnected side cams for realism
}));

export const useProctorStore = create<ProctorState>((set, get) => ({
    isAuthenticated: false,
    proctorName: '',
    cameraEnabled: false,
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
    selectedCandidateId: null,
    viewMode: 'front',
    currentPage: 1,
    focusedCandidateId: null,

    login: (name) => set({ isAuthenticated: true, proctorName: name }),
    logout: () => set({ isAuthenticated: false, proctorName: '', selectedCandidateId: null, focusedCandidateId: null }),
    setCameraStatus: (enabled) => set({ cameraEnabled: enabled }),
    selectCandidate: (id) => set({ selectedCandidateId: id }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setFocusedCandidate: (id) => {
        set({ focusedCandidateId: id });
        if (id) {
            set({ selectedCandidateId: id });
        }
    },

    sendMessage: (text) => {
        const { selectedCandidateId } = get();
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'proctor',
            text,
            timestamp: new Date(),
            isBroadcast: selectedCandidateId === null,
            targetCandidateId: selectedCandidateId || undefined,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
    },

    receiveMessage: (candidateId, text) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: candidateId,
            text,
            timestamp: new Date(),
            isBroadcast: false,
            targetCandidateId: candidateId,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
    }
}));
