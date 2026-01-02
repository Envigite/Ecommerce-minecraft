import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";
import { createOrder, 
  getMyOrders, 
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  deleteOrderAdmin, 
  getOrderStats, 
  getOrderByIdAdmin } from "../controllers/orderController";

const router = Router();

router.post("/", authenticateJWT, createOrder);
router.get("/my-orders", authenticateJWT, getMyOrders);
router.get("/:id", authenticateJWT, getOrderById);

router.get(
  "/admin/all", 
  authenticateJWT, 
  authorizeRole(['admin', 'manager']), 
  getAllOrdersAdmin
);

router.get(
  "/admin/stats", 
  authenticateJWT, 
  authorizeRole(['admin', 'manager']), 
  getOrderStats
);

router.get("/admin/:id", 
  authenticateJWT, 
  authorizeRole(['admin', 'manager']), 
  getOrderByIdAdmin);

router.patch(
  "/admin/:id/status", 
  authenticateJWT, 
  authorizeRole(['admin', 'manager']), 
  updateOrderStatusAdmin
);

router.delete(
  "/admin/:id", 
  authenticateJWT, 
  authorizeRole(['admin']), 
  deleteOrderAdmin
);


export default router;