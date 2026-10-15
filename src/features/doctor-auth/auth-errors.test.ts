import test from 'node:test';
import assert from 'node:assert/strict';
import { getFriendlyAuthErrorMessage } from './auth-errors.ts';

test('maps auth/email-already-in-use to friendly duplicate message', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/email-already-in-use).');
  assert.match(msg, /already registered with this email/i);
});

test('maps auth/invalid-credential to credential check message', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/invalid-credential).');
  assert.match(msg, /invalid email address or password/i);
});

test('maps auth/wrong-password to password guidance message', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/wrong-password).');
  assert.match(msg, /invalid email address or password/i);
});

test('maps auth/weak-password to strength guidance', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/weak-password).');
  assert.match(msg, /password is too weak/i);
});

test('maps auth/too-many-requests to lockout message', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/too-many-requests).');
  assert.match(msg, /access temporarily locked/i);
});

test('maps auth/network-request-failed to connectivity alert', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/network-request-failed).');
  assert.match(msg, /network connection failed/i);
});

test('maps auth/operation-not-allowed to console guide for developer', () => {
  const msg = getFriendlyAuthErrorMessage('Firebase: Error (auth/operation-not-allowed).');
  assert.match(msg, /email\/password sign-in is not enabled/i);
});

test('returns fallback for empty string', () => {
  const msg = getFriendlyAuthErrorMessage('');
  assert.match(msg, /unexpected error/i);
});
