import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { addCard, deleteCard, getMyCards } from "../controllers/cardController";

const router = Router();

router.post("/", authenticateJWT, addCard);
router.get("/", authenticateJWT, getMyCards);
router.delete("/:id", authenticateJWT, deleteCard);

export default router;