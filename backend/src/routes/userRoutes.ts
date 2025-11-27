import { Router } from "express";
import { changeUserRole, deleteUser, listUsers  } from "../controllers/userController";

const router = Router();

router.put("/role/:id", changeUserRole);
router.delete("/:id", deleteUser);
router.get("/", listUsers);

export default router;
