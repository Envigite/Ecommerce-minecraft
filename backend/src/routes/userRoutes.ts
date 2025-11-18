import { Router } from "express";
import { promoteUser, demoteUser, deleteUser, listUsers  } from "../controllers/userController";

const router = Router();

router.put("/promote/:id", promoteUser);
router.put("/demote/:id", demoteUser);
router.delete("/:id", deleteUser);
router.get("/", listUsers);

export default router;
