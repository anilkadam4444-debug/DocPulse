/**
 * Converts Firebase Authentication error codes into professional, actionable messages.
 */
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  if (!errorCodeOrMessage) return 'An unexpected error occurred. Please try again.';

  if (errorCodeOrMessage.includes('auth/email-already-in-use')) {
    return 'A practice account is already registered with this email address. Please sign in or reset your password.';
  }

  if (
    errorCodeOrMessage.includes('auth/invalid-credential') ||
    errorCodeOrMessage.includes('auth/wrong-password') ||
    errorCodeOrMessage.includes('auth/user-not-found')
  ) {
    return 'Invalid email address or password. Please double-check your credentials or use the password reset link.';
  }

  if (errorCodeOrMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 8 characters, including letters and numbers.';
  }

  if (errorCodeOrMessage.includes('auth/too-many-requests')) {
    return 'Access temporarily locked due to multiple failed login attempts. Please wait a few moments or reset your password.';
  }

  if (errorCodeOrMessage.includes('auth/network-request-failed')) {
    return 'Network connection failed. Please check your internet connectivity and try again.';
  }

  if (errorCodeOrMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid professional email address format.';
  }

  if (errorCodeOrMessage.includes('auth/user-disabled')) {
    return 'This doctor account has been deactivated. Please contact DocPulse practice support.';
  }

  if (errorCodeOrMessage.includes('auth/operation-not-allowed')) {
    return 'Email/password sign-in is not enabled in Firebase Authentication. Please enable Email/Password provider in your Firebase Console.';
  }

  if (errorCodeOrMessage.includes('auth/requires-recent-login')) {
    return 'This operation requires recent authentication. Please sign in again.';
  }

  return errorCodeOrMessage;
}
