import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Comment routes
router.get("/contracts/:contractId", getComments);
router.post("/contracts/:contractId", createComment);
router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;

