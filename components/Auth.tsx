
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { saveUserProfile, checkPhoneDuplicate } from '../services/db';
import { Eye, EyeOff, ArrowRight, Briefcase, LockKeyhole } from 'lucide-react';

interface AuthProps {
    onLoginSuccess: () => void;
    onTrainerLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onTrainerLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only for signup
    const [phone, setPhone] = useState(''); // Only for signup
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                await auth.signInWithEmailAndPassword(email.trim(), password);
            } else {
                // Validation for Signup
                if (!phone || phone.length < 10) {
                    throw new Error("Please enter a valid 10-digit mobile number.");
                }

                // Check for duplicate phone
                const isDuplicate = await checkPhoneDuplicate(phone, ""); 
                if (isDuplicate) {
                    throw new Error("This mobile number is already registered.");
                }

                const userCredential = await auth.createUserWithEmailAndPassword(email.trim(), password);
                // Create initial profile in Firestore
                if (userCredential.user) {
                    await saveUserProfile({
                        uid: userCredential.user.uid,
                        email: email.trim(),
                        name: name,
                        phoneNumber: phone,
                        onboardingComplete: false,
                        age: '', gender: '', weight: '', height: '', goal: '', activityLevel: '', injuries: '',
                        createdAt: new Date().toISOString()
                    });
                }
            }
            onLoginSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already exists. Please login.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        try {
            setLoading(true);
            const actionCodeSettings = {
                // Redirect to our custom reset page
                url: window.location.origin + '/reset-password', 
                handleCodeInApp: false // Standard flow: click email -> firebase handler -> redirect to url
            };
            await auth.sendPasswordResetEmail(email.trim(), actionCodeSettings);
            setSuccessMsg('If an account exists, a reset link has been sent. Check spam folder.');
            setError('');
        } catch (err: any) {
            console.error("Reset Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -ml-16 -mb-16"></div>

            <div className="w-full max-w-md bg-white relative z-10 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-10">
                    <img src="https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp" className="w-32 h-auto object-contain mx-auto mb-4" alt="Zuryo" />
                    <h1 className="text-3xl font-extrabold text-secondary">{isLogin ? 'Welcome Back' : 'Join Zuryo'}</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        {isLogin ? 'Login to continue your fitness journey' : 'Start your fitness revolution today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="John Doe"
                            />
                        </div>
                    )}
                    
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                            <input 
                                type="tel" 
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="9876543210"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold transition-all text-gray-900 placeholder:text-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input 
                            type={showPass ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold transition-all text-gray-900 placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-9 text-gray-400 hover:text-gray-600"
                        >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {isLogin && (
                        <div className="flex justify-end">
                            <button 
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs font-bold text-primary hover:text-primaryDark flex items-center gap-1"
                            >
                                <LockKeyhole size={12} /> Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                         <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-lg text-center">
                            {successMsg}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 mt-4 hover:bg-slate-800 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')} 
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account? "}{" "}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button 
                        onClick={onTrainerLogin}
                        className="text-blue-600 text-sm font-bold flex items-center justify-center gap-2 w-full py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Briefcase size={16} /> Trainer Login
                    </button>
                </div>
            </div>
        </div>
    );
};
