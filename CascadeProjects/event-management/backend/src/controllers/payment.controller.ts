import { Request, Response } from 'express';
import Stripe from 'stripe';
import { processPayment, getPaymentStatus } from '../services/payment.service';
import { verifyToken } from '../utils/jwt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { eventId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: user.id,
      metadata: {
        eventId,
        userId: user.id,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export const handlePayment = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { paymentMethodId, eventId, amount } = req.body;

    // Verify payment method
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== user.id) {
      return res.status(403).json({ error: 'Unauthorized payment method' });
    }

    // Process payment
    const paymentResult = await processPayment({
      userId: user.id,
      eventId,
      paymentMethodId,
      amount,
    });

    res.json(paymentResult);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { user } = verifyToken(req.headers.authorization as string);
    const { eventId } = req.params;

    const status = await getPaymentStatus({
      userId: user.id,
      eventId,
    });

    res.json(status);
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
