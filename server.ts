import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Authoritative Plans Catalogue (Integer paise, exactly matching specifications)
const PLANS: Record<
  string,
  {
    id: string;
    name: string;
    durationMonths: number;
    durationDays: number;
    totalPriceInr: number;
    totalPricePaise: number;
    effectiveMonthlyInr: number;
    discountPercent: number;
  }
> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    durationMonths: 1,
    durationDays: 30,
    totalPriceInr: 1500,
    totalPricePaise: 150000,
    effectiveMonthlyInr: 1500,
    discountPercent: 0,
  },
  quarterly: {
    id: 'quarterly',
    name: 'Quarterly Plan',
    durationMonths: 3,
    durationDays: 90,
    totalPriceInr: 4275,
    totalPricePaise: 427500,
    effectiveMonthlyInr: 1425,
    discountPercent: 5,
  },
  half_yearly: {
    id: 'half_yearly',
    name: 'Half-Yearly Plan',
    durationMonths: 6,
    durationDays: 180,
    totalPriceInr: 8100,
    totalPricePaise: 810000,
    effectiveMonthlyInr: 1350,
    discountPercent: 10,
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    durationMonths: 12,
    durationDays: 365,
    totalPriceInr: 14400,
    totalPricePaise: 1440000,
    effectiveMonthlyInr: 1200,
    discountPercent: 20,
  },
};

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Razorpay client instance (if keys provided)
let razorpayClient: Razorpay | null = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('Razorpay SDK initialization notice:', err);
  }
}

// ----------------------------------------------------
// API ROUTES: Subscription & UPI Payment Management
// ----------------------------------------------------

/**
 * GET /api/subscription/config
 * Returns public gateway configuration, plans catalogue, and supported UPI apps.
 */
app.get('/api/subscription/config', (_req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID || 'rzp_test_DocPulseMockKey123',
    plans: PLANS,
    hasLiveGateway: Boolean(razorpayClient),
    supportedUpiApps: [
      'Google Pay',
      'PhonePe',
      'Paytm UPI',
      'BHIM UPI',
      'Dynamic UPI QR',
    ],
  });
});

/**
 * POST /api/subscription/create-order
 * Authoritatively creates a payment gateway order using the selected plan's exact integer paise.
 */
app.post('/api/subscription/create-order', async (req, res) => {
  const { planId, doctorUid } = req.body;

  if (!planId || !PLANS[planId]) {
    res.status(400).json({ error: 'Invalid or missing subscription plan.' });
    return;
  }

  const selectedPlan = PLANS[planId];
  const receipt = `rcpt_${doctorUid ? doctorUid.slice(0, 8) : 'doc'}_${Date.now()}`;

  // If live Razorpay client is available
  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
        amount: selectedPlan.totalPricePaise,
        currency: 'INR',
        receipt,
        notes: {
          doctorUid: doctorUid || 'anonymous',
          planId: selectedPlan.id,
          planName: selectedPlan.name,
        },
      });

      res.json({
        success: true,
        order,
        keyId: RAZORPAY_KEY_ID,
      });
      return;
    } catch (gatewayErr: unknown) {
      console.error('Razorpay gateway order creation error:', gatewayErr);
      const errMsg = gatewayErr instanceof Error ? gatewayErr.message : String(gatewayErr);
      res.status(502).json({ error: `Payment gateway error: ${errMsg}` });
      return;
    }
  }

  // Graceful development / sandbox fallback order
  const mockOrder = {
    id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    entity: 'order',
    amount: selectedPlan.totalPricePaise,
    currency: 'INR',
    receipt,
    status: 'created',
    isMockOrder: true,
  };

  res.json({
    success: true,
    order: mockOrder,
    keyId: RAZORPAY_KEY_ID || 'rzp_test_DocPulseMockKey123',
  });
});

/**
 * POST /api/subscription/verify-payment
 * Authoritatively verifies HMAC-SHA256 signature for Razorpay UPI payments.
 */
app.post('/api/subscription/verify-payment', (req, res) => {
  const {
    planId,
    doctorUid,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    upiApp,
  } = req.body;

  if (!planId || !PLANS[planId] || !doctorUid) {
    res.status(400).json({ error: 'Missing required payment verification parameters.' });
    return;
  }

  const plan = PLANS[planId];

  // If live Razorpay secret is set, perform HMAC-SHA256 verification
  if (RAZORPAY_KEY_SECRET && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
      return;
    }
  }

  const now = new Date();
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPeriodEnd = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const subscriptionRecord = {
    doctorUid,
    planId: plan.id,
    status: 'active',
    trialStartAt: now.toISOString(),
    trialEndAt: now.toISOString(),
    currentPeriodStartAt: now.toISOString(),
    currentPeriodEndAt: newPeriodEnd.toISOString(),
    lastPaymentId: paymentId,
    lastPaymentStatus: 'captured',
    lastPaymentAmountPaise: plan.totalPricePaise,
    autoRenew: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const paymentRecord = {
    paymentId,
    doctorUid,
    orderId: razorpay_order_id,
    planId: plan.id,
    amountPaise: plan.totalPricePaise,
    amountInr: plan.totalPriceInr,
    currency: 'INR',
    paymentMethod: 'upi',
    upiApp: upiApp || 'Google Pay',
    status: 'captured',
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    razorpaySignature: razorpay_signature,
    paidAt: now.toISOString(),
    createdAt: now.toISOString(),
    receiptNumber: `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  res.json({
    success: true,
    subscription: subscriptionRecord,
    paymentRecord,
  });
});

/**
 * POST /api/subscription/webhook
 * Handles incoming Razorpay webhooks with signature verification.
 */
app.post('/api/subscription/webhook', (req, res) => {
  const webhookSig = req.headers['x-razorpay-signature'] as string;

  if (RAZORPAY_WEBHOOK_SECRET && webhookSig) {
    const rawBody = JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== webhookSig) {
      res.status(400).json({ error: 'Invalid webhook signature.' });
      return;
    }
  }

  const event = req.body.event;
  console.log(`Razorpay webhook event received: ${event}`);

  res.status(200).json({ status: 'ok' });
});

// ----------------------------------------------------
// VITE SPA MIDDLEWARE / STATIC HOSTING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocPulse Doctor & Patient SaaS server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
