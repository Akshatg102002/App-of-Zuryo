
import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-secondary">
                <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-extrabold text-secondary mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
        </div>
    );
};

export const About: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="About Zuryo" subtitle="Fitness on your terms." />
        <div className="prose prose-blue text-gray-600 leading-relaxed">
            <p>
                Zuryo is India's first community-based On Demand Fitness platform. We connect residents with certified fitness trainers in their vicinity within 60 minutes.
            </p>
            <p className="mt-4">
                Our mission is to make fitness accessible, affordable, and flexible. No long-term contracts, no travel time - just pure fitness delivered to your doorstep.
            </p>
            <h3 className="text-secondary font-bold text-xl mt-8 mb-4">Why we exist</h3>
            <p>
                We realized that the biggest barrier to fitness is convenience. By bringing the gym to your home, we remove the friction of travel and scheduling.
            </p>
        </div>
    </div>
);

export const Contact: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Contact Support" subtitle="We are here to help." />
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary"><MapPin /></div>
                <div>
                    <h3 className="font-bold text-secondary mb-1">Office Address</h3>
                    <p className="text-sm text-gray-500">3rd Floor, ASR Avenue, off Hosa Road, Choodasandra, Kasavanahalli, Bengaluru, Karnataka 560099</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary"><Mail /></div>
                <div>
                    <h3 className="font-bold text-secondary mb-1">Email Us</h3>
                    <p className="text-sm text-gray-500">founder@zuryo.co</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary"><Phone /></div>
                <div>
                    <h3 className="font-bold text-secondary mb-1">Call Us</h3>
                    <p className="text-sm text-gray-500">+91 73537 62555</p>
                </div>
            </div>
        </div>
    </div>
);

export const Terms: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Terms & Conditions" subtitle="Last updated: Jan 2026" />
        <div className="prose prose-sm text-gray-500 space-y-4">
            <p>By using Zuryo, you agree to the following terms...</p>
            <h4 className="font-bold text-secondary">1. Services</h4>
            <p>Zuryo provides a platform to book independent fitness trainers...</p>
            <h4 className="font-bold text-secondary">2. User Conduct</h4>
            <p>Users are expected to treat trainers with respect and provide a safe environment...</p>
            <h4 className="font-bold text-secondary">3. Payments</h4>
            <p>All payments are processed securely via Razorpay. Refunds are subject to our Refund Policy.</p>
        </div>
    </div>
);

export const Policies: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Privacy Policy" subtitle="Your data is safe with us." />
        <div className="prose prose-sm text-gray-500 space-y-4">
            <p>We collect information to provide better services...</p>
            <h4 className="font-bold text-secondary">Data Collection</h4>
            <p>We collect name, phone, address, and health metrics to personalize your training...</p>
            <h4 className="font-bold text-secondary">Data Sharing</h4>
            <p>We do not sell your data. We share necessary details with assigned trainers for service delivery.</p>
        </div>
    </div>
);

export const RefundPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Refund Policy" />
        <div className="prose prose-sm text-gray-500 space-y-4">
            <p>Cancellations made 2 hours prior to the session start time are eligible for a full refund or credit.</p>
            <p>Late cancellations may incur a fee of 50% of the session booking amount.</p>
            <p>Refunds are processed within 5-7 working days to the original payment method.</p>
        </div>
    </div>
);

export const POSHPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="POSH Policy" subtitle="Prevention of Sexual Harassment" />
        <div className="prose prose-sm text-gray-500 space-y-4">
            <p>Zuryo has a zero-tolerance policy towards sexual harassment.</p>
            <p>We are committed to providing a safe working environment for our trainers and a safe service experience for our customers.</p>
            <p>Any complaints can be reported directly to our Internal Complaints Committee at founder@zuryo.co.</p>
        </div>
    </div>
);
