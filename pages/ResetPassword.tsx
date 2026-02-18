
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const oobCode = searchParams.get('oobCode'); // Firebase sends the code in this param

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!oobCode) {
            setStatus('ERROR');
            setErrorMsg('Invalid or expired reset link. Please try again.');
        }
    }, [oobCode]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            setStatus('ERROR');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            setStatus('ERROR');
            return;
        }

        if (!oobCode) return;

        setLoading(true);
        setErrorMsg('');
        try {
            await auth.confirmPasswordReset(oobCode, newPassword);
            setStatus('SUCCESS');
            setTimeout(() => navigate('/'), 3000); // Redirect to login after 3s
        } catch (err: any) {
            setStatus('ERROR');
            setErrorMsg(err.message || "Failed to reset password. The link may have expired.");
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
                <div className="text-center mb-8">
                    <img src="https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp" className="w-24 h-auto object-contain mx-auto mb-4" alt="Zuryo" />
                    <h1 className="text-3xl font-extrabold text-secondary">Reset Password</h1>
                    <p className="text-gray-500 text-sm mt-2">Create a strong new password for your account</p>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="text-center bg-green-50 p-8 rounded-[32px] border border-green-100">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-green-800 mb-2">Password Updated!</h3>
                        <p className="text-green-700 text-sm">You can now login with your new password.</p>
                        <p className="text-green-600/60 text-xs mt-4">Redirecting you to login...</p>
                        <button onClick={() => navigate('/')} className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                            <input 
                                type={showPass ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold transition-all text-gray-900 placeholder:text-gray-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                            <input 
                                type={showPass ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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

                        {status === 'ERROR' && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || !oobCode}
                            className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 mt-4 hover:bg-slate-800 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Updating...' : 'Set New Password'} 
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}
             </div>
        </div>
    );
};
