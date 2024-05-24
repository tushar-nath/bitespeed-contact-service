import { Router } from "express";
import { identify } from "../handler/contactHandler";

const router = Router();

router.post("/identify", identify);

export default router;
