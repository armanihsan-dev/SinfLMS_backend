// src/services/google.service.ts
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


export class GoogleService {

    //Access Token
    async verifyAccessToken(accessToken: string) {
        try {
            // Call Google's userinfo endpoint with the access token
            const response = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            const payload = response.data;

            return {
                googleId: payload.sub,
                email: payload.email,
                fullName: payload.name,
                avatarUrl: payload.picture,
                isVerified: payload.email_verified,
            };
        } catch (error: any) {
            console.error('Google verify error:', error.response?.data || error.message);
            throw new Error('Invalid Google token');
        }
    }

    async verifyIDToken(token: string) {
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

    async verifyGoogleToken(token: string) {
        const type = detectTokenType(token);

        switch (type) {
            case 'id_token':
                return this.verifyIDToken(token);
            case 'access_token':
                return this.verifyAccessToken(token); 
            default:
                throw new Error('Unsupported or malformed Google token');
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

export type GoogleTokenType = 'id_token' | 'access_token' | 'unknown';


function detectTokenType(token: string): GoogleTokenType {
    if (!token || typeof token !== 'string') return 'unknown';

    if (token.startsWith('ya29.')) return 'access_token';
    const parts = token.split('.')
    if (parts.length === 3 && parts[0].startsWith('eyJ')) {
        try {
            const header = JSON.parse(
                Buffer.from(parts[0], 'base64url').toString('utf8')
            );
            if (header.alg && header.typ) return 'id_token';
        } catch {
            return 'unknown';
        }
    }
    return 'unknown';
}

