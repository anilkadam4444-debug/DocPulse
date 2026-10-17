import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBSCRIPTION_PLANS,
  calculateOneMonthTrialEnd,
  getRemainingDays,
} from './plans.ts';

describe('Subscription Plans & Pricing Rules', () => {
  it('enforces exact required prices and access periods', () => {
    // 1. Monthly: 1 month, ₹1,500 total, 0% discount, ₹1,500/mo
    assert.equal(SUBSCRIPTION_PLANS.monthly.durationMonths, 1);
    assert.equal(SUBSCRIPTION_PLANS.monthly.totalPriceInr, 1500);
    assert.equal(SUBSCRIPTION_PLANS.monthly.totalPricePaise, 150000);
    assert.equal(SUBSCRIPTION_PLANS.monthly.effectiveMonthlyInr, 1500);
    assert.equal(SUBSCRIPTION_PLANS.monthly.discountPercent, 0);

    // 2. Quarterly: 3 months, ₹4,275 total, 5% discount, ₹1,425/mo
    assert.equal(SUBSCRIPTION_PLANS.quarterly.durationMonths, 3);
    assert.equal(SUBSCRIPTION_PLANS.quarterly.totalPriceInr, 4275);
    assert.equal(SUBSCRIPTION_PLANS.quarterly.totalPricePaise, 427500);
    assert.equal(SUBSCRIPTION_PLANS.quarterly.effectiveMonthlyInr, 1425);
    assert.equal(SUBSCRIPTION_PLANS.quarterly.discountPercent, 5);

    // 3. Half-yearly: 6 months, ₹8,100 total, 10% discount, ₹1,350/mo
    assert.equal(SUBSCRIPTION_PLANS.half_yearly.durationMonths, 6);
    assert.equal(SUBSCRIPTION_PLANS.half_yearly.totalPriceInr, 8100);
    assert.equal(SUBSCRIPTION_PLANS.half_yearly.totalPricePaise, 810000);
    assert.equal(SUBSCRIPTION_PLANS.half_yearly.effectiveMonthlyInr, 1350);
    assert.equal(SUBSCRIPTION_PLANS.half_yearly.discountPercent, 10);

    // 4. Yearly: 12 months, ₹14,400 total, 20% discount, ₹1,200/mo
    assert.equal(SUBSCRIPTION_PLANS.yearly.durationMonths, 12);
    assert.equal(SUBSCRIPTION_PLANS.yearly.totalPriceInr, 14400);
    assert.equal(SUBSCRIPTION_PLANS.yearly.totalPricePaise, 1440000);
    assert.equal(SUBSCRIPTION_PLANS.yearly.effectiveMonthlyInr, 1200);
    assert.equal(SUBSCRIPTION_PLANS.yearly.discountPercent, 20);
    assert.equal(SUBSCRIPTION_PLANS.yearly.isBestValue, true);
  });

  it('guarantees integer paise without floating point representation issues', () => {
    Object.values(SUBSCRIPTION_PLANS).forEach((plan) => {
      assert.equal(Number.isInteger(plan.totalPricePaise), true);
      assert.equal(plan.totalPricePaise, plan.totalPriceInr * 100);
    });
  });

  it('calculates 1 calendar month trial end date properly across month boundaries', () => {
    // Standard 30-day month (e.g. April 15 -> May 15)
    const apr15 = new Date('2026-04-15T10:00:00Z');
    const may15 = calculateOneMonthTrialEnd(apr15);
    assert.equal(may15.getUTCMonth(), 4); // May is 4 (0-indexed)
    assert.equal(may15.getUTCDate(), 15);

    // October 17 -> November 17
    const oct17 = new Date('2026-10-17T10:00:00Z');
    const nov17 = calculateOneMonthTrialEnd(oct17);
    assert.equal(nov17.getUTCMonth(), 10); // November is 10 (0-indexed)
    assert.equal(nov17.getUTCDate(), 17);

    // End of January (Jan 31 -> Feb 28 in non-leap year)
    const jan31 = new Date('2026-01-31T10:00:00Z');
    const febEnd = calculateOneMonthTrialEnd(jan31);
    assert.equal(febEnd.getUTCMonth(), 1); // Feb is 1
    assert.equal(febEnd.getUTCDate(), 28);
  });

  it('getRemainingDays returns correct integer day counts', () => {
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    const days = getRemainingDays(futureDate);
    assert.equal(days >= 14 && days <= 16, true);

    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    assert.equal(getRemainingDays(pastDate), 0);
  });
});
