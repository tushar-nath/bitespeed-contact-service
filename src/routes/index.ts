import { Request, Response, Router } from "express";
import { identify } from "../handler/contactHandler";

const router = Router();

router.get("/healthcheck", (_req: Request, res: Response) => {
  res.send({ success: true });
});
router.post("/identify", identify);

export default router;
