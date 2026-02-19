import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Send, User, Mail, Phone, Briefcase, FileText, Lock } from 'lucide-react';

export const LeadCaptureForm: React.FC<{ className?: string }> = ({ className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterest: 'Corporate Wellness',
    projectDetails: '',
    securityCheck: ''
  });
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.securityCheck.trim() !== '0') {
        setStatus('ERROR');
        setMsg('Security check failed. Hint: 0 + 0 = 0');
        return;
    }

    setStatus('SENDING');
    setMsg('');

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "96c96747-780b-479e-b0d6-4aba911bc9a4",
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                service_interest: formData.serviceInterest,
                message: formData.projectDetails,
                subject: `New Lead: ${formData.serviceInterest} - ${formData.name}`
            }),
        });
        
        const result = await response.json();
        if (result.success) {
            setStatus('SUCCESS');
            setMsg('Message sent successfully! We will contact you soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                serviceInterest: 'Corporate Wellness',
                projectDetails: '',
                securityCheck: ''
            });
            // Reset status after 5 seconds
            setTimeout(() => {
                setStatus('IDLE');
                setMsg('');
            }, 5000);
        } else {
            setStatus('ERROR');
            setMsg(result.message || 'Submission failed. Please try again.');
        }
    } catch (error) {
        setStatus('ERROR');
        setMsg('Network error. Please check your connection.');
    }
  };

  return (
    <div className={`bg-white p-6 md:p-8 rounded-[24px] shadow-lg border border-gray-100 ${className}`}>
        <h3 className="text-xl font-black text-secondary mb-2">Get in Touch</h3>
        <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll get back to you.</p>

        {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-green-800">Request Sent!</h4>
                <p className="text-green-600 text-sm mt-1">{msg}</p>
                <button 
                    onClick={() => { setStatus('IDLE'); setMsg(''); }}
                    className="mt-6 text-xs font-bold text-gray-400 hover:text-secondary underline"
                >
                    Send another message
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Full Name</label>
                        <div className="relative">
                            <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                placeholder="John Doe"
                            />
                            <User className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Email Address</label>
                        <div className="relative">
                            <input 
                                required
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                placeholder="john@company.com"
                            />
                            <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Phone Number</label>
                        <div className="relative">
                            <input 
                                required
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                placeholder="+91 98765 43210"
                            />
                            <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Company</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={formData.company}
                                onChange={e => setFormData({...formData, company: e.target.value})}
                                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                placeholder="Company Name"
                            />
                            <Briefcase className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Service Interest</label>
                    <div className="relative">
                        <select 
                            value={formData.serviceInterest}
                            onChange={e => setFormData({...formData, serviceInterest: e.target.value})}
                            className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all appearance-none cursor-pointer"
                        >
                            <option value="Corporate Wellness">Corporate Wellness</option>
                            <option value="Personal Training">Personal Training</option>
                            <option value="Group Classes">Group Classes</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Other">Other</option>
                        </select>
                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={16} />
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Project Details</label>
                    <div className="relative">
                        <textarea 
                            required
                            value={formData.projectDetails}
                            onChange={e => setFormData({...formData, projectDetails: e.target.value})}
                            className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all min-h-[100px] resize-none"
                            placeholder="Tell us about your requirements..."
                        />
                        <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Security Check: 0 + 0 = ?</label>
                    <div className="relative">
                        <input 
                            required
                            type="text" 
                            value={formData.securityCheck}
                            onChange={e => setFormData({...formData, securityCheck: e.target.value})}
                            className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                            placeholder="Answer"
                        />
                        <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                    </div>
                </div>

                {status === 'ERROR' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{msg}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={status === 'SENDING'}
                    className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    {status === 'SENDING' ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Sending...
                        </>
                    ) : (
                        <>
                            Send Message <Send size={18} />
                        </>
                    )}
                </button>
            </form>
        )}
    </div>
  );
};