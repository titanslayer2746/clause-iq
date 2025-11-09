import { Response } from "express";
import { Contract, Notification } from "../models";
import Comment from "../models/Comment";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import { createAuditLog } from "../middleware/auditLog";

// Get comments for a contract
export const getComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const comments = await Comment.find({
      contractId,
      parentId: null, // Get top-level comments only
    })
      .populate("userId", "email firstName lastName")
      .populate("mentions", "email")
      .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .populate("userId", "email firstName lastName")
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    sendSuccess(res, { comments: commentsWithReplies });
  }
);

// Create comment
export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { text, mentions, parentId } = req.body;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    // Create comment
    const comment = await Comment.create({
      contractId,
      organizationId: user.organizationId,
      userId: user._id,
      text,
      mentions: mentions || [],
      parentId: parentId || undefined,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "email firstName lastName")
      .populate("mentions", "email");

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        try {
          await Notification.create({
            userId: mentionedUserId,
            organizationId: user.organizationId,
            type: "comment_mention",
            title: "You were mentioned in a comment",
            message: `${user.email} mentioned you: "${text.substring(0, 100)}..."`,
            relatedContractId: contractId,
            link: `/contracts/${contractId}`,
          });
        } catch (error) {
          console.error("Failed to create mention notification:", error);
        }
      }
    }

    // Audit log
    await createAuditLog(user.organizationId.toString(), {
      userId: (user._id as any).toString(),
      action: "comment_added",
      resourceType: "contract",
      contractId: contractId,
      metadata: { commentText: text.substring(0, 100) },
    });

    sendSuccess(res, { comment: populatedComment }, "Comment added", 201);
  }
);

// Update comment
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findOne({
      _id: commentId,
      organizationId: user.organizationId,
      userId: user._id, // Only author can edit
    });

    if (!comment) {
      throw new AppError("Comment not found or unauthorized", 404);
    }

    comment.text = text;
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "email firstName lastName")
      .populate("mentions", "email");

    sendSuccess(res, { comment: populatedComment }, "Comment updated");
  }
);

// Delete comment
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      organizationId: user.organizationId,
    });

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    // Only author or admin can delete
    if (
      comment.userId.toString() !== (user._id as any).toString() &&
      user.role !== "Admin"
    ) {
      throw new AppError("Unauthorized to delete this comment", 403);
    }

    // Delete replies as well
    await Comment.deleteMany({ parentId: comment._id });
    await comment.deleteOne();

    sendSuccess(res, null, "Comment deleted");
  }
);

