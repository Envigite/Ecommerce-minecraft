import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeCart,
  clearCart
} from "../controllers/cartController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticateJWT, getCart);
router.post("/", authenticateJWT, addToCart);
router.post("/merge", authenticateJWT, mergeCart);
router.put("/", authenticateJWT, updateCartItem);
router.delete("/:product_id", authenticateJWT, removeCartItem);
router.delete("/", authenticateJWT, clearCart);

export default router;
