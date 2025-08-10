import { Router } from "express";
import { register, login, logout, refreshToken, me } from "../controllers/auth";
import { requireLogin } from "../middlewares/requireLogin";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/me", requireLogin, me);

export default router;
