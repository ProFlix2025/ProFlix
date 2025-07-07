import bcrypt from 'bcrypt';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Hash PIN for secure storage
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

// Verify PIN against stored hash
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin);
}

// Create Stripe customer and setup intent for saving card
export async function createSaveCardSetup(userId: string, email: string) {
  try {
    // Create or retrieve Stripe customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });
      customer = customers.data[0];
    } catch (error) {
      // Customer doesn't exist, create new one
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
    }

    // Create setup intent for saving payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session', // For future payments
    });

    return {
      customerId: customer.id,
      clientSecret: setupIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating save card setup:', error);
    throw error;
  }
}

// Process payment with saved payment method
export async function chargeWithSavedCard(
  customerId: string,
  paymentMethodId: string,
  amount: number,
  description: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: description,
      return_url: process.env.DOMAIN || 'https://proflix.app',
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error charging saved card:', error);
    throw error;
  }
}

// Get saved payment methods for customer
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      cardBrand: pm.card?.brand || 'unknown',
      cardLast4: pm.card?.last4 || '****',
      cardExpMonth: pm.card?.exp_month || 12,
      cardExpYear: pm.card?.exp_year || 2025,
    }));
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
}

// Validate PIN format
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

// Generate secure random PIN (for reset functionality)
export function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}