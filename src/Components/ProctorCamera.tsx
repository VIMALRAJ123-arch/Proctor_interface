import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { useProctorStore } from '../store/proctorStore';

export default function ProctorCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const { cameraEnabled, setCameraStatus } = useProctorStore();

    useEffect(() => {
        let stream: MediaStream | null = null;

        const enableCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
                setCameraStatus(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                setHasPermission(false);
                setCameraStatus(false);
            }
        };

        enableCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [setCameraStatus]);

    return (
        <div className="flex flex-col h-[280px] bg-white relative overflow-hidden shadow-sm border-b border-slate-200">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Proctor Feed</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    {cameraEnabled ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                            <CameraOff className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Offline</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Element */}
            <div className="flex-1 relative bg-slate-900 group">
                {hasPermission !== false ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100 absolute inset-0"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                            <CameraOff className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-xs text-slate-400 max-w-[200px]">
                            Camera blocked or unavailable
                        </p>
                    </div>
                )}

                {/* Info overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-medium">You (Proctor)</p>
                </div>
            </div>
        </div>
    );
}
