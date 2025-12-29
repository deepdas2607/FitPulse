import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();

  const handleLogout = async () => {
    try {
      const { signOut } = await import('../firebase/auth');
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { to: '/dashboard/health', icon: Heart, label: 'Health Overview' },
    { to: '/dashboard/fitness', icon: Activity, label: 'Fitness Tracker' },
    { to: '/dashboard/settings', icon: Settings, label: 'Profile Settings' },
  ];

  const getInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 ${className}`}>
      <div className="p-6 flex items-center gap-2 border-b border-slate-100">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
          F
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          FitPulse
        </span>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {userProfile?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          item.disabled ? (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 text-slate-400 cursor-not-allowed opacity-60">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;