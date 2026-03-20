import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface CandidateFlag {
    timestamp: string;
    type: string;
    reason: string;
}

export interface Candidate {
    id: string; // This is email in our context
    name: string;
    reg_no: string;
    email: string;
    college: string;
    department: string;
    isOnline: boolean;
    isJoined: boolean;
    cameraOn: boolean;
    flags: CandidateFlag[];
}

export interface ChatMessage {
    id: string;
    sender: 'proctor' | 'candidate';
    text: string;
    timestamp: string;
    candidateId?: string;
}

interface ProctorState {
    isAuthenticated: boolean;
    proctorName: string;
    proctorEmail: string;
    assessmentId: string;
    candidates: Candidate[];
    focusedCandidateId: string | null;
    selectedCandidateId: string | null;
    proctorCameraEnabled: boolean;
    messages: ChatMessage[];
    pollingInterval: any | null;

    setLoginData: (name: string, email: string, aId: string) => void;
    login: (assessmentId: string, passkey: string) => Promise<boolean>;
    fetchCandidates: () => Promise<void>;
    fetchCandidateFlags: (email: string) => Promise<CandidateFlag[]>;
    updateCandidateStatus: (email: string, status: Partial<Candidate>) => void;
    setFocusedCandidateId: (id: string | null) => void;
    setSelectedCandidateId: (id: string | null) => void;
    toggleProctorCamera: () => void;
    sendMessage: (text: string, candidateId?: string) => void;
    startPolling: () => void;
    stopPolling: () => void;
}

export const useProctorStore = create<ProctorState>((set, get) => ({
    isAuthenticated: false,
    proctorName: '',
    proctorEmail: '',
    assessmentId: '',
    candidates: [],
    focusedCandidateId: null,
    selectedCandidateId: null,
    proctorCameraEnabled: false,
    messages: [],
    pollingInterval: null,

    setLoginData: (name, email, aId) => set({ 
        proctorName: name, 
        proctorEmail: email, 
        assessmentId: aId, 
        isAuthenticated: true 
    }),

    login: async (assessmentId: string, passkey: string) => {
        try {
            const formData = new FormData();
            formData.append('assessment_id', assessmentId);
            formData.append('passkey', passkey);

            const response = await axios.post(`${API_BASE_URL}/proctor/login`, formData);
            if (response.data && response.data.email) {
                get().setLoginData(response.data.name, response.data.email, assessmentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    },

    fetchCandidates: async () => {
        const { assessmentId, proctorEmail, candidates: existingCandidates } = get();
        if (!assessmentId || !proctorEmail) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/proctor/assigned-candidates`, {
                params: { assessment_id: assessmentId, proctor_email: proctorEmail }
            });

            const rawCandidates = response.data;
            const updatedCandidates = await Promise.all(rawCandidates.map(async (c: any) => {
                const existingCandidate = existingCandidates.find(ec => ec.email === c.email);
                
                // Fetch flags for each candidate
                const flags = await get().fetchCandidateFlags(c.email);
                
                // Real-time status logic:
                // isJoined: If they have a status in enrollment that isn't 'mail not sent' or 'invitation sent'
                const isJoined = c.status !== "invitation sent to candidate" && c.status !== "mail not sent";
                
                return {
                    id: c.email,
                    name: c.name,
                    reg_no: c.reg_no || c.candidate_id || "N/A",
                    email: c.email,
                    college: c.college || "N/A",
                    department: c.Department || c.department || "N/A",
                    isJoined: isJoined,
                    // isOnline is combination of Joined + CameraOn for now
                    isOnline: isJoined && (existingCandidate?.cameraOn || false),
                    cameraOn: existingCandidate?.cameraOn || false,
                    flags: flags
                };
            }));

            set({ candidates: updatedCandidates });
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    },

    fetchCandidateFlags: async (email: string) => {
        const { assessmentId } = get();
        try {
            const response = await axios.get(`${API_BASE_URL}/EvidencesLogs/${assessmentId}/${email}/get`);
            return response.data.map((log: any) => ({
                timestamp: log.timestamp || new Date().toLocaleString(),
                type: log.violation_type || "Violation",
                reason: log.details || "Behavioral anomaly detected"
            }));
        } catch (error) {
            console.error(`Error fetching flags for ${email}:`, error);
            return [];
        }
    },

    updateCandidateStatus: (email, status) => {
        set((state) => ({
            candidates: state.candidates.map((c) =>
                c.email === email ? { ...c, ...status } : c
            ),
        }));
    },

    startPolling: () => {
        // Stop any existing polling first
        const currentInterval = get().pollingInterval;
        if (currentInterval) {
            clearInterval(currentInterval);
        }

        // Fetch once immediately
        get().fetchCandidates();

        const interval = setInterval(() => {
            get().fetchCandidates();
        }, 10000); // Poll every 10 seconds for real-time updates

        set({ pollingInterval: interval });
    },

    stopPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) {
            clearInterval(pollingInterval);
            set({ pollingInterval: null });
        }
    },

    setFocusedCandidateId: (id) => set({ focusedCandidateId: id }),
    setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
    toggleProctorCamera: () => set((state) => ({ proctorCameraEnabled: !state.proctorCameraEnabled })),
    
    sendMessage: (text, candidateId) => {
        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            sender: 'proctor',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            candidateId
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
    },
}));
