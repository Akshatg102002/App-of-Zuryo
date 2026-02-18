
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Clock, Award, HeartHandshake, ClipboardList, Quote, Zap, MapPin, IndianRupee, Ban, CheckCircle, Star, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Play, Timer, Wallet, Unlock, Dumbbell, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { TESTIMONIALS, SUCCESS_STORIES } from '../constants';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/db';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const RevealOnScroll: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const successScrollRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const profile = await getUserProfile(auth.currentUser.uid);
        setUser(profile);
      }
    };
    fetchUser();
  }, []);

  const FAQ = [
    { q: "What is Zuryo?", a: "Zuryo is India's first community-based fitness platform bringing certified trainers to your doorstep in 60 minutes. We focus on convenience and quality." },
    { q: "Do I need equipment?", a: "No! Our trainers carry necessary functional equipment. If you have a gym in your complex, we can use that too." },
    { q: "Are trainers certified?", a: "Yes, every trainer is vetted, background checked, and certified by reputed institutes like ACE, ACSM, or similar." },
    { q: "What if I cancel?", a: "Cancellations 2 hours prior are free. Late cancellations incur a small fee to compensate the trainer." },
  ];

  const scrollTestimonials = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = 320;
          if (direction === 'left') {
              current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  const scrollSuccessStories = (direction: 'left' | 'right') => {
      if (successScrollRef.current) {
          const { current } = successScrollRef;
          const scrollAmount = 280;
          if (direction === 'left') {
              current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  const toggleAudio = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeVideoId === id) {
          setActiveVideoId(null);
      } else {
          setActiveVideoId(id);
      }
  };

  return (
    <div className="pb-4 md:pt-4 space-y-0 bg-gray-50 relative">
      
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/917353762555" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-glow hover:scale-110 transition-transform animate-in fade-in zoom-in duration-500"
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>

      {/* Mobile Header */}
      <header className="px-6 pt-6 flex justify-between items-center md:hidden mb-6">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center">
                <img src="https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp" alt="Zuryo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
                 <span className="text-xl font-black text-secondary tracking-tighter leading-none uppercase">ZURYO</span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">On Demand Fitness</span>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer bg-white"
            >
                <div className="w-full h-full bg-secondary flex items-center justify-center text-white font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
            </div>
        </div>
      </header>

      {/* IMMERSIVE HERO SECTION */}
      <RevealOnScroll>
        <div className="px-0 md:px-8 mb-12 md:mb-16">
            <div className="relative md:rounded-[40px] overflow-hidden min-h-[600px] md:h-[700px] flex items-center justify-center p-6 md:p-16 shadow-none md:shadow-2xl md:shadow-secondary/20 group">
                {/* Background Image */}
                <img 
                    src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=1031" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    alt="Fitness Background" 
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/30"></div>
                
                {/* Content - Centered */}
                <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
                    
                    {/* Live Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-primary px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(255,180,53,0.3)] animate-bounce-slow">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>Live in Bengaluru</span>
                    </div>
                    
                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8 drop-shadow-2xl">
                        ON DEMAND <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primaryDark">FITNESS</span>
                    </h1>
                    
                    {/* Subheadline/Tagline */}
                    <p className="text-gray-200 text-lg md:text-2xl font-medium mb-10 max-w-2xl leading-relaxed text-shadow-lg">
                        Premium certified trainers delivered to your doorstep in <span className="text-white font-bold underline decoration-primary decoration-4 underline-offset-4">60 minutes</span>.
                        <br className="hidden md:block"/> No memberships. No commute. Just results.
                    </p>
                    
                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button 
                            onClick={() => navigate('/book')}
                            className="group relative bg-primary text-secondary px-10 py-5 rounded-full font-black text-lg shadow-[0_0_40px_-10px_rgba(255,180,53,0.6)] hover:shadow-[0_0_60px_-15px_rgba(255,180,53,0.8)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 w-full md:w-auto"
                        >
                            <Zap size={24} fill="currentColor" />
                            <span>BOOK A SESSION</span>
                            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </RevealOnScroll>

      {/* VALUE PROPOSITION SECTION */}
      <RevealOnScroll delay={200}>
        <div className="px-6 md:px-8 py-4 mb-16 md:mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-primary font-black text-xl uppercase tracking-widest mb-3 block">Why Zuryo?</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-secondary tracking-tight">Fitness on your terms</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ValueCard 
                    icon={<Clock size={32}/>} 
                    title="Trainer within 60 mins" 
                    desc="Certified trainers at your doorstep within 60mins of booking."
                    color="from-blue-400 to-blue-600"
                />
                <ValueCard 
                    icon={<Wallet size={32}/>} 
                    title="Affordable Pricing" 
                    desc="Pay per session at Rs 399 only. No hidden fees or subscriptions." 
                    color="from-green-400 to-green-600"
                />
                <ValueCard 
                    icon={<Unlock size={32}/>} 
                    title="No Contracts" 
                    desc="Freedom to book whenever you want. No monthly commitments." 
                    color="from-purple-400 to-purple-600"
                />
                <ValueCard 
                    icon={<Dumbbell size={32}/>} 
                    title="Book - Pay - Train" 
                    desc="Seamless 3-step process to get your workout started instantly." 
                    color="from-orange-400 to-orange-600"
                />
            </div>
        </div>
      </RevealOnScroll>

      {/* SUCCESS STORIES SECTION */}
      <RevealOnScroll delay={300}>
        <div className="mb-16 md:mb-20 max-w-full overflow-hidden relative">
            <div className="px-6 md:px-8 mb-8 flex items-end justify-between max-w-7xl mx-auto">
                <div>
                    <span className="text-black font-bold text-xs uppercase tracking-widest mb-2 block">Transformations</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-secondary">Success Stories</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => scrollSuccessStories('left')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-primary transition-colors shadow-sm">
                        <ArrowLeft size={18} />
                    </button>
                    <button onClick={() => scrollSuccessStories('right')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-primary transition-colors shadow-sm">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div ref={successScrollRef} className="flex overflow-x-auto gap-4 px-6 md:px-8 pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth">
                {SUCCESS_STORIES.map((story) => {
                    const isMuted = activeVideoId !== story.id;
                    return (
                        <div key={story.id} className="snap-center shrink-0 w-[260px] md:w-[320px] relative group rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all bg-black">
                            <div className="aspect-[9/16] md:aspect-[3/4] relative">
                                {story.videoUrl && story.videoUrl !== '#' ? (
                                    <>
                                        <video 
                                            src={story.videoUrl} 
                                            className="w-full h-full object-cover" 
                                            autoPlay 
                                            muted={isMuted} 
                                            loop 
                                            playsInline
                                            poster={story.thumbnail}
                                        />
                                        <button 
                                            onClick={(e) => toggleAudio(story.id, e)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 hover:bg-black/70 transition-colors"
                                        >
                                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                        </button>
                                    </>
                                ) : (
                                    <img src={story.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={story.name} />
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>

                                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                    <h4 className="text-white font-bold text-lg mb-1">{story.title}</h4>
                                    <p className="text-gray-300 text-xs font-medium">{story.name}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="w-2 shrink-0"></div>
            </div>
        </div>
      </RevealOnScroll>

      {/* TESTIMONIALS CAROUSEL */}
      <RevealOnScroll delay={350}>
        <div className="mb-16 md:mb-20 max-w-full overflow-hidden relative">
            <div className="px-6 md:px-8 mb-8 flex items-end justify-between max-w-7xl mx-auto">
                <div>
                    <span className="text-black font-bold text-xs uppercase tracking-widest mb-2 block">Real Reviews</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-secondary">Loved by 100+</h2>
                </div>
                {/* Scroll Buttons */}
                <div className="flex gap-2">
                    <button onClick={() => scrollTestimonials('left')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-primary transition-colors shadow-sm">
                        <ArrowLeft size={18} />
                    </button>
                    <button onClick={() => scrollTestimonials('right')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-primary transition-colors shadow-sm">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
            
            <div ref={scrollRef} className="flex overflow-x-auto gap-4 px-6 md:px-8 pb-12 snap-x snap-mandatory no-scrollbar scroll-smooth">
                {TESTIMONIALS.map((t, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-[300px] md:w-[400px] bg-white p-6 md:p-8 rounded-[32px] shadow-soft border border-gray-100 hover:shadow-xl transition-all relative group flex flex-col justify-between">
                        <Quote className="absolute top-6 right-6 text-gray-100 fill-current group-hover:text-primary/10 transition-colors" size={40} />
                        <div className="mb-6">
                            <p className="text-secondary text-sm md:text-base leading-relaxed relative z-10 italic font-medium">"{t.text}"</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-3">
                                <img src={t.image} className="w-10 h-10 rounded-full object-cover bg-gray-100" alt={t.name} />
                                <div>
                                    <h4 className="font-bold text-secondary text-sm">{t.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="w-2 shrink-0"></div>
            </div>
        </div>
      </RevealOnScroll>

       {/* FAQ SECTION (ACCORDION) */}
       <RevealOnScroll delay={400}>
            <div className="px-6 md:px-8 mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl font-extrabold text-secondary mb-12 text-center">Frequently asked questions</h2>
                <div className="space-y-4">
                    {FAQ.map((item, idx) => (
                        <AccordionItem key={idx} question={item.q} answer={item.a} />
                    ))}
                </div>
            </div>
       </RevealOnScroll>
    </div>
  );
};

const ValueCard: React.FC<{ icon: any, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full group relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        
        <h3 className="relative z-10 font-black text-secondary text-2xl mb-2 tracking-tight">{title}</h3>
        <p className="relative z-10 text-gray-400 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
);

const AccordionItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 bg-white"
            >
                <span className="font-bold text-secondary text-lg">{question}</span>
                <div className={`p-2 rounded-full bg-gray-50 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'text-gray-400'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
