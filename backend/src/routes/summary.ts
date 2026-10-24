import { Router, Response } from "express";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { computeSummary } from "../utils/loanCalculations";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res: Response) => {
  const loans = await prisma.loan.findMany({ where: { userId: req.userId! } });
  res.json(computeSummary(loans));
});

export default router;
