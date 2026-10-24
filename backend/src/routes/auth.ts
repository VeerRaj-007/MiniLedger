import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { JWT_SECRET } from "../middleware/auth";
import { phoneSchema, verifyOtpSchema } from "../validation/schemas";

const router = Router();

// Mock OTP: generate it, store it with a 5-minute expiry, print it to the
// server log. That log line IS the delivery mechanism for this assignment
// — there's no SMS provider wired up on purpose.
router.post("/send-otp", async (req, res) => {
  const parsed = phoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone } = parsed.data;
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otp.create({ data: { phone, code, expiresAt } });

  console.log(`[MOCK OTP] phone=${phone} otp=${code} (expires ${expiresAt.toISOString()})`);

  res.json({ message: "OTP sent (check server log)" });
});

router.post("/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone, otp } = parsed.data;

  const record = await prisma.otp.findFirst({
    where: { phone, code: otp, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  await prisma.otp.delete({ where: { id: record.id } });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, userId: user.id });
});

export default router;
