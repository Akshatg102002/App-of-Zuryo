
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Trash2, CalendarCheck, Loader2, Lock, ArrowRight, Ban, CheckCircle, RefreshCw, AlertTriangle, MapPin, User, Navigation } from 'lucide-react';
import { Booking } from '../types';
import { getBookings, cancelBooking } from '../services/db';
import { auth } from '../services/firebase';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

interface BookingsProps {
    onLoginReq?: () => void;
}

export const Bookings: React.FC<BookingsProps> = ({ onLoginReq }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'rescheduled' | 'cancelled'>('upcoming');

  const fetchBookings = async () => {
      if (auth.currentUser) {
          const data = await getBookings(auth.currentUser.uid);
          setBookings(data);
          setLoading(false);
      } else {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchBookings();
  }, [auth.currentUser]);

  const handleCancel = async (id: string) => {
    if(confirm('Are you sure you want to cancel this session? Refund will be initiated within 24 hours.')) {
        await cancelBooking(id);
        showToast("Session cancelled successfully", "success");
        fetchBookings(); // Reload
    }
  };

  const handleReschedule = async (id: string) => {
      if(confirm('Rescheduling involves cancelling this slot and booking a new one. Proceed?')) {
          await cancelBooking(id);
          showToast("Previous slot cancelled. Please choose a new time.", "success");
          navigate('/book');
      }
  };

  if (!auth.currentUser) {
      return (
        <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Lock size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-secondary mb-2">Login Required</h2>
                <p className="text-gray-500 max-w-[240px] mx-auto text-sm leading-relaxed">
                    Please log in to view your upcoming sessions and booking history.
                </p>
            </div>
            <button onClick={onLoginReq} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Log In
            </button>
        </div>
      );
  }

  const filteredBookings = bookings.filter(b => {
      if (activeTab === 'upcoming') return b.status === 'confirmed';
      if (activeTab === 'completed') return b.status === 'completed';
      if (activeTab === 'cancelled') return b.status === 'cancelled';
      if (activeTab === 'rescheduled') return false; 
      return false;
  });

  if (loading) return <div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="pt-8 md:pt-4 px-6 pb-16 min-h-screen max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-secondary self-start md:self-center">My Bookings</h1>
        
        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            <TabButton 
                label="Upcoming" 
                active={activeTab === 'upcoming'} 
                onClick={() => setActiveTab('upcoming')} 
                icon={<Calendar size={14} />} 
            />
            <TabButton 
                label="Completed" 
                active={activeTab === 'completed'} 
                onClick={() => setActiveTab('completed')} 
                icon={<CheckCircle size={14} />} 
            />
             <TabButton 
                label="Rescheduled" 
                active={activeTab === 'rescheduled'} 
                onClick={() => setActiveTab('rescheduled')} 
                icon={<RefreshCw size={14} />} 
            />
            <TabButton 
                label="Cancelled" 
                active={activeTab === 'cancelled'} 
                onClick={() => setActiveTab('cancelled')} 
                icon={<Ban size={14} />} 
            />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200 mt-8 flex flex-col items-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <CalendarCheck size={32} />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">No {activeTab} sessions</h3>
                <p className="text-sm text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
                    {activeTab === 'upcoming' 
                        ? 'Your journey begins with a single step. Book a professional trainer today!' 
                        : `You have no ${activeTab} bookings.`}
                </p>
                
                {activeTab === 'upcoming' && (
                    <div className="text-primary font-bold flex items-center gap-2 text-sm animate-pulse cursor-pointer" onClick={() => navigate('/book')}>
                        Head to Home to Book <ArrowRight size={16}/>
                    </div>
                )}
            </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
                {filteredBookings.map((booking) => (
                        <BookingCard 
                            key={booking.id} 
                            booking={booking} 
                            onCancel={handleCancel} 
                            onReschedule={handleReschedule}
                        />
                ))}
          </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ label: string, active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
    <button 
        onClick={onClick} 
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            active 
            ? 'bg-secondary text-white shadow-md' 
            : 'bg-transparent text-gray-500 hover:bg-gray-50'
        }`}
    >
        {icon} {label}
    </button>
);

const BookingCard: React.FC<{ 
    booking: Booking, 
    onCancel: (id: string) => void,
    onReschedule: (id: string) => void 
}> = ({ booking, onCancel, onReschedule }) => {
    const navigate = useNavigate();
    
    // Helper to parse date/time string to Date object
    const getBookingDateTime = (dateStr: string, timeStr: string) => {
        try {
            const date = new Date(dateStr);
            // Handle time like "5:00 PM"
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            date.setHours(hours, minutes, 0, 0);
            return date;
        } catch (e) {
            return new Date(dateStr); // Fallback
        }
    };

    const sessionDate = getBookingDateTime(booking.date, booking.time);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const canModify = diffHours >= 4 && booking.status === 'confirmed';

    const isConfirmed = booking.status === 'confirmed';
    const isCancelled = booking.status === 'cancelled';
    const isCompleted = booking.status === 'completed';

    return (
        <div className={`p-6 rounded-[32px] transition-all border flex flex-col gap-4 relative overflow-hidden group h-full shadow-lg ${
            isCancelled ? 'bg-red-50/50 border-red-100 opacity-80 grayscale-[0.5]' : 'bg-white border-white/20 hover:-translate-y-1'
        }`}>
            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 pointer-events-none ${
                isConfirmed ? 'bg-blue-400' : isCancelled ? 'bg-red-400' : 'bg-green-400'
            }`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 backdrop-blur-sm ${
                        isConfirmed ? 'bg-blue-50 text-blue-600' : 
                        isCancelled ? 'bg-red-50 text-red-500' :
                        'bg-green-50 text-green-600'
                    }`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-secondary text-lg leading-tight">{booking.category}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                             <User size={12} className="text-gray-400"/>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                {booking.trainerName !== "Matching with Pro..." ? booking.trainerName : "Matching..."}
                             </p>
                        </div>
                    </div>
                </div>
                
                <div className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wide border shadow-sm ${
                    isConfirmed ? 'bg-green-100 text-green-800 border-green-200' : 
                    isCancelled ? 'bg-red-100 text-red-700 border-red-200' : 
                    'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                    {booking.status}
                </div>
            </div>
            
            {/* Info Grid */}
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                        <Clock size={16} />
                    </div>
                    <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">When</p>
                         <p className="text-sm font-bold text-secondary">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                        <MapPin size={16} />
                    </div>
                    <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Where</p>
                         <p className="text-sm font-medium text-gray-600 line-clamp-2 leading-tight">{booking.location || 'Home Location'}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto pt-2">
                {isConfirmed && (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => canModify ? onReschedule(booking.id) : null}
                            disabled={!canModify}
                            className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all border shadow-sm ${
                                canModify 
                                ? 'bg-white text-secondary border-gray-200 hover:bg-gray-50 hover:border-gray-300' 
                                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-70'
                            }`}
                        >
                            <RefreshCw size={14} /> Reschedule
                        </button>
                        <button 
                            onClick={() => canModify ? onCancel(booking.id) : null}
                            disabled={!canModify}
                            className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all border shadow-sm ${
                                canModify
                                ? 'bg-white text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200'
                                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-70'
                            }`}
                        >
                            <Trash2 size={14} /> Cancel
                        </button>
                    </div>
                )}
                
                {isConfirmed && !canModify && (
                    <div className="flex items-center gap-2 mt-2 justify-center text-[10px] font-bold text-orange-600 bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                        <AlertTriangle size={14} />
                        <span>Changes allowed up to 4 hrs before session</span>
                    </div>
                )}

                {isCompleted && (
                    <button onClick={() => navigate('/book')} className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-primary text-secondary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <RefreshCw size={14} /> Book Again
                    </button>
                )}
            </div>
        </div>
    );
};
