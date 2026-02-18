import React, { useState } from 'react';
import { ArrowRight, Activity, Check, AlertCircle, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/db';
import { submitProfileToSheet } from '../services/sheetService';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [locLoading, setLocLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    address: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: '',
    injuries: '',
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Priority 1: OpenStreetMap Nominatim
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                    headers: { 'Accept-Language': 'en-US,en;q=0.9' }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                    return;
                }
            }
            throw new Error("Nominatim failed");
        } catch (error) {
            console.warn("Primary geocoding failed, trying backup...", error);
            
            // Priority 2: BigDataCloud
            try {
                    const resp2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data2 = await resp2.json();
                    if (data2 && (data2.city || data2.locality || data2.principalSubdivision)) {
                        const parts = [
                            data2.locality, 
                            data2.city, 
                            data2.principalSubdivision, 
                            data2.countryName
                        ].filter(Boolean);
                        
                        if (parts.length > 0) {
                            setFormData(prev => ({ ...prev, address: parts.join(', ') + " (Please add street details)" }));
                            return;
                        }
                    }
            } catch(e) {
                    console.error("Backup geocoding failed", e);
            }

            // Fallback
            alert("We located you, but couldn't find the exact address text. Please type your street name.");
            setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        } finally {
            setLocLoading(false);
        }
    }, (error) => {
        alert("Unable to retrieve location. Please type it manually.");
        setLocLoading(false);
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
  };

  const handleSubmit = async () => {
    const profile: UserProfile = {
      ...formData as UserProfile,
      onboardingComplete: true
    };
    saveUserProfile(profile);
    await submitProfileToSheet(profile);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 w-full">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="px-8 pt-12">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Activity size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-secondary">Welcome to Zuryo</h1>
              <p className="text-gray-500">Let's build your profile. This 2-minute orientation helps us assign the perfect trainer for you.</p>
              
              <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold"
                        placeholder="e.g. Rahul Sharma"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase">Address</label>
                        <button 
                            onClick={handleCurrentLocation} 
                            disabled={locLoading}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
                        >
                            {locLoading ? <Loader2 size={12} className="animate-spin"/> : <LocateFixed size={12} />}
                            {locLoading ? 'Fetching...' : 'Use Current Location'}
                        </button>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-semibold"
                            placeholder="Apartment, Area..."
                        />
                        <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Age</label>
                        <input 
                            type="number" 
                            value={formData.age}
                            onChange={e => setFormData({...formData, age: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none font-semibold"
                            placeholder="Years"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Gender</label>
                        <select 
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none font-semibold"
                        >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                <h2 className="text-2xl font-extrabold text-secondary">Body Stats</h2>
                <p className="text-gray-500">This helps tracks progress and intensity.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Weight (kg)</label>
                        <input 
                            type="number" 
                            value={formData.weight}
                            onChange={e => setFormData({...formData, weight: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Height (cm)</label>
                        <input 
                            type="number" 
                            value={formData.height}
                            onChange={e => setFormData({...formData, height: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none font-semibold"
                        />
                    </div>
                </div>
             </div>
          )}

          {step === 3 && (
             <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                <h2 className="text-2xl font-extrabold text-secondary">Your Goals</h2>
                <p className="text-gray-500">What are you trying to achieve?</p>
                
                <div className="space-y-3">
                    {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'].map(goal => (
                        <button 
                            key={goal}
                            onClick={() => setFormData({...formData, goal})}
                            className={`w-full p-4 rounded-xl border font-bold text-left flex justify-between items-center transition-all ${
                                formData.goal === goal 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-gray-200 text-gray-600'
                            }`}
                        >
                            {goal}
                            {formData.goal === goal && <Check size={20} />}
                        </button>
                    ))}
                </div>
             </div>
          )}

          {step === 4 && (
             <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm">Safety Check</span>
                </div>
                <h2 className="text-2xl font-extrabold text-secondary">Medical History</h2>
                <p className="text-gray-500">Do you have any existing injuries or medical conditions? (e.g., Lower back pain, Asthma)</p>
                
                <textarea 
                    value={formData.injuries}
                    onChange={e => setFormData({...formData, injuries: e.target.value})}
                    className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none font-medium resize-none"
                    placeholder="Type 'None' if applicable..."
                />

                <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed">
                    By proceeding, you acknowledge that you are physically capable of performing exercises.
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-4">
        {step > 1 && (
            <button 
                onClick={handleBack}
                className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
            >
                Back
            </button>
        )}
        <button 
            onClick={step === 4 ? handleSubmit : handleNext}
            className="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
        >
            {step === 4 ? 'Complete Profile' : 'Next Step'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};