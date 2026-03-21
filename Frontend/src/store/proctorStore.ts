import { create } from 'zustand';
import axios from 'axios';
import AgoraRTM, { RTMClient } from 'agora-rtm';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../Config/AgoraConfig';

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
    selectedCandidateId: string | null;
    proctorCameraEnabled: boolean;
    messages: ChatMessage[];
    pollingInterval: any | null;
    rtmClient: RTMClient | null;
    rtcClient: IAgoraRTCClient | null;
    localVideoTrack: ILocalVideoTrack | null;
    rtmStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    rtmError: string | null;
    theme: 'blue' | 'black' | 'white';

    setTheme: (theme: 'blue' | 'black' | 'white') => void;
    logout: () => void;
    setLoginData: (name: string, email: string, aId: string) => void;
    login: (assessmentId: string, passkey: string) => Promise<boolean>;
    fetchCandidates: () => Promise<void>;
    fetchCandidateFlags: (email: string) => Promise<CandidateFlag[]>;
    updateCandidateStatus: (candidateId: string, status: Partial<Candidate>) => void;
    setSelectedCandidateId: (id: string | null) => void;
    toggleProctorCamera: () => void;
    sendMessage: (text: string, candidateId?: string) => void;
    startPolling: () => void;
    stopPolling: () => void;
    initRTM: () => Promise<void>;
    logoutRTM: () => Promise<void>;
    initRTC: () => Promise<void>;
    closeRTC: () => Promise<void>;
}

