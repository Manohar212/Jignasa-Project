import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Mic, Video, Users, AlertTriangle, Smile, Frown, Meh, VideoOff, Activity, CheckCircle } from 'lucide-react';
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

  // Mock Student Streams (will be updated via polling)
  const [studentStreams, setStudentStreams] = useState<StudentStream[]>([
      { id: 1, name: "Student 1", emotion: "Focused", isActive: true },
      { id: 2, name: "Student 2", emotion: "Confused", isActive: true },
      { id: 3, name: "Student 3", emotion: "Focused", isActive: true },
      { id: 4, name: "Student 4", emotion: "Bored", isActive: true },
      { id: 5, name: "Student 5", emotion: "Focused", isActive: true },
      { id: 6, name: "Student 6", emotion: "Focused", isActive: true },
      { id: 7, name: "Student 7", emotion: "Distracted", isActive: true },
      { id: 8, name: "Student 8", emotion: "Focused", isActive: true },
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

            // 2. Fetch Student Statuses
            const statusRes = await fetch('/api/emotion/student-status');
            if (statusRes.ok) {
                const students = await statusRes.json();
                setStudentStreams(prev => prev.map(stream => {
                    const update = students.find((s: any) => s.id === stream.id);
                    return update ? { ...stream, emotion: update.emotion } : stream;
                }));
            }

        } catch (error) {
            console.error("Polling error:", error);
        }
    };

    const interval = setInterval(fetchAnalytics, 5000);
    fetchAnalytics(); // Initial call

    return () => clearInterval(interval);
  }, [isActive]);

  // Socket Connection (For joining room / immediate events)
  useEffect(() => {
    const socket = io('http://localhost:5000', {
        transports: ['websocket'],
        query: {
            role: 'faculty',
            lecture_id: '1' // Hardcoded ID for demo
        }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
        console.log("Faculty Connected to Live Session");
        socket.emit('join', { lecture_id: '1', role: 'faculty' });
    });

    // We keep the socket listener, though polling overwrites it periodically.
    // This allows for future immediate events (like "Hand Raise") if implemented.
    socket.on('live_analytics_update', (data: any) => {
        // Optional: Can update state here for immediate feedback between polls
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

  const getEmotionColor = (emotion: string) => {
      switch(emotion) {
          case 'Focused': return 'bg-green-100 text-green-700';
          case 'Confused': return 'bg-blue-100 text-blue-700';
          case 'Bored': return 'bg-gray-100 text-gray-700';
          case 'Distracted': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
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
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#F9F7F2] text-gray-900">
      
      {/* Left: Video Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* Faculty Main Feed */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden relative border border-gray-200 shadow-sm min-h-[300px] flex flex-col">
           {isActive && (
               <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-2 text-white z-10">
                  <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
               </div>
           )}
           <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
               <div className="text-center text-gray-400">
                  <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Faculty Camera Feed</p>
                  {!isActive && <p className="text-sm mt-2 font-bold text-gray-300">Session Paused</p>}
               </div>
               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-sm font-medium border border-white/10 text-white shadow-sm z-10">
                  Prof. Amitabh Sharma (You)
               </div>
           </div>
        </div>

        {/* Student Grid - Scrollable if many students */}
        <div className="h-48 overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-[#F9F7F2] py-1 z-10">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Feeds ({studentStreams.length})</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {studentStreams.map(student => (
                    <div key={student.id} className="bg-white rounded-xl border border-gray-200 relative overflow-hidden shadow-sm aspect-video group">
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            {student.isActive ? (
                                <Users className="w-8 h-8 text-gray-300" />
                            ) : (
                                <VideoOff className="w-8 h-8 text-gray-300" />
                            )}
                        </div>
                        
                        {/* Overlay: Live Emotion Tag */}
                        {student.isActive && isActive && (
                            <div className="absolute top-2 right-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-colors duration-300 ${getEmotionColor(student.emotion)}`}>
                                    {student.emotion}
                                </span>
                            </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2 text-xs font-bold text-gray-600 bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm">
                            {student.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right: Analytics Panel */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 p-6 flex flex-col overflow-y-auto">
        
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Live Analytics</h2>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span>{isActive ? 'Monitoring' : 'Offline'}</span>
            </div>
        </div>

        {/* Session Timer */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center border border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Session Duration</span>
            <div className="text-4xl font-mono font-bold text-[#1B3B6F] tracking-widest">{formatTime(timer)}</div>
        </div>

        {/* Real-time Mood */}
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Classroom Emotion</h3>
            <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={moodData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {moodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">{moodData.find(m => m.name === 'Focused')?.value}%</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {moodData.map(mood => (
                    <div key={mood.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mood.color }}></div>
                        <span className="text-xs text-gray-500">{mood.name} ({mood.value}%)</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Engagement Meter */}
        <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Engagement Level</h3>
                <span className={`text-xl font-bold ${engagementLevel >= 70 ? 'text-green-600' : engagementLevel >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {engagementLevel >= 70 ? 'High' : engagementLevel >= 40 ? 'Moderate' : 'Low'}
                </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${engagementLevel >= 70 ? 'bg-green-500' : engagementLevel >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${engagementLevel}%` }}
                ></div>
            </div>
        </div>

        {/* Engagement Alert Banner */}
        {hasAlert && (
            <div className={`mb-auto p-4 rounded-xl border border-t-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${getAlertStyles()}`}>
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
                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${getAlertBadgeColor()}`}>
                            {alertRecommendation}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            {!isActive ? (
                <button 
                    onClick={() => setIsActive(true)}
                    className="col-span-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Play className="w-4 h-4 fill-current" /> Start Lecture
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => setIsActive(false)}
                        className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Pause className="w-4 h-4 fill-current" /> Pause
                    </button>
                    <button 
                        onClick={() => { setIsActive(false); setTimer(0); }}
                        className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Square className="w-4 h-4 fill-current" /> End
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default LiveLecture;