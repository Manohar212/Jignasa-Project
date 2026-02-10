import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Mic, Video, Users, AlertTriangle, Smile, Frown, Meh, VideoOff, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StudentStream {
    id: number;
    name: string;
    emotion: 'Focused' | 'Confused' | 'Bored' | 'Distracted';
    isActive: boolean;
}

const LiveLecture: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Real-time Analytics State
  const [moodData, setMoodData] = useState([
    { name: 'Focused', value: 55, color: '#74B783' },
    { name: 'Confused', value: 15, color: '#88AED0' },
    { name: 'Bored', value: 20, color: '#C0C0C0' },
    { name: 'Distracted', value: 10, color: '#E8A89A' },
  ]);
  const [engagementLevel, setEngagementLevel] = useState(75);
  
  // Alert State
  const [hasAlert, setHasAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'WARNING'>('WARNING');
  const [alertTitle, setAlertTitle] = useState<string | null>(null);
  const [alertDetails, setAlertDetails] = useState<string | null>(null);
  const [alertRecommendation, setAlertRecommendation] = useState<string | null>(null);

  // Mock Student Streams
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

  // Real-time Data Polling (Simulated)
  useEffect(() => {
    let pollingInterval: any;

    const updateAnalytics = () => {
        // Simulate data fluctuations
        const rand = Math.random();
        let confused = 15;
        let distracted = 10;
        let focused = 60;
        let bored = 15;

        // Create engagement events for demo
        if (rand > 0.7) {
            // Critical Event
            confused = 35;
            focused = 40;
            bored = 15;
            distracted = 10;
        } else if (rand > 0.4) {
            // Warning Event
            confused = 25;
            focused = 50;
            bored = 15;
            distracted = 10;
        }

        // Update Mood Data
        setMoodData([
            { name: 'Focused', value: focused, color: '#74B783' },
            { name: 'Confused', value: confused, color: '#88AED0' },
            { name: 'Bored', value: bored, color: '#C0C0C0' },
            { name: 'Distracted', value: distracted, color: '#E8A89A' },
        ]);

        // Calculate Engagement Score
        const score = focused + (confused * 0.5) + (bored * 0.2);
        setEngagementLevel(Math.round(score));

        // --- Alert Logic ---
        if (confused > 30) {
            setHasAlert(true);
            setAlertSeverity('CRITICAL');
            setAlertTitle("Critical Attention Drop Detected");
            setAlertDetails(`${confused}% of students are showing confusion in the last 2 minutes`);
            setAlertRecommendation("Recommended: Pause and Review Concept");
        } else if (confused > 20 || distracted > 15) {
            setHasAlert(true);
            setAlertSeverity('WARNING');
            setAlertTitle("Engagement Warning");
            setAlertDetails("Subtle drop in attention detected across the classroom.");
            setAlertRecommendation("Recommended: Ask a question to re-engage.");
        } else {
            setHasAlert(false);
            setAlertTitle(null);
            setAlertDetails(null);
            setAlertRecommendation(null);
        }

        // Randomize Student Thumbnails
        setStudentStreams(prev => prev.map(s => ({
            ...s,
            emotion: Math.random() > 0.6 ? ['Focused', 'Confused', 'Bored', 'Distracted'][Math.floor(Math.random()*4)] as any : s.emotion
        })));
    };

    if (isActive) {
        pollingInterval = setInterval(updateAnalytics, 3000);
        updateAnalytics(); // Initial
    }

    return () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isActive]);

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
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${getEmotionColor(student.emotion)}`}>
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
            <div className={`mb-auto p-4 rounded-xl border border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${alertSeverity === 'CRITICAL' ? 'bg-red-50/50 border-red-100 border-l-red-500' : 'bg-orange-50/50 border-orange-100 border-l-orange-500'}`}>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${alertSeverity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm mb-1 ${alertSeverity === 'CRITICAL' ? 'text-red-800' : 'text-orange-800'}`}>
                            {alertTitle}
                        </h4>
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                            {alertDetails}
                        </p>
                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${alertSeverity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
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