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
    
    // Step State
    const [signupStep, setSignupStep] = useState(1); // 1: Name, 2: Phone, 3: Email, 4: Password
    const [loginStep, setLoginStep] = useState(1); // 1: Email, 2: Password

    const nextStep = () => {
        setError('');
        if (isLogin) {
            if (loginStep === 1 && !email.includes('@')) { setError('Please enter a valid email'); return; }
            if (loginStep === 1) {
                setLoginStep(2);
            } else {
                handleLogin();
            }
            return;
        }

        if (signupStep === 1 && !name) { setError('Please enter your name'); return; }
        if (signupStep === 2 && (!phone || phone.length < 10)) { setError('Please enter a valid 10-digit mobile number'); return; }
        if (signupStep === 3 && !email.includes('@')) { setError('Please enter a valid email'); return; }
        if (signupStep === 4 && password.length < 6) { setError('Password must be at least 6 characters'); return; }
        
        if (signupStep === 4) {
            handleSignup();
        } else {
            setSignupStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setError('');
        if (isLogin) {
            setLoginStep(prev => prev - 1);
        } else {
            setSignupStep(prev => prev - 1);
        }
    };

    const handleSignup = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const cleanPhone = phone.trim();
            const cleanEmail = email.trim().toLowerCase();
            const cleanName = name.trim();

            if (!cleanName) throw new Error("Name is required");
            if (cleanPhone.length < 10) throw new Error("Valid 10-digit phone is required");
            if (!cleanEmail.includes('@')) throw new Error("Valid email is required");
            if (password.length < 6) throw new Error("Password must be at least 6 characters");

            // Check phone duplicate
            const isDuplicate = await checkPhoneDuplicate(cleanPhone, ""); 
            if (isDuplicate) {
                throw new Error("This mobile number is already registered.");
            }

            // Create user directly (No OTP as requested)
            const userCredential = await auth.createUserWithEmailAndPassword(cleanEmail, password);
            if (userCredential.user) {
                await saveUserProfile({
                    uid: userCredential.user.uid,
                    email: cleanEmail,
                    name: cleanName,
                    phoneNumber: cleanPhone,
                    onboardingComplete: false,
                    age: '', gender: '', weight: '', height: '', goal: '', activityLevel: '', injuries: '',
                    createdAt: new Date().toISOString()
                });

                // Notify Welcome via Resend
                try {
                    await fetch('/api/notify-signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: cleanEmail, name: cleanName }),
                    });
                } catch (e) {
                    console.error("Failed to send welcome email", e);
                }
            }
            onLoginSuccess();
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please log in.");
            } else if (err.code === 'auth/invalid-email') {
                setError("The email address is badly formatted.");
            } else if (err.code === 'auth/weak-password') {
                setError("The password is too weak.");
            } else {
                setError(err.message || "Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail || !password) throw new Error("Email and password are required");

            await auth.signInWithEmailAndPassword(cleanEmail, password);
            onLoginSuccess();
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
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
            const response = await fetch('/api/send-reset-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            if (!response.ok) throw new Error("Failed to send reset link");
            setSuccessMsg('Professional reset link sent to your email!');
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
                        {isLogin ? (loginStep === 1 ? 'Welcome Back' : 'Enter Password') : 'Create Account'}
                    </h1>
                    {isLogin ? (
                        <div className="flex justify-center gap-1 mt-2">
                            {[1, 2].map(s => (
                                <div key={s} className={`h-1 w-8 rounded-full transition-all duration-300 ${s <= loginStep ? 'bg-primary' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center gap-1 mt-2">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-1 w-8 rounded-full transition-all duration-300 ${s <= signupStep ? 'bg-primary' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    )}
                </div>

                {isLogin ? (
                    <div className="space-y-4">
                        {loginStep === 1 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">What's your email?</label>
                                <input 
                                    type="email" 
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                    placeholder="you@example.com"
                                />
                            </div>
                        )}
                        {loginStep === 2 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Enter your password</label>
                                <div className="relative">
                                    <input 
                                        type={showPass ? "text" : "password"}
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-5 text-gray-300 hover:text-gray-500">
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot Password?</button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            {loginStep > 1 && (
                                <button onClick={prevStep} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">Back</button>
                            )}
                            <button onClick={nextStep} disabled={loading} className="flex-[2] bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                {loading ? 'Processing...' : (loginStep === 2 ? 'Log In' : 'Continue')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {signupStep === 1 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">What's your full name?</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        {signupStep === 2 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your mobile number?</label>
                                <input 
                                    type="tel" 
                                    autoFocus
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                    placeholder="9876543210"
                                />
                            </div>
                        )}
                        {signupStep === 3 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">And your email address?</label>
                                <input 
                                    type="email" 
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                    placeholder="you@example.com"
                                />
                            </div>
                        )}
                        {signupStep === 4 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure your account</label>
                                <div className="relative">
                                    <input 
                                        type={showPass ? "text" : "password"}
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                        className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-xl text-secondary"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-5 text-gray-300 hover:text-gray-500">
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            {signupStep > 1 && (
                                <button onClick={prevStep} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">Back</button>
                            )}
                            <button onClick={nextStep} disabled={loading} className="flex-[2] bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                {loading ? 'Processing...' : (signupStep === 4 ? 'Create Account' : 'Continue')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}
                    </div>
                )}

                <div className="mt-6 text-center space-y-4">
                    <p className="text-gray-400 text-xs font-bold">
                        {isLogin ? "NEW TO ZURYO?" : "ALREADY HAVE AN ACCOUNT?"}{" "}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setSignupStep(1); setLoginStep(1); }} 
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

                    <button onClick={onTrainerLogin} className="text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2 hover:bg-blue-50 rounded-xl transition-colors">
                        <Briefcase size={14} /> Trainer Portal
                    </button>
                </div>
            </div>
        </div>
    );
};