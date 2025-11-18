import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticateJWT, getCart);
router.post("/", authenticateJWT, addToCart);
router.put("/", authenticateJWT, updateCartItem);
router.delete("/:product_id", authenticateJWT, removeCartItem);

export default router;
