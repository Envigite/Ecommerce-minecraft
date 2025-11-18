import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, updateUsernameController, updatePasswordController, checkUserProfile } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateJWT, getUserProfile);
router.put("/me/username", authenticateJWT, updateUsernameController);
router.put("/me/password", authenticateJWT, updatePasswordController);
router.get("/check", authenticateJWT, checkUserProfile);

export default router; 