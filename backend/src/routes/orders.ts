import { Router } from "express";
import { z } from "zod";
import { db, schema } from "../db/client";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const deliveryTypes = ["IN_STORE", "DELIVERY", "CURBSIDE"] as const;

const scheduleSchema = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}, "scheduledTime must be a valid ISO date");

const baseOrderSchema = z.object({
  deliveryType: z.enum(deliveryTypes),
  scheduledTime: scheduleSchema,
  contactPhone: z.string().min(10, "contactPhone must be at least 10 digits"),
  notes: z.string().max(500).optional(),
  deliveryAddress: z.string().max(255).optional(),
  pickupPerson: z.string().max(120).optional(),
  curbsideVehicleInfo: z.string().max(255).optional(),
});

const createOrderSchema = baseOrderSchema.superRefine((data, ctx) => {
  const scheduled = new Date(data.scheduledTime);
  const now = new Date();
  if (scheduled.getTime() <= now.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduledTime"],
      message: "scheduledTime must be in the future",
    });
  }

  if (data.deliveryType === "DELIVERY" && !data.deliveryAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["deliveryAddress"],
      message: "deliveryAddress is required for DELIVERY",
    });
  }

  if (data.deliveryType === "CURBSIDE" && !data.curbsideVehicleInfo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["curbsideVehicleInfo"],
      message: "curbsideVehicleInfo is required for CURBSIDE",
    });
  }

  if (data.deliveryType === "IN_STORE" && !data.pickupPerson) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pickupPerson"],
      message: "pickupPerson is required for IN_STORE",
    });
  }
});

const updateOrderSchema = baseOrderSchema
  .partial()
  .and(
    z.object({
      deliveryType: z.enum(deliveryTypes).optional(),
      scheduledTime: scheduleSchema.optional(),
      contactPhone: z.string().min(10).optional(),
    })
  )
  .superRefine((data, ctx) => {
    if (data.scheduledTime) {
      const scheduled = new Date(data.scheduledTime);
      if (scheduled.getTime() <= Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledTime"],
          message: "scheduledTime must be in the future",
        });
      }
    }
  });

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a delivery preference order.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Order created successfully.
 */
router.post("/", requireAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid order payload", issues: parsed.error.issues });
  }

  const data = parsed.data;

  const [order] = await db
    .insert(schema.orders)
    .values({
      userId: req.userId!,
      deliveryType: data.deliveryType,
      scheduledTime: new Date(data.scheduledTime),
      contactPhone: data.contactPhone,
      deliveryAddress: data.deliveryAddress,
      pickupPerson: data.pickupPerson,
      curbsideVehicleInfo: data.curbsideVehicleInfo,
      notes: data.notes,
    })
    .returning();

  return res.status(201).json(order);
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Fetch a single order by id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found.
 *       404:
 *         description: Order not found.
 */
router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const order = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, id), eq(schema.orders.userId, req.userId!)),
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json(order);
});

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update an existing order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderUpdate'
 *     responses:
 *       200:
 *         description: Order updated successfully.
 */
router.put("/:id", requireAuth, async (req, res) => {
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid order payload", issues: parsed.error.issues });
  }

  const { id } = req.params;

  const existing = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, id), eq(schema.orders.userId, req.userId!)),
  });

  if (!existing) {
    return res.status(404).json({ message: "Order not found" });
  }

  const mergedDeliveryType = parsed.data.deliveryType ?? existing.deliveryType;
  const mergedScheduledTime = parsed.data.scheduledTime ? new Date(parsed.data.scheduledTime) : existing.scheduledTime;
  const mergedContactPhone = parsed.data.contactPhone ?? existing.contactPhone;
  const mergedNotes = parsed.data.notes ?? existing.notes ?? undefined;
  const mergedDeliveryAddress = parsed.data.deliveryAddress ?? existing.deliveryAddress ?? undefined;
  const mergedPickupPerson = parsed.data.pickupPerson ?? existing.pickupPerson ?? undefined;
  const mergedCurbsideInfo =
    parsed.data.curbsideVehicleInfo ?? existing.curbsideVehicleInfo ?? undefined;

  const validation = createOrderSchema.safeParse({
    deliveryType: mergedDeliveryType,
    scheduledTime: mergedScheduledTime.toISOString(),
    contactPhone: mergedContactPhone,
    notes: mergedNotes,
    deliveryAddress: mergedDeliveryAddress,
    pickupPerson: mergedPickupPerson,
    curbsideVehicleInfo: mergedCurbsideInfo,
  });

  if (!validation.success) {
    return res.status(400).json({ message: "Invalid order payload", issues: validation.error.issues });
  }

  const [updated] = await db
    .update(schema.orders)
    .set({
      deliveryType: mergedDeliveryType,
      scheduledTime: mergedScheduledTime,
      contactPhone: mergedContactPhone,
      deliveryAddress: mergedDeliveryAddress,
      pickupPerson: mergedPickupPerson,
      curbsideVehicleInfo: mergedCurbsideInfo,
      notes: mergedNotes,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, id))
    .returning();

  return res.json(updated);
});

export default router;

