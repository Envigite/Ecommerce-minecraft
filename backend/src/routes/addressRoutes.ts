import { Router } from 'express';
import { authenticateJWT } from "../middlewares/authMiddleware";
import { addAddress, deleteAddress, getMyAddresses } from "../controllers/addressController";

const router = Router();

router.post("/", authenticateJWT, addAddress);
router.get("/", authenticateJWT, getMyAddresses);
router.delete("/:id", authenticateJWT, deleteAddress);

export default router;