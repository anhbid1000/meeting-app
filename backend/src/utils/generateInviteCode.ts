import crypto from 'crypto';

export const generateInviteCode = (length = 10): string => {
  return crypto.randomBytes(16).toString('base64url').slice(0, length);
};
