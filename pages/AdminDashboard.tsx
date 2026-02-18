import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Layout, Users, CheckCircle, XCircle, Edit2, Package, MapPin, Eye, Download, Save, ChevronDown, Lock, Plus, Briefcase, Mail, Key, Loader2, Trash2, Shield, Settings, RotateCcw, ClipboardList, FileText, ArrowRight, Calendar } from 'lucide-react';
import { getAllBookings, getAllUsers, updateBooking, getAllTrainers, createTrainerAccount, updateTrainer, deleteTrainer, saveUserProfile, deleteBooking, getUserProfile, saveAssessment, deleteUser } from '../services/db';
import { Booking, UserProfile, AssessmentData } from '../types';
import { useToast } from '../components/ToastContext';
import { auth } from '../services/firebase';
import { AssessmentWizard } from '../components/AssessmentWizard';

type AdminRole = 'SUPER_ADMIN' | 'SUPPORT' | null;

export const AdminDashboard: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<AdminRole>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            // Determine Role based on credentials
            let detectedRole: AdminRole = null;

            if (email === 'admin@zuryo.co' && password === 'Zuryo@0505') {
                detectedRole = 'SUPER_ADMIN';
            } else if (email === 'support@zuryo.co' && password === 'support123') {
                detectedRole = 'SUPPORT';
            } else {
                throw new Error('Invalid Admin Credentials');
            }

            // Sync with Firebase Auth for rules permissions
            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (firebaseErr: any) {
                // Handle auto-creation for specific admin emails if missing in Firebase
                if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
                    try {
                        await auth.createUserWithEmailAndPassword(email, password);
                    } catch (createErr: any) {
                         if (createErr.code === 'auth/email-already-in-use') {
                                setError("Incorrect password."); // Password mismatch
                         } else {
                                throw new Error("Firebase Init Failed: " + createErr.message);
                         }
                         setIsLoggingIn(false);
                         return;
                    }
                } else if (firebaseErr.code === 'auth/wrong-password') {
                     throw new Error("Invalid Password");
                }
            }
            
            setRole(detectedRole);
            setIsAuthenticated(true);
        } catch (e: any) {
            setError(e.message || 'Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                    <div className="flex justify-center mb-6">
                        <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" className="w-16 h-16 rounded-xl object-cover shadow-md" alt="Zuryo Admin" />
                    </div>
                    <h2 className="text-xl font-black text-center text-secondary mb-6">Admin Console</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Admin Email" 
                            className="w-full p-3 border rounded-lg"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full p-3 border rounded-lg"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded">{error}</p>}
                        <button type="submit" disabled={isLoggingIn} className="w-full bg-secondary text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                            {isLoggingIn && <Loader2 size={16} className="animate-spin" />}
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <AuthenticatedDashboard role={role} />;
};

const AuthenticatedDashboard: React.FC<{ role: AdminRole }> = ({ role }) => {
    const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'USERS' | 'TRAINERS'>('BOOKINGS');
    
    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans text-secondary overflow-hidden">
            {/* Admin Header - Compact */}
            <div className="bg-secondary text-white px-4 py-2 shadow-md flex justify-between items-center z-50 shrink-0 h-14">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                         <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" className="w-full h-full object-cover" alt="Z" />
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-tight leading-none">Zuryo Admin</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                           {role === 'SUPER_ADMIN' ? <Shield size={10} /> : <Users size={10}/>} {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Support Team'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('BOOKINGS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'BOOKINGS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Layout size={14} /> Bookings
                    </button>
                    <button 
                        onClick={() => setActiveTab('USERS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Users size={14} /> Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('TRAINERS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'TRAINERS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Briefcase size={14} /> Trainers
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'BOOKINGS' ? <BookingsManager role={role} /> : 
                 activeTab === 'USERS' ? <UsersManager role={role} /> : 
                 <TrainersManager role={role} />}
            </div>
        </div>
    );
};

