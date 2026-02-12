import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Video, AlertTriangle, Activity, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { io, Socket } from 'socket.io-client';

interface StudentStream {
    id: number;
    name: string;
    emotion: 'Focused' | 'Confused' | 'Bored' | 'Distracted';
    isActive: boolean;
}

const LiveLecture: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Real-time Analytics State
  const [moodData, setMoodData] = useState([
    { name: 'Focused', value: 55, color: '#74B783' },
    { name: 'Confused', value: 15, color: '#88AED0' },
    { name: 'Bored', value: 20, color: '#C0C0C0' },
    { name: 'Distracted', value: 10, color: '#E8A89A' },
  ]);
  const [engagementLevel, setEngagementLevel] = useState(75);
  
  // Alert State
  const [hasAlert, setHasAlert] = useState(true);
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'WARNING' | 'SUCCESS'>('CRITICAL');
  const [alertTitle, setAlertTitle] = useState<string | null>("Critical Attention Drop");
  const [alertDetails, setAlertDetails] = useState<string | null>("15% of students are showing signs of confusion in the last 2 minutes.");
  const [alertRecommendation, setAlertRecommendation] = useState<string | null>("Recommended: Pause and Review Concept.");

  // Data logic kept for analytics consistency, but UI removed
  const [studentStreams, setStudentStreams] = useState<StudentStream[]>([
      { id: 1, name: "Student 1", emotion: "Focused", isActive: true },
      { id: 2, name: "Student 2", emotion: "Confused", isActive: true },
  ]);

  // Session Timer
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Polling for Real-Time Analytics & Alert Logic (Every 5 seconds)
  useEffect(() => {
    if (!isActive) return;

    const fetchAnalytics = async () => {
        try {
            // 1. Fetch Live Summary
            const summaryRes = await fetch('/api/emotion/live-summary');
            if (summaryRes.ok) {
                const data = await summaryRes.json();
                
                // Update Mood Distribution
                setMoodData([
                    { name: 'Focused', value: data.distribution.focused, color: '#74B783' },
                    { name: 'Confused', value: data.distribution.confused, color: '#88AED0' },
                    { name: 'Bored', value: data.distribution.bored, color: '#C0C0C0' },
                    { name: 'Distracted', value: data.distribution.distracted, color: '#E8A89A' },
                ]);

                setEngagementLevel(data.engagementScore);

                // Dynamic Alert Logic
                const { confused, bored, focused } = data.distribution;

                if (confused > 25) {
                    setHasAlert(true);
                    setAlertSeverity('CRITICAL');
                    setAlertTitle("Critical Attention Drop");
                    setAlertDetails(`${confused}% of students are showing signs of confusion.`);
                    setAlertRecommendation("Recommended: Pause and Review Concept.");
                } else if (bored > 30) {
                    setHasAlert(true);
                    setAlertSeverity('WARNING');
                    setAlertTitle("Low Engagement Alert");
                    setAlertDetails("Students appear to be losing interest.");
                    setAlertRecommendation("Recommended: Ask a question or change pace.");
                } else if (focused > 65) {
                    setHasAlert(true);
                    setAlertSeverity('SUCCESS');
                    setAlertTitle("High Engagement");
                    setAlertDetails("Classroom focus is excellent right now.");
                    setAlertRecommendation("Great job! Keep the momentum going.");
                } else {
                    setHasAlert(false);
                }
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    };

    const interval = setInterval(fetchAnalytics, 5000);
    fetchAnalytics(); // Initial call

    return () => clearInterval(interval);
  }, [isActive]);

  // Socket Connection
  useEffect(() => {
    const socket = io('http://localhost:5000', {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        query: {
            role: 'faculty',
            lecture_id: '1' // Hardcoded ID for demo
        }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
        console.log("Faculty Connected to Live Session");
        setIsConnected(true);
        socket.emit('join', { lecture_id: '1', role: 'faculty' });
    });

    socket.on('disconnect', () => {
        console.log("Faculty Disconnected");
        setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
        console.log("Connection Error:", err.message);
        setIsConnected(false);
    });

    socket.on('student_joined', (student: any) => {
        setStudentStreams(prev => {
            if (prev.find(s => s.id === student.id)) return prev;
            return [...prev, { ...student, isActive: true }];
        });
    });

    return () => {
        socket.disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertStyles = () => {
      switch(alertSeverity) {
          case 'CRITICAL':
              return 'bg-red-50/50 border-red-100 border-t-red-500';
          case 'WARNING':
              return 'bg-orange-50/50 border-orange-100 border-t-orange-500';
          case 'SUCCESS':
              return 'bg-green-50/50 border-green-100 border-t-green-500';
          default:
              return 'bg-gray-50 border-gray-200';
      }
  };

  const getAlertIcon = () => {
      switch(alertSeverity) {
          case 'CRITICAL':
              return <AlertTriangle className="w-5 h-5" />;
          case 'WARNING':
              return <Activity className="w-5 h-5" />;
          case 'SUCCESS':
              return <CheckCircle className="w-5 h-5" />;
      }
  };

  const getAlertTextColor = () => {
    switch(alertSeverity) {
        case 'CRITICAL': return 'text-red-800';
        case 'WARNING': return 'text-orange-800';
        case 'SUCCESS': return 'text-green-800';
    }
  };

  const getAlertBadgeColor = () => {
    switch(alertSeverity) {
        case 'CRITICAL': return 'bg-red-100 text-red-700';
        case 'WARNING': return 'bg-orange-100 text-orange-700';
        case 'SUCCESS': return 'bg-green-100 text-green-700';
    }
  };

  const getAlertIconBg = () => {
    switch(alertSeverity) {
        case 'CRITICAL': return 'bg-red-100 text-red-600';
        case 'WARNING': return 'bg-orange-100 text-orange-600';
        case 'SUCCESS': return 'bg-green-100 text-green-600';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F9F7F2] text-gray-900 overflow-hidden">
      
      {/* Left: Video Area - Maximized */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden relative">
        <div className="flex-1 bg-gray-900 rounded-2xl relative shadow-lg border border-gray-800 overflow-hidden flex flex-col items-center justify-center group">
           
           {/* Live Status Badge */}
           <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
               {isActive ? (
                   <div className="bg-red-600 px-3 py-1 rounded-md text-xs font-bold animate-pulse flex items-center gap-2 text-white shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                   </div>
               ) : (
                   <div className="bg-gray-700/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-white shadow-lg border border-white/10">
                      PAUSED
                   </div>
               )}
               
               {/* Connection Status */}
               <div className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-2 text-white shadow-lg border border-white/10 ${isConnected ? 'bg-green-600/80' : 'bg-red-500/80'}`}>
                   {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                   {isConnected ? 'Signal Strong' : 'Reconnecting...'}
               </div>
           </div>

           {/* Timer Badge */}
           <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-lg font-mono font-bold text-white border border-white/10 shadow-lg z-10">
               {formatTime(timer)}
           </div>

           {/* Main Feed Content */}
           <div className="relative text-center z-0 transform transition-transform duration-500 hover:scale-[1.01]">
               <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-gray-700/50">
                    <Video className="w-12 h-12 text-gray-500" />
               </div>
               <h2 className="text-2xl font-serif font-bold text-white mb-2">Faculty Camera Feed</h2>
               {!isActive && <p className="text-gray-400 font-medium">Session is currently paused. Press start to begin.</p>}
               {isActive && <p className="text-green-400 font-medium animate-pulse">Broadcasting to {studentStreams.length} students...</p>}
           </div>

           {/* Bottom Bar overlay */}
           <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white shadow-lg">
                    <p className="text-sm font-bold">Prof. Amitabh Sharma</p>
                    <p className="text-xs text-gray-300">Data Structures & Algorithms</p>
                </div>
           </div>
        </div>
      </div>

      {/* Right: Analytics Panel - Fixed Width */}
      <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col shrink-0 h-full overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900 font-serif mb-1">Live Analytics</h2>
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3 h-3" /> Real-time Monitoring
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
                {!isActive ? (
                    <button 
                        onClick={() => setIsActive(true)}
                        className="col-span-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Play className="w-5 h-5 fill-current" /> START SESSION
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsActive(false)}
                            className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Pause className="w-5 h-5 fill-current" /> PAUSE
                        </button>
                        <button 
                            onClick={() => { setIsActive(false); setTimer(0); }}
                            className="py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Square className="w-5 h-5 fill-current" /> END
                        </button>
                    </>
                )}
            </div>

            {/* Engagement Meter */}
            <div>
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Engagement Score</h3>
                    <span className={`text-2xl font-bold font-serif ${engagementLevel >= 70 ? 'text-green-600' : engagementLevel >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {engagementLevel}/100
                    </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className={`h-full transition-all duration-700 ease-out ${engagementLevel >= 70 ? 'bg-green-500' : engagementLevel >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${engagementLevel}%` }}
                    ></div>
                </div>
            </div>

            {/* Real-time Mood */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Emotional Distribution</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={moodData}
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {moodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-900 font-serif">{moodData.find(m => m.name === 'Focused')?.value}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Focused</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {moodData.map(mood => (
                            <div key={mood.name} className="flex items-center gap-2 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: mood.color }}></div>
                                <span className="font-medium text-gray-700">{mood.name}</span>
                                <span className="text-gray-400 ml-auto">{mood.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Engagement Alert Banner */}
            {hasAlert && (
                <div className={`p-5 rounded-xl border border-t-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${getAlertStyles()}`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0 ${getAlertIconBg()}`}>
                            {getAlertIcon()}
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm mb-1 ${getAlertTextColor()}`}>
                                {alertTitle}
                            </h4>
                            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                                {alertDetails}
                            </p>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded inline-block uppercase tracking-wide ${getAlertBadgeColor()}`}>
                                {alertRecommendation}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LiveLecture;