
export interface Trainer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  price: number;
  imageUrl: string;
  bio: string;
  distance: string; // e.g., "0.8 km away"
  available: boolean;
  experience: number; // Years
  certifications: string[];
}

export interface SessionLog {
  date: string; // ISO String
  trainerName: string;
  completed: 'Yes' | 'No';
  comfortLevel: 'Very Comfortable' | 'Comfortable' | 'Uncomfortable';
  verbalFeedback?: string;
  nextRecommendation?: string;
  focusForNext?: string;
  activitiesDone: string;
}

// Updated Assessment Structure per JSON requirement
export interface AssessmentData {
  // A. Basic Profile (Optional in Wizard, fetched from DB)
  basic: {
    fullName: string;
    age: string;
    gender: string;
    address: {
        apartmentName: string;
        towerBlock: string;
        flatNo: string;
    };
    contactNumber: string;
    dateOfFirstSession: string;
    trainerName: string;
  };

  // B. Health, Safety & Lifestyle
  health: {
    medicalConditions: string[]; 
    injuryHistory: string[]; 
    currentPain: {
      location: string;
      painScale: string; // "1" to "10"
    };
    lifestyle: {
      sedentaryJob: boolean;
      dailyMovement: string; // Low, Moderate, High
      sleepQuality: string; // Poor, Average, Good
    };
    safetyClearance: {
      selfDeclaredFit: boolean;
      doctorRestrictions: string;
    };
  };

  // C. Body Measurements
  body: {
    height: string;
    weight: string;
    waist: string;
    hip: string;
    chest: string;
    biceps: { left: string; right: string };
  };

  // D-G. Trainer Evaluation
  evaluation: {
    posture: string; 
    balance: string; 
    mobility: {
      hip: string;
      ankle: string;
      shoulder: string;
      spine: string;
    };
    flexibility: {
      hamstrings: string;
      hipFlexors: string;
      chest: string;
    };
    movementStrength: {
      squatPattern: string;
      lungeStep: string;
      pushMovement: string;
      coreEngagement: string;
    };
    stamina: {
      overall: string;
      breathControl: string;
    };
  };

  // H-K. Goals & Outcomes
  goals: {
    fitnessCategory: string; 
    riskLevel: string; 
    primaryGoal: string;
    equipmentAvailable: string[];
    trainerNotes: {
      exercisesToAvoid: string;
      coachingStyle: string;
      rotationNotes: string;
    };
    sessionOutcome: {
      completed: boolean;
      customerComfort: string;
      nextSessionFocus: string;
    };
  };
}

export interface Booking {
  id: string;
  userId: string;
  trainerId?: string; // Assigned trainer ID
  trainerName: string; 
  trainerEmail?: string; // Added for precise assignment
  category: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  price: number;
  location: string; // Full address string
  
  // Specific Location Details
  apartmentName?: string;
  flatNo?: string;
  
  userName?: string;
  userPhone?: string;

  sessionNotes?: string; // History Notes (From previous session)
  sessionLog?: string;   // Current Session Log (Filled by trainer upon completion)
  paymentId?: string;
  createdAt: number;
}

export interface UserPackage {
  id: string;
  name: string; // '12 Sessions' | '16 Sessions'
  price: number;
  totalSessions: number;
  sessionsUsed: number;
  purchaseDate: string;
  expiryDate: string;
  isActive: boolean; // Controlled by Admin (0 or 1 in sheet/db)
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phoneNumber?: string;
  
  // Detailed Address
  address?: string; // Street/Area
  apartmentName?: string;
  flatNo?: string;
  
  age: string;
  gender: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
  injuries: string;
  onboardingComplete: boolean;
  walletBalance?: number;

  createdAt?: string;
  
  // Package Data
  activePackage?: UserPackage;

  // Stored Assessment (Single Source of Truth)
  latestAssessment?: AssessmentData;
  sessionHistory?: SessionLog[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image: string;
}

export enum ViewState {
  HOME = 'HOME',
  BOOK_SESSION = 'BOOK_SESSION',
  OUR_TRAINERS = 'OUR_TRAINERS',
  BOOKINGS = 'BOOKINGS',
  PROFILE = 'PROFILE',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  POLICIES = 'POLICIES', // Privacy Policy
  REFUND_POLICY = 'REFUND_POLICY',
  POSH_POLICY = 'POSH_POLICY',
  TERMS = 'TERMS',
  TRAINER_PORTAL = 'TRAINER_PORTAL'
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  active: boolean; 
}
