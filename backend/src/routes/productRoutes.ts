import { Router } from "express";
import { listProducts, createProduct, getProductById, updateProduct, deleteProduct } from "../controllers/productController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById)
router.post("/", authenticateJWT, authorizeRole(["admin", "manager"]), createProduct);
router.put("/:id", authenticateJWT, authorizeRole(["admin", "manager"]), updateProduct);
router.delete("/:id", authenticateJWT, authorizeRole(["admin"]), deleteProduct);

export default router;
