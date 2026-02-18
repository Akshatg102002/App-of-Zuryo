import React from 'react';
import { CreditCard, History, Plus, ChevronRight, Gift } from 'lucide-react';

export const Wallet: React.FC = () => {
  return (
    <div className="pt-8 px-6 pb-28 min-h-screen">
       <h1 className="text-2xl font-extrabold text-secondary mb-6">My Wallet</h1>
       
       {/* Card */}
       <div className="bg-gradient-to-br from-secondary to-slate-800 rounded-3xl p-6 text-white shadow-2xl shadow-secondary/30 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-gray-400 text-xs font-medium mb-1">Total Balance</p>
                        <h2 className="text-4xl font-bold">₹1,250</h2>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <CreditCard size={20} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex-1 bg-white text-secondary py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                        + Add Money
                    </button>
                    <button className="flex-1 bg-white/10 text-white backdrop-blur-md py-3 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/20 transition-colors">
                        Send
                    </button>
                </div>
            </div>
       </div>

       {/* Offers */}
       <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Gift className="text-primary" size={20} />
                <h3 className="font-bold text-secondary">Active Rewards</h3>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-orange-100 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-primaryDark">Refer & Earn ₹500</h4>
                    <p className="text-xs text-gray-600 mt-1">Invite friends to Zuryo and get credits.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-glow">Invite</button>
            </div>
       </div>

       {/* Transaction History */}
       <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-secondary">Recent Transactions</h3>
                <button className="text-gray-400 hover:text-secondary transition-colors">
                    <History size={20} />
                </button>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary">
                                <span className="font-bold text-xs">TX</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-secondary">Yoga Session</h4>
                                <p className="text-[10px] text-gray-400">24 Oct, 10:00 AM</p>
                            </div>
                        </div>
                        <span className="font-bold text-secondary text-sm">- ₹499</span>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};
