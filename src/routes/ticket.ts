import { Router } from "express";
import { requireLogin } from "../middlewares/requireLogin";
import { validate } from "../middlewares/validate";
import { purchaseTicket, confirmPayment, getUserTickets } from "../controllers/ticket";
import { purchaseTicketSchema } from "../validators/ticket";

const router = Router();

// All ticket routes require authentication
router.use(requireLogin);

router.post("/purchase", validate(purchaseTicketSchema), purchaseTicket);
router.post("/confirm-payment", confirmPayment);
router.get("/my-tickets", getUserTickets);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - ticketCode
 *         - user
 *         - event
 *         - quantity
 *         - totalAmount
 *         - paymentIntentId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the ticket
 *         ticketCode:
 *           type: string
 *           description: Unique ticket code
 *         user:
 *           type: string
 *           description: The ID of the user who purchased the ticket
 *         event:
 *           type: string
 *           description: The ID of the event for which the ticket was purchased
 *         quantity:
 *           type: number
 *           description: Number of tickets
 *         totalAmount:
 *           type: number
 *           description: Total amount paid for the ticket
 *         paymentIntentId:
 *           type: string
 *           description: Stripe payment intent ID
 *         paymentStatus:
 *           type: string
 *           enum: [pending, succeeded, failed, canceled]
 *           description: Status of the payment
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Date when the ticket was purchased
 *         isUsed:
 *           type: boolean
 *           description: Whether the ticket has been used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the ticket was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the ticket was last updated
 *     PurchaseTicketRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - quantity
 *         - paymentMethodId
 *       properties:
 *         eventId:
 *           type: string
 *           description: The ID of the event to purchase tickets for
 *         quantity:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *           description: Number of tickets to purchase
 *         paymentMethodId:
 *           type: string
 *           description: Stripe payment method ID
 *     ConfirmPaymentRequest:
 *       type: object
 *       required:
 *         - paymentIntentId
 *       properties:
 *         paymentIntentId:
 *           type: string
 *           description: Stripe payment intent ID to confirm
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 */

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket purchasing and management API
 */

/**
 * @swagger
 * /api/tickets/purchase:
 *   post:
 *     summary: Purchase tickets for an event
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseTicketRequest'
 *     responses:
 *       201:
 *         description: Tickets purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketCode:
 *                             type: string
 *                           eventTitle:
 *                             type: string
 *                           eventDate:
 *                             type: string
 *                             format: date-time
 *                           eventLocation:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           totalAmount:
 *                             type: number
 *                           purchaseDate:
 *                             type: string
 *                             format: date-time
 *                     totalTickets:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     paymentIntentId:
 *                       type: string
 *       200:
 *         description: Payment requires additional authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requiresAction:
 *                   type: boolean
 *                 paymentIntent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     client_secret:
 *                       type: string
 *       400:
 *         description: Bad request - Validation error, insufficient seats, or payment failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/tickets/confirm-payment:
 *   post:
 *     summary: Confirm payment and create tickets after 3D Secure authentication
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmPaymentRequest'
 *     responses:
 *       201:
 *         description: Payment confirmed and tickets created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *       200:
 *         description: Payment already processed
 *       400:
 *         description: Bad request - Invalid payment intent ID or payment not successful
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get all tickets for the authenticated user
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
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
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
