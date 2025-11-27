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
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

router.use(authenticateJWT, authorizeRole(["user"]));

router.get("/", getCart);
router.post("/", addToCart);
router.post("/merge", mergeCart);
router.put("/", updateCartItem);
router.delete("/:product_id", removeCartItem);
router.delete("/", clearCart);

export default router;
