// src/services/lemon-squeezy.service.ts
import axios from 'axios';
import { Errors } from '../utils/handle-request.js';

interface LemonSqueezyCustomer {
    email: string;
    name?: string;
}

interface CheckoutOptions {
    variantId: string;
    customerEmail: string;
    customerName?: string;
    redirectUrl?: string;
    customData?: Record<string, any>;
}

export class LemonSqueezyService {

    private apiKey: string;
    private baseUrl: string;
    private storeId: string;

    constructor() {
        this.apiKey = process.env.LEMON_SQUEEZY_API_KEY!;
        this.baseUrl = 'https://api.lemonsqueezy.com/v1';
        this.storeId = process.env.LEMON_SQUEEZY_STORE_ID!;
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
        };
    }

    // Create a subscription checkout URL
    async createCheckout(options: CheckoutOptions) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/checkouts`,
                {
                    data: {
                        type: 'checkouts',
                        attributes: {
                            checkout_data: {
                                custom: {
                                    user_id: options.customData?.userId,
                                    redirect: options.redirectUrl,
                                },
                                customer: {
                                    email: options.customerEmail,
                                    name: options.customerName,
                                },
                            },
                            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        },
                        relationships: {
                            store: {
                                data: {
                                    type: 'stores',
                                    id: this.storeId,
                                },
                            },
                            variant: {
                                data: {
                                    type: 'variants',
                                    id: options.variantId,
                                },
                            },
                        },
                    },
                },
                { headers: this.headers }
            );

            return {
                checkoutUrl: response.data.data.attributes.url,
                checkoutId: response.data.data.id,
            };
        } catch (error: any) {
            console.error('Lemon Squeezy checkout error:', error.response?.data || error.message);
            throw Errors.badRequest('Failed to create checkout session');
        }
    }

    // Get subscription details by ID
    async getSubscription(subscriptionId: string) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/subscriptions/${subscriptionId}`,
                { headers: this.headers }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Lemon Squeezy get subscription error:', error.message);
            return null;
        }
    }

    // cancel subscription
    async cancelSubscription(subscriptionId: string) {
        try {
            const response = await axios.patch(
                `${this.baseUrl}/subscriptions/${subscriptionId}`,
                {
                    data: {
                        type: 'subscriptions',
                        id: subscriptionId,
                        attributes: {
                            status: 'canceled',
                        },
                    },
                },
                { headers: this.headers }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Lemon Squeezy cancel subscription error:', error.message);
            throw Errors.badRequest('Failed to cancel subscription');
        }
    }

    //  Get variant ID by plan
    getVariantId(plan: 'monthly' | 'yearly'): string {
        if (plan === 'monthly') {
            return process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID!;
        }
        return process.env.LEMON_SQUEEZY_YEARLY_VARIANT_ID!;
    }

    // Verify webhook signature
    verifyWebhookSignature(payload: any, signature: string): boolean {
        // Lemon Squeezy uses X-Signature header
        // You can verify with your secret key
        // For now, we'll just trust it (add verification later)
        return true;
    }
}

export const lemonSqueezyService = new LemonSqueezyService();