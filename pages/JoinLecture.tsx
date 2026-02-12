import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, ArrowRight, VideoOff, Camera, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const JoinLecture: React.FC = () => {
  const [emotionDetection, setEmotionDetection] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { id } = useParams(); // Get lecture ID from URL

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  // Frame Capture Logic for Emotion Detection
  useEffect(() => {
    if (isCameraActive && emotionDetection && isConnected) {
        // Capture frame every 5 seconds (Requirement)
        intervalRef.current = window.setInterval(captureAndSendFrame, 5000); 
    } else {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCameraActive, emotionDetection, isConnected]);

  const startSession = async () => {
    setPermissionError(null);
    setConnectionError(null);
    
    try {
        // 1. Get Camera Stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
        
        setIsCameraActive(true);

        // 2. Connect to WebSocket / Signaling Server
        connectToSignalingServer();

    } catch (err: any) {
        console.error("Error accessing camera:", err);
        let errorMessage = "An unknown error occurred while accessing media devices.";

        // Handle specific error types for better UX
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = "Access denied. Please allow camera and microphone permissions in your browser settings.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = "No camera or microphone found. Please check your device connections.";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = "Camera or microphone is already in use by another application.";
        } else if (err.name === 'OverconstrainedError') {
            errorMessage = "The requested device constraints could not be satisfied.";
        } else if (err.name === 'TypeError') {
            errorMessage = "Secure connection required (HTTPS) to access media devices.";
        }

        setPermissionError(errorMessage);
        setIsCameraActive(false);
    }
  };

  const connectToSignalingServer = () => {
      // Connect to the Flask-SocketIO backend
      const socket = io('http://localhost:5000', {
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          query: {
              role: 'student',
              lecture_id: id
          }
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
          console.log(`Connected to signaling server for Lecture ${id}`);
          setIsConnected(true);
          setConnectionError(null);
          // Join the specific lecture room
          socket.emit('join', { lecture_id: id, role: 'student' });
      });

      socket.on('disconnect', (reason) => {
          console.log("Disconnected from signaling server:", reason);
          setIsConnected(false);
          if (reason === "io server disconnect") {
              setConnectionError("Disconnected by server. Please refresh.");
          } else {
              setConnectionError("Connection lost. Reconnecting...");
          }
      });

      socket.on('connect_error', (err) => {
          console.error("Socket connection error:", err.message);
          setIsConnected(false);
          setConnectionError("Unable to reach server. Retrying...");
      });

      socket.on('reconnect_failed', () => {
          setConnectionError("Failed to reconnect. Please check your internet connection.");
      });
  };

  const stopSession = () => {
    // Stop Media Stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    // Close WebSocket
    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }

    // Clear Intervals
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    setIsCameraActive(false);
    setIsConnected(false);
  };

  const captureAndSendFrame = async () => {
      if (videoRef.current && canvasRef.current && isCameraActive && isConnected) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          // Ensure dimensions match
          if (video.videoWidth && video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  
                  // Extract frame as Data URL (JPEG for compression)
                  const frameData = canvas.toDataURL('image/jpeg', 0.6);
                  
                  try {
                      // Send to backend API for analysis
                      const response = await fetch('http://localhost:5000/api/emotion/analyze', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                              lectureId: id,
                              studentId: 1, // Hardcoded for demo, normally from auth context
                              timestamp: new Date().toISOString(),
                              image: frameData // Base64 string
                          })
                      });
                      
                      // Handle non-200 responses if needed, but analysis failure shouldn't stop the stream
                      if (!response.ok) {
                          console.warn("Emotion analysis request failed:", response.statusText);
                      }
                  } catch (error) {
                      console.error("Failed to send frame:", error);
                  }
              }
          }
      }
  };

  const handleLeaveSession = () => {
      stopSession();
      navigate('/student/dashboard');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="text-center mb-8">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold mb-4 animate-pulse">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span> LIVE
         </div>
         <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2">Data Structures</h1>
         <p className="text-xl text-[#1B3B6F] font-serif italic">Prof. Alan Smith</p>
         <div className="flex items-center justify-center gap-2 text-gray-500 mt-2 text-sm">
            <ClockIcon /> 9:00 AM – 10:00 AM
         </div>
      </div>

      {/* Camera Panel */}
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 w-full max-w-2xl mb-8 relative">
        <div className="aspect-video bg-[#F0F0F0] rounded-xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
             
             {isCameraActive ? (
                 <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                 />
             ) : (
                 <>
                    {permissionError ? (
                        <div className="text-center p-4 max-w-md">
                            <VideoOff className="w-16 h-16 mb-4 text-red-400 mx-auto" />
                            <p className="font-bold text-red-600 mb-2">Camera Access Error</p>
                            <p className="font-medium text-sm text-gray-600 mb-4">{permissionError}</p>
                            <button onClick={startSession} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">
                                Retry Permission
                            </button>
                        </div>
                    ) : (
                        <>
                            <Video className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-medium">Camera Inactive</p>
                            <p className="text-xs text-gray-400 mt-2">Click 'Join Lecture' to start streaming</p>
                        </>
                    )}
                 </>
             )}
             
             {/* Status Overlay */}
             {isCameraActive && (
                 <>
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                        {/* Connection Status Badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-sm ${isConnected ? 'bg-black/50' : 'bg-red-500/80'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-white'}`}></div>
                            <span className="text-xs font-bold text-white">
                                {isConnected ? 'LIVE' : connectionError ? 'OFFLINE' : 'CONNECTING...'}
                            </span>
                        </div>
                        
                        {/* Error Toast */}
                        {!isConnected && connectionError && (
                            <div className="bg-red-50/90 text-red-700 px-3 py-2 rounded-lg text-xs font-bold shadow-sm max-w-[200px] text-right flex items-center gap-2 border border-red-100 animate-in slide-in-from-top-2">
                                <WifiOff className="w-3 h-3 shrink-0" />
                                {connectionError}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${emotionDetection ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs font-bold text-gray-700">
                            {emotionDetection ? "Emotion Analysis Active" : "Analysis Paused"}
                        </span>
                    </div>
                 </>
             )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-[#1B3B6F] rounded-lg">
                    <FaceIcon />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Emotion Detection</h3>
                    <p className="text-xs text-gray-500 italic">Allow camera-based engagement tracking</p>
                </div>
            </div>
            <button 
                onClick={() => setEmotionDetection(!emotionDetection)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${emotionDetection ? 'bg-[#1B3B6F]' : 'bg-gray-200'}`}
                title="Toggle Emotion Detection"
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${emotionDetection ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-2xl">
         {!isCameraActive ? (
             <button 
                onClick={startSession}
                className="flex-1 py-4 bg-[#2C4C88] text-white rounded-xl font-bold text-lg hover:bg-[#1B3B6F] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 transition-colors"
             >
                <Camera className="w-5 h-5" />
                Join Session
             </button>
         ) : (
             <button 
                className={`flex-1 py-4 text-white rounded-xl font-bold text-lg cursor-default shadow-lg flex items-center justify-center gap-2 transition-colors ${isConnected ? 'bg-green-600' : 'bg-yellow-500'}`}
             >
                {isConnected ? <Wifi className="w-5 h-5 animate-pulse" /> : <AlertCircle className="w-5 h-5" />}
                {isConnected ? 'Streaming...' : 'Reconnecting...'}
             </button>
         )}
         
         <button 
            onClick={handleLeaveSession}
            className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-colors"
         >
            Leave Session
         </button>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 italic max-w-xl text-center">
        By joining, you agree to the classroom's analytical guidelines. Camera frames are processed only for engagement analytics. No images are stored.
      </p>

    </div>
  );
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)

const FaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 13a3 3 0 0 0 6 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
)

export default JoinLecture;