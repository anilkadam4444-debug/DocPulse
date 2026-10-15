import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeString,
  formatAmPm,
  addMinutesToTime,
  calculateQueueSlotEstimate,
  formatQueueToken,
} from './queue-calculator.ts';

test('parseTimeString correctly parses 24hr and 12hr strings', () => {
  const t1 = parseTimeString('09:30');
  assert.equal(t1.hours, 9);
  assert.equal(t1.minutes, 30);

  const t2 = parseTimeString('05:15 PM');
  assert.equal(t2.hours, 17);
  assert.equal(t2.minutes, 15);

  const t3 = parseTimeString('12:00 PM');
  assert.equal(t3.hours, 12);
  assert.equal(t3.minutes, 0);

  const t4 = parseTimeString('12:30 AM');
  assert.equal(t4.hours, 0);
  assert.equal(t4.minutes, 30);

  // Fallback on empty or invalid string
  const t5 = parseTimeString('');
  assert.equal(t5.hours, 9);
  assert.equal(t5.minutes, 0);
});

test('formatAmPm formats time accurately', () => {
  assert.equal(formatAmPm(9, 5), '9:05 AM');
  assert.equal(formatAmPm(12, 0), '12:00 PM');
  assert.equal(formatAmPm(17, 30), '5:30 PM');
  assert.equal(formatAmPm(0, 15), '12:15 AM');
});

test('addMinutesToTime handles minute rollovers', () => {
  const result = addMinutesToTime({ hours: 9, minutes: 45 }, 30);
  assert.equal(result.hours, 10);
  assert.equal(result.minutes, 15);
});

test('formatQueueToken formats padded token codes without over-padding', () => {
  assert.equal(formatQueueToken(1), 'T-01');
  assert.equal(formatQueueToken(9), 'T-09');
  assert.equal(formatQueueToken(10), 'T-10');
  assert.equal(formatQueueToken(11), 'T-11');
  assert.equal(formatQueueToken(25), 'T-25');
  // Safe handling of 0 or negative
  assert.equal(formatQueueToken(0), 'T-01');
  assert.equal(formatQueueToken(-5), 'T-01');
});

test('calculateQueueSlotEstimate calculates token timing accurately', () => {
  // Session starts at 09:00 AM, 15 minutes per patient
  // Token 1 -> 09:00 AM
  const token1 = calculateQueueSlotEstimate('09:00 AM', 1, 1, 15, 10);
  assert.equal(token1.formattedToken, 'T-01');
  assert.equal(token1.tentativeTime, '9:00 AM');
  assert.equal(token1.tokensAhead, 0);

  // Token 5 -> (5 - 1) * 15 = 60 minutes after 9:00 AM = 10:00 AM
  const token5 = calculateQueueSlotEstimate('09:00 AM', 5, 1, 15, 10);
  assert.equal(token5.formattedToken, 'T-05');
  assert.equal(token5.tentativeTime, '10:00 AM');
  assert.equal(token5.windowStart, '9:50 AM');
  assert.equal(token5.windowEnd, '10:10 AM');
  assert.equal(token5.tokensAhead, 4);

  // Token 10 -> (10 - 1) * 15 = 135 minutes after 9:00 AM = 11:15 AM
  // When current serving is Token 7, tokens ahead is 10 - 7 = 3
  const token10 = calculateQueueSlotEstimate('09:00 AM', 10, 7, 15, 10);
  assert.equal(token10.formattedToken, 'T-10');
  assert.equal(token10.tentativeTime, '11:15 AM');
  assert.equal(token10.windowStart, '11:05 AM');
  assert.equal(token10.windowEnd, '11:25 AM');
  assert.equal(token10.tokensAhead, 3);
});
