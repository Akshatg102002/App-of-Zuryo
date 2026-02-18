
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#142B5D]/95 backdrop-blur-xl border-t border-white/10 shadow-up pb-safe pt-3 px-2 flex justify-around items-center z-40 h-[84px] md:hidden rounded-t-[30px]">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
            <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center space-y-1.5 w-14 transition-all duration-300 ${
                isActive ? 'text-primary translate-y-[-2px]' : 'text-gray-400 hover:text-white'
            }`}
            >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
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
                 <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden backdrop-blur-sm group-hover:scale-105 transition-transform">
                    <img src="https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp" alt="Zuryo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-white tracking-tight leading-none uppercase">ZURYO</span>
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