const Badge: React.FC<{ status: string }> = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-500';
    switch (status) {
        case 'confirmed': styles = 'bg-green-100 text-green-700'; break;
        case 'completed': styles = 'bg-blue-100 text-blue-700'; break;
        case 'cancelled': styles = 'bg-red-100 text-red-700'; break;
    }
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles}`}>{status}</span>;
};

// --- BOOKINGS MANAGER ---
const BookingsManager: React.FC<{ role: AdminRole }> = ({ role }) => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [trainers, setTrainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Quick Edit State (Status/Trainer)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [quickEditForm, setQuickEditForm] = useState<{ 
        trainerId: string, 
        trainerName: string, 
        trainerEmail: string, 
        status: string 
    }>({ trainerId: '', trainerName: '', trainerEmail: '', status: '' });

    // Full Edit State (Super Admin Only)
    const [fullEditBooking, setFullEditBooking] = useState<Booking | null>(null);

    // Assessment Viewer State
    const [assessmentModalData, setAssessmentModalData] = useState<AssessmentData | null>(null);
    const [assessmentUserId, setAssessmentUserId] = useState<string | null>(null);
    const [loadingAssessment, setLoadingAssessment] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [bookingsData, trainersData] = await Promise.all([
            getAllBookings(),
            getAllTrainers()
        ]);
        setBookings(bookingsData);
        // Only use DB trainers, do not merge mocks
        setTrainers(trainersData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const startQuickEdit = (booking: Booking) => {
        setEditingId(booking.id);
        setQuickEditForm({
            trainerId: booking.trainerId || '',
            trainerName: booking.trainerName,
            trainerEmail: booking.trainerEmail || '',
            status: booking.status
        });
    };

    const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const trainer = trainers.find(t => t.uid === selectedId);
        if (trainer) {
            setQuickEditForm(prev => ({
                ...prev,
                trainerId: trainer.uid,
                trainerName: trainer.name,
                trainerEmail: trainer.email
            }));
        } else {
            // Reset if "Assign Trainer" selected
            setQuickEditForm(prev => ({ ...prev, trainerId: '', trainerName: 'Matching with Pro...', trainerEmail: '' }));
        }
    };

    const saveQuickEdit = async (bookingId: string) => {
        try {
            await updateBooking(bookingId, {
                trainerId: quickEditForm.trainerId,
                trainerName: quickEditForm.trainerName,
                trainerEmail: quickEditForm.trainerEmail ? quickEditForm.trainerEmail.toLowerCase().trim() : "",
                status: quickEditForm.status as any
            });
            showToast("Booking updated successfully", "success");
            setEditingId(null);
            loadData();
        } catch(e) {
            showToast("Failed to update", "error");
        }
    };

    const handleFullEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!fullEditBooking) return;
        try {
            await updateBooking(fullEditBooking.id, fullEditBooking);
            showToast("Full details updated", "success");
            setFullEditBooking(null);
            loadData();
        } catch(e) {
            showToast("Update failed", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this booking?")) return;
        try {
            await deleteBooking(id);
            showToast("Booking deleted", "success");
            loadData();
        } catch (e) {
            showToast("Failed to delete", "error");
        }
    };

    const handleViewAssessment = async (userId: string) => {
        setLoadingAssessment(true);
        try {
            const user = await getUserProfile(userId);
            if (user && user.latestAssessment) {
                setAssessmentModalData(user.latestAssessment);
                setAssessmentUserId(userId);
            } else {
                showToast("No assessment found for this user", "error");
            }
        } catch (e) {
            showToast("Failed to fetch assessment", "error");
        } finally {
            setLoadingAssessment(false);
        }
    };

    const handleAdminSaveAssessment = async (data: AssessmentData) => {
        if(!assessmentUserId) return;
        try {
            await saveAssessment(assessmentUserId, data);
            showToast("Assessment updated by Admin", "success");
            setAssessmentModalData(null);
            setAssessmentUserId(null);
        } catch(e) {
            showToast("Failed to update assessment", "error");
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            (b.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
            (b.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (b.id || '').includes(searchTerm);
        
        const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadData} className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-secondary hover:bg-gray-200 transition-colors" title="Refresh">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Dense Table Container */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[1800px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase font-black tracking-wider border-b border-gray-200">
                            <th className="p-3 w-16 text-center">Edit</th>
                            <th className="p-3 w-20 border-r border-gray-200">ID</th>
                            <th className="p-3 w-24 border-r border-gray-200">Date</th>
                            <th className="p-3 w-20 border-r border-gray-200">Time</th>
                            <th className="p-3 w-24 border-r border-gray-200">Category</th>
                            <th className="p-3 w-32 border-r border-gray-200">Customer Name</th>
                            <th className="p-3 w-28 border-r border-gray-200">Customer Phone</th>
                            <th className="p-3 w-64 border-r border-gray-200">Location</th>
                            <th className="p-3 w-28 border-r border-gray-200">Status</th>
                            <th className="p-3 w-48 border-r border-gray-200">Trainer (Name/Email)</th>
                            <th className="p-3 w-48 border-r border-gray-200">Last Session</th>
                            <th className="p-3 w-48 border-r border-gray-200">Current Session</th>
                            <th className="p-3 w-24 border-r border-gray-200 text-center">Assessment</th>
                            <th className="p-3 w-20 border-r border-gray-200">Price</th>
                            <th className="p-3 w-32 border-r border-gray-200">Payment ID</th>
                            <th className="p-3 w-40 text-center sticky right-0 bg-gray-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100">
                        {filteredBookings.map((b, idx) => {
                            const isEditing = editingId === b.id;
                            return (
                                <tr key={b.id} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="p-3 text-center">
                                        {role === 'SUPER_ADMIN' && (
                                            <button onClick={() => setFullEditBooking(b)} className="p-1.5 bg-gray-100 text-secondary rounded hover:bg-secondary hover:text-white" title="Full Edit">
                                                <Settings size={12} />
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-3 font-mono text-gray-400 border-r border-gray-100 select-all">#{b.id.slice(-4)}</td>
                                    <td className="p-3 font-bold text-secondary border-r border-gray-100">{new Date(b.date).toLocaleDateString()}</td>
                                    <td className="p-3 border-r border-gray-100">{b.time}</td>
                                    <td className="p-3 border-r border-gray-100 font-bold text-primaryDark">{b.category}</td>
                                    <td className="p-3 border-r border-gray-100 font-bold">{b.userName}</td>
                                    <td className="p-3 border-r border-gray-100 text-gray-500 font-mono">{b.userPhone}</td>
                                    <td className="p-3 border-r border-gray-100 truncate max-w-[250px]" title={b.location}>
                                        {b.apartmentName ? `${b.apartmentName}, ${b.flatNo}, ${b.location}` : b.location}
                                    </td>
                                    
                                    {/* Editable Status */}
                                    <td className="p-3 border-r border-gray-100">
                                        {isEditing ? (
                                            <select 
                                                className="w-full p-1 border border-blue-300 rounded bg-white text-xs"
                                                value={quickEditForm.status}
                                                onChange={e => setQuickEditForm({...quickEditForm, status: e.target.value})}
                                            >
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <Badge status={b.status} />
                                        )}
                                    </td>

                                    {/* Editable Trainer */}
                                    <td className="p-3 border-r border-gray-100">
                                        {isEditing ? (
                                            <div className="relative">
                                                <select 
                                                    className="w-full p-1 pr-6 border border-blue-300 rounded bg-white text-xs appearance-none"
                                                    value={quickEditForm.trainerId}
                                                    onChange={handleTrainerChange}
                                                >
                                                    <option value="">-- Assign Trainer --</option>
                                                    {trainers.map(t => (
                                                        <option key={t.uid} value={t.uid}>
                                                            {t.name} ({t.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-2 pointer-events-none text-gray-400" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${b.trainerName === "Matching with Pro..." ? "text-orange-400 italic" : "text-secondary"}`}>
                                                    {b.trainerName}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{b.trainerEmail}</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Last Session Details */}
                                    <td className="p-3 border-r border-gray-100">
                                        <p className="line-clamp-2 text-[10px] text-gray-600 leading-tight" title={b.sessionNotes}>
                                            {b.sessionNotes || '-'}
                                        </p>
                                    </td>

                                    {/* Current Session Details */}
                                    <td className="p-3 border-r border-gray-100">
                                        <p className="line-clamp-2 text-[10px] text-gray-600 leading-tight" title={b.sessionLog}>
                                            {b.sessionLog || '-'}
                                        </p>
                                    </td>

                                    {/* Assessment View */}
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <button 
                                            onClick={() => handleViewAssessment(b.userId)}
                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-[10px] flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <ClipboardList size={12} /> {role === 'SUPER_ADMIN' ? 'Edit' : 'View'}
                                        </button>
                                    </td>

                                    <td className="p-3 border-r border-gray-100 font-mono">₹{b.price}</td>
                                    <td className="p-3 border-r border-gray-100 font-mono text-[10px] text-gray-400 truncate max-w-[100px]" title={b.paymentId}>{b.paymentId || '-'}</td>
                                    
                                    {/* Action Buttons */}
                                    <td className="p-3 text-center sticky right-0 bg-white border-l border-gray-100 group-hover:bg-blue-50/50">
                                        {isEditing ? (
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => saveQuickEdit(b.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14}/></button>
                                                <button onClick={() => setEditingId(null)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle size={14}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => startQuickEdit(b)} className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Quick Assign/Status">
                                                    <Edit2 size={14} />
                                                </button>
                                                {role === 'SUPER_ADMIN' && (
                                                    <button onClick={() => handleDelete(b.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Booking">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* SUPER ADMIN FULL EDIT MODAL */}
            {fullEditBooking && role === 'SUPER_ADMIN' && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-secondary">Edit Booking #{fullEditBooking.id.slice(-6)}</h3>
                            <button onClick={() => setFullEditBooking(null)}><XCircle className="text-gray-400 hover:text-secondary" /></button>
                        </div>
                        <form onSubmit={handleFullEditSave} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                <input type="text" className="w-full p-2 border rounded" value={fullEditBooking.date} onChange={e => setFullEditBooking({...fullEditBooking, date: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                                <input type="text" className="w-full p-2 border rounded" value={fullEditBooking.time} onChange={e => setFullEditBooking({...fullEditBooking, time: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <input type="text" className="w-full p-2 border rounded" value={fullEditBooking.category} onChange={e => setFullEditBooking({...fullEditBooking, category: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                                <input type="number" className="w-full p-2 border rounded" value={fullEditBooking.price} onChange={e => setFullEditBooking({...fullEditBooking, price: Number(e.target.value)})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                                <input type="text" className="w-full p-2 border rounded" value={fullEditBooking.userName} onChange={e => setFullEditBooking({...fullEditBooking, userName: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Customer Phone</label>
                                <input type="text" className="w-full p-2 border rounded" value={fullEditBooking.userPhone} onChange={e => setFullEditBooking({...fullEditBooking, userPhone: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Location</label>
                                <textarea className="w-full p-2 border rounded h-20" value={fullEditBooking.location} onChange={e => setFullEditBooking({...fullEditBooking, location: e.target.value})} />
                            </div>
                            <button type="submit" className="col-span-2 bg-secondary text-white py-3 rounded-xl font-bold mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assessment Modal (Admin Editable) */}
            {assessmentModalData && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button 
                            onClick={() => { setAssessmentModalData(null); setAssessmentUserId(null); }} 
                            className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 text-secondary shadow-lg hover:scale-110 transition-transform"
                        >
                            <XCircle size={24} />
                        </button>
                        <AssessmentWizard 
                            initialData={assessmentModalData} 
                            isLocked={role !== 'SUPER_ADMIN'}
                            mode="TRAINER_EDIT" 
                            onSave={handleAdminSaveAssessment}
                        />
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {loadingAssessment && (
                <div className="fixed inset-0 z-[210] bg-black/20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white w-12 h-12" />
                </div>
            )}
        </div>
    );
};

// --- TRAINERS MANAGER ---
const TrainersManager: React.FC<{ role: AdminRole }> = ({ role }) => {
    const { showToast } = useToast();
    const [trainers, setTrainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Edit States
    const [editTrainerId, setEditTrainerId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});

    const [newTrainer, setNewTrainer] = useState({ name: '', email: '', password: '' });
    const [processing, setProcessing] = useState(false);

    const loadTrainers = async () => {
        setLoading(true);
        // Only fetch from DB, no mocks
        const data = await getAllTrainers();
        setTrainers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTrainers();
    }, []);

    const handleCreateTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await createTrainerAccount(newTrainer.name, newTrainer.email, newTrainer.password);
            showToast("Trainer account created!", "success");
            setNewTrainer({ name: '', email: '', password: '' });
            setShowCreateForm(false);
            loadTrainers();
        } catch(e: any) {
            showToast(e.message || "Failed to create", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (uid: string) => {
        if (!confirm("Are you sure? This removes the trainer from the list.")) return;
        setProcessing(true);
        try {
            await deleteTrainer(uid);
            showToast("Trainer removed", "success");
            loadTrainers();
        } catch(e) {
            showToast("Failed to delete", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handlePasswordReset = async (email: string) => {
        if (!confirm(`Send password reset email to ${email}?`)) return;
        try {
            await auth.sendPasswordResetEmail(email);
            showToast("Reset link sent to " + email, "success");
        } catch(e) {
            showToast("Failed to send reset email", "error");
        }
    };

    const startEdit = (t: any) => {
        setEditTrainerId(t.uid);
        // Clone object to avoid mutating state directly
        setEditData({ ...t, specialties: (t.specialties || []).join(', ') });
    };

    const handleUpdate = async () => {
        setProcessing(true);
        try {
            // Convert specialties back to array
            const finalData = {
                ...editData,
                specialties: typeof editData.specialties === 'string' ? editData.specialties.split(',').map((s:string) => s.trim()) : editData.specialties
            };
            await updateTrainer(editTrainerId!, finalData);
            showToast("Trainer updated", "success");
            setEditTrainerId(null);
            loadTrainers();
        } catch(e) {
            showToast("Update failed", "error");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* List */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-secondary text-lg">Registered Trainers</h2>
                    {role === 'SUPER_ADMIN' && (
                        <button 
                            onClick={() => setShowCreateForm(true)} 
                            className="bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary hover:text-secondary transition-colors"
                        >
                            <Plus size={14} /> Add Trainer
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainers.map((t, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3 relative group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-primary shadow-sm text-lg">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary">{t.name}</h3>
                                        <p className="text-xs text-gray-500">{t.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {(t.specialties || []).map((s:string) => (
                                                <span key={s} className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {role === 'SUPER_ADMIN' && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end gap-2">
                                        <button onClick={() => startEdit(t)} className="p-1.5 bg-white border rounded hover:text-primary" title="Edit Profile"><Edit2 size={14}/></button>
                                        <button onClick={() => handlePasswordReset(t.email)} className="p-1.5 bg-white border rounded hover:text-orange-500" title="Reset Password"><RotateCcw size={14}/></button>
                                        <button onClick={() => handleDelete(t.uid)} className="p-1.5 bg-white border rounded hover:text-red-500" title="Remove"><Trash2 size={14}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-secondary">New Trainer Account</h3>
                            <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={20} className="text-gray-400"/></button>
                        </div>
                        <form onSubmit={handleCreateTrainer} className="space-y-4">
                            <input type="text" required className="w-full p-3 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="Full Name" value={newTrainer.name} onChange={e => setNewTrainer({...newTrainer, name: e.target.value})} />
                            <input type="email" required className="w-full p-3 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="Login Email" value={newTrainer.email} onChange={e => setNewTrainer({...newTrainer, email: e.target.value})} />
                            <input type="password" required minLength={6} className="w-full p-3 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="Set Password" value={newTrainer.password} onChange={e => setNewTrainer({...newTrainer, password: e.target.value})} />
                            <button type="submit" disabled={processing} className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-primary hover:text-secondary transition-colors mt-4">
                                {processing ? 'Processing...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editTrainerId && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-secondary">Edit Trainer</h3>
                            <button onClick={() => setEditTrainerId(null)} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={20} className="text-gray-400"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                                <input type="text" className="w-full p-2 border rounded" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Email (DB Record Only)</label>
                                <input type="email" className="w-full p-2 border rounded" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Specialties (Comma Separated)</label>
                                <input type="text" className="w-full p-2 border rounded" value={editData.specialties} onChange={e => setEditData({...editData, specialties: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Bio</label>
                                <textarea className="w-full p-2 border rounded h-24" value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                                <input type="number" className="w-full p-2 border rounded" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                            </div>
                            <button onClick={handleUpdate} disabled={processing} className="w-full bg-secondary text-white py-3 rounded-xl font-bold mt-4">
                                {processing ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- USERS MANAGER ---
const UsersManager: React.FC<{ role: AdminRole }> = ({ role }) => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    
    // Edit User
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editUserData, setEditUserData] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSaveUser = async () => {
        if (!editUserData) return;
        try {
            await saveUserProfile(editUserData);
            showToast("User updated successfully", "success");
            setIsEditingUser(false);
            setSelectedUser(editUserData);
            loadUsers();
        } catch(e) {
            showToast("Failed to update user", "error");
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm("Are you sure you want to permanently delete this user profile? This action cannot be undone.")) return;
        try {
            await deleteUser(uid);
            showToast("User profile deleted", "success");
            if (selectedUser?.uid === uid) setSelectedUser(null);
            loadUsers();
        } catch (e) {
            showToast("Failed to delete user", "error");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber?.includes(searchTerm)) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex h-full">
            <div className="w-2/3 flex flex-col border-r border-gray-200 bg-white">
                {/* User List Header */}
                <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center gap-3 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search Users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-secondary"
                        />
                    </div>
                    <button onClick={loadUsers} className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-secondary hover:bg-gray-200">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* User List Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase font-black tracking-wider border-b border-gray-200">
                                <th className="p-3">User</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3">Joined</th>
                                <th className="p-3">Package</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-gray-100">
                            {filteredUsers.map(u => (
                                <tr key={u.uid} className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedUser?.uid === u.uid ? 'bg-blue-50 border-l-4 border-primary' : ''}`} onClick={() => { setSelectedUser(u); setIsEditingUser(false); }}>
                                    <td className="p-3">
                                        <div className="font-bold text-secondary">{u.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400">{u.gender}, {u.age} yrs</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold">{u.phoneNumber}</div>
                                        <div className="text-[10px] text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="p-3 text-[10px] font-mono text-gray-500">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-3">
                                        {u.activePackage?.isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                <Package size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right flex justify-end gap-2">
                                        <button className="text-primary hover:bg-primary/10 p-1.5 rounded" title="View Details">
                                            <Eye size={14} />
                                        </button>
                                        {role === 'SUPER_ADMIN' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.uid); }}
                                                className="text-red-400 hover:bg-red-50 p-1.5 rounded" 
                                                title="Delete User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Panel */}
            <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 border-l border-gray-200">
                {selectedUser ? (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        {isEditingUser && role === 'SUPER_ADMIN' ? (
                            // EDIT MODE
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                                <h3 className="font-bold text-secondary">Edit User</h3>
                                
                                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Personal</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.name} onChange={e => setEditUserData({...editUserData!, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Age</label>
                                        <input type="number" className="w-full p-2 border rounded text-xs" value={editUserData?.age} onChange={e => setEditUserData({...editUserData!, age: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
                                        <select className="w-full p-2 border rounded text-xs" value={editUserData?.gender} onChange={e => setEditUserData({...editUserData!, gender: e.target.value})}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Contact</h4>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.phoneNumber} onChange={e => setEditUserData({...editUserData!, phoneNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.email} onChange={e => setEditUserData({...editUserData!, email: e.target.value})} />
                                    </div>
                                </div>

                                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Location</h4>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Apartment</label>
                                            <input className="w-full p-2 border rounded text-xs" value={editUserData?.apartmentName} onChange={e => setEditUserData({...editUserData!, apartmentName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Flat No</label>
                                            <input className="w-full p-2 border rounded text-xs" value={editUserData?.flatNo} onChange={e => setEditUserData({...editUserData!, flatNo: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Street Address</label>
                                        <textarea className="w-full p-2 border rounded text-xs h-16" value={editUserData?.address} onChange={e => setEditUserData({...editUserData!, address: e.target.value})} />
                                    </div>
                                </div>

                                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Stats & Health</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.height} onChange={e => setEditUserData({...editUserData!, height: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.weight} onChange={e => setEditUserData({...editUserData!, weight: e.target.value})} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Goal</label>
                                        <input className="w-full p-2 border rounded text-xs" value={editUserData?.goal} onChange={e => setEditUserData({...editUserData!, goal: e.target.value})} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Injuries</label>
                                        <textarea className="w-full p-2 border rounded text-xs h-16" value={editUserData?.injuries} onChange={e => setEditUserData({...editUserData!, injuries: e.target.value})} />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button onClick={handleSaveUser} className="flex-1 bg-green-500 text-white py-2 rounded font-bold">Save</button>
                                    <button onClick={() => setIsEditingUser(false)} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded font-bold">Cancel</button>
                                </div>
                             </div>
                        ) : (
                            // VIEW MODE
                            <>
                                <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
                                    {role === 'SUPER_ADMIN' && (
                                        <button 
                                            onClick={() => { setEditUserData(selectedUser); setIsEditingUser(true); }}
                                            className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-secondary"
                                        >
                                            <Edit2 size={14}/>
                                        </button>
                                    )}
                                    <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg">
                                        {selectedUser.name?.charAt(0) || 'U'}
                                    </div>
                                    <h2 className="text-xl font-black text-secondary">{selectedUser.name}</h2>
                                    <p className="text-gray-500 text-xs">{selectedUser.email}</p>
                                    {selectedUser.createdAt && <p className="text-[10px] text-gray-400 mt-1">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Height</p>
                                        <p className="font-black text-secondary text-sm">{selectedUser.height || '-'} cm</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p>
                                        <p className="font-black text-secondary text-sm">{selectedUser.weight || '-'} kg</p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location Details</h3>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                        <div className="text-xs text-gray-600 font-medium">
                                            <p className="font-bold text-secondary mb-1 text-sm">{selectedUser.apartmentName}, {selectedUser.flatNo}</p>
                                            <p className="leading-relaxed">{selectedUser.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedUser.activePackage?.isActive && (
                                    <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Membership</h3>
                                        <div className="pl-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-green-800 text-sm">{selectedUser.activePackage.name}</span>
                                                <span className="text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded text-green-700">
                                                    {selectedUser.activePackage.sessionsUsed} / {selectedUser.activePackage.totalSessions}
                                                </span>
                                            </div>
                                            <div className="w-full bg-green-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{width: `${(selectedUser.activePackage.sessionsUsed / selectedUser.activePackage.totalSessions) * 100}%`}}></div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 text-right">Expires: {new Date(selectedUser.activePackage.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <Users size={32} className="mb-2 opacity-20" />
                        <p className="font-bold text-xs">Select user to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};