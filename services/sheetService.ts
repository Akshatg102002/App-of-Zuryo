
import { Booking, UserProfile, UserPackage } from '../types';

// UPDATED URL
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbw-MX4BtPKFgWsL-uhz0p9Hs2R_fnnL3WFpROua3a-NmEV1lbKvLO7iuexoSNjB9Yg6/exec'; 

export const submitBookingToSheet = async (booking: Booking, user: UserProfile | null) => {
  if (!SHEET_API_URL || !SHEET_API_URL.includes('/exec')) {
    console.error("Configuration Error: Invalid Sheet URL");
    return;
  }

  // Format Date to DD/MM/YYYY
  const dateObj = new Date(booking.date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // Priority: Booking (Form Data) > User Profile > Fallback
  // Keys match Sheet Columns roughly (CamelCase for script consumption)
  const payload = {
    action: "create_booking",
    id: booking.id || Date.now().toString(),
    date: formattedDate,
    time: booking.time || 'N/A',
    category: booking.category || 'Fitness',
    customerName: booking.userName || user?.name || 'Guest',
    customerPhone: booking.userPhone || user?.phoneNumber || 'N/A',
    location: booking.location || 'N/A',
    status: booking.status || 'pending',
    trainerName: booking.trainerName || 'Matching...',
    price: booking.price || 0,
    paymentId: booking.paymentId || 'N/A',
    historyNotes: booking.sessionNotes || 'New Booking',
    
    // Legacy support fields just in case
    userName: booking.userName || user?.name || 'Guest',
    userPhone: booking.userPhone || user?.phoneNumber || 'N/A',
    address: booking.location || 'N/A',
    apartment: booking.apartmentName || '',
    flat: booking.flatNo || ''
  };

  console.log("Submitting Payload to Sheet:", payload);

  try {
    // Send as JSON text/plain to avoid CORS preflight issues in some envs
    await fetch(SHEET_API_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify(payload)
    });
    console.log("Booking submitted to sheet successfully");
  } catch (error) {
    console.error("Error submitting to sheet:", error);
  }
};

export const submitProfileToSheet = async (user: UserProfile) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "update_profile",
        uid: user.uid,
        name: user.name,
        phone: user.phoneNumber,
        email: user.email,
        address: user.address || '',
        apartment: user.apartmentName || '',
        flat: user.flatNo || '',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        weight: user.weight || '',
        goal: user.goal || '',
        injuries: user.injuries || ''
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error(e);
    }
};

export const updateSessionCompletion = async (bookingId: string, activities: string) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "complete_session",
        bookingId: bookingId,
        activities: activities
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error(e);
    }
};

// NEW: Submit Package Purchase
export const submitPackageToSheet = async (user: UserProfile, pkg: UserPackage) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "purchase_package", 
        uid: user.uid,
        userName: user.name,
        userPhone: user.phoneNumber,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        totalSessions: pkg.totalSessions,
        purchaseDate: pkg.purchaseDate,
        expiryDate: pkg.expiryDate,
        isActive: pkg.isActive ? 1 : 0
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        console.log("Package purchase submitted to sheet");
    } catch (e) {
        console.error("Error submitting package:", e);
    }
};