export const useProctorStore = create<ProctorState>((set, get) => ({
    isAuthenticated: false,
    proctorName: '',
    proctorEmail: '',
    assessmentId: '',
    candidates: [],
    selectedCandidateId: null,
    proctorCameraEnabled: false,
    messages: [],
    pollingInterval: null,
    rtmClient: null,
    rtcClient: null,
    localVideoTrack: null,
    rtmStatus: 'disconnected',
    rtmError: null,
    theme: 'blue',

    setTheme: (theme: 'blue' | 'black' | 'white') => set({ theme }),

    logout: () => {
        get().stopPolling();
        get().logoutRTM();
        get().closeRTC();
        set({
            isAuthenticated: false,
            proctorName: '',
            proctorEmail: '',
            assessmentId: '',
            candidates: [],
            messages: []
        });
    },

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
                const existingCandidate = existingCandidates.find(ec => ec.id === c.candidate_id || ec.email === c.email);

                // Fetch flags for each candidate
                const flags = await get().fetchCandidateFlags(c.email);

                // Real-time status logic:
                // isJoined: If they have a status in enrollment that isn't 'mail not sent' or 'invitation sent'
                const isJoined = c.status !== "invitation sent to candidate" && c.status !== "mail not sent";

                return {
                    id: c.candidate_id || c.email,
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

    updateCandidateStatus: (candidateId, status) => {
        set((state) => ({
            candidates: state.candidates.map((c) =>
                c.id === candidateId ? { ...c, ...status } : c
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

    setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
    toggleProctorCamera: () => {
        const current = get().proctorCameraEnabled;
        set({ proctorCameraEnabled: !current });
        if (!current) {
            get().initRTC();
        } else {
            get().closeRTC();
        }
    },

    sendMessage: async (text, candidateId) => {
        const { rtmClient, rtmStatus } = get();
        console.log(`[RTM] Attempting to send message to ${candidateId || 'broadcast'}. Status: ${rtmStatus}`);

        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            sender: 'proctor',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            candidateId
        };

        set((state) => ({ messages: [...state.messages, newMessage] }));

        if (rtmClient && rtmStatus === 'connected') {
            try {
                if (candidateId) {
                    const candidate = get().candidates.find(c => c.id === candidateId);
                    const rawTarget = (candidate?.email || candidateId);
                    const target = rawTarget.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                    console.log(`[RTM] Publishing to user: [${target}] (raw: [${rawTarget}])`);
                    const result = await rtmClient.publish(target, text);
                    console.log(`[RTM] Publish result:`, result);
                } else {
                    const broadcastChannel = get().assessmentId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                    console.log(`[RTM] Publishing to broadcast channel: [${broadcastChannel}]`);
                    const result = await rtmClient.publish(broadcastChannel, text);
                    console.log(`[RTM] Broadcast result:`, result);
                }
            } catch (err) {
                console.error("[RTM] Failed to send RTM message:", err);
            }
        } else {
            console.warn("[RTM] Client not connected, message stored locally only.");
        }
    },

    initRTM: async () => {
        const { proctorEmail, assessmentId, rtmClient, rtmStatus } = get();

        // Guard: Don't initialize if already connected or in the process of connecting
        if (!proctorEmail || !assessmentId || rtmClient || rtmStatus === 'connecting' || rtmStatus === 'connected') {
            console.log(`[RTM] Skipping initRTM. Email: ${!!proctorEmail}, ID: ${!!assessmentId}, Status: ${rtmStatus}, Client: ${!!rtmClient}`);
            return;
        }

        console.log(`[RTM] Starting initialization for ${proctorEmail}...`);
        set({ rtmStatus: 'connecting', rtmError: null });

        try {
            const appId = AGORA_CONFIG.appId;

            // Aggressively clean IDs: Only allow alphanumeric to be 100% safe
            const safeRtmId = (id: string) => id.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

            const loginEmail = safeRtmId(proctorEmail);
            const subAssessmentId = safeRtmId(assessmentId);

            console.log(`[RTM] Raw ProctorEmail: [${proctorEmail}], Cleaned: [${loginEmail}]`);
            console.log(`[RTM] Raw AssessmentId: [${assessmentId}], Cleaned: [${subAssessmentId}]`);

            if (!loginEmail) {
                throw new Error("Proctor email is empty after cleaning");
            }

            const client = new AgoraRTM.RTM(appId, loginEmail);
            console.log("[RTM] Initializing RTM client...");

            const rtmTokenUrl = AGORA_CONFIG.tokenUrl.replace('/token', '/rtm-token');
            const response = await axios.get(rtmTokenUrl, {
                params: { userAccount: loginEmail }
            });
            const { token } = response.data;

            await client.login({ token });
            console.log("[RTM] Login successful");

            await client.subscribe(subAssessmentId);
            console.log("[RTM] Subscribed to assessment channel:", subAssessmentId);

            client.addEventListener('message', (event: any) => {
                const publisher = event.publisher;
                // Avoid adding our own echoed messages (RTM v2 echoes channel messages)
                if (publisher.toLowerCase() === loginEmail.toLowerCase()) {
                    return;
                }

                console.log("[RTM] Received message event:", {
                    channelName: event.channelName,
                    channelType: event.channelType,
                    publisher: publisher,
                    message: event.message
                });

                // Try to find the candidate by their email or ID which matches the publisher
                const candidate = get().candidates.find(c =>
                    c.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === publisher.toLowerCase() ||
                    c.id.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === publisher.toLowerCase()
                );

                const candidateId = candidate ? candidate.id : publisher;

                const msg: ChatMessage = {
                    id: Math.random().toString(36).substring(7),
                    sender: 'candidate',
                    text: event.message.toString(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    candidateId: candidateId
                };

                console.log(`[RTM] Adding message from candidate [${candidateId}]:`, msg);
                set((state) => ({ messages: [...state.messages, msg] }));
            });

            client.addEventListener('status', (event: any) => {
                console.log("[RTM] Connection status change:", event);
                if (event.state === 'CONNECTED') {
                    set({ rtmStatus: 'connected', rtmError: null });
                } else if (event.state === 'DISCONNECTED' || event.state === 'FAILED') {
                    set({ rtmStatus: 'error', rtmError: event.reason || 'Connection failed' });
                }
            });

            set({ rtmClient: client, rtmStatus: 'connected', rtmError: null });
        } catch (err: any) {
            console.error("[RTM] Init failed:", err);
            set({ rtmStatus: 'error', rtmError: err.message || String(err) });
        }
    },

    logoutRTM: async () => {
        const { rtmClient, rtmStatus } = get();
        console.log(`[RTM] logoutRTM called. Status: ${rtmStatus}, Client: ${!!rtmClient}`);

        if (rtmClient) {
            try {
                // Set status to disconnected BEFORE logging out to stop incoming messages
                set({ rtmStatus: 'disconnected', rtmClient: null });
                await rtmClient.logout();
                console.log("[RTM] Logout successful");
            } catch (err) {
                console.error("[RTM] Logout failed:", err);
            }
        } else {
            set({ rtmStatus: 'disconnected' });
        }
    },

    initRTC: async () => {
        const { assessmentId, rtcClient } = get();
        if (!assessmentId || rtcClient) return;

        try {
            const channelName = `${assessmentId}_proctor_video`.toLowerCase();
            const uid = 1;

            const response = await axios.get(`${AGORA_CONFIG.tokenUrl}?channelName=${channelName}&uid=${uid}`);
            const { token } = response.data;

            const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await client.join(AGORA_CONFIG.appId, channelName, token, uid);

            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            await client.publish([videoTrack]);

            set({ rtcClient: client, localVideoTrack: videoTrack });
            console.log("Proctor RTC initialized and publishing in channel:", channelName);
        } catch (err) {
            console.error("Proctor RTC Init failed:", err);
            set({ proctorCameraEnabled: false });
        }
    },

    closeRTC: async () => {
        const { rtcClient, localVideoTrack } = get();
        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
        }
        if (rtcClient) {
            await rtcClient.leave();
        }
        set({ rtcClient: null, localVideoTrack: null });
        console.log("Proctor RTC closed");
    }
}));
