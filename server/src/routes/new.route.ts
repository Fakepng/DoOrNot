import { Router } from "express";

import { open } from "../controllers/open.controller";

const router = Router();

router.post("/", open);

export default router;
