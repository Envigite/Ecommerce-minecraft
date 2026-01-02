import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, updateUsernameController, updatePasswordController, checkUserProfile, googleCallback } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import passport from "passport";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateJWT, getUserProfile);
router.put("/me/username", authenticateJWT, updateUsernameController);
router.put("/me/password", authenticateJWT, updatePasswordController);
router.get("/check", authenticateJWT, checkUserProfile);
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router; 