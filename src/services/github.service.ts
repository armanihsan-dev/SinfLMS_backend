// src/services/github.service.ts
import axios from 'axios';

interface GitHubUser {
    githubId: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    username: string;
    verified: boolean;
}

export class GitHubService {
    async verifyToken(accessToken: string): Promise<GitHubUser> {
        
        // 1. Get user info from GitHub API
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });

        const data = response.data;

        // 2. Get email (GitHub may not return email in primary request)
        let email = data.email;
        if (!email) {
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            });

            const emails = emailResponse.data;
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            email = primaryEmail?.email || emails[0]?.email;
        }

        // 3. Return data matching interface
        return {
            githubId: data.id.toString(),
            email: email || `${data.login}@github.com`,
            fullName: data.name || data.login,
            avatarUrl: data.avatar_url,
            username: data.login,
            verified: true,
        };
    }
}
export const githubService = new GitHubService();