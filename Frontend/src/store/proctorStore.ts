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
    proctorEmail: string;
    assessmentId: string;
    candidates: Candidate[];
    messages: ChatMessage[];
    focusedCandidateId: string | null;
    selectedCandidateId: string | null;
    proctorCameraEnabled: boolean;

    login: (assessmentId: string, passkey: string) => Promise<boolean>;
    logout: () => void;
    fetchCandidates: () => Promise<void>;
    sendMessage: (text: string, targetId?: string) => void;
    setFocusedCandidateId: (id: string | null) => void;
    setSelectedCandidateId: (id: string | null) => void;
    toggleProctorCamera: () => void;
}

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500'
];

export const useProctorStore = create<ProctorState>((set, get) => ({
    isAuthenticated: false,
    proctorName: '',
    proctorEmail: '',
    assessmentId: '',
    candidates: [],
    messages: [
        {
            id: 'greeting',
            sender: 'proctor',
            text: 'System: Monitoring session initiated. Connection established securely.',
            timestamp: new Date(),
            isBroadcast: true,
        }
    ],
    focusedCandidateId: null,
    selectedCandidateId: null,
    proctorCameraEnabled: false,

    login: async (assessmentId, passkey) => {
        try {
            const formData = new FormData();
            formData.append('assessment_id', assessmentId);
            formData.append('passkey', passkey);

            const res = await fetch('http://localhost:8000/proctor/login', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                set({ 
                    isAuthenticated: true, 
                    proctorName: data.name,
                    proctorEmail: data.email,
                    assessmentId: assessmentId
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    logout: () => set({ 
        isAuthenticated: false, 
        proctorName: '', 
        proctorEmail: '', 
        assessmentId: '', 
        candidates: [],
        focusedCandidateId: null,
        selectedCandidateId: null,
        proctorCameraEnabled: false
    }),

    fetchCandidates: async () => {
        const { assessmentId, proctorEmail } = get();
        if (!assessmentId || !proctorEmail) return;

        try {
            const res = await fetch(`http://localhost:8000/proctor/assigned-candidates?assessment_id=${assessmentId}&proctor_email=${proctorEmail}`);
            if (res.ok) {
                const data = await res.json();
                // Map backend candidate format to store format
                const mappedCandidates = data.map((c: any, idx: number) => ({
                    id: c.candidate_id || c.email || `C-${idx}`,
                    name: c.name,
                    avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length]
                }));
                set({ candidates: mappedCandidates });
            }
        } catch (error) {
            console.error('Fetch candidates error:', error);
        }
    },

    sendMessage: (text, targetId) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'proctor',
            text,
            timestamp: new Date(),
            isBroadcast: !targetId,
            targetCandidateId: targetId
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
    },

    setFocusedCandidateId: (id) => set({ focusedCandidateId: id, selectedCandidateId: id || get().selectedCandidateId }),
    setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
    toggleProctorCamera: () => set((state) => ({ proctorCameraEnabled: !state.proctorCameraEnabled })),
}));
