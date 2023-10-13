import { Router } from "express";

import { frequent } from "../controllers/stat.cotroller";

const router = Router();

router.get("/frequent", frequent);

export default router;
