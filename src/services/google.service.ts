// src/services/google.service.ts
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export class GoogleService {
    async verifyToken(token: string) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            

            if (!payload) throw new Error('No payload');

            return {
                googleId: payload.sub,
                email: payload.email,
                fullName: payload.name,
                avatarUrl: payload.picture,
                isVerified: payload.email_verified,
            };
        } catch (error) {
            throw new Error('Invalid Google token');
        }
    }

    async getUserInfo(accessToken: string) {
        const response = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
        );
        return response.json();
    }
}

export const googleService = new GoogleService();