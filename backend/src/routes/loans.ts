import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { createLoanSchema } from "../validation/schemas";
import { withOverdueFlag } from "../utils/loanCalculations";

const router = Router();
router.use(requireAuth);

// Receipts are saved to local disk under /uploads and served statically
// (see index.ts). For a real production app you'd put these in S3/GCS
// instead — local disk doesn't survive redeploys on most hosts — but for
// this assignment's scope that's unnecessary infra to stand up.
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../uploads"),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.post("/", async (req: AuthedRequest, res: Response) => {
  const parsed = createLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { friendName, amount, dueDate } = parsed.data;

  const loan = await prisma.loan.create({
    data: {
      userId: req.userId!,
      friendName,
      amount,
      dueDate: new Date(dueDate),
    },
  });

  res.status(201).json(withOverdueFlag(loan));
});

router.get("/", async (req: AuthedRequest, res: Response) => {
  const loans = await prisma.loan.findMany({
    where: { userId: req.userId! },
    orderBy: { dueDate: "asc" },
  });
  res.json(loans.map((loan) => withOverdueFlag(loan)));
});

router.patch("/:id/repay", async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  // Scope the update to this user too, not just the loan id — otherwise
  // any logged-in user could mark anyone's loan as repaid by guessing ids.
  const existing = await prisma.loan.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!existing) {
    return res.status(404).json({ error: "Loan not found" });
  }

  const loan = await prisma.loan.update({
    where: { id },
    data: { repaid: true, repaidAt: new Date() },
  });

  res.json(withOverdueFlag(loan));
});

// Bonus: attach a receipt photo to an existing entry. Separate endpoint
// rather than bundling the file into POST /loans, so creating an entry
// never requires a photo — the receipt is optional and added after.
router.post(
  "/:id/receipt",
  upload.single("receipt"),
  async (req: AuthedRequest, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.loan.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!existing) {
      return res.status(404).json({ error: "Loan not found" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({
          error: "No receipt file uploaded (field name must be 'receipt')",
        });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;
    const loan = await prisma.loan.update({
      where: { id },
      data: { receiptUrl },
    });

    res.json(withOverdueFlag(loan));
  },
);

export default router;
