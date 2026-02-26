import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';
import { firebaseConfig } from './services/firebase';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        const serviceAccountPath = path.resolve('./serviceAccountKey.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: firebaseConfig.projectId,
            });
            console.log('Firebase Admin: Initialized with serviceAccountKey.json');
        } else {
            // Fallback to minimal initialization if file is missing
            admin.initializeApp({ projectId: firebaseConfig.projectId });
            console.log('Firebase Admin: Initialized without Service Account (Limited functionality)');
        }
    }
} catch (err) {
    console.error('Firebase Admin initialization error:', err);
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_cJkig2tP_BSzBcoJ5ZNAw6dLjpRqaYc3k');

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    // API Routes
    app.post('/api/send-otp', async (req, res) => {
        console.log('POST /api/send-otp', req.body);
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        try {
            // Note: admin.auth().getUserByEmail requires service account. 
            // If not available, we skip the server-side check and rely on frontend/signup attempt.
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                try {
                    await admin.auth().getUserByEmail(email);
                    return res.status(409).json({ error: 'Email already registered. Please login instead.' });
                } catch (authError: any) {
                    if (authError.code !== 'auth/user-not-found') {
                        console.error('Firebase Auth Error:', authError.code);
                    }
                }
            }

            // 2. Send OTP via Resend
            console.log('Sending OTP via Resend to:', email);
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <onboarding@resend.dev>',
                to: [email],
                subject: 'Your Zuryo Verification Code',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Code</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(20, 43, 93, 0.05); border: 1px solid #F1F5F9;">
                                        <!-- Header -->
                                        <tr>
                                            <td align="center" style="background: #142B5D; padding: 40px;">
                                                <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 60px; height: 60px; border-radius: 18px;" />
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 50px 40px; text-align: center;">
                                                <h2 style="color: #142B5D; font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">Verify Your Account</h2>
                                                <p style="color: #64748B; font-size: 16px; margin: 0 0 40px 0;">Use the code below to complete your verification.</p>
                                                
                                                <div style="background-color: #F8FAFC; border-radius: 24px; padding: 40px; border: 2px solid #F1F5F9; display: inline-block; min-width: 200px;">
                                                    <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #142B5D; font-family: 'Courier New', monospace;">${otp}</span>
                                                </div>
                                                
                                                <p style="color: #94A3B8; font-size: 13px; margin-top: 40px;">
                                                    This code expires in 10 minutes. If you didn't request this, please ignore this email.
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 0 40px 40px 40px; text-align: center;">
                                                <p style="color: #CBD5E1; font-size: 11px; margin: 0; border-top: 1px solid #F1F5F9; padding-top: 20px;">
                                                    &copy; 2026 Zuryo Technologies Pvt Ltd.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });

            if (error) {
                console.error('Resend Error:', error);
                return res.status(500).json({ error: 'Failed to send verification email' });
            }

            res.json({ success: true });
        } catch (error: any) {
            console.error('Server Error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/send-reset-link', async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        try {
            // Generate the reset link using Firebase Admin
            // Pointing to our custom reset page in the app
            const appUrl = process.env.APP_URL || 'https://ais-dev-qp3wafpsq33qqpe32kf2dq-45571142071.asia-southeast1.run.app';
            const actionCodeSettings = {
                url: `${appUrl}/reset-password`,
                handleCodeInApp: true,
            };
            const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
            
            // Send a high-end designer HTML template via Resend
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <onboarding@resend.dev>',
                to: [email],
                subject: 'Reset Your Zuryo Password',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Reset Your Password</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(20, 43, 93, 0.05); border: 1px solid #F1F5F9;">
                                        <!-- Header with Gradient -->
                                        <tr>
                                            <td align="center" style="background: linear-gradient(135deg, #142B5D 0%, #1E3A8A 100%); padding: 60px 40px;">
                                                <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 24px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); margin-bottom: 24px;" />
                                                <h1 style="color: #FFB435; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">ZURYO</h1>
                                                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; font-weight: 700; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">On-Demand Fitness</p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 50px 40px;">
                                                <h2 style="color: #142B5D; font-size: 24px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -0.5px;">Password Reset Request</h2>
                                                <p style="color: #64748B; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                                                    Hello there,<br><br>
                                                    We received a request to reset the password for your Zuryo account. If you didn't make this request, you can safely ignore this email.
                                                </p>
                                                
                                                <!-- CTA Button -->
                                                <table border="0" cellspacing="0" cellpadding="0" style="margin: 40px 0;">
                                                    <tr>
                                                        <td align="center" bgcolor="#FFB435" style="border-radius: 20px;">
                                                            <a href="${link}" target="_blank" style="display: inline-block; padding: 20px 40px; font-size: 16px; font-weight: 900; color: #142B5D; text-decoration: none; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Reset My Password</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <div style="background-color: #F8FAFC; border-radius: 20px; padding: 24px; border: 1px dashed #E2E8F0;">
                                                    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 0;">
                                                        <strong>Security Note:</strong> This link will expire in 1 hour for your protection. You can only use this link once.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 0 40px 40px 40px;">
                                                <div style="border-top: 1px solid #F1F5F9; padding-top: 30px; text-align: center;">
                                                    <p style="color: #94A3B8; font-size: 12px; margin: 0 0 10px 0;">&copy; 2026 Zuryo Technologies Pvt Ltd.</p>
                                                    <div style="display: flex; justify-content: center; gap: 15px;">
                                                        <a href="https://zuryo.co" style="color: #142B5D; font-size: 11px; font-weight: 700; text-decoration: none; text-transform: uppercase;">Website</a>
                                                        <span style="color: #E2E8F0;">&bull;</span>
                                                        <a href="https://zuryo.co/support" style="color: #142B5D; font-size: 11px; font-weight: 700; text-decoration: none; text-transform: uppercase;">Support</a>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });

            if (error) throw error;

            console.log('Designer reset email sent via Resend');
            res.json({ success: true });
        } catch (error: any) {
            console.error('Reset Link Error:', error);
            res.status(500).json({ error: error.message || 'Failed to send reset link' });
        }
    });

    app.post('/api/notify-booking', async (req, res) => {
        const { email, name, bookingDetails } = req.body;
        try {
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <onboarding@resend.dev>',
                to: [email],
                subject: 'Booking Confirmed - Zuryo',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Confirmed</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(20, 43, 93, 0.05); border: 1px solid #F1F5F9;">
                                        <!-- Header -->
                                        <tr>
                                            <td align="center" style="background: #10B981; padding: 40px;">
                                                <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 60px; height: 60px; border-radius: 18px;" />
                                                <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 15px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px;">
                                                <p style="color: #142B5D; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Hi ${name},</p>
                                                <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Your fitness session is locked in! Get ready to sweat. Our trainer will meet you at the scheduled time.</p>
                                                
                                                <div style="background-color: #F8FAFC; border-radius: 24px; padding: 30px; border: 1px solid #F1F5F9;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding-bottom: 20px;">
                                                                <p style="color: #94A3B8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Session Type</p>
                                                                <p style="color: #142B5D; font-size: 18px; font-weight: 900; margin: 0;">${bookingDetails.category}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 20px;">
                                                                <p style="color: #94A3B8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Date & Time</p>
                                                                <p style="color: #142B5D; font-size: 16px; font-weight: 700; margin: 0;">${bookingDetails.date} at ${bookingDetails.time}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <p style="color: #94A3B8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Location</p>
                                                                <p style="color: #142B5D; font-size: 14px; font-weight: 600; margin: 0; line-height: 1.5;">${bookingDetails.location}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                
                                                <div style="margin-top: 40px; text-align: center;">
                                                    <a href="https://zuryo.co/bookings" style="display: inline-block; background: #142B5D; color: #FFB435; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">View Booking Details</a>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 0 40px 40px 40px; text-align: center;">
                                                <p style="color: #CBD5E1; font-size: 11px; margin: 0; border-top: 1px solid #F1F5F9; padding-top: 20px;">
                                                    &copy; 2026 Zuryo Technologies Pvt Ltd.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });
            if (error) throw error;
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to send confirmation' });
        }
    });

    app.post('/api/notify-signup', async (req, res) => {
        const { email, name } = req.body;
        try {
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <onboarding@resend.dev>',
                to: [email],
                subject: 'Welcome to Zuryo!',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Welcome to Zuryo</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(20, 43, 93, 0.05); border: 1px solid #F1F5F9;">
                                        <!-- Header -->
                                        <tr>
                                            <td align="center" style="background: #142B5D; padding: 60px 40px;">
                                                <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 24px;" />
                                                <h1 style="color: #FFB435; font-size: 28px; font-weight: 900; margin: 20px 0 0 0; letter-spacing: 2px;">WELCOME</h1>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 50px 40px; text-align: center;">
                                                <h2 style="color: #142B5D; font-size: 24px; font-weight: 800; margin: 0 0 20px 0;">Hi ${name}, Welcome to the Tribe!</h2>
                                                <p style="color: #64748B; font-size: 16px; line-height: 1.7; margin: 0 0 40px 0;">
                                                    We're thrilled to have you with us. Zuryo is here to make fitness accessible, on-demand, and right at your doorstep.
                                                </p>
                                                
                                                <a href="https://zuryo.co" style="display: inline-block; background: #142B5D; color: #FFB435; padding: 20px 40px; border-radius: 20px; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(20, 43, 93, 0.2);">Start Your Journey</a>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 0 40px 40px 40px; text-align: center;">
                                                <p style="color: #CBD5E1; font-size: 11px; margin: 0; border-top: 1px solid #F1F5F9; padding-top: 20px;">
                                                    &copy; 2026 Zuryo Technologies Pvt Ltd.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });
            if (error) throw error;
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to send welcome email' });
        }
    });

    app.post('/api/request-deletion', async (req, res) => {
        const { email, name, uid } = req.body;
        try {
            // Notify Admin
            await resend.emails.send({
                from: 'System <onboarding@resend.dev>',
                to: ['founder@zuryo.co'],
                subject: 'Account Deletion Request',
                html: `<p>User <strong>${name}</strong> (${email}) with UID: ${uid} has requested account deletion.</p>`
            });
            // Confirm to User
            await resend.emails.send({
                from: 'Zuryo Support <onboarding@resend.dev>',
                to: [email],
                subject: 'Account Deletion Request Received',
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #142B5D;">Zuryo Support</h2>
                        <p>Hi ${name},</p>
                        <p>We have received your request to delete your Zuryo account. Our team will process this within 7 business days as per our policies.</p>
                        <p>If you change your mind, please contact us immediately.</p>
                    </div>
                `
            });
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to process request' });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static('dist'));
        app.get('*', (req, res) => {
            res.sendFile('dist/index.html', { root: '.' });
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
