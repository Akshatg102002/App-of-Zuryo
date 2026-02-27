import React from 'react';
import { Home, CalendarCheck, UserCircle, Users, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath.startsWith('/trainer-portal')) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/book', label: 'Book', icon: Zap },
    { path: '/trainers', label: 'Trainers', icon: Users },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#142B5D] border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] pb-safe pt-3 px-4 flex justify-around items-end z-50 md:hidden rounded-t-[24px]">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
            <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`group flex flex-col items-center justify-end pb-1 w-16 transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
            >
                <div className={`transition-all duration-300 ${isActive ? 'mb-1 transform scale-110' : 'mb-0'}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 overflow-hidden ${
                    isActive ? 'h-auto opacity-100 translate-y-0' : 'h-0 opacity-0 translate-y-2'
                }`}>
                    {item.label}
                </span>
                
                <div className={`w-1 h-1 rounded-full bg-primary mt-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
            </button>
        );
      })}
    </div>
  );
};

// Desktop Top Navbar variant
export const TopNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    if (currentPath.startsWith('/trainer-portal')) return null;

    const navItems = [
        { path: '/', label: 'HOME', icon: Home },
        { path: '/book', label: 'BOOK NOW', icon: Zap },
        { path: '/trainers', label: 'TRAINERS', icon: Users },
        { path: '/bookings', label: 'MY BOOKINGS', icon: CalendarCheck },
        { path: '/profile', label: 'PROFILE', icon: UserCircle },
    ];

    return (
        <div className="hidden md:flex items-center justify-between w-full h-24 bg-[#142B5D] fixed left-0 top-0 px-10 z-50 shadow-2xl rounded-b-[40px] border-b border-white/5 mx-auto max-w-[1920px]">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                 <div className="w-14 h-14 bg-white border border-white/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,180,53,0.2)] overflow-hidden group-hover:scale-105 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,180,53,0.4)]">
                    <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">ZURYO</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">On Demand Fitness</span>
                </div>
            </div>
            <nav className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl backdrop-blur-sm border border-white/5">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center space-x-2 text-sm font-bold tracking-wide transition-all duration-300 px-5 py-3 rounded-xl ${
                                isActive 
                                ? 'text-secondary bg-primary shadow-lg shadow-primary/20' 
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={18} strokeWidth={2.5} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    )
}