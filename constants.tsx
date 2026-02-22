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
    name: 'Anita singh',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV6_720p.mp4'
  },
  {
    id: 's2',
    name: 'Deep',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Success_Stories.mp4'
  },
  {
    id: 's3',
    name: 'Shweta',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV3_720p.mp4'
  },
  {
    id: 's4',
    name: 'Deepak & Neha',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/DN-Akshat-Garg-720p-h264.mp4'
  },
  {
    id: 's5',
    name: 'Shreaya',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV2_720p.mp4'
  },
  {
    id: 's6',
    name: 'Vikramjit',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV4_720p.mp4'
  },
  {
    id: 's7',
    name: 'Tanmay',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV1_720p.mp4'
  },
  {
    id: 's8',
    name: 'Manjeet',
    title: '',
    thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8966cd?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/ZV5_720p.mp4'
  }
];

export const MOCK_TRAINERS: Trainer[] = [
  {
    id: 't2',
    name: 'Ishaq M.',
    specialties: ['Strength Training', 'Cardio', 'Weight Loss'],
    rating: 4.8,
    reviews: 98,
    price: 449,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Ishaq.jpeg',
    bio: 'Experienced fitness professional specializing in strength training, cardiovascular conditioning, and sustainable weight loss through structured and personalized programs.',
    distance: '1.2 km away',
    available: true,
    experience: 5,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't3',
    name: 'Krithika T.',
    specialties: ['Muscle Training', 'Cardio', 'Fitness for Women'],
    rating: 4.9,
    reviews: 112,
    price: 499,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Krithika.jpeg',
    bio: 'Certified fitness trainer focused on strength development, cardiovascular fitness, and women-centric training programs tailored to individual goals.',
    distance: '2.0 km away',
    available: true,
    experience: 2,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't4',
    name: 'Maheswaran',
    specialties: ['Functional Strength', 'Mobility', 'Posture'],
    rating: 4.7,
    reviews: 86,
    price: 449,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Maheswrn.jpeg',
    bio: 'Specializes in fitness assessments and corrective exercise programs aimed at improving posture, mobility, and overall movement efficiency.',
    distance: '3.5 km away',
    available: true,
    experience: 3,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't6',
    name: 'Ravinayaka',
    specialties: ['Strength Training', 'Cardio', 'Endurance'],
    rating: 4.6,
    reviews: 65,
    price: 399,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/RaviNayak-scaled.jpeg',
    bio: 'Fitness trainer with experience in strength training and cardiovascular conditioning, delivering balanced programs to improve endurance and overall fitness.',
    distance: '2.8 km away',
    available: true,
    experience: 4,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't7',
    name: 'Isha A.',
    specialties: ['Lean Muscle', 'Weight Loss', 'Mobility'],
    rating: 4.8,
    reviews: 90,
    price: 499,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Isha.jpeg',
    bio: 'Provides structured training programs focused on lean muscle development, weight management, and mobility improvement for long-term fitness.',
    distance: '4.1 km away',
    available: true,
    experience: 3,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid']
  },
  {
    id: 't8',
    name: 'Biju R.',
    specialties: [
      'Strength & Muscle Training',
      'Weight Loss & Cardio',
      'Posture & Mobility Correction'
    ],
    rating: 4.9,
    reviews: 120,
    price: 699,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Biju_Trainer.jpeg',
    bio: 'Senior fitness professional with extensive experience in designing structured, personalized training programs focused on strength, weight management, and mobility.',
    distance: '3.2 km away',
    available: true,
    experience: 15,
    certifications: [
      'Certified Fitness Trainer',
      'CPR & First Aid Certified'
    ]
  },
  {
    id: 't9',
    name: 'Goutam',
    specialties: [
      'Strength Training',
      'Posture Correction',
      'Mobility Improvement'
    ],
    rating: 4.6,
    reviews: 65,
    price: 399,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Goutam_trainer.jpeg',
    bio: 'Focuses on strength development and posture correction to support long-term physical health, movement quality, and injury prevention.',
    distance: '5.0 km away',
    available: true,
    experience: 3,
    certifications: [
      'Certified Fitness Trainer',
      'CPR & First Aid'
    ]
  },
  {
    id: 't10',
    name: 'Kiran',
    specialties: [
      'Strength Training',
      'Weight Management',
      'Mobility & Functional Fitness'
    ],
    rating: 4.7,
    reviews: 72,
    price: 449,
    imageUrl: 'https://socialfoundationindia.org/wp-content/uploads/2026/02/Kiran.jpeg',
    bio: 'Certified fitness trainer delivering assessment-based training programs focused on strength, weight management, mobility, and safe long-term progress.',
    distance: '3.0 km away',
    available: true,
    experience: 4,
    certifications: [
      'Certified Fitness Trainer',
      'CPR & First Aid'
    ]
  },
  {
    "id": "t11",
    "name": "Varun",
    "specialties": [
      "Muscle Building",
      "Fat Loss Transformation",
      "HIIT & Endurance Training"
    ],
    "rating": 4.8,
    "reviews": 96,
    "price": 499,
    "imageUrl": "https://socialfoundationindia.org/wp-content/uploads/2026/02/Varun.jpeg",
    "bio": "Experienced fitness coach with 5+ years of expertise in body transformations, strength conditioning, and high-intensity training programs tailored to individual goals.",
    "distance": "2.5 km away",
    "available": true,
    "experience": 6,
    "certifications": [
      "Certified Personal Trainer",
      "Nutrition & Lifestyle Coach",
      "CPR & First Aid"
    ]
  }

];