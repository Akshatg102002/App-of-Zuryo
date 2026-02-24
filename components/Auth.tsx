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
    
    // OTP & Step State
    const [signupStep, setSignupStep] = useState(1); // 1: Name, 2: Phone, 3: Email, 4: Password, 5: OTP
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');

    const sendOTPEmail = async (targetEmail: string, code: string) => {
        console.log(`[SECURITY] OTP for ${targetEmail}: ${code}`);
    };

    const nextStep = () => {
        setError('');
        if (signupStep === 1 && !name) { setError('Please enter your name'); return; }
        if (signupStep === 2 && (!phone || phone.length < 10)) { setError('Please enter a valid 10-digit mobile number'); return; }
        if (signupStep === 3 && !email.includes('@')) { setError('Please enter a valid email'); return; }
        if (signupStep === 4 && password.length < 6) { setError('Password must be at least 6 characters'); return; }
        
        if (signupStep === 4) {
            handleSignupInitiate();
        } else {
            setSignupStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setError('');
        setSignupStep(prev => prev - 1);
    };

    const handleSignupInitiate = async () => {
        setLoading(true);
        try {
            const isDuplicate = await checkPhoneDuplicate(phone, ""); 
            if (isDuplicate) {
                throw new Error("This mobile number is already registered.");
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            await sendOTPEmail(email, code);
            
            setSignupStep(5);
            setSuccessMsg(`Verification code sent to ${email}`);
        } catch (err: any) {
            setError(err.message || "Failed to initiate signup");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            setError("Invalid verification code.");
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
            setError('Invalid email or password.');
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
            await auth.sendPasswordResetEmail(email.trim());
            setSuccessMsg('Password reset link sent!');
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
                        {isLogin ? 'Welcome Back' : (signupStep === 5 ? 'Verify Email' : 'Create Account')}
                    </h1>
                    {!isLogin && signupStep < 5 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-1 w-8 rounded-full transition-all duration-300 ${s <= signupStep ? 'bg-primary' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    )}
                </div>

                {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary"
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
                                className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all text-secondary"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[38px] text-gray-300 hover:text-gray-500">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot Password?</button>
                        </div>
                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 mt-2 hover:bg-slate-800 transition-all disabled:opacity-70">
                            {loading ? 'Processing...' : 'Log In'} 
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
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
                        {signupStep === 5 && (
                            <form onSubmit={handleVerifyAndSignup} className="animate-in zoom-in duration-300 space-y-4">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1 text-center">Verification Code</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-black text-center text-2xl tracking-[0.5em] text-secondary"
                                    placeholder="000000"
                                />
                                <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? 'Verifying...' : 'Verify & Sign Up'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>
                        )}

                        {signupStep < 5 && (
                            <div className="flex gap-3 mt-4">
                                {signupStep > 1 && (
                                    <button onClick={prevStep} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">Back</button>
                                )}
                                <button onClick={nextStep} disabled={loading} className="flex-[2] bg-secondary text-white py-4 rounded-2xl font-bold shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                    {loading ? 'Processing...' : (signupStep === 4 ? 'Create Account' : 'Continue')}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </div>
                        )}

                        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
                        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{successMsg}</div>}
                    </div>
                )}

                <div className="mt-6 text-center space-y-4">
                    <p className="text-gray-400 text-xs font-bold">
                        {isLogin ? "NEW TO ZURYO?" : "ALREADY HAVE AN ACCOUNT?"}{" "}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setSignupStep(1); }} 
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