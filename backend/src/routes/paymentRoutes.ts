import { Router } from "express";
import { createCheckoutSession, handlePaymentSuccess, receiveWebhook } from "../controllers/paymentController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create-checkout-session", authenticateJWT, createCheckoutSession);
router.post("/success", authenticateJWT, handlePaymentSuccess);
router.post("/webhook", receiveWebhook);

export default router;