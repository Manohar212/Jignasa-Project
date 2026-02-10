import React from 'react';
import { Calendar, CheckCircle, Clock, FileText, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Good morning, John.</h1>
        <p className="text-gray-500 font-serif italic">Your academic journey continues. Here is your overview for today.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4 text-[#1B3B6F] font-bold">
          <Calendar className="w-5 h-5" />
          <h3>Upcoming Lecture</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#F0F4F8] rounded-lg text-[#1B3B6F]">
              <span className="text-xs font-bold uppercase">Today</span>
              <span className="text-3xl font-serif font-bold">14</span>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Data Structures</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 9:00 AM – 10:00 AM</span>
                <span className="flex items-center gap-1">Room 402 • Prof. Smith</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
                onClick={() => navigate('/student/lecture/1')}
                className="flex-1 md:flex-none px-6 py-3 bg-[#2C4C88] text-white rounded-lg font-medium hover:bg-[#1B3B6F] transition-colors shadow-md"
            >
              Join Session
            </button>
            <button className="flex-1 md:flex-none px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Materials
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-serif font-bold text-gray-900">92%</span>
                <span className="text-sm text-green-600 font-medium mb-2">↑ +2%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Engagement</h3>
                <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">?</div>
            </div>
            <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-serif font-bold text-gray-900">60%</span>
                <span className="text-sm text-gray-400 font-serif italic mb-2">Focused</span>
            </div>
            <div className="flex gap-1 h-2">
                <div className="bg-blue-100 w-1/5 rounded-l-full"></div>
                <div className="bg-blue-200 w-1/5"></div>
                <div className="bg-blue-300 w-1/5"></div>
                <div className="bg-blue-100 w-1/5"></div>
                <div className="bg-[#2C4C88] w-1/5 rounded-r-full"></div>
            </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4 text-[#1B3B6F] font-bold">
            <Clock className="w-5 h-5" />
            <h3>Recent Activity</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Lab 4: Linked Lists submitted</h4>
                    <p className="text-sm text-gray-500">Successfully uploaded to the portal for Prof. Smith</p>
                </div>
                <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900">New feedback: Algorithm Quiz</h4>
                    <p className="text-sm text-gray-500">Review your results and detailed teacher commentary</p>
                </div>
                <span className="text-xs text-gray-400">Yesterday</span>
            </div>
            <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Joined "Theory Study Group"</h4>
                    <p className="text-sm text-gray-500">3 new members added recently</p>
                </div>
                <span className="text-xs text-gray-400">Oct 12</span>
            </div>
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button className="text-[#1B3B6F] text-sm font-bold hover:underline">View All Activities</button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;