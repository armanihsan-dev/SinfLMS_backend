// src/services/otp.service.ts

import { redis } from "../config/redis.js";


const OTP_PREFIX = 'otp:';
const VERIFIED_PREFIX = 'email-verified:';

export class OTPService {
    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async saveOTP(email: string, otp: string): Promise<void> {
        const key = `${OTP_PREFIX}${email.toLowerCase()}`;
        const expiry = Number(process.env.OTP_EXPIRY_SECONDS) || 600;
        await redis.set(key, otp, 'EX', expiry);
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const key = `${OTP_PREFIX}${email.toLowerCase()}`;
        const stored = await redis.get(key);


        if (!stored) return false;
        if (stored !== otp) return false;

        // Mark email as verified for 30 minutes so register can proceed
        const verifiedKey = `${VERIFIED_PREFIX}${email.toLowerCase()}`;
        await redis.set(verifiedKey, '1', 'EX', 30 * 60);

        // Delete the OTP so it can't be reused
        await redis.del(key);
        return true;
    }

    async isEmailVerified(email: string): Promise<boolean> {
        const key = `${VERIFIED_PREFIX}${email.toLowerCase()}`;
        return (await redis.get(key)) === '1';
    }

    async clearVerified(email: string): Promise<void> {
        const key = `${VERIFIED_PREFIX}${email.toLowerCase()}`;
        await redis.del(key);
    }


    async canSendOTP(email: string): Promise<boolean> {
        const key = `otp-cooldown:${email.toLowerCase()}`;
        const exists = await redis.get(key);
        return !exists;
    }

    async setCooldown(email: string): Promise<void> {
        const key = `otp-cooldown:${email.toLowerCase()}`;
        await redis.set(key, '1', 'EX', 60); // 60-second cooldown
    }
}

export const otpService = new OTPService();