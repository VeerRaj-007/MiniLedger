import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import loanRoutes from "./routes/loans";
import summaryRoutes from "./routes/summary";

// Express app construction is split out from index.ts (which just calls
// app.listen) so tests can import the app directly with supertest
// without binding a real port.
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/auth", authRoutes);
  app.use("/loans", loanRoutes);
  app.use("/summary", summaryRoutes);

  app.get("/", (_req, res) => res.json({ status: "MiniLedger API running" }));

  return app;
}
