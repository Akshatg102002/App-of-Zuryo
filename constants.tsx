import { Trainer, Category, Testimonial } from './types';
import { Dumbbell, Activity, User, Heart, Zap, ShieldCheck, Accessibility, Trophy, Flame, Sword } from 'lucide-react';

export const CATEGORIES: Category[] = [
  { id: 'pro_training', name: 'Pro Training', icon: Trophy, color: 'text-secondary', bg: 'bg-primary', active: true },
  { id: 'yoga', name: 'Yoga', icon: Accessibility, color: 'text-purple-600', bg: 'bg-purple-50', active: false },
  { id: 'zumba', name: 'Zumba', icon: Flame, color: 'text-pink-600', bg: 'bg-pink-50', active: false },
  { id: 'pilates', name: 'Pilates', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', active: false },
  { id: 'mma', name: 'MMA', icon: Sword, color: 'text-red-600', bg: 'bg-red-50', active: false },
];

export const PACKAGES = [
    { id: 'pkg_12', name: '12 Sessions', price: 4499, sessions: 12, validity: '1 Month', description: 'Recommended for 3 sessions/week' },
    { id: 'pkg_16', name: '16 Sessions', price: 5999, sessions: 16, validity: '1 Month', description: 'Intensive 4 sessions/week' }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Deep', role: 'Verified User', text: 'Great workout session, really enjoyed the intensity.', rating: 5, image: 'https://ui-avatars.com/api/?name=Deep&background=random' },
  { id: '2', name: 'Anisha', role: 'Verified User', text: 'Todays session was very good.', rating: 5, image: 'https://ui-avatars.com/api/?name=Anisha&background=random' },
  { id: '3', name: 'Gayatri', role: 'Verified User', text: 'Completed my session successfully, feeling great!', rating: 5, image: 'https://ui-avatars.com/api/?name=Gayatri&background=random' },
  { id: '4', name: 'Nikita', role: 'Verified User', text: 'It was an excellent session', rating: 5, image: 'https://ui-avatars.com/api/?name=Nikita&background=random' },
  { id: '5', name: 'Piyush', role: 'Verified User', text: 'Professional service and a solid workout.', rating: 5, image: 'https://ui-avatars.com/api/?name=Piyush&background=random' },
  { id: '6', name: 'Surabhi', role: 'Verified User', text: 'Hey Swapnil ! it was a really good session today', rating: 4, image: 'https://ui-avatars.com/api/?name=Surabhi&background=random' },
  { id: '7', name: 'Shravanesh', role: 'Verified User', text: 'Trainer was on time and very helpful.', rating: 5, image: 'https://ui-avatars.com/api/?name=Shravanesh&background=random' },
  { id: '8', name: 'Shubham', role: 'Verified User', text: 'Excellent session, looking forward to the next one.', rating: 5, image: 'https://ui-avatars.com/api/?name=Shubham&background=random' },
  { id: '9', name: 'Diksha', role: 'Verified User', text: 'Great quality service, very satisfied with the trainer.', rating: 5, image: 'https://ui-avatars.com/api/?name=Diksha&background=random' },
  { id: '10', name: 'Sarthak', role: 'Verified User', text: 'Trainers were very professional and knew their game', rating: 4, image: 'https://ui-avatars.com/api/?name=Sarthak&background=random' },
];

export const SUCCESS_STORIES = [
    {
        id: 's1',
        name: 'Rahul K.',
        title: 'Lost 12kg in 3 Months',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-battle-ropes-at-gym-22839-large.mp4'
    },
    {
        id: 's2',
        name: 'Sneha P.',
        title: 'Post-Pregnancy Fit',
        thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-the-beach-at-sunset-40695-large.mp4'
    },
    {
        id: 's3',
        name: 'Arjun M.',
        title: 'Muscle Gain Journey',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-muscular-man-lifting-weights-in-gym-22843-large.mp4'
    },
    {
        id: 's4',
        name: 'Priya D.',
        title: 'Yoga for Flexibility',
        thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-stretching-her-legs-at-home-40698-large.mp4'
    }
];

export const MOCK_TRAINERS: Trainer[] = [
  {
    id: 't1',
    name: 'Biju R.',
    specialties: ['Strength & Muscle', 'Weight Loss', 'Posture Correction'],
    rating: 4.9,
    reviews: 145,
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1594824476969-51c44efd40d3?q=80&w=800&auto=format&fit=crop',
    bio: 'Our most experienced trainer with over 15+ years of expertise. Specializes in transforming bodies through comprehensive strength and mobility training.',
    distance: '0.8 km away',
    available: true,
    experience: 15,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't2',
    name: 'Ishaq M.',
    specialties: ['Strength Training', 'Cardio', 'Weight Loss'],
    rating: 4.8,
    reviews: 98,
    price: 449,
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop',
    bio: 'Dedicated professional specializing in building strength and achieving sustainable weight loss through personalized cardio programs. 5+ Years Experience.',
    distance: '1.2 km away',
    available: true,
    experience: 5,
    certifications: ['Certified Personal Trainer', 'Sports Nutritionist']
  }
];