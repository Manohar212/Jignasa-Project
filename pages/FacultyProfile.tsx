import React from 'react';
import { Edit2 } from 'lucide-react';

const FacultyProfile: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center">
        
        {/* Profile Avatar */}
        <div className="w-32 h-32 bg-[#EEF2F6] rounded-full flex items-center justify-center mb-6 text-[#1B3B6F]">
            <span className="text-4xl font-serif font-bold">RC</span>
        </div>

        {/* Header Info */}
        <div className="text-center mb-12">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Dr. Robert Chen</h1>
            <p className="text-gray-500 font-medium text-lg">Senior Faculty</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Computer Science</p>
        </div>

        {/* Details List */}
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Email Address</span>
                <span className="text-gray-900 font-bold">robert.chen@university.edu</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Department</span>
                <span className="text-gray-900 font-bold">Computer Science & Engineering</span>
            </div>

            <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium mt-1">Subjects Handled</span>
                <div className="text-right">
                    <p className="text-gray-900 font-bold">Advanced Algorithms,</p>
                    <p className="text-gray-900 font-bold">Data Structures, ML Fundamentals</p>
                </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Years of Experience</span>
                <span className="text-gray-900 font-bold">12 Years</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Office Hours</span>
                <span className="text-gray-900 font-bold">Mon & Wed, 2:00 PM - 4:00 PM</span>
            </div>
        </div>

        {/* Edit Button */}
        <button className="mt-12 px-8 py-3 bg-[#3B5D95] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-[#2C4C88] transition-colors shadow-lg shadow-blue-900/10">
            <Edit2 className="w-4 h-4" />
            Edit Profile
        </button>

      </div>
    </div>
  );
};

export default FacultyProfile;