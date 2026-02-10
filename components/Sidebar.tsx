import React from 'react';
import { LayoutDashboard, Users, BarChart2, User, BookOpen, Video, LogOut } from 'lucide-react';
import { UserRole } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'Groups', icon: Users, path: '/student/groups' },
    { name: 'Statistics', icon: BarChart2, path: '/student/statistics' },
  ];

  const facultyLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
    { name: 'Groups', icon: Users, path: '/faculty/groups' },
    { name: 'Schedule Lecture', icon: BookOpen, path: '/faculty/schedule' },
    { name: 'Student Analytics', icon: BarChart2, path: '/faculty/analytics' },
    { name: 'Live Monitor', icon: Video, path: '/faculty/live' }, // Added for easy access
  ];

  const links = role === UserRole.STUDENT ? studentLinks : facultyLinks;

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-[#F9F7F2] border-r border-gray-200 flex flex-col z-10">
      <div className="p-6 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#1B3B6F]" />
        <h1 className="text-2xl font-bold font-serif text-[#1B3B6F]">Jignasa</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive(link.path)
                ? 'bg-[#E5E7EB] text-[#1B3B6F] font-medium'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;