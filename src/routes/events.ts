import { Router } from "express";
import { requireRole } from "../middlewares/RequireRole";
import { validate } from "../middlewares/validate";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
} from "../controllers/events";
import { updateEventSchema, createEventSchema } from "../validators/events";

const router = Router();

router.post(
  "/",
  requireRole("organizer", "admin"),
  validate(createEventSchema),
  createEvent
);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put(
  "/:id",
  requireRole("organizer", "admin"),
  validate(updateEventSchema),
  updateEventById
);
router.delete("/:id", requireRole("organizer", "admin"), deleteEventById);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - date
 *         - location
 *         - price
 *         - totalSeats
 *         - availableSeats
 *         - image
 *         - organizer
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the event
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: The description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the event
 *         location:
 *           type: string
 *           description: The location of the event
 *         price:
 *           type: number
 *           description: The price of the event ticket
 *         totalSeats:
 *           type: number
 *           description: The total number of seats available
 *         availableSeats:
 *           type: number
 *           description: The number of seats currently available
 *         image:
 *           type: string
 *           description: The image URL for the event
 *         organizer:
 *           type: string
 *           description: The ID of the user who organized the event
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the event was last updated
 *     CreateEventRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - date
 *         - location
 *         - price
 *         - totalSeats
 *         - image
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: The description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the event
 *         location:
 *           type: string
 *           description: The location of the event
 *         price:
 *           type: number
 *           description: The price of the event ticket
 *         totalSeats:
 *           type: number
 *           description: The total number of seats available
 *         image:
 *           type: string
 *           description: The image URL for the event
 *     UpdateEventRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: The description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the event
 *         location:
 *           type: string
 *           description: The location of the event
 *         price:
 *           type: number
 *           description: The price of the event ticket
 *         totalSeats:
 *           type: number
 *           description: The total number of seats available
 *         image:
 *           type: string
 *           description: The image URL for the event
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management API
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

