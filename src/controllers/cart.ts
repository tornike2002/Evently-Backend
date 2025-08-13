import { Request, Response } from "express";
import { Cart } from "../models/Cart";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const cartData = {
      ...req.body,
      userId: req.user,
    };
    const data = await Cart.create(cartData);
    res.status(201).json({ message: "Item added to cart", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const data = await Cart.find({ userId: req.user });
    if (!data) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    res.status(200).json({ message: "Cart fetched successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const data = await Cart.findOneAndUpdate(
      { _id: req.params.id, userId: req.user }, // Ensure user can only update their own cart items
      req.body,
      { new: true }
    );
    if (!data) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    res.status(200).json({ message: "Cart updated successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const data = await Cart.findOneAndDelete({
      _id: req.params.id,
      userId: req.user, // Ensure user can only delete their own cart items
    });
    if (!data) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    res.status(200).json({ message: "Cart removed successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
