
import React, { useEffect, useState } from 'react';
import { MapPin, LogOut, ChevronRight, FileText, Info, Phone, Edit2, Save, UserCircle, ShieldCheck, Calendar, Lock, Loader2, X, Ruler, Weight, Activity, Mail, Package, CheckCircle, Headphones, ClipboardList, Clock } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { getBookings, saveUserProfile } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { AssessmentWizard } from '../components/AssessmentWizard';

interface ProfileProps {
    currentUser: any;
    userProfile: UserProfile | null;
    onLogout: () => void;
    onLoginReq: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, userProfile, onLogout, onLoginReq }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'PERSONAL' | 'ADDRESS' | 'ASSESSMENT' | null>(null);

  const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=142B5D&color=fff&name=";

  useEffect(() => {
    const fetchBookings = async () => {
        if (currentUser) {
            setLoading(true);
            const userBookings = await getBookings(currentUser.uid);
            setBookings(userBookings);
            setLoading(false);
        }
    };
    fetchBookings();
  }, [currentUser]);

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
      if(!userProfile) return;
      try {
          const newProfile = { ...userProfile, ...updatedData };
          await saveUserProfile(newProfile);
          showToast("Profile Updated", "success");
      } catch(e) {
          showToast("Update Failed", "error");
      }
  };

  const MenuItem = ({ icon, label, onClick, badge, subLabel }: any) => (
      <button 
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all mb-3 group relative overflow-hidden"
      >
          <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
                  {icon}
              </div>
              <div className="text-left">
                  <span className="font-bold text-secondary text-sm block">{label}</span>
                  {subLabel && <span className="text-[10px] text-gray-400 font-medium">{subLabel}</span>}
              </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>
      </button>
  );

  if (loading) return <div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!currentUser) {
      return (
        <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Lock size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-secondary mb-2">My Profile</h2>
                <p className="text-gray-500 max-w-[240px] mx-auto text-sm leading-relaxed">
                    Log in to view your stats, manage bookings, and update your health profile.
                </p>
            </div>
            <button onClick={onLoginReq} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Log In / Sign Up
            </button>
        </div>
      );
  }

  return (
    <div className="pt-8 md:pt-10 px-6 pb-28 min-h-screen max-w-2xl mx-auto relative">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img 
                        src={DEFAULT_AVATAR + (userProfile?.name || 'User')} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                    />
                </div>
            </div>
            <h1 className="text-2xl font-extrabold text-secondary">{userProfile?.name || 'User'}</h1>
            <p className="text-sm text-gray-500 font-medium">{userProfile?.phoneNumber || userProfile?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Activity size={20} />
                </div>
                <p className="text-2xl font-black text-secondary">{bookings.length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sessions</p>
            </div>
            
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                    <Calendar size={20} />
                </div>
                <p className="text-lg font-black text-secondary">Jan 2026</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Member Since</p>
            </div>
        </div>

        {/* Active Package Card (If exists) - Simplified view */}
        {userProfile?.activePackage?.isActive && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Current Membership</h3>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Active</span>
                            <h3 className="text-xl font-black text-secondary mt-2">{userProfile.activePackage.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">Valid until {new Date(userProfile.activePackage.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-secondary">
                             <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Session History */}
        {userProfile?.sessionHistory && userProfile.sessionHistory.length > 0 && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Session History</h3>
                <div className="space-y-3">
                    {userProfile.sessionHistory.slice().reverse().map((session, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                    <Clock size={12}/> {new Date(session.date).toLocaleDateString()}
                                </div>
                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Completed</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Trainer</p>
                                    <p className="text-sm font-bold text-secondary">{session.trainerName}</p>
                                </div>
                                {session.activitiesDone && (
                                    <div className="text-right max-w-[60%]">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Workout</p>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{session.activitiesDone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Account Settings */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Account Settings</h3>
            
            <MenuItem 
                icon={<UserCircle size={20} />} 
                label="Personal Details" 
                subLabel="Name, Age, Gender, Stats"
                onClick={() => setActiveModal('PERSONAL')} 
            />
            <MenuItem 
                icon={<MapPin size={20} />} 
                label="Saved Addresses" 
                subLabel="Home, Office"
                onClick={() => setActiveModal('ADDRESS')} 
            />
            
            {/* View Assessment Option */}
            {userProfile?.latestAssessment && (
                <MenuItem 
                    icon={<ClipboardList size={20} />} 
                    label="My Fitness Assessment" 
                    subLabel="View your latest evaluation & goals"
                    onClick={() => setActiveModal('ASSESSMENT')} 
                />
            )}

            {!userProfile?.activePackage?.isActive && (
                <MenuItem 
                    icon={<Calendar size={20} />} 
                    label="Booking History" 
                    subLabel="View past and upcoming sessions"
                    onClick={() => navigate('/bookings')} 
                    badge={bookings.filter(b => b.status === 'confirmed').length > 0 ? `${bookings.filter(b => b.status === 'confirmed').length}` : undefined}
                />
            )}
        </div>

        {/* Support & Legal */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Support & Legal</h3>
            <MenuItem icon={<Info size={20} />} label="About Zuryo" onClick={() => navigate('/about-us')} />
            <MenuItem icon={<FileText size={20} />} label="Terms & Policies" onClick={() => navigate('/terms')} />
            <MenuItem icon={<Phone size={20} />} label="Contact Support" onClick={() => navigate('/contact')} />
        </div>

        <button onClick={onLogout} className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
            <LogOut size={20} /> Log Out
        </button>

        <div className="mt-8 text-center pb-8">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Version 1.0.6</p>
        </div>

        {/* Modals */}
        {activeModal === 'PERSONAL' && userProfile && (
            <PersonalDetailsModal 
                profile={userProfile} 
                onClose={() => setActiveModal(null)} 
                onSave={handleUpdateProfile}
            />
        )}

        {activeModal === 'ADDRESS' && userProfile && (
            <AddressModal profile={userProfile} onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'ASSESSMENT' && userProfile && userProfile.latestAssessment && (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                    <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 text-secondary shadow-lg"><X size={20} /></button>
                    <AssessmentWizard 
                        initialData={userProfile.latestAssessment} 
                        isLocked={true}
                        mode="USER_VIEW"
                    />
                </div>
            </div>
        )}
    </div>
  );
};

// --- Modal Components ---

const PersonalDetailsModal: React.FC<{ 
    profile: UserProfile, 
    onClose: () => void,
    onSave: (data: Partial<UserProfile>) => void
}> = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState(profile);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-secondary">Personal Details</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Full Name (Locked)</label>
                        <input type="text" value={profile.name || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-400 cursor-not-allowed mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Age</label>
                            <input type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-bold text-secondary mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Gender</label>
                            <select value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-bold text-secondary mt-1">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Height (cm)</label>
                            <input type="number" value={formData.height || ''} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-bold text-secondary mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Weight (kg)</label>
                            <input type="number" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-bold text-secondary mt-1" />
                        </div>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Email (Locked)</label>
                         <input type="text" value={profile.email || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-400 cursor-not-allowed mt-1" />
                    </div>

                    <button onClick={handleSave} className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-lg mt-4">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AddressModal: React.FC<{ profile: UserProfile, onClose: () => void }> = ({ profile, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-secondary">Address Details</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mb-4 flex items-center gap-2 border border-yellow-100">
                    <Lock size={14}/> Addresses are updated during bookings.
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Apartment</label>
                            <input type="text" value={profile.apartmentName || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Flat No</label>
                            <input type="text" value={profile.flatNo || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Street Address</label>
                        <textarea value={profile.address || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 min-h-[100px] resize-none mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};
