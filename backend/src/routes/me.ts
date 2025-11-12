import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { db, schema } from "../db/client";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, req.userId!),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

export default router;

