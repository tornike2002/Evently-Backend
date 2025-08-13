import { Request, Response } from "express";
import Stripe from "stripe";
import { Ticket } from "../models/Ticket";
import { Events } from "../models/Events";
import { User } from "../models/User";
import mongoose from "mongoose";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Generate a unique ticket code
const generateTicketCode = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TK-${timestamp}-${randomStr}`.toUpperCase();
};

export const purchaseTicket = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, quantity, paymentMethodId } = req.body;
    const userId = (req.user as any)?.id;

    // Get event details
    const event = await Events.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if enough seats are available
    if (event.availableSeats < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Not enough seats available. Only ${event.availableSeats} seats remaining.` 
      });
    }

    // Calculate total amount
    const totalAmount = event.price * quantity;

    // Get user details for Stripe customer
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      metadata: {
        eventId: eventId,
        userId: userId,
        quantity: quantity.toString(),
        eventTitle: event.title,
      },
    });

    // Handle different payment intent statuses
    if (paymentIntent.status === "requires_action") {
      await session.abortTransaction();
      return res.status(200).json({
        message: "Payment requires additional authentication",
        requiresAction: true,
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      });
    } else if (paymentIntent.status === "succeeded") {
      // Payment succeeded, create tickets
      const ticketCodes = [];
      const tickets = [];

      for (let i = 0; i < quantity; i++) {
        const ticketCode = generateTicketCode();
        ticketCodes.push(ticketCode);
        
        const ticket = new Ticket({
          ticketCode,
          user: userId,
          event: eventId,
          quantity: 1, // Each ticket represents one seat
          totalAmount: event.price,
          paymentIntentId: paymentIntent.id,
          paymentStatus: "succeeded",
          purchaseDate: new Date(),
        });
        
        tickets.push(ticket);
      }

      // Save all tickets
      await Ticket.insertMany(tickets, { session });

      // Update event available seats
      await Events.findByIdAndUpdate(
        eventId,
        { $inc: { availableSeats: -quantity } },
        { session }
      );

      await session.commitTransaction();

      return res.status(201).json({
        message: "Tickets purchased successfully!",
        data: {
          tickets: tickets.map(ticket => ({
            ticketCode: ticket.ticketCode,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            quantity: ticket.quantity,
            totalAmount: ticket.totalAmount,
            purchaseDate: ticket.purchaseDate,
          })),
          totalTickets: quantity,
          totalAmount: totalAmount,
          paymentIntentId: paymentIntent.id,
        },
      });
    } else {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Payment failed",
        error: paymentIntent.status,
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Ticket purchase error:", error);
    
    // Handle Stripe specific errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        message: "Payment failed",
        error: error.message,
      });
    }
    
    return res.status(500).json({
      message: "Internal server error during ticket purchase",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = (req.user as any)?.id;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Check if tickets already exist for this payment intent
      const existingTickets = await Ticket.find({ paymentIntentId });
      
      if (existingTickets.length > 0) {
        return res.status(200).json({
          message: "Payment already processed",
          data: {
            tickets: existingTickets,
          },
        });
      }

      // Create tickets if they don't exist
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { eventId, quantity } = paymentIntent.metadata;
        const event = await Events.findById(eventId).session(session);
        
        if (!event) {
          await session.abortTransaction();
          return res.status(404).json({ message: "Event not found" });
        }

        const tickets = [];
        for (let i = 0; i < parseInt(quantity); i++) {
          const ticketCode = generateTicketCode();
          const ticket = new Ticket({
            ticketCode,
            user: userId,
            event: eventId,
            quantity: 1,
            totalAmount: event.price,
            paymentIntentId: paymentIntentId,
            paymentStatus: "succeeded",
            purchaseDate: new Date(),
          });
          tickets.push(ticket);
        }

        await Ticket.insertMany(tickets, { session });
        await Events.findByIdAndUpdate(
          eventId,
          { $inc: { availableSeats: -parseInt(quantity) } },
          { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
          message: "Payment confirmed and tickets created!",
          data: {
            tickets: tickets.map(ticket => ({
              ticketCode: ticket.ticketCode,
              eventTitle: event.title,
              eventDate: event.date,
              eventLocation: event.location,
              quantity: ticket.quantity,
              totalAmount: ticket.totalAmount,
              purchaseDate: ticket.purchaseDate,
            })),
          },
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      return res.status(400).json({
        message: "Payment not successful",
        status: paymentIntent.status,
      });
    }
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({
      message: "Internal server error during payment confirmation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    const tickets = await Ticket.find({ user: userId })
      .populate("event", "title date location price image")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tickets retrieved successfully",
      data: tickets,
    });
  } catch (error: any) {
    console.error("Get user tickets error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const generateTicketPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    // Validate ticket ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID format",
      });
    }

    // Import PDFService here to avoid circular dependency
    const { PDFService } = await import("../services/pdfService");

    // Get ticket with full details
    const ticketData = await PDFService.getTicketWithDetails(id, userId);

    if (!ticketData) {
      return res.status(404).json({
        message: "Ticket not found or you don't have permission to access it",
      });
    }

    // Check if payment was successful
    if (ticketData.ticket.paymentStatus !== "succeeded") {
      return res.status(400).json({
        message: "Cannot generate PDF for unpaid ticket",
      });
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateTicketPDF(ticketData);

    // Set response headers for PDF download
    const filename = `ticket-${ticketData.ticket.ticketCode}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    return res.send(pdfBuffer);

  } catch (error: any) {
    console.error("PDF generation error:", error);
    return res.status(500).json({
      message: "Internal server error during PDF generation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
