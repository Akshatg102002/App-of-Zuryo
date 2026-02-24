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
    
    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');

    const sendOTPEmail = async (targetEmail: string, code: string) => {
        // In a real app, this would call a backend API to send the email.
        // For this implementation, we'll simulate the security flow.
        console.log(`[SECURITY] OTP for ${targetEmail}: ${code}`);
        // We can use a toast or alert to show the OTP for demo purposes if needed, 
        // but usually it's sent to email.
    };

    const handleSignupInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        
        if (!phone || phone.length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);
        try {
            const isDuplicate = await checkPhoneDuplicate(phone, ""); 
            if (isDuplicate) {
                throw new Error("This mobile number is already registered.");
            }

            // Generate 6-digit OTP
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            
            // Simulate sending email
            await sendOTPEmail(email, code);
            
            setShowOTP(true);
            setSuccessMsg(`A 6-digit verification code has been sent to ${email}`);
        } catch (err: any) {
            setError(err.message || "Failed to initiate signup");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            setError("Invalid verification code. Please check your email.");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email.trim(), password);
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
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await auth.signInWithEmailAndPassword(email.trim(), password);
            onLoginSuccess();
        } catch (err: any) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid email or password.');
            } else {
                setError(err.message || 'Login failed');
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
            // Firebase default reset flow is more reliable without custom settings sometimes
            await auth.sendPasswordResetEmail(email.trim());
            setSuccessMsg('Password reset link sent! Check your email (and spam folder).');
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
            <div className="w-full max-w-md bg-white relative z-10 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-secondary tracking-tight">
                        {showOTP ? 'Verify Email' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {showOTP ? `Enter code sent to ${email}` : (isLogin ? 'Login to your account' : 'Join the Zuryo community')}
                    </p>
                </div>

                {showOTP ? (
                    <form onSubmit={handleVerifyAndSignup} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Verification Code</label>
                            <input 
                                type="text" 
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-center text-2xl tracking-[0.5em] transition-all text-secondary placeholder:text-gray-200"
                                placeholder="000000"
                            />
                        </div>
                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}
                        
                        <button 
                            type="submit" 
                            disabled={loading || otp.length < 6}
                            className="w-full bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign Up'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setShowOTP(false)}
                            className="w-full text-gray-400 text-[10px] font-bold uppercase tracking-widest py-2"
                        >
                            Back to Signup
                        </button>
                    </form>
                ) : (
                    <form onSubmit={isLogin ? handleLogin : handleSignupInitiate} className="space-y-3">
                        {!isLogin && (
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary placeholder:text-gray-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                                        className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary placeholder:text-gray-300"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary placeholder:text-gray-300"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                            <input 
                                type={showPass ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary placeholder:text-gray-300"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-[38px] text-gray-300 hover:text-gray-500"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 mt-2 hover:bg-slate-800 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Continue')} 
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center space-y-4">
                    <p className="text-gray-400 text-xs font-bold">
                        {isLogin ? "NEW TO ZURYO?" : "ALREADY HAVE AN ACCOUNT?"}{" "}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setShowOTP(false); }} 
                            className="text-primary hover:underline ml-1"
                        >
                            {isLogin ? 'SIGN UP' : 'LOG IN'}
                        </button>
                    </p>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">OR</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button 
                        onClick={onTrainerLogin}
                        className="text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        <Briefcase size={14} /> Trainer Portal
                    </button>
                </div>
            </div>
        </div>
    );
};