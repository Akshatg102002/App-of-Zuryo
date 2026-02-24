import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Booking, UserProfile } from './types';
import { BottomNav, TopNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Trainers } from './pages/Trainers';
import { Bookings } from './pages/Bookings';
import { Profile } from './pages/Profile';
import { BookSession } from './pages/BookSession';
import { About, Contact, Policies, Terms, RefundPolicy, POSHPolicy } from './pages/StaticPages';
import { TrainerPortal } from './pages/TrainerPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResetPassword } from './pages/ResetPassword';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { logoutUser } from './services/db';
import { auth, db } from './services/firebase'; 
import firebase from 'firebase/compat/app';
import { X, Loader2, WifiOff } from 'lucide-react';
import { ToastProvider, useToast } from './components/ToastContext';
import { AuthPage } from './pages/AuthPage';

// Razorpay global
declare global { interface Window { Razorpay: any; } }

const SplashScreen = () => (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 delay-1000 fill-mode-forwards pointer-events-none">
        <div className="relative flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute w-40 h-40 border-2 border-primary/10 rounded-full"></div>
            
            {/* Spinning Rings */}
            <div className="absolute w-28 h-28 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute w-28 h-28 border-t-4 border-primary rounded-full animate-[spin_0.8s_linear_infinite]"></div>
            
            {/* Logo Image */}
            <div className="relative z-10 bg-white rounded-full p-4 shadow-sm">
                <img 
                    src="https://i.ibb.co/JRS0NMMj/ZUL.png" 
                    alt="Zuryo" 
                    className="w-20 h-20 object-contain p-1"
                />
            </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-secondary font-black text-xs tracking-[0.3em] uppercase">
                ZURYO
            </span>
            <span className="text-gray-400 font-bold text-[8px] tracking-[0.2em] uppercase">
                On Demand Fitness
            </span>
        </div>
    </div>
);

// Scroll To Top Component
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// Page Transition Loader
const PageLoader = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 600); // Simulate network/render delay
        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-white/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
                <img src="https://i.ibb.co/JRS0NMMj/ZUL.png" alt="Loading..." className="w-12 h-12 object-contain animate-pulse p-1" />
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        </div>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { showToast } = useToast();
    
    // Hide navbars on specific routes (onboarding, reset-password, admin/working portal)
    const showNav = location.pathname !== '/onboarding' && 
                    location.pathname !== '/reset-password' && 
                    location.pathname !== '/working';

    // Offline Detection
    useEffect(() => {
        const handleOffline = () => showToast("You are currently offline", "error");
        const handleOnline = () => showToast("You are back online!", "success");

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <div className="h-[100dvh] bg-gray-50 flex flex-col font-sans w-full overflow-hidden select-none text-secondary touch-manipulation">
             {showNav && <TopNav />}
             
             {/* Adjusted top padding for desktop. Added pb-24 for mobile to account for compact fixed nav. Added pt-safe for standalone mode. */}
             <main className="flex-1 w-full overflow-y-auto md:pt-28 pb-24 md:pb-0 pt-safe scroll-smooth relative overscroll-contain">
                {children}
             </main>

             {showNav && <BottomNav />}
        </div>
    );
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // --- Auth & Init ---
  useEffect(() => {
    // Faster splash screen: 1500ms total (1000ms delay + 500ms fade)
    const timer = setTimeout(() => setShowSplash(false), 1500);
    
    // Store unsubscribe function for profile listener
    let unsubscribeProfile: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        
        if (user) {
            // Real-time listener: Ensure profile data (address, package) is always fresh
            unsubscribeProfile = db.collection('users').doc(user.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        setUserProfile(doc.data() as UserProfile);
                    }
                }, (error) => {
                    console.error("Profile sync error", error);
                });
        } else {
            setUserProfile(null);
            if(unsubscribeProfile) unsubscribeProfile();
        }
        setAuthChecking(false);
    });

    return () => {
        clearTimeout(timer);
        unsubscribeAuth();
        if(unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleLogout = async () => {
      await logoutUser();
      setUserProfile(null);
  };

  if (authChecking) return null;

  return (
    <ToastProvider>
        <BrowserRouter>
        <ScrollToTop />
        {showSplash && <SplashScreen />}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
        
        <AppLayout>
            <PageLoader />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/book" element={
                    <BookSession 
                        currentUser={currentUser} 
                        userProfile={userProfile} 
                    />
                } />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/profile" element={
                    <Profile 
                        currentUser={currentUser}
                        userProfile={userProfile}
                        onLogout={handleLogout} 
                    />
                } />
                <Route path="/trainer-portal" element={<TrainerPortal />} />
                <Route path="/working" element={<AdminDashboard />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Static Pages */}
                <Route path="/about-us" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy-policy" element={<Policies />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/posh-policy" element={<POSHPolicy />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
        </BrowserRouter>
    </ToastProvider>
  );
};