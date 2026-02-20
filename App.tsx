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
import { Footer } from './components/Footer';
import { logoutUser } from './services/db';
import { auth, db } from './services/firebase'; 
import firebase from 'firebase/compat/app';
import { X, Loader2, WifiOff } from 'lucide-react';
import { ToastProvider, useToast } from './components/ToastContext';

// Razorpay global
declare global { interface Window { Razorpay: any; } }

const SplashScreen = () => (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-out fade-out duration-700 delay-2000 fill-mode-forwards pointer-events-none">
        <div className="relative flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute w-48 h-48 border-2 border-primary/10 rounded-full"></div>
            
            {/* Spinning Rings */}
            <div className="absolute w-32 h-32 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute w-32 h-32 border-t-4 border-primary rounded-full animate-[spin_1s_linear_infinite]"></div>
            
            {/* Logo Image */}
            <div className="relative z-10 bg-white rounded-full p-4 shadow-lg">
                <img 
                    src="https://i.ibb.co/4n8Y46LD/Zul-bg.png" 
                    alt="Zuryo" 
                    className="w-24 h-24 object-contain"
                />
            </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
            <div className="h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full animate-[translateX_1s_ease-in-out_infinite]"></div>
            </div>
            <span className="text-secondary font-bold text-[10px] tracking-[0.4em] uppercase">
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
                <img src="https://i.ibb.co/4n8Y46LD/Zul-bg.png" alt="Loading..." className="w-12 h-12 object-contain animate-pulse" />
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
             
             {/* Adjusted top padding for desktop. Removed extra pb-28 on mobile to fix footer whitespace */}
             <main className="flex-1 w-full overflow-y-auto md:pt-28 pb-0 md:pb-0 scroll-smooth relative overscroll-contain">
                {children}
                <Footer />
             </main>

             {showNav && <BottomNav />}
        </div>
    );
};

export const App: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // --- Auth & Init ---
  useEffect(() => {
    // Increased duration to 2800ms to ensure the CSS fade-out animation (2000ms delay + 700ms duration) completes
    const timer = setTimeout(() => setShowSplash(false), 2800);
    
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

  const openAuth = () => setShowAuthModal(true);

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
                <Route path="/book" element={
                    <BookSession 
                        currentUser={currentUser} 
                        userProfile={userProfile} 
                        onLoginReq={openAuth} 
                    />
                } />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/bookings" element={<Bookings onLoginReq={openAuth} />} />
                <Route path="/profile" element={
                    <Profile 
                        currentUser={currentUser}
                        userProfile={userProfile}
                        onLogout={handleLogout} 
                        onLoginReq={openAuth} 
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

        {/* Auth Modal */}
        {showAuthModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
                    <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 z-50 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-secondary hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto">
                        <Auth 
                            onLoginSuccess={() => setShowAuthModal(false)} 
                            onTrainerLogin={() => {
                                setShowAuthModal(false);
                                window.location.href = '/trainer-portal'; 
                            }}
                        />
                    </div>
                </div>
            </div>
        )}
        </BrowserRouter>
    </ToastProvider>
  );
};