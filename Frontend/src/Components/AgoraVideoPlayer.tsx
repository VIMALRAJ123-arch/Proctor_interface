import { useEffect, useState, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../Config/AgoraConfig';
import { Monitor, Smartphone, VideoOff } from 'lucide-react';

interface AgoraVideoPlayerProps {
    assessmentId: string;
    candidateId: string;
    layout: 'grid' | 'focused';
    viewMode?: 'front' | 'side' | 'both';
}

export default function AgoraVideoPlayer({ assessmentId, candidateId, layout, viewMode = 'both' }: AgoraVideoPlayerProps) {
    const [client, setClient] = useState<IAgoraRTCClient | null>(null);
    const [frontTrack, setFrontTrack] = useState<IRemoteVideoTrack | null>(null);
    const [sideTrack, setSideTrack] = useState<IRemoteVideoTrack | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    
    const frontRef = useRef<HTMLDivElement>(null);
    const sideRef = useRef<HTMLDivElement>(null);

    const channelName = `${assessmentId}_${candidateId}`.toLowerCase();

    useEffect(() => {
        let rtcClient: IAgoraRTCClient | null = null;

        const init = async () => {
            rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            setClient(rtcClient);

            rtcClient.on('user-published', async (user, mediaType) => {
                await rtcClient!.subscribe(user, mediaType);
                if (mediaType === 'video') {
                    const remoteVideoTrack = user.videoTrack!;
                    if (user.uid === 1) { // Laptop/Front
                        setFrontTrack(remoteVideoTrack);
                    } else if (user.uid === 2) { // Mobile/Side
                        setSideTrack(remoteVideoTrack);
                    }
                }
            });

            rtcClient.on('user-unpublished', (user) => {
                if (user.uid === 1) setFrontTrack(null);
                if (user.uid === 2) setSideTrack(null);
            });

            try {
                // Fetch token
                const response = await fetch(`${AGORA_CONFIG.tokenUrl}?channelName=${channelName}`);
                const data = await response.json();
                const token = data.token;

                await rtcClient.join(AGORA_CONFIG.appId, channelName, token, null);
                setIsJoined(true);
                console.log(`Joined Agora channel: ${channelName} with client ID: ${rtcClient.uid}`);
            } catch (error) {
                console.error('Error joining Agora channel:', error);
            }
        };

        init();

        return () => {
            if (rtcClient) {
                rtcClient.leave();
                rtcClient.removeAllListeners();
            }
        };
    }, [channelName]);

    const isLoading = !isJoined || !client;

    useEffect(() => {
        if (frontTrack && frontRef.current) {
            frontTrack.play(frontRef.current);
        }
    }, [frontTrack]);

    useEffect(() => {
        if (sideTrack && sideRef.current) {
            sideTrack.play(sideRef.current);
        }
    }, [sideTrack]);

    const renderPlaceholder = (type: 'Front' | 'Side') => (
        <div className="flex flex-col items-center gap-2 opacity-20">
            {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Joining...</span>
                </div>
            ) : (
                <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 animate-pulse">
                        <VideoOff size={20} className="text-slate-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{type} Offline</span>
                </>
            )}
        </div>
    );

    if (layout === 'focused') {
        const showFront = viewMode === 'front' || viewMode === 'both';
        const showSide = viewMode === 'side' || viewMode === 'both';

        return (
            <div className={`flex-1 grid ${showFront && showSide ? 'grid-cols-2' : 'grid-cols-1'} gap-6 min-h-0`}>
                {showFront && (
                    <div className="aspect-video bg-[#1E293B] rounded-[2rem] border border-slate-800/50 relative overflow-hidden flex items-center justify-center shadow-inner">
                        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                            <Monitor size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Front Camera</span>
                        </div>
                        <div ref={frontRef} className="w-full h-full" />
                        {!frontTrack && renderPlaceholder('Front')}
                    </div>
                )}
                {showSide && (
                    <div className="aspect-video bg-[#1E293B] rounded-[2rem] border border-slate-800/50 relative overflow-hidden flex items-center justify-center shadow-inner">
                        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                            <Smartphone size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Side Camera</span>
                        </div>
                        <div ref={sideRef} className="w-full h-full" />
                        {!sideTrack && renderPlaceholder('Side')}
                    </div>
                )}
            </div>
        );
    }

    const showFront = viewMode === 'front' || viewMode === 'both';
    const showSide = viewMode === 'side' || viewMode === 'both';

    return (
        <div className="flex gap-px bg-slate-800/30 aspect-video relative">
            {showFront && (
                <div className="flex-1 bg-slate-900/50 relative flex items-center justify-center group-hover:bg-slate-900 transition-colors overflow-hidden">
                    <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-[#0F172A]/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800/50">
                        <Monitor size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Front</span>
                    </div>
                    <div ref={frontRef} className="w-full h-full" />
                    {!frontTrack && renderPlaceholder('Front')}
                </div>
            )}
            {showSide && (
                <div className="flex-1 bg-slate-900/50 relative flex items-center justify-center border-l border-slate-800/30 group-hover:bg-slate-900 transition-colors overflow-hidden">
                    <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-[#0F172A]/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800/50">
                        <Smartphone size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Side</span>
                    </div>
                    <div ref={sideRef} className="w-full h-full" />
                    {!sideTrack && renderPlaceholder('Side')}
                </div>
            )}
        </div>
    );
}
