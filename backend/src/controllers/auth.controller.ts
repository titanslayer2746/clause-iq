import { Response } from "express";
import { User, Organization, Invitation } from "../models";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import {
  generateOTP,
  generateInvitationToken,
  getOTPExpiry,
  getInvitationExpiry,
} from "../utils/otp";
import emailService from "../services/email.service";
import { sendSuccess } from "../utils/response";

// Signup - Create user and organization
export const signup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, organizationName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = getOTPExpiry();

  // Import mongoose for ObjectId
  const mongoose = await import("mongoose");
  const tempOrgId = new mongoose.Types.ObjectId();

  // Create user first with temporary org ID
  const user = await User.create({
    email,
    password: hashedPassword,
    organizationId: tempOrgId,
    otp,
    otpExpires,
    isEmailVerified: false,
  });

  // Now create organization with the user as creator
  const organization = await Organization.create({
    name: organizationName,
    createdBy: user._id,
    members: [user._id],
  });

  // Update user with correct organization ID
  user.organizationId = organization._id as any;
  await user.save();

  // Send OTP email
  try {
    await emailService.sendOTP(email, otp);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    // Don't fail registration if email fails
  }

  sendSuccess(
    res,
    {
      userId: user._id,
      email: user.email,
      organizationId: organization._id,
    },
    "Signup successful. Please verify your email with the OTP sent.",
    201
  );
});

// Verify OTP
export const verifyOTP = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, otp } = req.body;

    // Find user with OTP
    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    if (!user.otp || !user.otpExpires) {
      throw new AppError("No OTP found. Please request a new one.", 400);
    }

    if (user.otpExpires < new Date()) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    if (user.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    // Verify user
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
      "Email verified successfully"
    );
  }
);

// Resend OTP
export const resendOTP = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTP(email, otp);
    } catch (error) {
      throw new AppError("Failed to send OTP email", 500);
    }

    sendSuccess(res, null, "OTP resent successfully");
  }
);

// Login
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = generateToken(user);

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  });
});

// Invite team member
export const inviteTeamMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, role } = req.body;
    const inviter = req.user!;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Check if invitation already exists
    const existingInvite = await Invitation.findOne({
      email,
      organizationId: inviter.organizationId,
      status: "pending",
    });

    if (existingInvite) {
      throw new AppError("Invitation already sent to this email", 409);
    }

    // Generate invitation token
    const token = generateInvitationToken();
    const expiresAt = getInvitationExpiry();

    // Create invitation
    const invitation = await Invitation.create({
      email,
      organizationId: inviter.organizationId,
      role,
      invitedBy: inviter._id,
      token,
      expiresAt,
      status: "pending",
    });

    // Get organization details
    const organization = await Organization.findById(inviter.organizationId);

    // Send invitation email
    try {
      await emailService.sendInvitation(
        email,
        organization?.name || "Organization",
        inviter.email,
        token
      );
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      // Don't fail if email fails
    }

    sendSuccess(
      res,
      {
        invitationId: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      "Invitation sent successfully",
      201
    );
  }
);

// Accept invitation
// Validate invitation token
export const validateInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.query;

    if (!token) {
      throw new AppError("Token is required", 400);
    }

    // Find invitation
    const invitation = await Invitation.findOne({
      token: token as string,
      status: "pending",
    }).populate("organizationId", "name");

    if (!invitation) {
      throw new AppError("Invalid or expired invitation", 404);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      throw new AppError("Invitation has expired", 400);
    }

    sendSuccess(res, {
      email: invitation.email,
      role: invitation.role,
      organizationName: (invitation.organizationId as any).name,
    });
  }
);

export const acceptInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token, password } = req.body;

    // Find invitation
    const invitation = await Invitation.findOne({ token, status: "pending" });

    if (!invitation) {
      throw new AppError("Invalid or expired invitation", 404);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      throw new AppError("Invitation has expired", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      organizationId: invitation.organizationId,
      isEmailVerified: true, // Auto-verify for invited users
    });

    // Add user to organization members
    await Organization.findByIdAndUpdate(invitation.organizationId, {
      $push: { members: user._id },
    });

    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Generate token
    const jwtToken = generateToken(user);

    sendSuccess(
      res,
      {
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
      "Invitation accepted successfully",
      201
    );
  }
);
