
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, LocateFixed, Loader2, Clock, MapPin, CheckCircle, CreditCard, Sun, Moon, Sparkles, Star, Package } from 'lucide-react';
import { CATEGORIES, PACKAGES } from '../constants';
import { Booking, UserProfile, UserPackage } from '../types';
import { addBooking, saveUserProfile, checkPhoneDuplicate, saveUserPackage } from '../services/db';
import { submitBookingToSheet, submitPackageToSheet } from '../services/sheetService';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

interface BookSessionProps {
    currentUser: firebase.User | null;
    userProfile: UserProfile | null;
    onLoginReq: () => void;
}

export const BookSession: React.FC<BookSessionProps> = ({ currentUser, userProfile, onLoginReq }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // Booking Type State: 'SESSION' (default) or 'PACKAGE'
    const [bookingType, setBookingType] = useState<'SESSION' | 'PACKAGE'>('SESSION');

    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        phone: userProfile?.phoneNumber || '',
        address: userProfile?.address || '',
        apartmentName: userProfile?.apartmentName || '',
        flatNo: userProfile?.flatNo || '',
        gender: userProfile?.gender || ''
    });
    
    useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                name: userProfile.name || prev.name,
                email: userProfile.email || prev.email,
                phone: userProfile.phoneNumber || prev.phone,
                address: userProfile.address || prev.address,
                apartmentName: userProfile.apartmentName || prev.apartmentName,
                flatNo: userProfile.flatNo || prev.flatNo,
                gender: userProfile.gender || prev.gender
            }));
        }
    }, [userProfile]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // --- Logic for Date & Time ---
    const getNext3Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const next3Days = getNext3Days();

    const generateSlots = (date: Date | null) => {
        if (!date) return { morning: [], evening: [] };
        
        const morningSlots: string[] = [];
        const eveningSlots: string[] = [];
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();

        const addSlotIfValid = (hour: number, minute: number, targetArray: string[]) => {
            const timeDate = new Date(date);
            timeDate.setHours(hour, minute, 0, 0);
            
            if (!isToday || timeDate > now) {
                let hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const minuteStr = minute === 0 ? '00' : minute;
                targetArray.push(`${hour12}:${minuteStr} ${ampm}`);
            }
        };

        for (let h = 5; h <= 10; h++) {
            addSlotIfValid(h, 0, morningSlots);
            if (h < 10) addSlotIfValid(h, 30, morningSlots);
        }
        for (let h = 17; h <= 20; h++) {
            addSlotIfValid(h, 0, eveningSlots);
            if (h < 20) addSlotIfValid(h, 30, eveningSlots);
        }
        return { morning: morningSlots, evening: eveningSlots };
    };

    const availableSlots = generateSlots(selectedDate);

    // --- Steps Logic ---

    const handleNext = async () => {
        if (step === 1) {
            if (bookingType === 'SESSION') {
                if (!selectedCategory) { showToast("Please select a workout type", "error"); return; }
            } else {
                if (!selectedPackageId) { showToast("Please select a package", "error"); return; }
            }

            if (!formData.address) {
                showToast("Please enter your location area", "error");
                return;
            }

            if (!currentUser) {
                onLoginReq();
                return;
            }

            if (bookingType === 'PACKAGE') {
                setStep(3); 
                return;
            }
        }
        
        if (step === 2) {
            if (!selectedDate) { showToast("Please select a date", "error"); return; }
            if (!selectedTime) { showToast("Please select a time slot", "error"); return; }
        }

        if (step === 3) {
             if (!formData.name || !formData.phone || !formData.apartmentName || !formData.flatNo || !formData.address) {
                 showToast("Please fill in all mandatory details (*)", "error");
                 return;
             }
             if (formData.phone.length < 10) { showToast("Invalid Phone Number", "error"); return; }
        }

        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step === 3 && bookingType === 'PACKAGE') {
            setStep(1);
        } else {
            setStep(prev => prev - 1);
        }
    };

    const isNextDisabled = () => {
        if (step === 1) {
            const hasSelection = bookingType === 'SESSION' ? !!selectedCategory : !!selectedPackageId;
            return !hasSelection || !formData.address;
        }
        if (step === 2) {
            return !selectedDate || !selectedTime;
        }
        if (step === 3) {
             const isValid = formData.name && formData.phone && formData.apartmentName && formData.flatNo && formData.address && formData.phone.length >= 10;
             return !isValid;
        }
        return false;
    };

    const processPayment = async () => {
        if (!currentUser) return;
        setIsProcessing(true);

        if (userProfile) {
            await saveUserProfile({ 
                ...userProfile, 
                name: formData.name,
                phoneNumber: formData.phone,
                address: formData.address,
                apartmentName: formData.apartmentName,
                flatNo: formData.flatNo,
                gender: formData.gender
            });
        }

        let price = 0;
        let desc = "";
        let selectedPkg = null;

        if (bookingType === 'SESSION') {
             price = 399;
             desc = `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Session`;
        } else {
             selectedPkg = PACKAGES.find(p => p.id === selectedPackageId);
             price = selectedPkg?.price || 0;
             desc = `${selectedPkg?.name} Package`;
        }

        const options = {
            key: "rzp_test_1DP5mmOlF5G5ag",
            amount: price * 100,
            currency: "INR",
            name: "Zuryo",
            description: desc,
            image: "https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp",
            handler: async function (response: any) {
                if (response.razorpay_payment_id) {
                    if (bookingType === 'SESSION') {
                        await finalizeBooking(response.razorpay_payment_id);
                    } else {
                        await finalizePackagePurchase(response.razorpay_payment_id, selectedPkg!);
                    }
                }
            },
            prefill: {
                name: formData.name,
                contact: formData.phone,
                email: formData.email
            },
            theme: { color: "#142B5D" },
            modal: { 
                ondismiss: () => {
                    setIsProcessing(false);
                    showToast("Payment cancelled", "error");
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                showToast("Payment Failed", "error");
                setIsProcessing(false);
            });
            rzp.open();
        } catch (e) {
            showToast("Payment gateway failed", "error");
            setIsProcessing(false);
        }
    };

    const finalizeBooking = async (paymentId: string) => {
        if (!currentUser || !selectedCategory || !selectedTime || !selectedDate) return;

        let historyNotes = "First Session";
        if (userProfile && userProfile.sessionHistory && userProfile.sessionHistory.length > 0) {
            const lastSession = userProfile.sessionHistory[userProfile.sessionHistory.length - 1];
            if (lastSession.activitiesDone) {
                historyNotes = lastSession.activitiesDone;
            }
        }

        const newBooking: Booking = {
            id: Date.now().toString(),
            userId: currentUser.uid,
            trainerName: "Matching with Pro...",
            category: CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Fitness',
            date: selectedDate.toISOString(),
            time: selectedTime,
            status: 'confirmed',
            price: 399,
            location: `${formData.apartmentName}, ${formData.flatNo}, ${formData.address}`,
            apartmentName: formData.apartmentName,
            flatNo: formData.flatNo,
            userName: formData.name,
            userPhone: formData.phone,
            sessionNotes: historyNotes,
            paymentId: paymentId,
            createdAt: Date.now()
        };

        await addBooking(newBooking);
        await submitBookingToSheet(newBooking, userProfile);
        
        showToast("Booking Confirmed!", "success");
        setIsProcessing(false);
        navigate('/bookings');
    };

    const finalizePackagePurchase = async (paymentId: string, pkg: { id: string, name: string, price: number, sessions: number }) => {
        if (!currentUser || !userProfile) return;

        const today = new Date();
        const expiry = new Date(today);
        expiry.setMonth(today.getMonth() + 1); 

        const newPackage: UserPackage = {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            totalSessions: pkg.sessions,
            sessionsUsed: 0,
            purchaseDate: today.toISOString(),
            expiryDate: expiry.toISOString(),
            isActive: true
        };

        await saveUserPackage(currentUser.uid, newPackage);
        await submitPackageToSheet(userProfile, newPackage);

        showToast("Package Purchased!", "success");
        setIsProcessing(false);
        navigate('/profile'); 
    };

    // Step labels
    const stepLabels = ['Activity', 'Time', 'Details', 'Pay'];

    return (
        <div className="pt-8 md:pt-4 pb-16 px-6 min-h-screen flex flex-col items-center justify-start max-w-4xl mx-auto">
            {/* Steps & Progress UI */}
            <div className="w-full mb-8 px-4">
                <div className="flex items-center justify-between relative z-10">
                    {(bookingType === 'PACKAGE' ? [1, 3, 4] : [1, 2, 3, 4]).map((i, idx) => (
                        <div key={i} className={`flex flex-col items-center gap-2 transition-all duration-300 ${step >= i ? 'scale-110' : 'opacity-80'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-base transition-all duration-300 shadow-md ${
                                step >= i ? 'bg-primary text-secondary' : 'bg-white text-gray-400 border-2 border-gray-200'
                            }`}>
                                {idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${step >= i ? 'text-secondary' : 'text-gray-300'}`}>
                                {stepLabels[i-1]}
                            </span>
                        </div>
                    ))}
                    <div className="absolute top-6 left-0 w-full h-3 bg-gray-100 rounded-full -z-10"></div>
                </div>
            </div>

            <div className="w-full bg-white md:p-10 md:rounded-[40px] md:shadow-2xl md:shadow-secondary/5 transition-all rounded-[32px] p-6 text-secondary shadow-lg border border-gray-100">
                
                <div className="flex-1 min-h-[400px]">
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right duration-300">
                            <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                                <button 
                                    onClick={() => { setBookingType('SESSION'); setSelectedPackageId(null); }}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${bookingType === 'SESSION' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500'}`}
                                >
                                    Single Session
                                </button>
                                <button 
                                    onClick={() => { setBookingType('PACKAGE'); setSelectedCategory(null); }}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 ${bookingType === 'PACKAGE' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500'}`}
                                >
                                    <Sparkles size={14} className="text-primary"/> Packages
                                </button>
                            </div>
                            
                            {bookingType === 'SESSION' ? (
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            disabled={!cat.active}
                                            onClick={() => cat.active && setSelectedCategory(cat.id)}
                                            className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 h-32 md:h-40 justify-between ${
                                                cat.active 
                                                    ? selectedCategory === cat.id ? 'border-secondary bg-secondary shadow-xl shadow-secondary/20' : `border-transparent ${cat.bg}` 
                                                    : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60' 
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedCategory === cat.id ? 'bg-primary text-secondary' : 'bg-white'}`}>
                                                <cat.icon size={24} strokeWidth={2.5} className={selectedCategory === cat.id ? '' : cat.color} />
                                            </div>
                                            <div className="text-left w-full">
                                                <span className={`font-black text-base ${selectedCategory === cat.id ? 'text-white' : 'text-secondary'}`}>{cat.name}</span>
                                                {!cat.active && <p className="text-[10px] font-bold text-gray-400 mt-1">Coming Soon</p>}
                                            </div>
                                            {selectedCategory === cat.id && <div className="absolute top-3 right-3 text-white"><CheckCircle size={20} className="text-primary" /></div>}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {PACKAGES.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => setSelectedPackageId(pkg.id)}
                                                className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col text-left gap-4 ${
                                                    selectedPackageId === pkg.id 
                                                    ? 'border-secondary bg-secondary text-white shadow-xl shadow-secondary/20' 
                                                    : 'border-gray-200 bg-white text-secondary hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div>
                                                        <h3 className={`text-xl font-black ${selectedPackageId === pkg.id ? 'text-white' : 'text-secondary'}`}>{pkg.name}</h3>
                                                        <p className={`text-2xl font-black ${selectedPackageId === pkg.id ? 'text-primary' : 'text-primary'}`}>₹{pkg.price}</p>
                                                        <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${selectedPackageId === pkg.id ? 'opacity-70' : 'text-gray-400'}`}>{pkg.sessions} Sessions</p>
                                                    </div>
                                                </div>
                                                {selectedPackageId === pkg.id && <div className="absolute top-3 right-3 text-white"><CheckCircle size={24} className="text-primary" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-center text-gray-400 font-bold mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        For sessions tracking: <br/>
                                        <span className="text-secondary select-all">Please contact support at 7353762555</span>
                                    </p>
                                </div>
                            )}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Service Location *</h3>
                                </div>
                                <textarea 
                                    placeholder="Enter your Area (e.g. HSR Layout)" 
                                    value={formData.address} 
                                    onChange={e=>setFormData(prev => ({ ...prev, address: e.target.value }))} 
                                    className="input-field bg-white min-h-[60px] resize-none" 
                                />
                                <div className="text-[10px] text-gray-500 mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <p className="mb-1 font-medium">We are Currently Serving in</p>
                                    <p className="text-lg font-black text-secondary">SARJAPUR, BELLANDUR, HSR LAYOUT</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && bookingType === 'SESSION' && (
                        <div className="animate-in slide-in-from-right duration-300">
                             <h2 className="text-2xl font-black text-secondary mb-1">When to train?</h2>
                             <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar mt-4">
                                {next3Days.map((date) => {
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    return (
                                        <button
                                            key={date.toString()}
                                            onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                            className={`min-w-[100px] py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                                                isSelected ? 'border-primary bg-secondary text-white' : 'border-gray-100 bg-white text-gray-400'
                                            }`}
                                        >
                                            <span className="text-2xl font-black">{date.getDate()}</span>
                                            <span className="text-[10px] uppercase font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedDate && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase mb-3"><Sun size={14} className="inline text-orange-400 mr-1"/> Morning</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {availableSlots.morning.map(slot => (
                                                <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-3 rounded-xl text-xs font-bold border-2 ${selectedTime === slot ? 'bg-primary text-secondary border-primary' : 'bg-white border-gray-100'}`}>{slot}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase mb-3"><Moon size={14} className="inline text-blue-500 mr-1"/> Evening</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {availableSlots.evening.map(slot => (
                                                <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-3 rounded-xl text-xs font-bold border-2 ${selectedTime === slot ? 'bg-primary text-secondary border-primary' : 'bg-white border-gray-100'}`}>{slot}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in slide-in-from-right duration-300 space-y-6">
                            <h2 className="text-2xl font-black text-secondary mb-1">Details</h2>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Name *</label>
                                        <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field mt-1" />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Gender</label>
                                        <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="input-field mt-1">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Phone *</label>
                                        <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="input-field mt-1" />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Email</label>
                                        <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="input-field mt-1" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input type="text" placeholder="Apartment Name *" value={formData.apartmentName} onChange={e=>setFormData({...formData, apartmentName: e.target.value})} className="input-field bg-white" />
                                        <input type="text" placeholder="Flat No *" value={formData.flatNo} onChange={e=>setFormData({...formData, flatNo: e.target.value})} className="input-field bg-white" />
                                    </div>
                                    <textarea placeholder="Street Address *" value={formData.address} onChange={e=>setFormData(prev=>({...prev, address: e.target.value}))} className="input-field bg-white min-h-[60px] resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in slide-in-from-right duration-300">
                             <h2 className="text-2xl font-black text-secondary mb-1">Summary</h2>
                             <div className="bg-secondary text-white rounded-[24px] p-6 shadow-2xl mt-4 border border-white/10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-primary">
                                            {bookingType === 'SESSION' ? CATEGORIES.find(c => c.id === selectedCategory)?.name : PACKAGES.find(p => p.id === selectedPackageId)?.name}
                                        </h3>
                                        <p className="text-white/60 text-xs font-medium">
                                            {bookingType === 'SESSION' ? '60 Minutes • Personal Training' : `${PACKAGES.find(p => p.id === selectedPackageId)?.sessions} Sessions`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black">₹{bookingType === 'SESSION' ? 399 : PACKAGES.find(p => p.id === selectedPackageId)?.price}</div>
                                        <div className="text-[10px] text-white/50 font-bold uppercase">Total</div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl text-secondary">
                                    <p className="font-bold text-sm">{formData.apartmentName}, {formData.flatNo}</p>
                                    <p className="text-xs text-gray-500">{formData.address}</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-4">
                    {step > 1 && (
                        <button onClick={handleBack} className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <button 
                        onClick={step === 4 ? processPayment : handleNext}
                        disabled={isProcessing || (step !== 4 && isNextDisabled())}
                        className="flex-1 bg-primary text-secondary py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : (step === 4 ? 'Pay Now' : 'Next')} 
                    </button>
                </div>
            </div>
            
            <style>{`
                .input-field { width: 100%; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: 600; color: #0f172a; outline: none; font-size: 0.875rem; }
                .input-field:focus { border-color: #FFB435; background: white; }
            `}</style>
        </div>
    );
};
