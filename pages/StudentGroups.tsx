import React from 'react';
import { Plus, Search, Users, Network, Terminal, Cpu } from 'lucide-react';

const StudentGroups: React.FC = () => {
  const groups = [
    { name: 'Data Structures', prof: 'Prof. Amitabh Sharma', students: 128, icon: Network },
    { name: 'Algorithms', prof: 'Dr. Sarah Jenkins', students: 94, icon: Terminal },
    { name: 'Computer Networks', prof: 'Prof. Rajesh Kumar', students: 110, icon: Users },
    { name: 'OS', prof: 'Dr. Emily Watson', students: 76, icon: Cpu },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Enrolled Classes</h1>
          <p className="text-gray-500 font-serif italic">Manage your academic circles and collaborative spaces.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#2C4C88] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[#1B3B6F] shadow-sm">
          <Plus className="w-5 h-5" />
          Join New Class
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 w-full md:w-96">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search groups..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map((group) => (
          <div key={group.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-[#1B3B6F] rounded-lg flex items-center justify-center mb-4">
              <group.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-1">{group.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{group.prof}</p>
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Users className="w-4 h-4" />
                {group.students} Students
              </div>
              <button className="w-full py-2 bg-[#2C4C88] text-white rounded-lg text-sm font-medium hover:bg-[#1B3B6F]">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1B3B6F]">
                <div className="w-3 h-3 bg-[#1B3B6F] rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-[#1B3B6F] rounded-full relative"></div>
            </div>
            <div>
                <h4 className="font-bold text-gray-900">Looking for study partners?</h4>
                <p className="text-sm text-gray-500 font-serif italic">Check out the 'Public Groups' section to find specialized study circles for your electives.</p>
            </div>
         </div>
         <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
            Explore Groups
         </button>
      </div>
    </div>
  );
};

export default StudentGroups;