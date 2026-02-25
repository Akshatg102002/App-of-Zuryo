import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: "zuryo-2f32a",
        });
        console.log('Firebase Admin initialized');
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
            // 1. Cross-check email existence in Firebase Auth
            try {
                console.log('Checking email existence:', email);
                await admin.auth().getUserByEmail(email);
                // If this succeeds, the user exists
                console.log('User already exists:', email);
                return res.status(409).json({ error: 'Email already registered. Please login instead.' });
            } catch (authError: any) {
                // If error code is 'auth/user-not-found', it's safe to proceed with signup
                if (authError.code === 'auth/user-not-found') {
                    console.log('User not found, proceeding with OTP:', email);
                } else {
                    console.error('Firebase Auth Error:', authError.code, authError.message);
                }
            }

            // 2. Send OTP via Resend
            console.log('Sending OTP via Resend to:', email);
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <noreply@zuryo.co>',
                to: [email],
                subject: 'Your Zuryo Verification Code',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #142B5D;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover;" />
                            <h1 style="margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #142B5D;">ZURYO</h1>
                        </div>
                        <p style="font-size: 18px; line-height: 1.6; color: #333;">Hello,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">To complete your verification, please use the following code:</p>
                        <div style="background: #F8FAFC; padding: 30px; text-align: center; border-radius: 20px; margin: 30px 0; border: 1px solid #E2E8F0;">
                            <span style="font-size: 42px; font-weight: 900; letter-spacing: 8px; color: #142B5D;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #64748B; text-align: center;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="font-size: 12px; color: #94A3B8;">&copy; 2026 Zuryo Technologies Pvt Ltd. All rights reserved.</p>
                        </div>
                    </div>
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
            const link = await admin.auth().generatePasswordResetLink(email);
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <noreply@zuryo.co>',
                to: [email],
                subject: 'Reset your password for Zuryo',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #142B5D;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover;" />
                            <h1 style="margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #142B5D;">ZURYO</h1>
                        </div>
                        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 20px;">Reset Your Password</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">We received a request to reset your Zuryo account password. Click the button below to set a new one:</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${link}" style="background: #FFB435; color: #142B5D; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(255, 180, 53, 0.2);">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #64748B; text-align: center;">If you didn't request this, you can safely ignore this email. The link will expire shortly.</p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="font-size: 12px; color: #94A3B8;">&copy; 2026 Zuryo Technologies Pvt Ltd. All rights reserved.</p>
                        </div>
                    </div>
                `,
            });
            if (error) throw error;
            res.json({ success: true });
        } catch (error: any) {
            console.error('Reset Link Error:', error);
            res.status(500).json({ error: 'Failed to send reset link' });
        }
    });

    app.post('/api/notify-booking', async (req, res) => {
        const { email, name, bookingDetails } = req.body;
        try {
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <noreply@zuryo.co>',
                to: [email],
                subject: 'Booking Confirmed - Zuryo',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #142B5D;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover;" />
                            <h1 style="margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #142B5D;">ZURYO</h1>
                        </div>
                        <h2 style="font-size: 22px; font-weight: 800; color: #10B981; margin-bottom: 20px;">Booking Confirmed!</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Your fitness session has been successfully booked. Our trainer will reach your location as per the schedule.</p>
                        <div style="background: #F8FAFC; padding: 25px; border-radius: 20px; margin: 30px 0; border: 1px solid #E2E8F0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #64748B; text-transform: uppercase;">Session Details</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 900; color: #142B5D;">${bookingDetails.category}</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">${bookingDetails.date} at ${bookingDetails.time}</p>
                            <p style="margin: 15px 0 0 0; font-size: 14px; color: #555;"><strong>Location:</strong> ${bookingDetails.location}</p>
                        </div>
                        <p style="font-size: 14px; color: #64748B;">You can view or manage your booking in the Zuryo app.</p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="font-size: 12px; color: #94A3B8;">&copy; 2026 Zuryo Technologies Pvt Ltd. All rights reserved.</p>
                        </div>
                    </div>
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
                from: process.env.RESEND_FROM || 'Zuryo <noreply@zuryo.co>',
                to: [email],
                subject: 'Welcome to Zuryo!',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #142B5D;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg" alt="Zuryo" style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover;" />
                            <h1 style="margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #142B5D;">ZURYO</h1>
                        </div>
                        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 20px;">Welcome to the Tribe, ${name}!</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">We're thrilled to have you with us. Zuryo is here to make fitness accessible, on-demand, and right at your doorstep.</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Start your journey by booking your first session today!</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="https://zuryo.co" style="background: #142B5D; color: #FFB435; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 16px; display: inline-block;">Book a Session</a>
                        </div>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="font-size: 12px; color: #94A3B8;">&copy; 2026 Zuryo Technologies Pvt Ltd. All rights reserved.</p>
                        </div>
                    </div>
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
                from: 'System <noreply@zuryo.co>',
                to: ['founder@zuryo.co'],
                subject: 'Account Deletion Request',
                html: `<p>User <strong>${name}</strong> (${email}) with UID: ${uid} has requested account deletion.</p>`
            });
            // Confirm to User
            await resend.emails.send({
                from: 'Zuryo Support <noreply@zuryo.co>',
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
