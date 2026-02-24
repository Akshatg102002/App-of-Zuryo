import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: "zuryo-2f32a",
    });
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_cJkig2tP_BSzBcoJ5ZNAw6dLjpRqaYc3k');

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    // API Routes
    app.post('/api/send-otp', async (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        try {
            // 1. Cross-check email existence in Firebase Auth
            try {
                await admin.auth().getUserByEmail(email);
                // If this succeeds, the user exists
                return res.status(409).json({ error: 'Email already registered. Please login instead.' });
            } catch (authError: any) {
                // If error code is 'auth/user-not-found', it's safe to proceed with signup
                if (authError.code !== 'auth/user-not-found') {
                    console.error('Firebase Auth Error:', authError);
                    throw authError;
                }
            }

            // 2. Send OTP via Resend
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'Zuryo <noreply@zuryo.co>',
                to: [email],
                subject: 'Your Zuryo Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #142B5D; text-align: center;">ZURYO</h2>
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 16px; color: #333;">Your verification code for Zuryo is:</p>
                        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #142B5D;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 Zuryo Technologies Pvt Ltd</p>
                    </div>
                `,
            });

            if (error) {
                console.error('Resend Error:', error);
                return res.status(500).json({ error: 'Failed to send verification email' });
            }

            res.json({ success: true, message: 'OTP sent successfully' });
        } catch (error: any) {
            console.error('Server Error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
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
