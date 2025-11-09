import crypto from "crypto";

export const generateOTP = (): string => {
  // Generate 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
};

export const generateInvitationToken = (): string => {
  // Generate secure random token for invitations
  return crypto.randomBytes(32).toString("hex");
};

export const getOTPExpiry = (): Date => {
  // OTP expires in 10 minutes
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
};

export const getInvitationExpiry = (): Date => {
  // Invitation expires in 7 days
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
};
