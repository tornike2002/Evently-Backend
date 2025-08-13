import { Router } from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} from "../controllers/cart";
import { validate } from "../middlewares/validate";
import { requireLogin } from "../middlewares/requireLogin";
import { addToCartSchema, updateCartSchema } from "../validators/cart";

const router = Router();

router.post("/", requireLogin, validate(addToCartSchema), addToCart);
router.get("/", requireLogin, getCart);
router.put("/:id", requireLogin, validate(updateCartSchema), updateCart);
router.delete("/:id", requireLogin, removeFromCart);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         eventId:
 *           type: string
 *         seatNumber:
 *           type: string
 *         quantity:
 *           type: number
 *         totalPrice:
 *           type: number
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AddToCartRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - seatNumber
 *         - quantity
 *         - totalPrice
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID of the event
 *         seatNumber:
 *           type: string
 *           description: Seat number for the event
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Number of tickets
 *         totalPrice:
 *           type: number
 *           minimum: 1
 *           description: Total price for the cart item
 *     UpdateCartRequest:
 *       type: object
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID of the event
 *         seatNumber:
 *           type: string
 *           description: Seat number for the event
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Number of tickets
 *         totalPrice:
 *           type: number
 *           minimum: 1
 *           description: Total price for the cart item
 * 
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cartItem:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *   
 *   get:
 *     summary: Get user's cart items
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 * 
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartRequest'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cartItem:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *   
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */