import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getUpcomingTasks,
  getMyTasks,
} from "../controllers/task.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task routes
router.get("/", getTasks);
router.get("/upcoming", getUpcomingTasks);
router.get("/my-tasks", getMyTasks);
router.get("/:taskId", getTaskById);
router.post("/", createTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
