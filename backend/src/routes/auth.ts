import { Router } from "express";
import { z } from "zod";
import { db, schema } from "../db/client";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in a user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid request payload", issues: result.error.issues });
  }

  const { email, password } = result.data;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user.id);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

export default router;

