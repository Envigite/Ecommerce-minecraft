import { Router } from "express";
import { createMessage, getMessages, updateMessageStatus } from "../controllers/contactController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/", createMessage);

router.get("/", authenticateJWT, authorizeRole(["admin", "manager"]), getMessages);
router.patch("/:id", authenticateJWT, authorizeRole(["admin", "manager"]), updateMessageStatus);

export default router;