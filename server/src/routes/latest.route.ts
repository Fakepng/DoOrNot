import { Router } from "express";

import { latest, add } from "../controllers/latest.controller";

const router = Router();

router.get("/", latest);
router.get("/add/:id", add);

export default router;
