
import React, { useEffect, useState } from 'react';
import { MapPin, LogOut, ChevronRight, FileText, Info, Phone, Edit2, Save, UserCircle, ShieldCheck, Calendar, Lock, Loader2, X, Ruler, Weight, Activity, Mail, Package, CheckCircle, Headphones, ClipboardList, Clock, Sparkles } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { getBookings, saveUserProfile } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { AssessmentWizard } from '../components/AssessmentWizard';

interface ProfileProps {
    currentUser: any;
    userProfile: UserProfile | null;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, userProfile, onLogout }) => {
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
            <button onClick={() => navigate('/login')} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
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
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-secondary flex items-center justify-center text-primary font-black text-3xl">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>
            <h1 className="text-2xl font-extrabold text-secondary">@{userProfile?.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{userProfile?.name || 'Zuryo Member'}</p>
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

        {/* Active Package Card (If exists) */}
        {userProfile?.activePackage?.isActive && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Active Package</h3>
                <div className="bg-[#142B5D] p-6 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-primary" />
                                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Premium Member</span>
                            </div>
                            <h3 className="text-2xl font-black mt-2">{userProfile.activePackage.name}</h3>
                            <p className="text-xs text-white/60 font-medium mt-1">Valid until {new Date(userProfile.activePackage.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md border border-white/10">
                             <Package size={28} />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status</div>
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Active</div>
                    </div>
                </div>
            </div>
        )}

        {/* Upcoming Booking Card */}
        {bookings.filter(b => b.status === 'confirmed').length > 0 && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Upcoming Session</h3>
                {bookings.filter(b => b.status === 'confirmed').slice(0, 1).map(booking => (
                    <div key={booking.id} className="bg-white p-6 rounded-[32px] border-2 border-primary/20 shadow-xl shadow-primary/5 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="bg-primary/10 text-primary p-2 rounded-xl">
                                <Calendar size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{booking.category}</p>
                            <h4 className="text-xl font-black text-secondary">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                            <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-1"><Clock size={14}/> {booking.time}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <MapPin size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                                <p className="text-xs font-bold text-secondary line-clamp-1">{booking.location}</p>
                            </div>
                        </div>
                    </div>
                ))}
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

            <MenuItem 
                icon={<Calendar size={20} />} 
                label="Booking History" 
                subLabel="View past and upcoming sessions"
                onClick={() => navigate('/bookings')} 
                badge={bookings.filter(b => b.status === 'confirmed').length > 0 ? `${bookings.filter(b => b.status === 'confirmed').length}` : undefined}
            />
            
            <MenuItem 
                icon={<X size={20} className="text-red-500" />} 
                label="Account Deletion" 
                subLabel="Request to delete your data"
                onClick={async () => {
                    if (window.confirm("Are you sure you want to request account deletion? This action is irreversible.")) {
                        try {
                            const response = await fetch('/api/request-deletion', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: userProfile?.email,
                                    name: userProfile?.name,
                                    uid: userProfile?.uid
                                }),
                            });
                            if (response.ok) {
                                showToast("Deletion request sent successfully", "success");
                            } else {
                                throw new Error();
                            }
                        } catch (e) {
                            showToast("Failed to send request", "error");
                        }
                    }
                }} 
            />
        </div>

        {/* Support & Legal */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Support & Legal</h3>
            <MenuItem icon={<Info size={20} />} label="About Zuryo" onClick={() => navigate('/about-us')} />
            <MenuItem icon={<FileText size={20} />} label="Terms & Policies" onClick={() => navigate('/terms')} />
            <MenuItem icon={<ShieldCheck size={20} />} label="Privacy Policy" onClick={() => navigate('/privacy-policy')} />
            <MenuItem icon={<FileText size={20} />} label="Refund Policy" onClick={() => navigate('/refund-policy')} />
            <MenuItem icon={<ShieldCheck size={20} />} label="POSH Policy" onClick={() => navigate('/posh-policy')} />
            <MenuItem icon={<Phone size={20} />} label="Contact Support" onClick={() => navigate('/contact')} />
        </div>

        <div className="mb-8 text-center">
            <p className="text-gray-400 text-xs">
                3rd Floor, ASR Avenue, off Hosa Road, Choodasandra, Bengaluru, Karnataka 560099
            </p>
            <p className="text-gray-400 text-xs mt-1">
                +91 73537 62555 | founder@zuryo.co
            </p>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Username / Full Name</label>
                        <input 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 bg-white rounded-xl border border-gray-200 font-bold text-secondary mt-1" 
                        />
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
