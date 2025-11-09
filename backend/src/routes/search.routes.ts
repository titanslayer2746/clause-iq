import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { advancedSearch, searchInContract } from "../controllers/search.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search routes
router.get("/advanced", advancedSearch);
router.get("/contracts/:contractId", searchInContract);

export default router;

