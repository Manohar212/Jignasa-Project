import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Smile, Frown, Meh, AlertCircle } from 'lucide-react';

const StudentStatistics: React.FC = () => {
  const moodData = [
    { name: 'Focused', value: 60, color: '#74B783' }, // Greenish
    { name: 'Confused', value: 20, color: '#88AED0' }, // Bluish
    { name: 'Bored', value: 10, color: '#C0C0C0' }, // Grey
    { name: 'Distracted', value: 10, color: '#E8A89A' }, // Pinkish
  ];

  const history = [
    { name: 'Data Structures & Algorithms', att: 100, mood: 'Focused', date: 'Oct 14, 2023', color: 'green' },
    { name: 'Introduction to Cloud Computing', att: 92, mood: 'Confused', date: 'Oct 12, 2023', color: 'blue' },
    { name: 'Software Engineering Principles', att: 75, mood: 'Bored', date: 'Oct 10, 2023', color: 'gray' },
    { name: 'Discrete Mathematics', att: 100, mood: 'Focused', date: 'Oct 08, 2023', color: 'green' },
  ];

  const getMoodIcon = (mood: string) => {
    switch(mood) {
        case 'Focused': return <Smile className="w-4 h-4" />;
        case 'Confused': return <AlertCircle className="w-4 h-4" />;
        case 'Bored': return <Meh className="w-4 h-4" />;
        default: return <Frown className="w-4 h-4" />;
    }
  }
  
  const getMoodColor = (mood: string) => {
      switch(mood) {
        case 'Focused': return 'bg-green-100 text-green-700';
        case 'Confused': return 'bg-blue-100 text-blue-700';
        case 'Bored': return 'bg-gray-100 text-gray-700';
        default: return 'bg-red-100 text-red-700';
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Academic Statistics</h1>
        <p className="text-gray-500 font-serif italic">Performance analysis and engagement trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Attendance Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
           <div className="flex items-center gap-2 text-[#1B3B6F] font-bold mb-6">
                <Calendar className="w-5 h-5" />
                <h3>Attendance Percentage</h3>
           </div>
           
           <h2 className="text-8xl font-serif font-bold text-gray-900 mb-4">88%</h2>
           <p className="text-gray-400 font-serif italic mb-8">Overall attendance this semester</p>

           <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
               <div className="bg-green-500 h-full w-[88%] rounded-full"></div>
           </div>
           
           <div className="w-full flex justify-between text-xs font-bold tracking-wider">
              <span className="text-gray-400">MIN REQUIRED: 75%</span>
              <span className="text-green-600">ON TRACK</span>
           </div>
        </div>

        {/* Mood Distribution Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 text-[#1B3B6F] font-bold mb-6">
                <Smile className="w-5 h-5" />
                <h3>Mood Distribution</h3>
             </div>
             <div className="flex flex-col md:flex-row items-center">
                <div className="w-48 h-48 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">General</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={moodData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {moodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 pl-8 space-y-4">
                    {moodData.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-400 italic">{item.value}% of time</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>

      {/* History Table */}
      <div>
         <div className="flex items-center gap-2 text-[#1B3B6F] font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            <h3>Lecture History</h3>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lecture Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance %</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dominant Mood</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {history.map((row) => (
                        <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{row.name}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900 w-8">{row.att}%</span>
                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${row.att >= 90 ? 'bg-green-500' : row.att >= 75 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                                            style={{ width: `${row.att}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getMoodColor(row.mood)}`}>
                                    {getMoodIcon(row.mood)}
                                    {row.mood}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400 font-serif italic text-right">{row.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="w-full py-3 text-sm font-bold text-[#1B3B6F] hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                Load more history <span className="text-lg">↓</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default StudentStatistics;