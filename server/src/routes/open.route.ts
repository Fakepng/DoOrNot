import { Router } from "express";

import { open } from "../controllers/open.controller";

const router = Router();

router.get("/", open);

export default router;
